from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_optional_user, require_roles
from app.models.enums import QuestionType, Role, SurveyStatus
from app.models.survey import Survey, SurveyAnswer, SurveyQuestion, SurveyResponse
from app.models.user import User
from app.schemas.survey import (
    QuestionResult,
    QuestionResultOption,
    SurveyCreate,
    SurveyOut,
    SurveyResponseSubmit,
    SurveyResultsOut,
)

router = APIRouter(prefix="/api/surveys", tags=["surveys"])


@router.get("", response_model=list[SurveyOut])
def list_surveys(published_only: bool = True, db: Session = Depends(get_db)):
    query = db.query(Survey)
    if published_only:
        query = query.filter(Survey.status == SurveyStatus.published)
    return query.order_by(Survey.created_at.desc()).all()


@router.get("/{survey_id}", response_model=SurveyOut)
def get_survey(survey_id: int, db: Session = Depends(get_db)):
    survey = db.get(Survey, survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    return survey


@router.post("", response_model=SurveyOut, status_code=201)
def create_survey(
    payload: SurveyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.admin, Role.operator)),
):
    survey = Survey(title=payload.title, subtitle=payload.subtitle, status=payload.status, created_by=current_user.id)
    db.add(survey)
    db.flush()
    for q in payload.questions:
        db.add(
            SurveyQuestion(
                survey_id=survey.id,
                question_type=q.question_type,
                text=q.text,
                required=q.required,
                options=q.options,
                order=q.order,
            )
        )
    db.commit()
    db.refresh(survey)
    return survey


@router.post("/{survey_id}/responses", status_code=201)
def submit_response(
    survey_id: int,
    payload: SurveyResponseSubmit,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    survey = db.get(Survey, survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    response = SurveyResponse(
        survey_id=survey_id,
        respondent_id=current_user.id if current_user else None,
        respondent_name=payload.respondent_name or (current_user.name if current_user else None),
    )
    db.add(response)
    db.flush()
    for answer in payload.answers:
        db.add(
            SurveyAnswer(
                response_id=response.id,
                question_id=answer.question_id,
                rating_value=answer.rating_value,
                choice_value=answer.choice_value,
                text_value=answer.text_value,
            )
        )
    db.commit()
    return {"message": "Response recorded"}


@router.get("/{survey_id}/results", response_model=SurveyResultsOut)
def survey_results(
    survey_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.admin, Role.operator)),
):
    survey = db.get(Survey, survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")

    total_responses = db.query(SurveyResponse).filter(SurveyResponse.survey_id == survey_id).count()
    question_results: list[QuestionResult] = []
    rating_averages: list[float] = []
    satisfied_count = 0
    satisfied_total = 0

    for question in survey.questions:
        answers = db.query(SurveyAnswer).filter(SurveyAnswer.question_id == question.id).all()
        result = QuestionResult(
            question_id=question.id,
            text=question.text,
            question_type=question.question_type,
            response_count=len(answers),
        )
        if question.question_type == QuestionType.rating and answers:
            ratings = [a.rating_value for a in answers if a.rating_value is not None]
            if ratings:
                avg = sum(ratings) / len(ratings)
                result.average_rating = round(avg, 1)
                rating_averages.append(avg)
                satisfied_total += len(ratings)
                satisfied_count += len([r for r in ratings if r >= 4])
            distribution: dict[int, int] = {i: 0 for i in range(1, 6)}
            for r in ratings:
                if r in distribution:
                    distribution[r] += 1
            result.options = [
                QuestionResultOption(
                    label=f"{i}★",
                    count=distribution[i],
                    percentage=round((distribution[i] / len(ratings)) * 100, 1) if ratings else 0,
                )
                for i in range(1, 6)
            ]
        elif question.question_type == QuestionType.multiple_choice and answers:
            choices = [a.choice_value for a in answers if a.choice_value]
            counts: dict[str, int] = {}
            for c in choices:
                counts[c] = counts.get(c, 0) + 1
            result.options = [
                QuestionResultOption(
                    label=label,
                    count=count,
                    percentage=round((count / len(choices)) * 100, 1) if choices else 0,
                )
                for label, count in counts.items()
            ]
        question_results.append(result)

    average_score = round(sum(rating_averages) / len(rating_averages), 1) if rating_averages else 0.0
    satisfaction_rate = round((satisfied_count / satisfied_total) * 100, 1) if satisfied_total else 0.0

    return SurveyResultsOut(
        survey_id=survey_id,
        total_responses=total_responses,
        average_score=average_score,
        satisfaction_rate=satisfaction_rate,
        questions=question_results,
    )
