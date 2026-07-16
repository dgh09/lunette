# Lunette — Demo E-commerce

Tienda de moda femenina **de demostración**, construida como ejercicio full-stack
y usada como aplicación de referencia para desplegar sobre Kubernetes con GitOps
(ver [eks-gitops-platform](https://github.com/dgh09/eks-gitops-platform)).

> Marca, catálogo e imágenes son **ficticios**. Las fotos provienen de
> [Unsplash](https://unsplash.com) (licencia libre). No representa a ninguna
> tienda real.

## Stack

| Capa | Tecnología |
|------|------------|
| Storefront | Next.js 14 (App Router), Tailwind CSS, Radix UI |
| Backend | Medusa 2 (headless commerce) |
| Datos | PostgreSQL |
| Auth | NextAuth (credentials) |
| Empaquetado | Docker (multi-stage, output standalone) |

## Estructura

```
lunette/
├── storefront/   # Next.js — la tienda (consume la Store API de Medusa)
└── backend/      # Medusa — catálogo, pedidos, admin
```

## Desarrollo local

Cada subproyecto tiene su propio `.env.example`. En resumen:

```bash
# Backend (Medusa) — requiere PostgreSQL
cd backend
npm install
npx medusa db:migrate
npm run seed          # carga catálogo demo
npm run dev           # http://localhost:9000

# Storefront (Next.js)
cd storefront
npm install
npm run dev           # http://localhost:3000
```

El storefront lee el catálogo de la Store API de Medusa vía
`NEXT_PUBLIC_MEDUSA_URL` y `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.

## Despliegue

El storefront se empaqueta con el `Dockerfile` de `storefront/` (Next.js
standalone). El objetivo es desplegar el stack completo (storefront + Medusa +
PostgreSQL) sobre Kubernetes vía GitOps con ArgoCD, en
[eks-gitops-platform](https://github.com/dgh09/eks-gitops-platform).
