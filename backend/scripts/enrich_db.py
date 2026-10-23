from app.database import SessionLocal
from app.models import Coach, Opportunity, Scholarship
from app.seed import seed_test_profiles_and_enrichment

def run():
    db = SessionLocal()
    try:
        seed_test_profiles_and_enrichment(db)
        print("Coaches count:", db.query(Coach).count())
        print("Opportunities count:", db.query(Opportunity).count())
        print("Scholarships count:", db.query(Scholarship).count())
    finally:
        db.close()

if __name__ == "__main__":
    run()
