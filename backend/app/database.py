import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./athletebridge.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def ensure_schema_columns(engine):
    with engine.connect() as conn:
        try:
            res = conn.exec_driver_sql("PRAGMA table_info(athlete_profiles)").fetchall()
            existing_cols = [r[1] for r in res]
            new_cols = [
                ("exam_period", "VARCHAR(255)"),
                ("short_term_sport_goals", "TEXT"),
                ("long_term_sport_goals", "TEXT"),
                ("improvement_areas", "TEXT"),
                ("platform_goals", "TEXT"),
                ("experience_type", "VARCHAR(50)")
            ]
            for col_name, col_def in new_cols:
                if col_name not in existing_cols:
                    conn.exec_driver_sql(f"ALTER TABLE athlete_profiles ADD COLUMN {col_name} {col_def}")
                    conn.commit()
        except Exception as e:
            print("Schema column migration notice:", e)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
