# Seed data

- `locations_prices.md` — source list of locations, sublocations and day-trip prices from Kislovodsk.
- `assets/*.jpg` — cover photos used by `npm run seed` (copied into `uploads/`).

On the server after deploy:

```bash
cd /opt/tmp-app
git pull
docker compose -p tmpapp --env-file .env.prod up -d --build
docker compose -p tmpapp --env-file .env.prod exec api npm run seed
```
