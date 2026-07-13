export type Role = "admin" | "operator" | "pencari_kerja" | "perusahaan";
export type AccountStatus = "aktif" | "nonaktif";

export interface UserAccount {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: AccountStatus;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: Role;
  user_id: number;
  name: string;
}

export interface JobSeekerProfile {
  nik: string | null;
  phone: string | null;
  birth_place: string | null;
  birth_date: string | null;
  address: string | null;
  village: string | null;
  last_education: string | null;
  major: string | null;
  skills: string | null;
}

export interface CompanyProfile {
  company_name: string;
  official_email: string | null;
  phone: string | null;
  sector: string | null;
  website: string | null;
  npwp: string | null;
  nib: string | null;
  city: string | null;
  postal_code: string | null;
  verified: boolean;
}

export type JobType = "full_time" | "part_time";
export type JobStatus = "aktif" | "nonaktif";

export interface Job {
  id: number;
  company_id: number;
  title: string;
  description: string;
  job_type: JobType;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  image_url: string | null;
  status: JobStatus;
  created_at: string;
  company_name: string | null;
}

export type ApplicationStatus = "ditinjau" | "interview" | "diterima" | "ditolak";

export interface Application {
  id: number;
  job_id: number;
  job_seeker_id: number;
  status: ApplicationStatus;
  applied_at: string;
  job_title: string | null;
  company_name: string | null;
  applicant_name: string | null;
}

export type EnrollmentStatus = "belum_mulai" | "berjalan" | "selesai";

export interface Training {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  capacity: number;
  enrolled_count: number;
  location: string | null;
  scheduled_at: string | null;
  banner_url: string | null;
  created_at: string;
}

export interface Enrollment {
  id: number;
  training_id: number;
  job_seeker_id: number;
  progress_percent: number;
  status: EnrollmentStatus;
  enrolled_at: string;
  training_title: string | null;
}

export type ComplaintUrgency = "rendah" | "sedang" | "tinggi";
export type ComplaintStatus = "pending" | "diproses" | "selesai";

export interface Complaint {
  id: number;
  ticket_code: string;
  full_name: string;
  nik: string | null;
  category: string;
  urgency: ComplaintUrgency;
  detail: string;
  evidence_url: string | null;
  status: ComplaintStatus;
  created_at: string;
}

export type NewsStatus = "draft" | "published";

export interface NewsArticle {
  id: number;
  title: string;
  thumbnail_url: string | null;
  content: string;
  category: string | null;
  status: NewsStatus;
  published_at: string | null;
  created_at: string;
}

export type QuestionType = "rating" | "multiple_choice" | "short_answer";
export type SurveyStatus = "draft" | "published";

export interface SurveyQuestion {
  id: number;
  question_type: QuestionType;
  text: string;
  required: boolean;
  options: string[] | null;
  order: number;
}

export interface Survey {
  id: number;
  title: string;
  subtitle: string | null;
  status: SurveyStatus;
  created_at: string;
  questions: SurveyQuestion[];
}

export interface QuestionResultOption {
  label: string;
  count: number;
  percentage: number;
}

export interface QuestionResult {
  question_id: number;
  text: string;
  question_type: QuestionType;
  response_count: number;
  average_rating: number | null;
  options: QuestionResultOption[];
}

export interface SurveyResults {
  survey_id: number;
  total_responses: number;
  average_score: number;
  satisfaction_rate: number;
  questions: QuestionResult[];
}

export type ReportStatus = "pending" | "proses" | "selesai";

export interface CompanyReport {
  id: number;
  company_id: number;
  period: string;
  npwp: string | null;
  nib: string | null;
  city: string | null;
  postal_code: string | null;
  sector: string | null;
  male_count: number;
  female_count: number;
  total_count: number;
  status: ReportStatus;
  submitted_at: string;
  company_name: string | null;
}

export type DocumentType = "ktp" | "kartu_keluarga" | "ijazah" | "kartu_ak1";
export type DocumentStatus = "belum_diunggah" | "menunggu" | "terverifikasi" | "ditolak";

export interface DocumentRecord {
  id: number;
  job_seeker_id: number;
  document_type: DocumentType;
  file_url: string | null;
  status: DocumentStatus;
  uploaded_at: string | null;
}

export interface Participant {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  village: string | null;
  nik: string | null;
  document_status: DocumentStatus;
}

export interface DailyPoint {
  label: string;
  value: number;
}

export interface AdminDashboard {
  total_participants: number;
  participants_this_month: number;
  total_trainings: number;
  ongoing_trainings: number;
  top_village: string | null;
  total_complaints: number;
  pending_complaints: number;
  daily_visits: DailyPoint[];
  participant_distribution: DailyPoint[];
}

export interface JobSeekerDashboard {
  profile_completion: number;
  applications_sent: number;
  interviews_in_progress: number;
  trainings_joined: number;
  active_documents: number;
}

export interface CompanyDashboard {
  active_jobs: number;
  total_applicants: number;
  last_report_period: string | null;
  account_status: string;
  applicant_trend: DailyPoint[];
}
