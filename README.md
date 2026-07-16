# Lunette — E-commerce Demo

A **demo** women's fashion store, built as a full-stack exercise and used as a
reference application for deploying to Kubernetes with GitOps (see
[eks-gitops-platform](https://github.com/dgh09/eks-gitops-platform)).

> Brand, catalog, and images are **fictional**. Photos come from
> [Unsplash](https://unsplash.com) (free license). This does not represent any
> real store.

## Stack

| Layer | Technology |
|-------|------------|
| Storefront | Next.js 14 (App Router), Tailwind CSS, Radix UI |
| Backend | Medusa 2 (headless commerce) |
| Data | PostgreSQL |
| Auth | NextAuth (credentials) |
| Packaging | Docker (multi-stage, standalone output) |

## Structure

```
lunette/
├── storefront/   # Next.js — the store (consumes Medusa's Store API)
└── backend/      # Medusa — catalog, orders, admin
```

## Local development

Each subproject has its own `.env.example`. In short:

```bash
# Backend (Medusa) — requires PostgreSQL
cd backend
npm install
npx medusa db:migrate
npm run seed          # loads the demo catalog
npm run dev           # http://localhost:9000

# Storefront (Next.js)
cd storefront
npm install
npm run dev           # http://localhost:3000
```

The storefront reads the catalog from Medusa's Store API via
`NEXT_PUBLIC_MEDUSA_URL` and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.

## Deployment

The storefront is packaged with the `Dockerfile` in `storefront/` (Next.js
standalone output). The goal is to deploy the full stack (storefront + Medusa +
PostgreSQL) to Kubernetes via GitOps with ArgoCD, in
[eks-gitops-platform](https://github.com/dgh09/eks-gitops-platform).
