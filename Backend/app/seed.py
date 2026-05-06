"""Run: python -m app.seed  (from the Backend/ directory)"""
import uuid
from app.db.session import SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.student_profile import StudentProfile
from app.models.employer_profile import EmployerProfile
from app.models.job import Job, JobType, JobStatus
from app.models.approval import Approval, ApprovalType, ApprovalStatus
from app.models.success_story import SuccessStory, StoryType

DEMO_PASSWORD = hash_password("Demo1234!")

JOBS = [
    {
        "title": "Junior Software Engineer",
        "location": "Karachi, Pakistan",
        "job_type": JobType.full_time,
        "salary_min": 50000,
        "salary_max": 70000,
        "description": (
            "We are looking for a highly motivated fresh graduate to join our frontend team. "
            "You will be working primarily with React and Python backend services to build "
            "scalable web applications. Strong knowledge of REST APIs, Git workflows, and "
            "SQL databases is required. Candidates with open-source contributions are preferred."
        ),
        "required_skills": ["React", "Python", "SQL", "Git", "REST APIs"],
    },
    {
        "title": "Data Analyst Trainee",
        "location": "Lahore, Pakistan",
        "job_type": JobType.internship,
        "salary_min": 30000,
        "salary_max": 45000,
        "description": (
            "Start your career in data with our comprehensive 6-month trainee program. "
            "Focus on analyzing large datasets using Python and SQL, and generating actionable "
            "business insights. Experience with Data Visualization tools such as Tableau or "
            "Power BI is a strong advantage. Strong Statistics background required."
        ),
        "required_skills": ["Python", "SQL", "Statistics", "Data Analysis", "Pandas"],
    },
    {
        "title": "Frontend Developer",
        "location": "Remote",
        "job_type": JobType.full_time,
        "salary_min": 60000,
        "salary_max": 90000,
        "description": (
            "Join our fully remote team to build stunning web interfaces. You must have a keen "
            "eye for design and strong proficiency in modern CSS frameworks like Tailwind CSS. "
            "Proficiency in React, TypeScript, and Figma is essential for this role. UX/UI "
            "knowledge and experience with Figma prototyping are required."
        ),
        "required_skills": ["React", "TypeScript", "Tailwind CSS", "Figma", "UX/UI"],
    },
]

APPROVALS_SEED = [
    {
        "target_type": ApprovalType.company,
        "name": "Quantum Analytics",
        "details": "Tech Startup • Registration Doc #4421",
        "ai_confidence": 98,
        "flags": 0,
        "flag_reason": None,
    },
    {
        "target_type": ApprovalType.job,
        "name": "Data Scientist (Fresh)",
        "details": "Posted by Nexus Tech • Check JD compliance",
        "ai_confidence": 100,
        "flags": 0,
        "flag_reason": None,
    },
    {
        "target_type": ApprovalType.student_verification,
        "name": "Hassan Ali",
        "details": "FAST-NU • Uploaded Academic Transcript",
        "ai_confidence": 65,
        "flags": 2,
        "flag_reason": "Inconsistent university record",
    },
]

STORIES = [
    {
        "name": "Ahmed Raza",
        "role_text": "Junior Software Engineer",
        "company": "TechFlow Solutions",
        "story_type": StoryType.student,
        "content": (
            "I was struggling to get past the traditional ATS filters because I lacked 3+ years "
            "of experience. GradMatch AI read my final year project details and matched me with a "
            "startup looking for exactly my tech stack. I got hired within a week!"
        ),
        "image_url": "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        "name": "Sarah Jenkins",
        "role_text": "Head of Talent",
        "company": "Nexus Tech",
        "story_type": StoryType.employer,
        "content": (
            "We used to spend weeks filtering through generic applications from fresh graduates. "
            "GradMatch's bidirectional engine does it in seconds. Our time-to-hire dropped by 60% "
            "and the candidate quality is incredible."
        ),
        "image_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        "name": "Usman Tariq",
        "role_text": "Data Analyst",
        "company": "QuantCorp",
        "story_type": StoryType.student,
        "content": (
            "The match score gave me the confidence to apply. It highlighted how my academic "
            "projects aligned with the job description perfectly. This platform actually "
            "understands context instead of just keyword counting."
        ),
        "image_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
]


def seed():
    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == "usman@example.com").first():
            print("Seed data already present — skipping.")
            return

        # --- Users ---
        student_user = User(
            email="usman@example.com",
            password_hash=DEMO_PASSWORD,
            name="Usman Tariq",
            role=UserRole.student,
            avatar_url="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
            is_verified=True,
        )
        employer_user = User(
            email="sarah@nexus.tech",
            password_hash=DEMO_PASSWORD,
            name="Sarah Jenkins",
            role=UserRole.employer,
            avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
            is_verified=True,
        )
        admin_user = User(
            email="admin@gradmatch.ai",
            password_hash=DEMO_PASSWORD,
            name="System Admin",
            role=UserRole.admin,
            avatar_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
            is_verified=True,
        )
        db.add_all([student_user, employer_user, admin_user])
        db.flush()

        # --- Profiles ---
        student_profile = StudentProfile(
            user_id=student_user.id,
            university="FAST-NU",
            degree="BS Computer Science",
            graduation_year=2024,
            gpa=3.52,
            skills=["React", "Python", "SQL", "Git", "REST APIs", "Problem Solving"],
            is_approved=True,
        )
        employer_profile = EmployerProfile(
            user_id=employer_user.id,
            company_name="Nexus Tech",
            company_website="https://nexus.tech",
            company_size="51-200 employees",
            industry="Software & IT Services",
            description="A leading tech company building next-gen SaaS products.",
            is_approved=True,
        )
        db.add_all([student_profile, employer_profile])
        db.flush()

        # --- Jobs (status=active, owned by Sarah) ---
        for jdata in JOBS:
            job = Job(
                employer_id=employer_profile.id,
                status=JobStatus.active,
                **jdata,
            )
            db.add(job)
        db.flush()

        # --- Pending approvals ---
        for adata in APPROVALS_SEED:
            db.add(
                Approval(
                    target_id=uuid.uuid4(),
                    status=ApprovalStatus.pending,
                    **adata,
                )
            )

        # --- Success stories ---
        for sdata in STORIES:
            db.add(SuccessStory(**sdata))

        db.commit()
        print("Seed data inserted successfully.")
    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
