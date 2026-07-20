# KAVKAZ Frontend Plan

## Overview

Adaptive Next.js frontend for the KAVKAZ tourism platform, consuming the NestJS REST API with JWT auth.

Stack: Next.js (App Router), TypeScript, Tailwind CSS, native `fetch`, JWT. No UI kits or state-manager libraries.

Location: `./frontend`

## Pages and endpoints

| Route | Auth | Endpoints |
|---|---|---|
| `/` | public | `GET /destinations`, `GET /tours` |
| `/destinations` | public | `GET /destinations` |
| `/destinations/[id]` | public | `GET /destinations/:id`, `GET /tours?destinationId=` |
| `/tours` | public | `GET /tours` (`TourFilterDto`) |
| `/tours/[id]` | public | `GET /tours/:id`; CTA `POST /trips/from-tour/:tourId` |
| `/trip-builder` | USER/ADMIN | redirects to `/trips` or creates empty flow via from-tour |
| `/trips` | USER/ADMIN | `GET /trips` |
| `/trips/[id]` | USER/ADMIN | trip CRUD + days/locations/extra-services |
| `/bookings` | USER/ADMIN | `GET /bookings` |
| `/bookings/[id]` | USER/ADMIN | `GET /bookings/:id` |
| `/login` | public | `POST /auth/login` |
| `/register` | public | `POST /auth/register` |
| `/profile` | USER/ADMIN | `GET/PATCH /users/me`, `POST /images` |
| `/admin` | ADMIN | dashboard |
| `/admin/destinations` | ADMIN | destinations CRUD |
| `/admin/locations` | ADMIN | locations CRUD |
| `/admin/extra-services` | ADMIN | extra-services CRUD |
| `/admin/tours` | ADMIN | tours CRUD (scalar + cover only) |
| `/admin/bookings` | ADMIN | `GET /admin/bookings`, `PATCH /bookings/:id/status` |
| `/admin/users` | ADMIN | `GET/PATCH /admin/users` |

## Missing data / contradictions

- No rating field in any DTO → ratings omitted from UI.
- `GET /tours` returns a plain array → pagination heuristic: disable next when `length < limit`.
- Destination cards need `minTourPrice` / `tourCount` → extended in `DestinationShortDto`.
- Tour list cards need destination → extended in `TourShortDto`.
- No TourDay / TourDayLocation / TourExtraService admin endpoints → admin tours UI marks these as TODO.
- No password-reset endpoint → not implemented.

## Directory structure

```
frontend/
  src/
    app/
    api/
    types/
    components/
    lib/
    styles/
  public/images/
```

## API client

- Typed `request<T>()` with Bearer access token.
- On 401: single `POST /auth/refresh`, one retry, no refresh loops.
- Access token in memory; refresh token in `localStorage`.
- No `any`.

## Design tokens

```css
--background: #f2efe8;
--surface: #ffffff;
--primary: #0b1d13;
--primary-light: #163d2b;
--accent: #d9c6a3;
--text-primary: #101411;
--text-secondary: #667069;
--border: #dedbd3;
--danger: #b83a3a;
```

Breakpoints: mobile 360–767, tablet 768–1199, desktop 1200+.

## How to run

```bash
# backend (port 3000)
cp .env.example .env   # set JWT_* and DB_*
npm run start:dev

# frontend (port 3001)
cd frontend
npm run dev
```

`NEXT_PUBLIC_API_URL` defaults to `http://localhost:3000`.
