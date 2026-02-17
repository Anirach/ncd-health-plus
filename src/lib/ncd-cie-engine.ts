// NCD-CIE Risk Prediction Engine
// Implements the NCD-CIE v14 paper's formulas exactly

import { edges, topologicalOrder, getEdgesTo } from './knowledge-graph'

// ── Types ──────────────────────────────────────────
export interface PatientProfile {
  id: string
  name: string
  age: number
  sex: number // 0=Female, 1=Male
  sbp: number
  dbp: number
  ldl: number
  hdl: number
  tc: number
  tg: number
  hba1c: number
  fpg: number
  bmi: number
  egfr: number
  smoking: number // 0=Never, 0.5=Former, 1=Current
  exercise: number // 0-7 days/week
  alcohol: number // 0=None, 0.5=Moderate, 1=Heavy
  diet: number // 0-1
  statin: number // 0 or 1
  htn_med: number // 0 or 1
  sglt2i: number // 0 or 1
  metformin: number // 0 or 1
  aspirin: number // 0 or 1
  ace_arb: number // 0 or 1
  // Derived
  diabetes?: number
  hypertension?: number
}

export interface RiskResult {
  cad: number
  stroke: number
  hf: number
  pad: number
  t2dm: number
  ckd: number
  nafld: number
  cvd_composite: number // 1 - (1-cad)(1-stroke)(1-hf)(1-pad)
  ncd_composite: number // 1 - (1-cvd)(1-t2dm)(1-ckd)
}

export interface RiskWithCI {
  value: number
  ci_low: number
  ci_high: number
}

export interface FullRiskResult {
  cad: RiskWithCI
  stroke: RiskWithCI
  hf: RiskWithCI
  pad: RiskWithCI
  t2dm: RiskWithCI
  ckd: RiskWithCI
  nafld: RiskWithCI
  cvd_composite: RiskWithCI
  ncd_composite: RiskWithCI
}

// ── Reference ranges for z-score standardization ──
const referenceStats: Record<string, { mean: number; std: number }> = {
  age: { mean: 55, std: 12 },
  sex: { mean: 0.5, std: 0.5 },
  sbp: { mean: 130, std: 18 },
  dbp: { mean: 82, std: 10 },
  ldl: { mean: 130, std: 35 },
  hdl: { mean: 50, std: 14 },
  tc: { mean: 210, std: 40 },
  tg: { mean: 150, std: 70 },
  hba1c: { mean: 5.8, std: 0.9 },
  fpg: { mean: 105, std: 25 },
  bmi: { mean: 26, std: 4.5 },
  egfr: { mean: 85, std: 22 },
  smoking: { mean: 0.25, std: 0.4 },
  exercise: { mean: 2.5, std: 2.0 },
  alcohol: { mean: 0.2, std: 0.3 },
  diet: { mean: 0.5, std: 0.25 },
  statin: { mean: 0.2, std: 0.4 },
  htn_med: { mean: 0.3, std: 0.45 },
  sglt2i: { mean: 0.05, std: 0.22 },
  metformin: { mean: 0.15, std: 0.35 },
  aspirin: { mean: 0.15, std: 0.35 },
  ace_arb: { mean: 0.2, std: 0.4 },
  diabetes: { mean: 0.15, std: 0.35 },
  hypertension: { mean: 0.35, std: 0.48 },
}

// ── Disease intercepts (β₀) ──
const diseaseIntercepts: Record<string, number> = {
  cad: -2.5,
  stroke: -3.0,
  hf: -3.2,
  pad: -3.5,
  t2dm: -2.8,
  ckd: -2.6,
  nafld: -2.0,
}

// ── Core functions ──

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

function standardize(nodeId: string, value: number): number {
  const stats = referenceStats[nodeId]
  if (!stats) return 0
  return (value - stats.mean) / stats.std
}

// Derive intermediate conditions
function deriveConditions(profile: PatientProfile): PatientProfile {
  const p = { ...profile }
  p.diabetes = (p.hba1c >= 6.5 || p.fpg >= 126) ? 1 : (p.hba1c >= 5.7 || p.fpg >= 100) ? 0.5 : 0
  p.hypertension = (p.sbp >= 140 || p.dbp >= 90) ? 1 : (p.sbp >= 130 || p.dbp >= 85) ? 0.5 : 0
  return p
}

// Get patient value for a node
function getPatientValue(profile: PatientProfile, nodeId: string): number {
  return (profile as unknown as Record<string, number>)[nodeId] ?? 0
}

// ── Risk Scoring (Logistic-Link) ──
// R_d = sigmoid(β₀_d + Σ W_(vi,d) × z_i)
export function computeDiseaseRisk(profile: PatientProfile, diseaseId: string): number {
  const p = deriveConditions(profile)
  const intercept = diseaseIntercepts[diseaseId] ?? -2.5
  const incomingEdges = getEdgesTo(diseaseId)

  let logit = intercept
  for (const edge of incomingEdges) {
    const rawValue = getPatientValue(p, edge.source)
    const z = standardize(edge.source, rawValue)
    logit += edge.weight * z
  }

  return sigmoid(logit)
}

