from pydantic import BaseModel


class DailyPoint(BaseModel):
    label: str
    value: int


class DistributionPoint(BaseModel):
    label: str
    value: int


class AdminDashboardOut(BaseModel):
    total_participants: int
    participants_this_month: int
    total_trainings: int
    ongoing_trainings: int
    top_village: str | None
    total_complaints: int
    pending_complaints: int
    daily_visits: list[DailyPoint]
    participant_distribution: list[DistributionPoint]


class JobSeekerDashboardOut(BaseModel):
    profile_completion: int
    applications_sent: int
    interviews_in_progress: int
    trainings_joined: int
    active_documents: int


class CompanyDashboardOut(BaseModel):
    active_jobs: int
    total_applicants: int
    last_report_period: str | None
    account_status: str
    applicant_trend: list[DailyPoint]
