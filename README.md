# Data Benchmark Frontend

Angular frontend for the benchmark dashboard. It lets you choose a payload preset, choose a run count, and trigger benchmark requests against the Go, Spring Boot, .NET, and Django backends.

## Clone

SSH:

```bash
git clone git@github.com:Khroxx/data_benchmark_frontend.git
```

HTTPS:

```bash
git clone https://github.com/Khroxx/data_benchmark_frontend.git
```

## Runtime

Recommended local toolchain:

```bash
Node.js 24.2.0
npm 11.13.0
```

The project also includes [.nvmrc](/home/bari/test/practice/data_benchmark_frontend/.nvmrc).

## Environment

This repo is intentionally clone-and-run friendly. There are no private frontend secrets required for local testing.

Public example env file:

```bash
cp .env.example .env
```

Current public variables:

- `FRONTEND_API_BASE_URL=` for an optional absolute backend base URL
- `NODE_ENV=development`

## Local development

Install dependencies:

```bash
npm ci
```

Start the Angular dev server:

```bash
npm start
```

Create a production build:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## Backend endpoints

The UI expects these routes to exist:

- `/api/golang/benchmark`
- `/api/spring/benchmark`
- `/api/dotnet/benchmark`
- `/api/django/benchmark`

Each backend is called with query params such as `type`, `size` and `runs`.