// Compute risk with 95% CI using edge weight CIs
export function computeDiseaseRiskWithCI(profile: PatientProfile, diseaseId: string): RiskWithCI {
  const p = deriveConditions(profile)
  const intercept = diseaseIntercepts[diseaseId] ?? -2.5
  const incomingEdges = getEdgesTo(diseaseId)

  let logit = intercept
  let logitLow = intercept
  let logitHigh = intercept

  for (const edge of incomingEdges) {
    const rawValue = getPatientValue(p, edge.source)
    const z = standardize(edge.source, rawValue)
    logit += edge.weight * z
    // For CI: use CI bounds of weights
    if (z >= 0) {
      logitLow += edge.ci[0] * z
      logitHigh += edge.ci[1] * z
    } else {
      logitLow += edge.ci[1] * z
      logitHigh += edge.ci[0] * z
    }
  }

  return {
    value: sigmoid(logit),
    ci_low: sigmoid(logitLow),
    ci_high: sigmoid(logitHigh),
  }
}

// ── Composite NCD Risk ──
// R_NCD = 1 - Π(1 - R_d) for d in {CVD, T2DM, CKD}
export function computeAllRisks(profile: PatientProfile): RiskResult {
  const cad = computeDiseaseRisk(profile, 'cad')
  const stroke = computeDiseaseRisk(profile, 'stroke')
  const hf = computeDiseaseRisk(profile, 'hf')
  const pad = computeDiseaseRisk(profile, 'pad')
  const t2dm = computeDiseaseRisk(profile, 't2dm')
  const ckd = computeDiseaseRisk(profile, 'ckd')
  const nafld = computeDiseaseRisk(profile, 'nafld')

  const cvd_composite = 1 - (1 - cad) * (1 - stroke) * (1 - hf) * (1 - pad)
  const ncd_composite = 1 - (1 - cvd_composite) * (1 - t2dm) * (1 - ckd)

  return { cad, stroke, hf, pad, t2dm, ckd, nafld, cvd_composite, ncd_composite }
}

export function computeAllRisksWithCI(profile: PatientProfile): FullRiskResult {
  const cad = computeDiseaseRiskWithCI(profile, 'cad')
  const stroke = computeDiseaseRiskWithCI(profile, 'stroke')
  const hf = computeDiseaseRiskWithCI(profile, 'hf')
  const pad = computeDiseaseRiskWithCI(profile, 'pad')
  const t2dm = computeDiseaseRiskWithCI(profile, 't2dm')
  const ckd = computeDiseaseRiskWithCI(profile, 'ckd')
  const nafld = computeDiseaseRiskWithCI(profile, 'nafld')

  const cvdVal = 1 - (1 - cad.value) * (1 - stroke.value) * (1 - hf.value) * (1 - pad.value)
  const cvdLow = 1 - (1 - cad.ci_low) * (1 - stroke.ci_low) * (1 - hf.ci_low) * (1 - pad.ci_low)
  const cvdHigh = 1 - (1 - cad.ci_high) * (1 - stroke.ci_high) * (1 - hf.ci_high) * (1 - pad.ci_high)

  const ncdVal = 1 - (1 - cvdVal) * (1 - t2dm.value) * (1 - ckd.value)
  const ncdLow = 1 - (1 - cvdLow) * (1 - t2dm.ci_low) * (1 - ckd.ci_low)
  const ncdHigh = 1 - (1 - cvdHigh) * (1 - t2dm.ci_high) * (1 - ckd.ci_high)

  return {
    cad, stroke, hf, pad, t2dm, ckd, nafld,
    cvd_composite: { value: cvdVal, ci_low: cvdLow, ci_high: cvdHigh },
    ncd_composite: { value: ncdVal, ci_low: ncdLow, ci_high: ncdHigh },
  }
}

// ── What-If Intervention Cascade (Algorithm 1) ──
// γ = 0.7, d_max = 3
const GAMMA = 0.7
const D_MAX = 3

interface CascadeResult {
  interventionProfile: PatientProfile
  risks: RiskResult
  deltas: Record<string, number> // how much each node changed
  activatedEdges: string[] // edge IDs that contributed
}

