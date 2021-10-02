# pedropedia

Small website with random facts (and sometimes lies)

## development

Run website locally in reload mode with:
```bash
docker run --user nobody -p 9000:80 -d -v $(pwd)/pedropedia/data:/var/lib/pedropedia --env-file .env --name pedropedia_test -v $(pwd)/pedropedia/pedropedia:/app/pedropedia pedropedia /start-reload.sh
```

