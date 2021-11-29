from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.exceptions import HTTPException as StarletteHTTPException

from pydantic import BaseModel

from typing import Optional

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


def create_tables(db: sqlite3.Cursor) -> None:
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
    id: int
    date: datetime.date
    content: str
    is_true: bool
    last_id: bool = False
    first_id: bool = False


def get_max_id(db: sqlite3.Cursor) -> int:
    db.execute(
        "select max(post_id) from (select ROW_NUMBER() OVER(ORDER BY date) AS post_id from facts)"
    )
    response = db.fetchone()
    if response:
        return response[0]
    else:
        raise Exception("Bad connection to db.")


def get_content_by_id(db: sqlite3.Cursor, id: int) -> Optional[Post]:
    db.execute(
        "SELECT date, post, is_true "
        "FROM (SELECT *, ROW_NUMBER() OVER(ORDER BY date) AS post_id FROM facts) "
        "WHERE post_id=:post_id",
        {"post_id": id},
    )
    response = db.fetchone()
    if response:
        date, post, is_true = response
        is_true = is_true == 1
    else:
        return None

    last_id = id == get_max_id(db)
    first_id = id == 1

    return Post(
        id=id,
        date=date,
        content=post,
        is_true=is_true,
        last_id=last_id,
        first_id=first_id,
    )


@app.get("/api/id/{id}", response_model=Post)
@app.get("/api/id", response_model=Post)
async def get_id_content(id: int = None, db: sqlite3.Cursor = Depends(get_db)) -> Post:
    id = id or get_max_id(db)
    post = get_content_by_id(db, id)
    if not post:
        raise HTTPException(status_code=404, detail="Id not found")
    return post


@app.get("/{id}", response_class=HTMLResponse)
@app.get("/", response_class=HTMLResponse)
async def page_id(
    request: Request, id: int = None, db: sqlite3.Cursor = Depends(get_db)
):
    id = id or get_max_id(db)
    post = get_content_by_id(db, id)
    if not post:
        raise HTTPException(status_code=404, detail="Id not found")

    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "id": post.id,
            "date": post.date,
            "content": post.content,
            "isTrue": post.is_true,
            "lastId": post.last_id,
            "firstId": post.first_id,
        },
    )
