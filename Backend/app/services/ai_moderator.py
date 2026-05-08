"""
AI confidence scoring for the admin moderation queue.
Each function calls the LLM to evaluate how legitimate / complete
a submitted profile or job posting looks, returning a score 0–100.
"""

from app.services import ai_client


def _prompt_and_score(prompt: str) -> float:
    raw = ai_client.chat(prompt, max_tokens=10, timeout=20.0)
    return ai_client.parse_score(raw, default=75.0)


def score_student_profile(
    name: str,
    university: str | None,
    degree: str | None,
    gpa: float | None,
    skills: list[str],
) -> float:
    skills_str = ", ".join(skills[:10]) if skills else "none listed"
    gpa_str = str(gpa) if gpa is not None else "not provided"

    prompt = f"""You are a platform moderator reviewing a student profile for legitimacy and completeness.

Profile:
- Name: {name}
- University: {university or "not provided"}
- Degree: {degree or "not provided"}
- GPA: {gpa_str}
- Skills: {skills_str}

Score this profile from 0 to 100 using these criteria:
- 90-100: Complete and clearly legitimate (real university, valid GPA 0-4, relevant skills)
- 70-89: Mostly complete, minor gaps, likely legitimate
- 50-69: Partially complete or some unusual details
- 30-49: Significant gaps or inconsistencies
- 0-29: Very incomplete or suspicious data

IMPORTANT: Your entire response must be a single integer number between 0 and 100.
Do not write any explanation. Do not write any text. Only write the number.

Score:"""
    return _prompt_and_score(prompt)


def score_company_profile(
    company_name: str,
    industry: str | None,
    website: str | None,
    description: str | None,
) -> float:
    prompt = f"""You are a platform moderator reviewing a company registration for legitimacy.

Company details:
- Name: {company_name}
- Industry: {industry or "not provided"}
- Website: {website or "not provided"}
- Description: {(description or "not provided")[:300]}

Score this registration from 0 to 100 using these criteria:
- 90-100: Clearly legitimate business with consistent, complete details
- 70-89: Likely legitimate, minor details missing
- 50-69: Some concerns, unusual company name or missing key info
- 30-49: Multiple concerns or inconsistent information
- 0-29: Likely fake or very suspicious

IMPORTANT: Your entire response must be a single integer number between 0 and 100.
Do not write any explanation. Do not write any text. Only write the number.

Score:"""
    return _prompt_and_score(prompt)


def score_job_posting(
    title: str,
    company: str,
    location: str,
    job_type: str,
    required_skills: list[str],
    description: str,
) -> float:
    skills_str = ", ".join(required_skills[:10]) if required_skills else "none listed"

    prompt = f"""You are a platform moderator reviewing a job posting for legitimacy and quality.

Job posting:
- Title: {title}
- Company: {company}
- Location: {location}
- Type: {job_type}
- Required skills: {skills_str}
- Description preview: {description[:400]}

Score this posting from 0 to 100 using these criteria:
- 90-100: Legitimate, detailed, professional job posting
- 70-89: Mostly legitimate, minor gaps in details
- 50-69: Vague description or unusual requirements
- 30-49: Suspicious requirements or very poor quality
- 0-29: Likely fake, spam, or inappropriate content

IMPORTANT: Your entire response must be a single integer number between 0 and 100.
Do not write any explanation. Do not write any text. Only write the number.

Score:"""
    return _prompt_and_score(prompt)
