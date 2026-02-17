# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NCD Health+ is a clinical decision support web app for non-communicable disease (NCD) risk prediction. It implements the NCD-CIE (Causal Inference Engine) framework using a knowledge graph with 107 evidence-based causal edges to compute CVD, T2DM, and CKD risk scores with what-if intervention simulation.

## Commands

```bash
npm run dev      # Start development server on localhost:3000
npm run build    # Build static export to out/
npm run lint     # Run ESLint
npx serve out/   # Serve production build locally
```

## Architecture

### Core Engine (`src/lib/`)

- **ncd-cie-engine.ts** — Risk computation engine implementing:
  - Z-score standardization against population reference stats
  - Logistic-link scoring: `R_d = σ(β₀ + Σ W·z)` with disease intercepts
  - 95% CIs using edge weight confidence bounds
  - What-if cascade: topological propagation with γ=0.7 attenuation, max depth 3
  - Composite risk: `R_NCD = 1 − (1−R_CVD)(1−R_T2DM)(1−R_CKD)`

- **knowledge-graph.ts** — 33 nodes and 107 weighted edges with:
  - Types: KGNode (biomarker/disease/lifestyle/medication/demographic)
  - Types: KGEdge with weight, CI, evidence grade (A-D), domain
  - Topological ordering for causal cascade traversal
  - Helper functions: `getEdgesTo()`, `getEdgesFrom()`, `getNode()`

- **store.ts** — localStorage persistence for patients and visit history

### Pages (`src/app/`)

| Route | Purpose |
|-------|---------|
| `/` | Dashboard with risk gauges (CVD, T2DM, CKD, composite NCD) |
| `/profile` | Patient data input and visit history |
| `/what-if` | Interactive intervention sliders with live risk updates |
| `/knowledge-graph` | Force-directed visualization of all 107 edges |
| `/progress` | Timeline and biomarker trend charts |
| `/about` | NCD-CIE framework explainer |

### UI Components

- **shadcn/ui** — Radix UI primitives in `src/components/ui/` (button, card, slider, switch, tabs)
- **RiskGauge.tsx** — Animated SVG gauge for risk display
- **Navigation.tsx** — Top nav with patient selector

## Tech Stack

- Next.js 14 with App Router (static export via `output: 'export'`)
- TypeScript with strict mode
- Tailwind CSS with custom navy/teal theme and risk colors
- Recharts for data visualization
- Framer Motion for animations
- Path alias: `@/*` maps to `./src/*`

## Key Types

```typescript
// Patient profile with all biomarkers and medications
interface PatientProfile {
  id, name, age, sex, sbp, dbp, ldl, hdl, tc, tg, hba1c, fpg, bmi, egfr,
  smoking, exercise, alcohol, diet,
  statin, htn_med, sglt2i, metformin, aspirin, ace_arb
}

// Risk result with individual and composite scores
interface RiskResult {
  cad, stroke, hf, pad, t2dm, ckd, nafld, cvd_composite, ncd_composite
}
```

## Styling Conventions

- Risk colors: green (`<10%`), yellow (`10-20%`), orange (`20-30%`), red (`>30%`)
- Primary palette: navy-800 background, teal-500 accents
- Use `cn()` utility from `@/lib/utils` for conditional class merging
