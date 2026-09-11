# FinReq — Frontend

The web client for **FinReq**, a multi-tenant financial requisition
(expense/purchase approval) system. This is a single-page React app: a
public marketing/landing page plus an authenticated dashboard where
requesters submit requests, approvers act on them, and admins manage the
organization.

This document describes the frontend only. The API/real-time server has
its own [README](../backend/request_system_backend/README.md) (separate
repository/folder) — read that first if you want to understand the
approval chain and roles in depth;

---

## Tech stack

| Concern | Tool |
|---|---|
| Framework / build | **React 18 + Vite 5** |
| Routing | **React Router v6** |
| Global UI state | **Redux Toolkit** |
| Styling | **Tailwind CSS 3** | 
| HTTP | **axios** |
