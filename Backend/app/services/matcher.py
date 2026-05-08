"""
Matching engine.

Match score:   sentence-transformers cosine similarity (local, fast).
ai_reason:     OpenRouter LLM explanation (generated in parallel threads for top matches).
               Falls back to a keyword-based template on timeout or error.
"""

from __future__ import annotations

import concurrent.futures
from decimal import Decimal
from typing import List

from sqlalchemy.orm import Session

from app.models.student_profile import StudentProfile
from app.models.job import Job, JobStatus
from app.models.application import Application, ApplicationStatus
from app.services.skills_vocab import extract_skills
from app.services import ai_client
from app.services.embeddings import (
    semantic_similarity,
    build_student_text,
    build_job_text,
)

# Generate LLM reasons only for the top N matches to keep response time acceptable.
_LLM_REASON_TOP_N = 5
_LLM_REASON_TIMEOUT = 20.0


def _keyword_overlap_score(student_skills: set, job: Job) -> float:
    """Fast keyword fallback used for jobs outside the top-N."""
    job_skills = set(s.lower() for s in (job.required_skills or []))
    if not job_skills:
        return 30.0
    overlap = job_skills & student_skills
    return round(100.0 * len(overlap) / len(job_skills), 2)


def _semantic_score(student_text: str, job: Job) -> float:
    """0–100 semantic similarity between student profile and job."""
    job_text = build_job_text(job)
    sim = semantic_similarity(student_text, job_text)
    # cosine similarity 0–1 → scale to 0–100, capped at 98 (perfect score is rare)
    return min(98.0, round(sim * 100.0, 2))


def _build_reason_prompt(student: StudentProfile, job: Job, score: float) -> str:
    student_skills = ", ".join((student.skills or [])[:10]) or "not listed"
    job_skills = ", ".join((job.required_skills or [])[:10]) or "not specified"

    overlap = [
        s for s in (job.required_skills or [])
        if s.lower() in set(sk.lower() for sk in (student.skills or []))
    ]
    overlap_str = ", ".join(overlap[:5]) if overlap else "none directly"

    return f"""You are a recruitment assistant writing a match explanation for a student.

Job: {job.title}
Required skills: {job_skills}
Student skills: {student_skills}
Matching skills: {overlap_str}
Match score: {score:.0f}%

Write exactly ONE sentence (maximum 25 words) explaining why this student matches this job.
Rules:
- Mention at least one specific skill if any matching skills exist
- If no matching skills, mention how the student's background relates to the role
- Do not start with "The student" or "The candidate"
- Do not include the match score number
- Output only the sentence, no quotes, no labels, no punctuation other than the sentence itself

Example good output: Strong alignment on Python and SQL makes this a solid fit for the data engineering role.
Example bad output: "The candidate has a 72% match score."

Your sentence:"""


def _generate_reason(student: StudentProfile, job: Job, score: float) -> str:
    """Call LLM for a match reason. Returns template string on failure."""
    raw = ai_client.chat(_build_reason_prompt(student, job, score), max_tokens=60, timeout=_LLM_REASON_TIMEOUT)

    # Validate: must be non-empty and look like a sentence (>10 chars)
    if raw and len(raw) > 10:
        # Strip surrounding quotes the model sometimes adds
        return raw.strip('"\'')

    # Fallback to template
    overlap = [
        s for s in (job.required_skills or [])
        if s.lower() in set(sk.lower() for sk in (student.skills or []))
    ]
    if overlap:
        return f"Strong alignment on {', '.join(overlap[:3])}."
    return "Profile shows relevant background for this role."


def compute_matches(student: StudentProfile, db: Session, limit: int = 20) -> List[Application]:
    # Build student representation once (used for all semantic comparisons)
    student_text = build_student_text(student)
    student_skill_set = set(s.lower() for s in (student.skills or []))
    if student.resume_text:
        student_skill_set |= set(s.lower() for s in extract_skills(student.resume_text))

    jobs = db.query(Job).filter(Job.status == JobStatus.active).all()
    if not jobs:
        db.commit()
        return []

    # Score all jobs
    scored: list[tuple[Job, float]] = []
    for job in jobs:
        score = _semantic_score(student_text, job)
        # If semantic gives 0 (sentence-transformers not installed), fall back to keyword
        if score == 0.0:
            score = _keyword_overlap_score(student_skill_set, job)
        # Small GPA bonus
        if student.gpa is not None and float(student.gpa) >= 3.5:
            score = min(98.0, score + 3.0)
        scored.append((job, round(score, 2)))

    scored.sort(key=lambda x: x[1], reverse=True)
    scored = scored[:limit]

    # Generate LLM reasons for top N in parallel
    top_n = scored[:_LLM_REASON_TOP_N]
    rest = scored[_LLM_REASON_TOP_N:]

    reasons: dict[str, str] = {}

    if top_n:
        with concurrent.futures.ThreadPoolExecutor(max_workers=_LLM_REASON_TOP_N) as pool:
            futures = {
                pool.submit(_generate_reason, student, job, score): str(job.id)
                for job, score in top_n
            }
            for future in concurrent.futures.as_completed(futures, timeout=_LLM_REASON_TIMEOUT + 2):
                job_id = futures[future]
                try:
                    reasons[job_id] = future.result()
                except Exception:
                    reasons[job_id] = ""

    # Template reasons for the rest
    for job, score in rest:
        overlap = [
            s for s in (job.required_skills or [])
            if s.lower() in student_skill_set
        ]
        reasons[str(job.id)] = (
            f"Solid alignment on {', '.join(overlap[:3])}." if overlap
            else "Profile background aligns with this role."
        )

    # Persist to DB
    for job, score in scored:
        reason = reasons.get(str(job.id), "")
        existing = (
            db.query(Application)
            .filter(Application.student_id == student.id, Application.job_id == job.id)
            .first()
        )
        if existing:
            existing.match_score = Decimal(str(score))
            if reason:
                existing.ai_reason = reason
        else:
            db.add(Application(
                student_id=student.id,
                job_id=job.id,
                match_score=Decimal(str(score)),
                ai_reason=reason,
                status=ApplicationStatus.matched,
            ))

    db.commit()

    return (
        db.query(Application)
        .filter(Application.student_id == student.id)
        .join(Job)
        .filter(Job.status == JobStatus.active)
        .order_by(Application.match_score.desc())
        .limit(limit)
        .all()
    )
