from fastapi import FastAPI, Request, Depends
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.exceptions import HTTPException as StarletteHTTPException

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
    create_tables(db)
    content, is_true = get_daily_content(db)
    return templates.TemplateResponse(
        "index.html", {"request": request, "content": content, "isTrue": is_true}
    )
