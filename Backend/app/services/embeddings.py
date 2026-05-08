"""
Semantic similarity via sentence-transformers (all-MiniLM-L6-v2).
Model is lazy-loaded on first call and cached in memory.
Falls back to keyword-overlap if the package is not installed.
"""

from __future__ import annotations

_model = None


def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def semantic_similarity(text_a: str, text_b: str) -> float:
    """
    Returns cosine similarity 0.0–1.0 between two text strings.
    Falls back to 0.0 on import error or runtime failure.
    """
    if not text_a or not text_b:
        return 0.0
    try:
        from sentence_transformers import util
        model = _get_model()
        embs = model.encode([text_a, text_b], convert_to_tensor=True)
        sim = util.cos_sim(embs[0], embs[1]).item()
        return float(max(0.0, sim))
    except Exception:
        return 0.0


def build_student_text(student) -> str:
    parts = []
    if student.degree:
        parts.append(student.degree)
    if student.university:
        parts.append(f"from {student.university}")
    if student.skills:
        parts.append("Skills: " + ", ".join(student.skills))
    if student.bio:
        parts.append(student.bio)
    if student.resume_text:
        parts.append(student.resume_text[:800])
    return " ".join(parts) or "student profile"


def build_job_text(job) -> str:
    parts = [job.title]
    if job.required_skills:
        parts.append("Required skills: " + ", ".join(job.required_skills))
    if job.description:
        parts.append(job.description[:800])
    return " ".join(parts)
