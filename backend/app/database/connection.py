import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STORAGE_DIR = os.path.join(os.path.dirname(BASE_DIR), "storage")
os.makedirs(STORAGE_DIR, exist_ok=True)
os.makedirs(os.path.join(STORAGE_DIR, "scans"), exist_ok=True)
os.makedirs(os.path.join(STORAGE_DIR, "evidence"), exist_ok=True)
os.makedirs(os.path.join(STORAGE_DIR, "reports"), exist_ok=True)

DB_PATH = os.path.join(STORAGE_DIR, "rabbit_security.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

