FROM tiangolo/uvicorn-gunicorn-fastapi:python3.8

ENV MODULE_NAME="pedropedia.app"
ENV VARIABLE_NAME="app"
ENV PORT 80

COPY ./requirements.txt ./
RUN python -m pip install -r requirements.txt

COPY ./pedropedia ./pedropedia

EXPOSE 80
USER nobody
