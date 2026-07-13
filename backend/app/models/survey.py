from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import QuestionType, SurveyStatus


class Survey(Base):
    __tablename__ = "surveys"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    subtitle: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[SurveyStatus] = mapped_column(Enum(SurveyStatus), default=SurveyStatus.draft)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    questions: Mapped[list["SurveyQuestion"]] = relationship(
        back_populates="survey", cascade="all, delete-orphan", order_by="SurveyQuestion.order"
    )
    responses: Mapped[list["SurveyResponse"]] = relationship(back_populates="survey", cascade="all, delete-orphan")


class SurveyQuestion(Base):
    __tablename__ = "survey_questions"

    id: Mapped[int] = mapped_column(primary_key=True)
    survey_id: Mapped[int] = mapped_column(ForeignKey("surveys.id"), index=True)
    question_type: Mapped[QuestionType] = mapped_column(Enum(QuestionType))
    text: Mapped[str] = mapped_column(Text)
    required: Mapped[bool] = mapped_column(Boolean, default=True)
    options: Mapped[list | None] = mapped_column(JSON, nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0)

    survey: Mapped["Survey"] = relationship(back_populates="questions")
    answers: Mapped[list["SurveyAnswer"]] = relationship(back_populates="question", cascade="all, delete-orphan")


class SurveyResponse(Base):
    __tablename__ = "survey_responses"

    id: Mapped[int] = mapped_column(primary_key=True)
    survey_id: Mapped[int] = mapped_column(ForeignKey("surveys.id"), index=True)
    respondent_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    respondent_name: Mapped[str | None] = mapped_column(String(255))
    submitted_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    survey: Mapped["Survey"] = relationship(back_populates="responses")
    answers: Mapped[list["SurveyAnswer"]] = relationship(back_populates="response", cascade="all, delete-orphan")


class SurveyAnswer(Base):
    __tablename__ = "survey_answers"

    id: Mapped[int] = mapped_column(primary_key=True)
    response_id: Mapped[int] = mapped_column(ForeignKey("survey_responses.id"), index=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("survey_questions.id"), index=True)
    rating_value: Mapped[int | None] = mapped_column(Integer, nullable=True)
    choice_value: Mapped[str | None] = mapped_column(String(255), nullable=True)
    text_value: Mapped[str | None] = mapped_column(Text, nullable=True)

    response: Mapped["SurveyResponse"] = relationship(back_populates="answers")
    question: Mapped["SurveyQuestion"] = relationship(back_populates="answers")
