FROM tiangolo/uvicorn-gunicorn-fastapi:python3.8

ENV MODULE_NAME="pedropedia.app"
ENV VARIABLE_NAME="app"
ENV PORT 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost/ || exit 1

RUN apt-get update && apt-get install tzdata
ENV TZ=Europe/Amsterdam
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY ./requirements.txt ./
RUN python -m pip install -r requirements.txt

COPY ./pedropedia ./pedropedia

EXPOSE 80
USER nobody
