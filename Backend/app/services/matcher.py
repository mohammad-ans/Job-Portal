from decimal import Decimal
from typing import List
from sqlalchemy.orm import Session

from app.models.student_profile import StudentProfile
from app.models.job import Job, JobStatus
from app.models.application import Application, ApplicationStatus
from app.services.skills_vocab import extract_skills


def _build_student_skill_set(student: StudentProfile) -> set:
    skills = set(s.lower() for s in (student.skills or []))
    if student.resume_text:
        skills |= set(s.lower() for s in extract_skills(student.resume_text))
    return skills


def _score_job(student_skills: set, job: Job) -> tuple:
    job_skills = [s for s in (job.required_skills or [])]
    if not job_skills:
        return Decimal("0"), "No specific skills required."

    job_skill_set = set(s.lower() for s in job_skills)
    overlap = [s for s in job_skills if s.lower() in student_skills]
    raw = 100 * len(overlap) / max(len(job_skill_set), 1)
    score = min(100.0, raw)

    top3 = overlap[:3]
    if top3:
        ai_reason = f"Strong match on {', '.join(top3)}."
    else:
        ai_reason = "Partial profile alignment with job requirements."

    return Decimal(str(round(score, 2))), ai_reason


def compute_matches(student: StudentProfile, db: Session, limit: int = 20) -> List[Application]:
    student_skills = _build_student_skill_set(student)
    jobs = db.query(Job).filter(Job.status == JobStatus.active).all()

    scored = []
    for job in jobs:
        score, ai_reason = _score_job(student_skills, job)
        if student.gpa is not None and float(student.gpa) >= 3.5:
            score = min(Decimal("100"), score + Decimal("5"))
        scored.append((job, score, ai_reason))

    scored.sort(key=lambda x: x[1], reverse=True)
    scored = scored[:limit]

    for job, score, ai_reason in scored:
        existing = (
            db.query(Application)
            .filter(Application.student_id == student.id, Application.job_id == job.id)
            .first()
        )
        if existing:
            existing.match_score = score
            existing.ai_reason = ai_reason
        else:
            db.add(
                Application(
                    student_id=student.id,
                    job_id=job.id,
                    match_score=score,
                    ai_reason=ai_reason,
                    status=ApplicationStatus.matched,
                )
            )

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
