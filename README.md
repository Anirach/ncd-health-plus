# NCD Health+ — Clinical Decision Support Web App

> Companion web application for the **NCD-CIE** (Non-Communicable Disease — Causal Inference Engine) paper, submitted to AIiH 2026.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8) ![License](https://img.shields.io/badge/License-MIT-green)

## Overview

NCD Health+ is an interactive clinical decision support tool that predicts and visualizes non-communicable disease (NCD) risk using a **causal knowledge graph with 107 evidence-based edges**. It implements the NCD-CIE framework for:

- **Risk Scoring** — Logistic-link model: `R_d = σ(β₀ + Σ W·z)`
- **What-If Simulation** — Topological causal cascade with γ=0.7 attenuation
- **Composite NCD Risk** — `R_NCD = 1 − (1−R_CVD)(1−R_T2DM)(1−R_CKD)`

## Features

| Page | Description |
|------|-------------|
| **Dashboard** | Risk gauges for CVD, T2DM, CKD + composite NCD score with 95% CI |
| **Patient Profile** | Lab data input with visit history tracking |
| **What-If Simulator** | Interactive sliders with live cascading risk updates |
| **Knowledge Graph** | Interactive force-directed visualization of all 107 causal edges |
| **Progress Tracker** | Timeline, biomarker trends, milestones |
| **About** | Educational explainer of the NCD-CIE framework |

## Demo Patients

| Patient | Profile | Risk Level |
|---------|---------|------------|
| Sarah Chen | 40F, healthy lifestyle, normal labs | Low |
| James Wilson | 55M, overweight, pre-diabetic, untreated hypertension | Moderate |
| Robert Martinez | 65M, smoker, diabetic, obese, CKD stage 3 | High |

## Tech Stack

- **Framework:** Next.js 14 (App Router, static export)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom navy/teal theme
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Charts:** Recharts
- **Animations:** Framer Motion
- **State:** localStorage-based persistence

## Getting Started

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build (static export)
npm run build

# Serve the static build
npx serve out/
```

## NCD-CIE Engine

The core engine (`src/lib/ncd-cie-engine.ts`) implements:

1. **Z-score standardization** against population reference stats
2. **Logistic-link scoring** with disease-specific intercepts
3. **95% confidence intervals** using edge weight CI bounds
4. **What-if cascade** (Algorithm 1 from the paper):
   - Apply intervention → propagate through topological order
   - Attenuation factor γ=0.7 per hop, max depth d=3
   - Track activated causal pathways

### Knowledge Graph

The graph (`src/lib/knowledge-graph.ts`) contains:
- **33 nodes** (biomarkers, diseases, lifestyle factors, medications, demographics)
- **107 edges** with weights, 95% CIs, evidence grades (A–D), and domain labels
- **5 domains:** CVD, T2DM, CKD, Shared, Intervention

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── profile/page.tsx      # Patient Profile
│   ├── what-if/page.tsx      # What-If Simulator
│   ├── knowledge-graph/page.tsx  # KG Viewer
│   ├── progress/page.tsx     # Progress Tracker
│   ├── about/page.tsx        # Educational About
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── Navigation.tsx        # Top nav bar
│   ├── RiskGauge.tsx         # Animated SVG gauge
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── ncd-cie-engine.ts     # Core risk engine
│   ├── knowledge-graph.ts    # 107-edge KG data
│   ├── store.ts              # localStorage persistence
│   └── utils.ts              # Tailwind merge utility
```

## Disclaimer

⚕️ **For research and educational purposes only.** Not a substitute for professional medical advice, diagnosis, or treatment.

## Citation

```
NCD-CIE: Causal Inference Engine for Non-Communicable Disease Risk Prediction
with What-If Intervention Simulation
AIiH 2026
```

## License

MIT
