# FinReq — Frontend

The web client for **FinReq**, a multi-tenant financial requisition
(expense/purchase approval) system. This is a single-page React app: a
public marketing/landing page plus an authenticated dashboard where
requesters submit requests, approvers act on them, and admins manage the
organization.

This document describes the frontend only. The API/real-time server has
its own [README](../backend/request_system_backend/README.md) (separate
repository/folder) — read that first if you want to understand the
approval chain, roles, and data model in depth;

---

## Table of contents

- [Tech stack](#tech-stack)
- [Getting started](#getting-started)

---

## Tech stack

| Concern | Tool | Notes |
|---|---|---|
| Framework / build | **React 18 + Vite 5** | Fast dev server, `import.meta.env` for config |
| Routing | **React Router v6** | Nested routes for the dashboard shell, three route-guard components |
| Global UI state | **Redux Toolkit** | Two tiny slices only — alerts and modal visibility (see [State management](#state-management)) |
| Styling | **Tailwind CSS 3** + `@tailwindcss/forms` | Utility classes throughout; no CSS-in-JS |
| HTTP | **axios** | One configured instance with auth + token-refresh interceptors |


## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Run the dev server
npm run dev

# Other scripts
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint       # ESLint
```