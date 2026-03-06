import oracledb
import sys

try:
    c = oracledb.connect(user="system", password="Oracle2024!", dsn="localhost:1521/XE")
    print("DB connected OK, version:", c.version)
    cur = c.cursor()
    cur.execute("SELECT TABLE_NAME FROM USER_TABLES")
    tables = cur.fetchall()
    print("Tables:", [t[0] for t in tables])
    c.close()
except Exception as e:
    print("DB ERROR:", e)
    sys.exit(1)
