#!/usr/bin/env python3
"""
Dev seed — creates three test accounts for quick login.

Usage:
    cd Backend
    python dev_seed.py

Test credentials after seeding:
    student@test.com  /  Test1234!   (verified student)
    employer@test.com /  Test1234!   (verified employer)
    admin@test.com    /  Test1234!   (admin)
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from app.db.session import SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.student_profile import StudentProfile
from app.models.employer_profile import EmployerProfile

TEST_PASSWORD = "Test1234!"
HASHED = hash_password(TEST_PASSWORD)


def _get_or_create_user(db, email: str, name: str, role: UserRole) -> tuple[User, bool]:
    user = db.query(User).filter_by(email=email).first()
    if user:
        return user, False
    user = User(
        email=email,
        password_hash=HASHED,
        name=name,
        role=role,
        is_verified=True,
    )
    db.add(user)
    db.flush()
    return user, True


def seed():
    db = SessionLocal()
    try:
        # ── Student ──────────────────────────────────────────────────────────
        student, created = _get_or_create_user(
            db, "student@test.com", "Usman Tariq", UserRole.student
        )
        if created:
            db.add(StudentProfile(
                user_id=student.id,
                university="FAST-NU",
                degree="BS Computer Science",
                graduation_year=2025,
                gpa=3.52,
                skills=["Python", "React", "SQL", "Git", "REST APIs"],
                is_approved=True,
            ))
            print("✓ Created student:  student@test.com")
        else:
            print("→ Skipped student:  already exists")

        # ── Employer ─────────────────────────────────────────────────────────
        employer, created = _get_or_create_user(
            db, "employer@test.com", "Sarah Ahmed", UserRole.employer
        )
        if created:
            db.add(EmployerProfile(
                user_id=employer.id,
                company_name="Nexus Technologies",
                company_website="https://nexustech.pk",
                company_size="51-200 employees",
                industry="Software & IT Services",
                location="Lahore, Pakistan",
                description="Leading tech company building enterprise solutions.",
                is_approved=True,
            ))
            print("✓ Created employer: employer@test.com")
        else:
            print("→ Skipped employer: already exists")

        # ── Admin ─────────────────────────────────────────────────────────────
        _, created = _get_or_create_user(
            db, "admin@test.com", "Test Admin", UserRole.admin
        )
        if created:
            print("✓ Created admin:    admin@test.com")
        else:
            print("→ Skipped admin:    already exists")

        db.commit()

        print()
        print("─" * 48)
        print("  Credentials (password for all: Test1234!)")
        print("─" * 48)
        print("  Student:  student@test.com")
        print("  Employer: employer@test.com")
        print("  Admin:    admin@test.com")
        print("─" * 48)
        print()
        print("Open /dev in the browser for one-click login.")

    except Exception as exc:
        db.rollback()
        print(f"✗ Seeding failed: {exc}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed()
