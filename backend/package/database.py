import os
import oracledb
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

USER = os.getenv("ORACLE_USER", "system")
PASSWORD = os.getenv("ORACLE_PASSWORD", "OraclePassword2026!")
HOST_PORT = os.getenv("ORACLE_HOST_PORT", "localhost:1521")
SERVICE = os.getenv("ORACLE_SERVICE", "FREEPDB1")

# On retire `oracledb.init_oracle_client()` pour forcer le "Thin mode"
# (le mode par défaut, sans besoin du client lourd Oracle)

SQLALCHEMY_DATABASE_URL = f"oracle+oracledb://{USER}:{PASSWORD}@{HOST_PORT}/?service_name={SERVICE}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
