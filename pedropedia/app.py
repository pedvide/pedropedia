from fastapi import FastAPI, Request, Depends
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

import datetime
import sqlite3
import os

SQLALCHEMY_DATABASE_URL = os.environ.get("SQLALCHEMY_DATABASE_URL", "sql_app.db")


app = FastAPI()
app.mount("/static", StaticFiles(directory="pedropedia/static"), name="static")
templates = Jinja2Templates(directory="pedropedia/static")


def get_db():
    connection = sqlite3.connect(SQLALCHEMY_DATABASE_URL, check_same_thread=False)
    try:
        cursor = connection.cursor()
        yield cursor
        connection.commit()
    finally:
        cursor.close()
        connection.close()


def add_some_content(db: sqlite3.Cursor):
    db.execute(
        """CREATE TABLE IF NOT EXISTS facts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date date UNIQUE NOT NULl,
        post TEXT UNIQUE NOT NULl,
        is_true INTEGER NOT NULl,
        num_true INTEGER,
        num_false INTEGER
        )"""
    )
    # db.execute("INSERT INTO facts VALUES ('2021-09-23', 'First fact', 1)")


def get_daily_content(db: sqlite3.Cursor):
    today = datetime.date.today()
    db.execute("SELECT post, is_true FROM facts where date=:today", {"today": today})
    response = db.fetchone()
    if response:
        post, is_true = response
        is_true = is_true == 1
    else:
        post, is_true = "Pedro was too lazy to post today", True
    return post, is_true


@app.get("/", response_class=HTMLResponse)
async def build_page(request: Request, db: sqlite3.Cursor = Depends(get_db)):
    add_some_content(db)
    content, is_true = get_daily_content(db)
    return templates.TemplateResponse(
        "index.html", {"request": request, "content": content, "isTrue": is_true}
    )