export function whatIfIntervention(
  baseProfile: PatientProfile,
  interventions: Partial<PatientProfile>
): CascadeResult {
  const base = deriveConditions(baseProfile)
  const xINT: Record<string, number> = {}
  const deltas: Record<string, number> = {}
  const activatedEdges: string[] = []

  // Copy base values
  for (const nodeId of topologicalOrder) {
    xINT[nodeId] = getPatientValue(base, nodeId)
  }

  // Apply direct interventions
  for (const [key, value] of Object.entries(interventions)) {
    if (value !== undefined) {
      const delta = (value as number) - (xINT[key] || 0)
      xINT[key] = value as number
      deltas[key] = delta
    }
  }

  // Cascade through topological order
  // BFS-like: for each node, compute cascading deltas
  function getDepth(source: string, target: string): number {
    // Simple BFS depth in the graph
    const visited = new Set<string>()
    const queue: { node: string; depth: number }[] = [{ node: source, depth: 0 }]
    while (queue.length > 0) {
      const { node, depth } = queue.shift()!
      if (node === target) return depth
      if (depth >= D_MAX) continue
      visited.add(node)
      const outEdges = edges.filter(e => e.source === node)
      for (const e of outEdges) {
        if (!visited.has(e.target)) {
          queue.push({ node: e.target, depth: depth + 1 })
        }
      }
    }
    return D_MAX + 1
  }

  // Process cascade
  for (const nodeId of topologicalOrder) {
    if (interventions.hasOwnProperty(nodeId)) continue // skip directly intervened nodes

    const incomingEdges = edges.filter(e => e.target === nodeId)
    let totalDelta = 0

    for (const edge of incomingEdges) {
      const parentDelta = (xINT[edge.source] ?? 0) - getPatientValue(base, edge.source)
      if (Math.abs(parentDelta) > 0.001) {
        // Find minimum depth from any intervention source
        let minDepth = D_MAX + 1
        for (const intKey of Object.keys(interventions)) {
          const d = getDepth(intKey, edge.source)
          minDepth = Math.min(minDepth, d + 1)
        }

        if (minDepth <= D_MAX) {
          const attenuation = Math.pow(GAMMA, minDepth)
          const cascade = edge.weight * parentDelta * attenuation
          totalDelta += cascade
          if (Math.abs(cascade) > 0.001) {
            activatedEdges.push(edge.id)
          }
        }
      }
    }

    if (Math.abs(totalDelta) > 0.001) {
      xINT[nodeId] = getPatientValue(base, nodeId) + totalDelta
      deltas[nodeId] = totalDelta
    }
  }

  // Build the intervention profile
  const interventionProfile: PatientProfile = {
    ...baseProfile,
    ...interventions,
  }
  // Apply cascaded changes
  for (const [key, delta] of Object.entries(deltas)) {
    if (!interventions.hasOwnProperty(key)) {
      (interventionProfile as unknown as Record<string, number>)[key] =
        getPatientValue(base, key) + delta
    }
  }

  // Also add directly intervened edges
  for (const [key] of Object.entries(interventions)) {
    const outEdges = edges.filter(e => e.source === key)
    for (const e of outEdges) {
      activatedEdges.push(e.id)
    }
  }

  const risks = computeAllRisks(interventionProfile)

  return { interventionProfile, risks, deltas, activatedEdges: Array.from(new Set(activatedEdges)) }
}

// ── Risk color helper ──
export function getRiskColor(risk: number): string {
  if (risk < 0.10) return '#22C55E' // green
  if (risk < 0.20) return '#EAB308' // yellow
  if (risk < 0.30) return '#F97316' // orange
  return '#EF4444' // red
}

export function getRiskLevel(risk: number): string {
  if (risk < 0.10) return 'Low'
  if (risk < 0.20) return 'Moderate'
  if (risk < 0.30) return 'High'
  return 'Very High'
}

// ── Demo patients ──
export const demoPatients: PatientProfile[] = [
  {
    id: 'demo-low',
    name: 'Sarah Chen',
    age: 40, sex: 0,
    sbp: 115, dbp: 72,
    ldl: 95, hdl: 62, tc: 185, tg: 90,
    hba1c: 5.2, fpg: 88,
    bmi: 22.5, egfr: 105,
    smoking: 0, exercise: 5, alcohol: 0, diet: 0.8,
    statin: 0, htn_med: 0, sglt2i: 0, metformin: 0, aspirin: 0, ace_arb: 0,
  },
  {
    id: 'demo-moderate',
    name: 'James Wilson',
    age: 55, sex: 1,
    sbp: 148, dbp: 92,
    ldl: 162, hdl: 38, tc: 245, tg: 210,
    hba1c: 6.1, fpg: 112,
    bmi: 29.5, egfr: 78,
    smoking: 0, exercise: 1, alcohol: 0.5, diet: 0.4,
    statin: 0, htn_med: 0, sglt2i: 0, metformin: 0, aspirin: 0, ace_arb: 0,
  },
  {
    id: 'demo-high',
    name: 'Robert Martinez',
    age: 65, sex: 1,
    sbp: 168, dbp: 98,
    ldl: 185, hdl: 32, tc: 280, tg: 290,
    hba1c: 8.2, fpg: 165,
    bmi: 33.5, egfr: 52,
    smoking: 1, exercise: 0, alcohol: 0.5, diet: 0.2,
    statin: 0, htn_med: 0, sglt2i: 0, metformin: 0, aspirin: 0, ace_arb: 0,
  },
]
