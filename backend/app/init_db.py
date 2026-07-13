"""Create all tables directly from the SQLAlchemy models.

Use this for local development bootstrapping. For production deployments,
prefer generating and applying proper Alembic migrations instead.
"""

from app.core.database import Base, engine
from app.models import *  # noqa: F401,F403  ensures all models are registered

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")
