from fastapi import FastAPI, Request, Depends
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.exceptions import HTTPException as StarletteHTTPException

from pydantic import BaseModel
from pydantic.types import OptionalInt

import datetime
import sqlite3
import os

SQLALCHEMY_DATABASE_URL = os.environ.get("SQLALCHEMY_DATABASE_URL", "sql_app.db")


app = FastAPI(docs_url=None, redoc_url=None)
app.mount("/static", StaticFiles(directory="pedropedia/static"), name="static")
app.mount("/scripts", StaticFiles(directory="pedropedia/scripts"), name="scripts")
templates = Jinja2Templates(directory="pedropedia/templates")


@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request, exc):
    return templates.TemplateResponse("404.html", {"request": request}, status_code=404)


def get_db():
    connection = sqlite3.connect(SQLALCHEMY_DATABASE_URL, check_same_thread=False)
    try:
        cursor = connection.cursor()
        create_tables(cursor)
        yield cursor
        connection.commit()
    finally:
        cursor.close()
        connection.close()


def create_tables(db: sqlite3.Cursor):
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


class Post(BaseModel):
    date: datetime.date
    content: str
    is_true: bool
    num_true: OptionalInt = None
    num_false: OptionalInt = None


def get_content(db: sqlite3.Cursor, date: datetime.date):
    db.execute("SELECT post, is_true FROM facts where date=:date", {"date": date})
    response = db.fetchone()
    if response:
        post, is_true = response
        is_true = is_true == 1
    else:
        post, is_true = "Pedro was too lazy to post today", True
    return Post(date=date, content=post, is_true=is_true)


@app.get("/date/{date}", response_model=Post)
async def get_date_content(
    date: datetime.date, db: sqlite3.Cursor = Depends(get_db)
) -> Post:
    return get_content(db, date)


@app.get("/", response_class=HTMLResponse)
async def build_page(request: Request, db: sqlite3.Cursor = Depends(get_db)):
    today = datetime.date.today()
    post = get_content(db, today)
    content, is_true = post.content, post.is_true
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "date": today, "content": content, "isTrue": is_true},
    )
