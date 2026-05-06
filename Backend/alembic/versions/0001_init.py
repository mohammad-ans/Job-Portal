"""Initial schema

Revision ID: 0001
Revises:
Create Date: 2026-05-05
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()

    # ── ENUM types ────────────────────────────────────────────────────────────
    for name, values in [
        ("user_role", ["student", "employer", "admin"]),
        ("job_type", ["full_time", "part_time", "internship", "contract"]),
        ("job_status", ["pending", "active", "rejected", "closed"]),
        ("application_status", ["matched", "applied", "shortlisted", "rejected", "hired"]),
        ("approval_type", ["company", "job", "student_verification"]),
        ("approval_status", ["pending", "approved", "rejected"]),
        ("story_type", ["student", "employer"]),
    ]:
        quoted = ", ".join(f"'{v}'" for v in values)
        conn.execute(sa.text(
            f"DO $$ BEGIN "
            f"  CREATE TYPE {name} AS ENUM ({quoted}); "
            f"EXCEPTION WHEN duplicate_object THEN NULL; "
            f"END $$;"
        ))

    # ── users ─────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("role", sa.Text, nullable=False),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("is_verified", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    conn.execute(sa.text(
        "ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role"
    ))

    # ── student_profiles ──────────────────────────────────────────────────────
    op.create_table(
        "student_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("university", sa.String(200), nullable=True),
        sa.Column("degree", sa.String(120), nullable=True),
        sa.Column("graduation_year", sa.Integer, nullable=True),
        sa.Column("gpa", sa.Numeric(3, 2), nullable=True),
        sa.Column("skills", postgresql.ARRAY(sa.Text), nullable=False, server_default="{}"),
        sa.Column("resume_url", sa.String(500), nullable=True),
        sa.Column("resume_text", sa.Text, nullable=True),
        sa.Column("bio", sa.Text, nullable=True),
        sa.Column("is_approved", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    # ── employer_profiles ─────────────────────────────────────────────────────
    op.create_table(
        "employer_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("company_name", sa.String(200), nullable=False),
        sa.Column("company_website", sa.String(500), nullable=True),
        sa.Column("company_size", sa.String(50), nullable=True),
        sa.Column("industry", sa.String(120), nullable=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("is_approved", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    # ── jobs ──────────────────────────────────────────────────────────────────
    op.create_table(
        "jobs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("employer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("employer_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("location", sa.String(120), nullable=False),
        sa.Column("job_type", sa.Text, nullable=False),
        sa.Column("salary_min", sa.Integer, nullable=True),
        sa.Column("salary_max", sa.Integer, nullable=True),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("required_skills", postgresql.ARRAY(sa.Text), nullable=False, server_default="{}"),
        sa.Column("status", sa.Text, nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_jobs_status", "jobs", ["status"])
    op.create_index("ix_jobs_employer_id", "jobs", ["employer_id"])
    conn.execute(sa.text(
        "ALTER TABLE jobs ALTER COLUMN job_type TYPE job_type USING job_type::job_type;"
        " ALTER TABLE jobs ALTER COLUMN status TYPE job_status USING status::job_status;"
    ))

    # ── applications ──────────────────────────────────────────────────────────
    op.create_table(
        "applications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("match_score", sa.Numeric(5, 2), nullable=False),
        sa.Column("ai_reason", sa.Text, nullable=True),
        sa.Column("status", sa.Text, nullable=False, server_default="matched"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("student_id", "job_id", name="uq_application_student_job"),
    )
    conn.execute(sa.text(
        "ALTER TABLE applications ALTER COLUMN status TYPE application_status USING status::application_status"
    ))

    # ── approvals ─────────────────────────────────────────────────────────────
    op.create_table(
        "approvals",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("target_type", sa.Text, nullable=False),
        sa.Column("target_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("details", sa.Text, nullable=True),
        sa.Column("ai_confidence", sa.Numeric(5, 2), nullable=False),
        sa.Column("flags", sa.Integer, nullable=False, server_default="0"),
        sa.Column("flag_reason", sa.Text, nullable=True),
        sa.Column("status", sa.Text, nullable=False, server_default="pending"),
        sa.Column("reviewed_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    conn.execute(sa.text(
        "ALTER TABLE approvals ALTER COLUMN target_type TYPE approval_type USING target_type::approval_type;"
        " ALTER TABLE approvals ALTER COLUMN status TYPE approval_status USING status::approval_status;"
    ))

    # ── success_stories ───────────────────────────────────────────────────────
    op.create_table(
        "success_stories",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("role_text", sa.String(120), nullable=False),
        sa.Column("company", sa.String(120), nullable=False),
        sa.Column("story_type", sa.Text, nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    conn.execute(sa.text(
        "ALTER TABLE success_stories ALTER COLUMN story_type TYPE story_type USING story_type::story_type"
    ))

    # ── system_logs ───────────────────────────────────────────────────────────
    op.create_table(
        "system_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("event", sa.String(200), nullable=False),
        sa.Column("actor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("metadata", postgresql.JSONB, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_system_logs_created_at", "system_logs", ["created_at"])


def downgrade() -> None:
    op.drop_table("system_logs")
    op.drop_table("success_stories")
    op.drop_table("approvals")
    op.drop_table("applications")
    op.drop_table("jobs")
    op.drop_table("employer_profiles")
    op.drop_table("student_profiles")
    op.drop_table("users")
    conn = op.get_bind()
    for t in ["story_type", "approval_status", "approval_type", "application_status",
              "job_status", "job_type", "user_role"]:
        conn.execute(sa.text(f"DROP TYPE IF EXISTS {t}"))
