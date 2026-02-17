'use client'

import { useState, useEffect, useMemo } from 'react'
import Navigation from '@/components/Navigation'
import RiskGauge from '@/components/RiskGauge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { loadPatients, getActivePatientId } from '@/lib/store'
import {
  PatientProfile,
  computeAllRisks,
  whatIfIntervention,
  getRiskColor,
  RiskResult,
} from '@/lib/ncd-cie-engine'
import { edges as kgEdges, getNode } from '@/lib/knowledge-graph'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowDown,
  ArrowUp,
  Minus,
  Zap,
  RotateCcw,
  Pill,
  Cigarette,
  Dumbbell,
  Activity,
  Weight,
  Stethoscope,
} from 'lucide-react'

interface Intervention {
  statin: number
  htn_med: number
  sglt2i: number
  metformin: number
  smoking: number
  exercise: number
  sbp_reduction: number // how much to reduce SBP
  weight_loss: number // kg to lose
}

const defaultInterventions: Intervention = {
  statin: 0,
  htn_med: 0,
  sglt2i: 0,
  metformin: 0,
  smoking: -1, // -1 = no change
  exercise: -1,
  sbp_reduction: 0,
  weight_loss: 0,
}

export default function WhatIfPage() {
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [patient, setPatient] = useState<PatientProfile | null>(null)
  const [interventions, setInterventions] = useState<Intervention>({ ...defaultInterventions })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const p = loadPatients()
    setPatients(p)
    const id = getActivePatientId()
    const active = p.find(x => x.id === id) || p[0]
    setPatient(active)
  }, [])

  // Build intervention profile
  const interventionResult = useMemo(() => {
    if (!patient) return null

    const changes: Partial<PatientProfile> = {}

    if (interventions.statin && !patient.statin) changes.statin = 1
    if (interventions.htn_med && !patient.htn_med) changes.htn_med = 1
    if (interventions.sglt2i && !patient.sglt2i) changes.sglt2i = 1
    if (interventions.metformin && !patient.metformin) changes.metformin = 1
    if (interventions.smoking >= 0) changes.smoking = interventions.smoking
    if (interventions.exercise >= 0) changes.exercise = interventions.exercise
    if (interventions.sbp_reduction > 0) changes.sbp = patient.sbp - interventions.sbp_reduction
    if (interventions.weight_loss > 0) {
      const heightM = Math.sqrt(patient.bmi > 0 ? patient.bmi : 25) * 1.0 // approximate
      const currentWeight = patient.bmi * (heightM * heightM) / patient.bmi * patient.bmi
      // Simple: reduce BMI proportionally
      const newBMI = Math.max(18.5, patient.bmi - (interventions.weight_loss / 2.5))
      changes.bmi = newBMI
    }

    if (Object.keys(changes).length === 0) {
      return {
        interventionProfile: patient,
        risks: computeAllRisks(patient),
        deltas: {},
        activatedEdges: [],
        baseRisks: computeAllRisks(patient),
        hasChanges: false,
      }
    }

    const result = whatIfIntervention(patient, changes)
    return {
      ...result,
      baseRisks: computeAllRisks(patient),
      hasChanges: true,
    }
  }, [patient, interventions])

  const resetInterventions = () => setInterventions({ ...defaultInterventions })

  if (!mounted || !patient || !interventionResult) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-teal-500">Loading...</div>
      </div>
    )
  }

  const baseRisks = interventionResult.baseRisks
  const newRisks = interventionResult.risks

  const riskComparisons = [
    { label: 'CVD', base: baseRisks.cvd_composite, newVal: newRisks.cvd_composite },
    { label: 'T2DM', base: baseRisks.t2dm, newVal: newRisks.t2dm },
    { label: 'CKD', base: baseRisks.ckd, newVal: newRisks.ckd },
    { label: 'NCD', base: baseRisks.ncd_composite, newVal: newRisks.ncd_composite },
    { label: 'CAD', base: baseRisks.cad, newVal: newRisks.cad },
    { label: 'Stroke', base: baseRisks.stroke, newVal: newRisks.stroke },
    { label: 'HF', base: baseRisks.hf, newVal: newRisks.hf },
  ]

  // Get activated edges for visualization
  const activeEdgeDetails = interventionResult.activatedEdges
    .map(id => kgEdges.find(e => e.id === id))
    .filter(Boolean)
    .slice(0, 12)

  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-800 dark:text-white">What-If Simulator</h1>
            <p className="text-navy-500 dark:text-navy-300">Explore intervention impacts for {patient.name}</p>
          </div>
          <Button variant="outline" onClick={resetInterventions}>
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Interventions Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Medications */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Pill className="h-4 w-4 text-teal-500" /> Medications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Start Statin</span>
                  <Switch
                    checked={interventions.statin === 1}
                    onCheckedChange={c => setInterventions({ ...interventions, statin: c ? 1 : 0 })}
                    disabled={patient.statin === 1}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Start HTN Med</span>
                  <Switch
                    checked={interventions.htn_med === 1}
                    onCheckedChange={c => setInterventions({ ...interventions, htn_med: c ? 1 : 0 })}
                    disabled={patient.htn_med === 1}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Start SGLT2i</span>
                  <Switch
                    checked={interventions.sglt2i === 1}
                    onCheckedChange={c => setInterventions({ ...interventions, sglt2i: c ? 1 : 0 })}
                    disabled={patient.sglt2i === 1}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Start Metformin</span>
                  <Switch
                    checked={interventions.metformin === 1}
                    onCheckedChange={c => setInterventions({ ...interventions, metformin: c ? 1 : 0 })}
                    disabled={patient.metformin === 1}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Lifestyle */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-green-500" /> Lifestyle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Quit Smoking */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Quit Smoking</span>
                    <Switch
                      checked={interventions.smoking === 0}
                      onCheckedChange={c => setInterventions({ ...interventions, smoking: c ? 0 : -1 })}
                      disabled={patient.smoking === 0}
                    />
                  </div>
                  {patient.smoking > 0 && <p className="text-xs text-navy-400">Currently: {patient.smoking === 1 ? 'Active smoker' : 'Former smoker'}</p>}
                </div>

                {/* Exercise */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Exercise</span>
                    <span className="text-sm font-medium text-teal-600">
                      {interventions.exercise >= 0 ? interventions.exercise : patient.exercise} days/wk
                    </span>
                  </div>
                  <Slider
                    value={[interventions.exercise >= 0 ? interventions.exercise : patient.exercise]}
                    onValueChange={([v]) => setInterventions({ ...interventions, exercise: v })}
                    min={0}
                    max={7}
                    step={1}
                  />
                  <p className="text-xs text-navy-400 mt-1">Currently: {patient.exercise} days/week</p>
                </div>

                {/* Weight Loss */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Weight Loss</span>
                    <span className="text-sm font-medium text-teal-600">{interventions.weight_loss} kg</span>
                  </div>
                  <Slider
                    value={[interventions.weight_loss]}
                    onValueChange={([v]) => setInterventions({ ...interventions, weight_loss: v })}
                    min={0}
                    max={20}
                    step={1}
                  />
                </div>

                {/* SBP Reduction */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Reduce SBP by</span>
                    <span className="text-sm font-medium text-teal-600">{interventions.sbp_reduction} mmHg</span>
                  </div>
                  <Slider
                    value={[interventions.sbp_reduction]}
                    onValueChange={([v]) => setInterventions({ ...interventions, sbp_reduction: v })}
                    min={0}
                    max={40}
                    step={5}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Risk Gauges - Live */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Live Risk Comparison
                </CardTitle>
                <CardDescription>
                  {interventionResult.hasChanges ? 'Showing impact of your interventions' : 'Adjust interventions to see changes'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <RiskGauge label="CVD" value={newRisks.cvd_composite} size="md" />
                  <RiskGauge label="T2DM" value={newRisks.t2dm} size="md" />
                  <RiskGauge label="CKD" value={newRisks.ckd} size="md" />
                  <RiskGauge label="Overall NCD" value={newRisks.ncd_composite} size="md" />
                </div>
              </CardContent>
            </Card>

            {/* Before/After Comparison */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Before → After</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {riskComparisons.map(r => {
                    const diff = r.newVal - r.base
                    const diffPct = diff * 100
                    const improved = diff < -0.005
                    const worsened = diff > 0.005
                    return (
                      <motion.div
                        key={r.label}
                        className="flex items-center gap-3 p-3 rounded-lg bg-navy-50/50 dark:bg-navy-700/30"
                        layout
                      >
                        <span className="w-16 text-sm font-medium">{r.label}</span>
                        <div className="flex-1">
                          {/* Progress bar */}
                          <div className="relative h-6 bg-navy-100 dark:bg-navy-700 rounded-full overflow-hidden">
                            {/* Base */}
                            <motion.div
                              className="absolute top-0 left-0 h-full rounded-full opacity-40"
                              style={{ backgroundColor: getRiskColor(r.base) }}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(r.base * 100, 100)}%` }}
                              transition={{ duration: 0.5 }}
                            />
                            {/* New */}
                            <motion.div
                              className="absolute top-0 left-0 h-full rounded-full"
                              style={{ backgroundColor: getRiskColor(r.newVal) }}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(r.newVal * 100, 100)}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                        <div className="w-20 text-right">
                          <span className="text-sm font-mono" style={{ color: getRiskColor(r.newVal) }}>
                            {(r.newVal * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-20 text-right">
                          {improved && (
                            <span className="text-xs text-green-600 flex items-center justify-end gap-0.5">
                              <ArrowDown className="h-3 w-3" />
                              {Math.abs(diffPct).toFixed(1)}%
                            </span>
                          )}
                          {worsened && (
                            <span className="text-xs text-red-500 flex items-center justify-end gap-0.5">
                              <ArrowUp className="h-3 w-3" />
                              {Math.abs(diffPct).toFixed(1)}%
                            </span>
                          )}
                          {!improved && !worsened && (
                            <span className="text-xs text-navy-400 flex items-center justify-end gap-0.5">
                              <Minus className="h-3 w-3" /> 0.0%
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Causal Cascade Visualization */}
            {activeEdgeDetails.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-teal-500" />
                    Activated Causal Pathways
                  </CardTitle>
                  <CardDescription>Edges in the knowledge graph affected by your interventions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activeEdgeDetails.map((edge, i) => {
                      if (!edge) return null
                      const sourceNode = getNode(edge.source)
                      const targetNode = getNode(edge.target)
                      return (
                        <motion.div
                          key={edge.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-2 p-2 rounded-lg bg-navy-50/50 dark:bg-navy-700/30 text-xs"
                        >
                          <span className="font-medium text-navy-700 dark:text-navy-200">{sourceNode?.label || edge.source}</span>
                          <span className="text-navy-400">→</span>
                          <span className="font-medium text-navy-700 dark:text-navy-200">{targetNode?.label || edge.target}</span>
                          <span className={`ml-auto font-mono ${edge.weight > 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {edge.weight > 0 ? '+' : ''}{edge.weight.toFixed(2)}
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cascaded biomarker changes */}
            {Object.keys(interventionResult.deltas).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Cascaded Biomarker Changes</CardTitle>
                  <CardDescription>How interventions propagate through the causal graph</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(interventionResult.deltas).map(([key, delta]) => {
                      const node = getNode(key)
                      if (!node || node.type === 'disease') return null
                      return (
                        <div key={key} className="p-3 rounded-lg bg-navy-50/50 dark:bg-navy-700/30 text-center">
                          <div className="text-xs text-navy-500 dark:text-navy-400">{node.label}</div>
                          <div className={`text-sm font-semibold ${delta < 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {delta > 0 ? '+' : ''}{typeof delta === 'number' ? delta.toFixed(2) : delta}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
