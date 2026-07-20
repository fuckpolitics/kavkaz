# Deploy рядом с Kaishaku (не трогаем 80/443)

Сервер: `root@5.42.114.140`  
Каталог: `/opt/tmp-app`  
Порт: **8080**  
Compose project: **tmpapp**  
Стек: postgres + Nest API + Next.js + nginx-gateway

Репозиторий: https://github.com/fuckpolitics/kavkaz (private)

## 1. С Mac: git и push

```bash
cd /Users/timurtkhakokhov/kavkaz
git add .
git commit -m "..."
git push
```

Первый раз (уже сделано в репо): `git init` → commit → remote → `git push -u origin main`.

## 2. На сервере: клон и запуск

```bash
sudo ufw allow 8080/tcp

cd /opt
git clone https://github.com/fuckpolitics/kavkaz.git tmp-app
cd /opt/tmp-app

cp .env.prod.example .env.prod
nano .env.prod   # пароли и JWT secrets

# ВАЖНО: -p tmpapp — отдельный project, не пересекается с kaishaku
docker compose -p tmpapp --env-file .env.prod up -d --build

# или:
# bash scripts/server-up.sh
```

Проверка:

```bash
docker compose -p tmpapp --env-file .env.prod ps
curl -sI http://127.0.0.1:8080 | head -5
```

Снаружи: http://5.42.114.140:8080

Сиды (если нужно):

```bash
docker compose -p tmpapp --env-file .env.prod exec api npm run seed
```

## 3. Обновить код позже

На Mac:

```bash
git add . && git commit -m "..." && git push
```

На сервере:

```bash
cd /opt/tmp-app
git pull
docker compose -p tmpapp --env-file .env.prod up -d --build
```

## 4. Остановить / удалить

```bash
cd /opt/tmp-app
docker compose -p tmpapp --env-file .env.prod down        # данные БД сохранить
# docker compose -p tmpapp --env-file .env.prod down -v  # + удалить volume БД
sudo ufw delete allow 8080/tcp
# rm -rf /opt/tmp-app               # когда точно не нужно
```

Kaishaku не затронется.
