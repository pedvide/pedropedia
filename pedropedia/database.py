import sqlite3
import os

SQLALCHEMY_DATABASE_URL = os.environ.get("SQLALCHEMY_DATABASE_URL", "sql_app.db")


def get_db():
    connection = sqlite3.connect(SQLALCHEMY_DATABASE_URL, check_same_thread=False)
    try:
        cursor = connection.cursor()
        yield cursor
        connection.commit()
    finally:
        cursor.close()
        connection.close()
