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
from app.models.faq import FAQ

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

        # --- FAQs ---
        faqs = [
            FAQ(question="How long does account verification take?",
                answer="Admin team reviews new student and employer accounts within 24 hours. You will receive full platform access once verified. In the meantime you can complete your profile and upload your resume.",
                category="Getting Started", order_index=0),
            FAQ(question="How do I get my identity verified as a student?",
                answer="After signing up, your account is automatically queued for admin review. To speed up verification, go to Account Settings and fill in your university, degree, and graduation year. Upload your resume — the more complete your profile, the faster the approval.",
                category="Getting Started", order_index=1),
            FAQ(question="Can I apply for jobs before my identity is verified?",
                answer="Yes — you can apply, but the application will show a 'Pending Verification' status and will not be visible to employers until an admin verifies your identity. Once verified, all your pending applications automatically become active.",
                category="Getting Started", order_index=2),
            FAQ(question="How do I upload my resume and why is it important?",
                answer="Go to your Student Hub and click the upload area, or drag and drop a PDF/DOCX file. The AI parser extracts your skills automatically and uses them to compute match scores. A complete resume with a clear skills section will dramatically improve your match quality.",
                category="Resume & Profile", order_index=0),
            FAQ(question="What resume format gives the best parsing results?",
                answer="Use a single-column PDF or DOCX with clearly labelled sections: Skills, Education, and Projects. Avoid tables, multiple columns, and images — the parser reads plain text. List specific technologies (e.g. 'React', 'Python', 'SQL') rather than generic descriptions.",
                category="Resume & Profile", order_index=1),
            FAQ(question="How is the AI Match Score calculated?",
                answer="The score is computed using Cosine Similarity between the vector of your extracted skills and the vector of the job's required skills and description keywords. A score above 70% means strong alignment. Skills that appear in both your profile and the job description are highlighted in green.",
                category="AI Matching", order_index=0),
            FAQ(question="Why do some jobs appear even if my score is lower?",
                answer="The engine shows all jobs where any skill overlap exists, ranked from highest to lowest match. This gives you visibility into stretch opportunities. Applying with a lower score is still worthwhile — employers see your full profile.",
                category="AI Matching", order_index=1),
            FAQ(question="How do employers see my application?",
                answer="Once verified, your application appears in the employer's candidate pipeline ranked by AI match score. They can view your skills, GPA, university, and a resume snippet. Shortlisted candidates are moved to a dedicated section; rejected ones are removed from their view.",
                category="AI Matching", order_index=2),
            FAQ(question="How does an employer post a job?",
                answer="Employers must first be verified by an admin. Once verified, go to Employer Suite → Post New Role and fill in the job title, location, type, required skills, and description. The job goes to admin review; once approved it goes live and matching begins automatically.",
                category="For Employers", order_index=0),
            FAQ(question="How do I change my password?",
                answer="Go to Account Settings (click your avatar in the top-right corner → Account Settings). Scroll down to the 'Change Password' section. Enter your current password, then your new password twice. Click 'Change Password' to save.",
                category="Account", order_index=0),
            FAQ(question="How do I update my profile picture?",
                answer="On the Account Settings page, click your profile photo. A file picker will open — select a JPEG, PNG, or WebP image under 5 MB. The photo updates immediately across the header and all pages.",
                category="Account", order_index=1),
            FAQ(question="Can I track all my job applications?",
                answer="Yes. From your Student Hub, click 'My Applications' in the header. You will see all applications with their current status: Pending Verification, Applied, Shortlisted, Not Selected, or Hired. Use the filter buttons to sort by status.",
                category="Account", order_index=2),
        ]
        for faq in faqs:
            db.add(faq)

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
