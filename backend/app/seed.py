"""Populate the database with demo data for local development and screenshots.

Run with: python -m app.seed
"""

from datetime import datetime, timedelta, timezone

from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models import *  # noqa: F401,F403
from app.models.company_report import CompanyReport
from app.models.complaint import Complaint
from app.models.document import Document
from app.models.enums import (
    ApplicationStatus,
    ComplaintStatus,
    ComplaintUrgency,
    DocumentStatus,
    DocumentType,
    EnrollmentStatus,
    JobType,
    NewsStatus,
    QuestionType,
    ReportStatus,
    Role,
    SurveyStatus,
)
from app.models.job import Application, Job
from app.models.news import News
from app.models.survey import Survey, SurveyAnswer, SurveyQuestion, SurveyResponse
from app.models.training import Training, TrainingEnrollment
from app.models.user import CompanyProfile, JobSeekerProfile, User

now = datetime.now(timezone.utc)


def make_user(db, name, email, password, role, **kwargs):
    user = User(name=name, email=email, password_hash=hash_password(password), role=role, **kwargs)
    db.add(user)
    db.flush()
    return user


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            print("Database already has data, skipping seed.")
            return

        admin = make_user(db, "Admin Disnaker", "admin@example.gov", "admin1234", Role.admin)
        operator1 = make_user(db, "Rina Agustina", "rina.a@example.gov", "operator123", Role.operator)
        make_user(db, "Hendra Wijaya", "hendra.w@example.gov", "operator123", Role.operator, status="nonaktif")

        rizky = make_user(db, "Rizky Firmansyah", "rizky.f@email.com", "password123", Role.pencari_kerja)
        db.add(JobSeekerProfile(
            user_id=rizky.id, nik="3507261104980001", phone="0812-3456-7890", birth_place="Malang",
            village="Pesanggrahan", last_education="S1", major="Teknik Informatika", skills="React, TypeScript, Figma",
        ))

        dewi = make_user(db, "Dewi Anjani Putri", "dewi.ap@email.com", "password123", Role.pencari_kerja)
        db.add(JobSeekerProfile(user_id=dewi.id, nik="3507261205000003", phone="0813-9876-5432", village="Temas"))

        farhan = make_user(db, "Muhammad Farhan", "m.farhan@email.com", "password123", Role.pencari_kerja)
        db.add(JobSeekerProfile(user_id=farhan.id, nik="3507261506970005", phone="0856-1122-3344", village="Sisir"))

        company1 = make_user(db, "PT Batu Digital Nusantara", "hr@batudigital.example", "password123", Role.perusahaan)
        db.add(CompanyProfile(
            user_id=company1.id, company_name="PT Batu Digital Nusantara", official_email="hr@batudigital.example",
            phone="0341-512999", sector="Teknologi Informasi", website="www.batudigital.example",
            npwp="01.234.567.8-000.000", nib="9120308123456", city="Kota Batu", postal_code="65311", verified=True,
        ))

        company2 = make_user(db, "CV Kusuma Agro Mandiri", "hrd@kusuma.example", "password123", Role.perusahaan)
        db.add(CompanyProfile(
            user_id=company2.id, company_name="CV Kusuma Agro Mandiri", official_email="hrd@kusuma.example",
            sector="Agribisnis", city="Kota Batu", verified=True,
        ))

        company3 = make_user(db, "Jawa Timur Park Group", "hr@jtp.example", "password123", Role.perusahaan)
        db.add(CompanyProfile(
            user_id=company3.id, company_name="Jawa Timur Park Group", official_email="hr@jtp.example",
            sector="Pariwisata", city="Kota Batu", verified=True,
        ))
        db.flush()

        jobs_data = [
            (company1, "Front-End Developer", "Membangun antarmuka web modern berbasis React.", JobType.full_time,
             5000000, 8000000, "/uploads/samples/job-frontend.jpg"),
            (company2, "Staff Akuntansi", "Mengelola laporan keuangan dan rekonsiliasi bank.", JobType.full_time,
             3500000, 4500000, "/uploads/samples/job-accounting.jpg"),
            (company2, "Barista & Kasir", "Melayani pelanggan dan mengelola transaksi.", JobType.part_time,
             2500000, 3000000, "/uploads/samples/job-barista.jpg"),
            (company3, "Tour Guide Wisata", "Memandu wisatawan dengan kemampuan bahasa asing.", JobType.full_time,
             3000000, 3000000, "/uploads/samples/job-tourguide.jpg"),
        ]
        jobs = []
        for company, title, desc, jtype, smin, smax, img in jobs_data:
            job = Job(company_id=company.id, title=title, description=desc, job_type=jtype,
                      location="Kota Batu, Jawa Timur", salary_min=smin, salary_max=smax, image_url=img)
            db.add(job)
            jobs.append(job)
        db.flush()

        db.add(Application(job_id=jobs[0].id, job_seeker_id=rizky.id, status=ApplicationStatus.interview))
        db.add(Application(job_id=jobs[1].id, job_seeker_id=dewi.id, status=ApplicationStatus.ditinjau))
        db.add(Application(job_id=jobs[3].id, job_seeker_id=farhan.id, status=ApplicationStatus.ditolak))
        db.add(Application(job_id=jobs[2].id, job_seeker_id=rizky.id, status=ApplicationStatus.diterima))

        trainings_data = [
            ("Web Development Full Stack", "Teknologi", 50, "Gedung Disnaker Kota Batu", "12 Agustus 2024"),
            ("Desain Grafis & Multimedia", "Desain", 40, "Gedung Disnaker Kota Batu", "18 Agustus 2024"),
            ("Teknik Las & Fabrikasi Logam", "Industri", 30, "BLK Kota Batu", "20 Agustus 2024"),
            ("Bahasa Inggris untuk Kerja", "Bahasa", 60, "Gedung Disnaker Kota Batu", "25 Agustus 2024"),
            ("Barista & Manajemen Kafe", "Kuliner", 25, "BLK Kota Batu", "1 September 2024"),
            ("Teknisi AC & Refrigerasi", "Teknik", 30, "BLK Kota Batu", "5 September 2024"),
        ]
        trainings = []
        for title, category, capacity, location, scheduled_at in trainings_data:
            t = Training(title=title, description=f"Program pelatihan {title.lower()} bersertifikasi.",
                         category=category, capacity=capacity, location=location, scheduled_at=scheduled_at,
                         created_by=admin.id)
            db.add(t)
            trainings.append(t)
        db.flush()

        db.add(TrainingEnrollment(training_id=trainings[0].id, job_seeker_id=rizky.id,
                                   progress_percent=65, status=EnrollmentStatus.berjalan))
        db.add(TrainingEnrollment(training_id=trainings[3].id, job_seeker_id=rizky.id,
                                   progress_percent=0, status=EnrollmentStatus.belum_mulai))

        for doc_type in DocumentType:
            db.add(Document(job_seeker_id=rizky.id, document_type=doc_type,
                             status=DocumentStatus.terverifikasi if doc_type in (DocumentType.ktp, DocumentType.kartu_keluarga)
                             else (DocumentStatus.menunggu if doc_type == DocumentType.ijazah else DocumentStatus.belum_diunggah),
                             file_url=f"/uploads/samples/{doc_type.value}.jpg" if doc_type != DocumentType.kartu_ak1 else None,
                             uploaded_at=now if doc_type != DocumentType.kartu_ak1 else None))
            db.add(Document(job_seeker_id=dewi.id, document_type=doc_type, status=DocumentStatus.menunggu))
            db.add(Document(job_seeker_id=farhan.id, document_type=doc_type, status=DocumentStatus.menunggu))

        complaints_data = [
            ("Rizky Firmansyah", "PHK Sepihak", ComplaintUrgency.tinggi, ComplaintStatus.pending),
            ("Dewi Anjani", "Upah Tidak Dibayar", ComplaintUrgency.sedang, ComplaintStatus.diproses),
            ("Bagas Prasetyo", "K3", ComplaintUrgency.rendah, ComplaintStatus.selesai),
            ("Siti Rahma", "Diskriminasi", ComplaintUrgency.tinggi, ComplaintStatus.diproses),
        ]
        for i, (name, category, urgency, status) in enumerate(complaints_data):
            db.add(Complaint(ticket_code=f"PGD-{i + 1:03d}", full_name=name, category=category, urgency=urgency,
                              detail=f"Laporan terkait {category.lower()}.", status=status))

        news_data = [
            ("Layanan Buka 500 Kuota Pelatihan Kerja Gratis Semester II 2024", "Pelatihan",
             "Pendaftaran program pelatihan vokasi gratis resmi dibuka untuk warga Kota Batu.", NewsStatus.published),
            ("Job Fair Kota Batu 2024 Hadirkan 150 Perusahaan", "Loker",
             "Bursa kerja tahunan mempertemukan pencari kerja dengan perusahaan mitra.", NewsStatus.published),
            ("Pemkot Batu Naikkan UMK 2024 sebesar 6,2 Persen", "Kebijakan",
             "Penyesuaian upah minimum kota berlaku mulai awal tahun.", NewsStatus.published),
            ("Sosialisasi Jaminan Sosial Ketenagakerjaan bagi UMKM", "Sosial",
             "Edukasi kepesertaan jaminan sosial untuk pelaku usaha mikro kecil menengah.", NewsStatus.published),
        ]
        for title, category, content, status in news_data:
            db.add(News(title=title, category=category, content=content, status=status, created_by=admin.id,
                         published_at=now, thumbnail_url="/uploads/samples/news-default.jpg"))

        survey = Survey(title="Survei Kepuasan Pelayanan", subtitle="Indeks Kepuasan Masyarakat 2024",
                         status=SurveyStatus.published, created_by=admin.id)
        db.add(survey)
        db.flush()
        q1 = SurveyQuestion(survey_id=survey.id, question_type=QuestionType.rating,
                             text="Kemudahan akses layanan?", required=True, order=1)
        q2 = SurveyQuestion(survey_id=survey.id, question_type=QuestionType.rating,
                             text="Kecepatan respons dan penyelesaian layanan?", required=True, order=2)
        q3 = SurveyQuestion(survey_id=survey.id, question_type=QuestionType.multiple_choice,
                             text="Layanan mana yang paling sering digunakan?", required=False, order=3,
                             options=["Pelatihan", "Info Loker", "Pengaduan", "Survei Kepuasan"])
        db.add_all([q1, q2, q3])
        db.flush()

        import random
        random.seed(42)
        for i in range(40):
            resp = SurveyResponse(survey_id=survey.id, respondent_name=f"Responden {i + 1}")
            db.add(resp)
            db.flush()
            db.add(SurveyAnswer(response_id=resp.id, question_id=q1.id, rating_value=random.randint(3, 5)))
            db.add(SurveyAnswer(response_id=resp.id, question_id=q2.id, rating_value=random.randint(2, 5)))
            db.add(SurveyAnswer(response_id=resp.id, question_id=q3.id,
                                 choice_value=random.choice(q3.options)))

        db.add(CompanyReport(company_id=company1.id, period="Q2 2024", npwp="01.234.567.8-000.000",
                              nib="9120308123456", city="Kota Batu", postal_code="65311", sector="Teknologi Informasi",
                              male_count=52, female_count=35, status=ReportStatus.selesai))
        db.add(CompanyReport(company_id=company2.id, period="Q2 2024", city="Kota Batu", sector="Agribisnis",
                              male_count=20, female_count=14, status=ReportStatus.proses))
        db.add(CompanyReport(company_id=company3.id, period="Q2 2024", city="Kota Batu", sector="Pariwisata",
                              male_count=150, female_count=106, status=ReportStatus.selesai))

        db.commit()
        print("Seed data created.")
        print("Demo accounts (password shown alongside email):")
        print("  admin@example.gov / admin1234 (admin)")
        print("  rina.a@example.gov / operator123 (operator)")
        print("  rizky.f@email.com / password123 (pencari_kerja)")
        print("  hr@batudigital.example / password123 (perusahaan)")
    finally:
        db.close()


if __name__ == "__main__":
    run()
