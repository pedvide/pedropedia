from fastapi import FastAPI, Request, Depends
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

import datetime

from .database import get_db, sqlite3

app = FastAPI()
app.mount("/static", StaticFiles(directory="pedropedia/static"), name="static")
templates = Jinja2Templates(directory="pedropedia/static")


def add_some_content(db: sqlite3.Cursor):
    # db.execute("CREATE TABLE facts (date date, post text, is_true int)")
    db.execute("INSERT INTO facts VALUES ('2021-09-23', 'First fact', 1)")


def get_daily_content(db: sqlite3.Cursor):
    today = datetime.date.today()
    db.execute(
        "SELECT post, is_true FROM facts where date=:today LIMIT 10", {"today": today}
    )
    response = db.fetchone()
    if response:
        post, is_true = response
    else:
        post, is_true = "Pedro was too lazy to post today", 1
    return post, is_true


@app.get("/", response_class=HTMLResponse)
async def build_page(request: Request, db: sqlite3.Cursor = Depends(get_db)):
    add_some_content(db)
    content, is_true = get_daily_content(db)
    return templates.TemplateResponse(
        "index.html", {"request": request, "content": content, "is_true": is_true}
    )