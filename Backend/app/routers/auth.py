from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User, UserRole
from app.models.student_profile import StudentProfile
from app.models.employer_profile import EmployerProfile
from app.models.approval import Approval, ApprovalType, ApprovalStatus
from app.schemas.auth import SignupRequest, LoginRequest, AuthResponse
from app.schemas.user import UserOut
from app.services import ai_moderator

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role.value,
        avatar_url=user.avatar_url,
        is_verified=user.is_verified,
        created_at=user.created_at,
    )


@router.post("/signup", response_model=AuthResponse, status_code=201)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    if body.role == "admin":
        raise HTTPException(status_code=400, detail="Admin accounts cannot be created via signup")

    if body.role not in ("student", "employer"):
        raise HTTPException(status_code=400, detail="role must be 'student' or 'employer'")

    if body.role == "employer" and not body.company_name:
        raise HTTPException(status_code=400, detail="company_name is required for employer signup")

    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        name=body.name,
        role=UserRole(body.role),
        is_verified=False,
    )
    db.add(user)
    db.flush()

    if body.role == "student":
        profile = StudentProfile(user_id=user.id, skills=[])
        db.add(profile)
        db.flush()
        confidence = ai_moderator.score_student_profile(
            name=user.name,
            university=None,
            degree=None,
            gpa=None,
            skills=[],
        )
        approval = Approval(
            target_type=ApprovalType.student_verification,
            target_id=profile.id,
            name=user.name,
            ai_confidence=confidence,
            flags=0,
            status=ApprovalStatus.pending,
        )
    else:
        profile = EmployerProfile(
            user_id=user.id,
            company_name=body.company_name,
        )
        db.add(profile)
        db.flush()
        confidence = ai_moderator.score_company_profile(
            company_name=body.company_name,
            industry=None,
            website=None,
            description=None,
        )
        approval = Approval(
            target_type=ApprovalType.company,
            target_id=profile.id,
            name=body.company_name,
            ai_confidence=confidence,
            flags=0,
            status=ApprovalStatus.pending,
        )

    db.add(approval)
    db.commit()
    db.refresh(user)

    token = create_access_token(str(user.id), user.role.value)
    return AuthResponse(access_token=token, token_type="bearer", user=_user_out(user))


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(str(user.id), user.role.value)
    return AuthResponse(access_token=token, token_type="bearer", user=_user_out(user))


@router.post("/logout", status_code=204)
def logout(user=Depends(get_current_user)):
    return None


@router.get("/me", response_model=UserOut)
def me(user=Depends(get_current_user)):
    return _user_out(user)
