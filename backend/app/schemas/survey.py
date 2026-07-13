from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import QuestionType, SurveyStatus


class SurveyQuestionCreate(BaseModel):
    question_type: QuestionType
    text: str
    required: bool = True
    options: list[str] | None = None
    order: int = 0


class SurveyCreate(BaseModel):
    title: str
    subtitle: str | None = None
    status: SurveyStatus = SurveyStatus.draft
    questions: list[SurveyQuestionCreate] = []


class SurveyQuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question_type: QuestionType
    text: str
    required: bool
    options: list[str] | None
    order: int


class SurveyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    subtitle: str | None
    status: SurveyStatus
    created_at: datetime
    questions: list[SurveyQuestionOut] = []


class AnswerSubmit(BaseModel):
    question_id: int
    rating_value: int | None = None
    choice_value: str | None = None
    text_value: str | None = None


class SurveyResponseSubmit(BaseModel):
    respondent_name: str | None = None
    answers: list[AnswerSubmit]


class QuestionResultOption(BaseModel):
    label: str
    count: int
    percentage: float


class QuestionResult(BaseModel):
    question_id: int
    text: str
    question_type: QuestionType
    response_count: int
    average_rating: float | None = None
    options: list[QuestionResultOption] = []


class SurveyResultsOut(BaseModel):
    survey_id: int
    total_responses: int
    average_score: float
    satisfaction_rate: float
    questions: list[QuestionResult]
