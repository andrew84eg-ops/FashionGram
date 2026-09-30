# FashionGram

A digital closet. Photograph what you own, mix looks in a fitting room, save outfits to dates, and fill only the gap — so you stop buying the white blouse you already have.

This is the **2026 web rebuild** of the original Ionic/Cordova FashionGram concept (not the old Angular app).

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints. Sign in with email or Google/X.

First sign-in seeds an 8-piece starter closet and follows community members (Lina, Nour, Maya, Yasmine).

## What is in here

| Area | Route |
|---|---|
| Closet, filters, gap insights | `/closet` |
| Add a photographed piece | `/add` |
| Fitting room | `/room` |
| Saved looks / calendar | `/looks` |
| Partner shop + complete-the-look | `/shop` |
| Timeline | `/feed` |
| Explore public pieces | `/explore` |
| Profile | `/me` |

## Stack

TanStack Start, React, Tailwind, Better Auth, PostgreSQL (PGLite locally; Postgres in production).

## Scripts

```bash
npm run dev          # development
npm run build        # production build
npm run typecheck    # tsc --noEmit
```
