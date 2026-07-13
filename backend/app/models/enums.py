import enum


class Role(str, enum.Enum):
    admin = "admin"
    operator = "operator"
    pencari_kerja = "pencari_kerja"
    perusahaan = "perusahaan"


class AccountStatus(str, enum.Enum):
    aktif = "aktif"
    nonaktif = "nonaktif"


class JobType(str, enum.Enum):
    full_time = "full_time"
    part_time = "part_time"


class JobStatus(str, enum.Enum):
    aktif = "aktif"
    nonaktif = "nonaktif"


class ApplicationStatus(str, enum.Enum):
    ditinjau = "ditinjau"
    interview = "interview"
    diterima = "diterima"
    ditolak = "ditolak"


class EnrollmentStatus(str, enum.Enum):
    belum_mulai = "belum_mulai"
    berjalan = "berjalan"
    selesai = "selesai"


class ComplaintUrgency(str, enum.Enum):
    rendah = "rendah"
    sedang = "sedang"
    tinggi = "tinggi"


class ComplaintStatus(str, enum.Enum):
    pending = "pending"
    diproses = "diproses"
    selesai = "selesai"


class NewsStatus(str, enum.Enum):
    draft = "draft"
    published = "published"


class QuestionType(str, enum.Enum):
    rating = "rating"
    multiple_choice = "multiple_choice"
    short_answer = "short_answer"


class SurveyStatus(str, enum.Enum):
    draft = "draft"
    published = "published"


class ReportStatus(str, enum.Enum):
    pending = "pending"
    proses = "proses"
    selesai = "selesai"


class DocumentType(str, enum.Enum):
    ktp = "ktp"
    kartu_keluarga = "kartu_keluarga"
    ijazah = "ijazah"
    kartu_ak1 = "kartu_ak1"


class DocumentStatus(str, enum.Enum):
    belum_diunggah = "belum_diunggah"
    menunggu = "menunggu"
    terverifikasi = "terverifikasi"
    ditolak = "ditolak"
