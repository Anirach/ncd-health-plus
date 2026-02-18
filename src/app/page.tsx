'use client'

import { useState, useEffect, useMemo } from 'react'
import Navigation from '@/components/Navigation'
import RiskGauge from '@/components/RiskGauge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { loadPatients, getActivePatientId, setActivePatientId, loadHistory } from '@/lib/store'
import { computeAllRisksWithCI, PatientProfile, computeAllRisks, getRiskColor } from '@/lib/ncd-cie-engine'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  Heart,
  Droplets,
  Brain,
  Zap,
  ArrowRight,
  User,
  ChevronDown,
  Pill,
  Cigarette,
  Dumbbell,
} from 'lucide-react'
import Link from 'next/link'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

export default function Dashboard() {
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const p = loadPatients().filter(patient => patient.name !== 'Patient')
    setPatients(p)
    const id = getActivePatientId()
    setActiveId(id)
  }, [])

  const patient = useMemo(() => patients.find(p => p.id === activeId) || patients[0], [patients, activeId])
  const risks = useMemo(() => patient ? computeAllRisksWithCI(patient) : null, [patient])
  const history = useMemo(() => patient ? loadHistory(patient.id) : [], [patient, mounted])

  // Generate trend data from history
  const trendData = useMemo(() => {
    if (!history.length && patient) {
      // Generate sample trend data
      const r = computeAllRisks(patient)
      return [
        { date: '6mo ago', cvd: +(r.cvd_composite * 100 * 1.15).toFixed(1), t2dm: +(r.t2dm * 100 * 1.1).toFixed(1), ckd: +(r.ckd * 100 * 1.08).toFixed(1) },
        { date: '3mo ago', cvd: +(r.cvd_composite * 100 * 1.08).toFixed(1), t2dm: +(r.t2dm * 100 * 1.05).toFixed(1), ckd: +(r.ckd * 100 * 1.03).toFixed(1) },
        { date: 'Now', cvd: +(r.cvd_composite * 100).toFixed(1), t2dm: +(r.t2dm * 100).toFixed(1), ckd: +(r.ckd * 100).toFixed(1) },
      ]
    }
    return history.map(v => {
      const r = computeAllRisks(v.profile)
      return {
        date: v.date,
        cvd: +(r.cvd_composite * 100).toFixed(1),
        t2dm: +(r.t2dm * 100).toFixed(1),
        ckd: +(r.ckd * 100).toFixed(1),
      }
    })
  }, [history, patient])

  if (!mounted || !patient || !risks) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-teal-500">Loading...</div>
      </div>
    )
  }

  const quickActions = [
    { label: 'Start Statin', icon: Pill, color: 'text-blue-500', href: '/what-if?action=statin' },
    { label: 'Quit Smoking', icon: Cigarette, color: 'text-orange-500', href: '/what-if?action=smoking' },
    { label: 'More Exercise', icon: Dumbbell, color: 'text-green-500', href: '/what-if?action=exercise' },
    { label: 'Lower BP', icon: Activity, color: 'text-red-500', href: '/what-if?action=bp' },
  ]

  const vitals = [
    { label: 'SBP/DBP', value: `${patient.sbp}/${patient.dbp}`, unit: 'mmHg', icon: Activity },
    { label: 'LDL-C', value: patient.ldl, unit: 'mg/dL', icon: Droplets },
    { label: 'HbA1c', value: patient.hba1c, unit: '%', icon: Brain },
    { label: 'BMI', value: patient.bmi, unit: 'kg/m²', icon: User },
    { label: 'eGFR', value: patient.egfr, unit: 'mL/min', icon: Zap },
  ]

  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-800 dark:text-white">Dashboard</h1>
            <p className="text-navy-500 dark:text-navy-300">Risk overview for {patient.name}</p>
          </div>
          <div className="relative">
            <select
              value={activeId}
              onChange={(e) => { setActiveId(e.target.value); setActivePatientId(e.target.value) }}
              className="appearance-none bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600 rounded-lg pl-9 pr-8 py-2 text-sm font-medium text-navy-700 dark:text-navy-200 cursor-pointer hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400 pointer-events-none" />
          </div>
        </div>

        {/* Risk Gauges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-teal-500" />
                NCD Risk Assessment
              </CardTitle>
              <CardDescription>Composite and individual disease risk scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                {/* Composite NCD */}
                <div className="col-span-2 md:col-span-1 flex justify-center">
                  <RiskGauge label="Overall NCD" value={risks.ncd_composite.value} ciLow={risks.ncd_composite.ci_low} ciHigh={risks.ncd_composite.ci_high} size="lg" showCI />
                </div>
                {/* Individual */}
                <div className="col-span-2 md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <RiskGauge label="CVD" value={risks.cvd_composite.value} ciLow={risks.cvd_composite.ci_low} ciHigh={risks.cvd_composite.ci_high} showCI />
                  <RiskGauge label="T2DM" value={risks.t2dm.value} ciLow={risks.t2dm.ci_low} ciHigh={risks.t2dm.ci_high} showCI />
                  <RiskGauge label="CKD" value={risks.ckd.value} ciLow={risks.ckd.ci_low} ciHigh={risks.ckd.ci_high} showCI />
                  <RiskGauge label="NAFLD" value={risks.nafld.value} ciLow={risks.nafld.ci_low} ciHigh={risks.nafld.ci_high} showCI />
                </div>
              </div>

              {/* Sub-risks */}
              <div className="mt-6 grid grid-cols-4 gap-3">
                {[
                  { label: 'CAD', val: risks.cad },
                  { label: 'Stroke', val: risks.stroke },
                  { label: 'Heart Failure', val: risks.hf },
                  { label: 'PAD', val: risks.pad },
                ].map(r => (
                  <div key={r.label} className="text-center p-3 rounded-lg bg-navy-50/50 dark:bg-navy-700/50">
                    <div className="text-lg font-bold" style={{ color: getRiskColor(r.val.value) }}>
                      {(r.val.value * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-navy-500 dark:text-navy-400">{r.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vitals + Trend */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Key Vitals */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Key Vitals</CardTitle>
                <CardDescription>{patient.age}yo {patient.sex === 0 ? 'Female' : 'Male'} — {patient.smoking > 0 ? 'Smoker' : 'Non-smoker'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vitals.map(v => {
                    const Icon = v.icon
                    return (
                      <div key={v.label} className="flex items-center justify-between p-3 rounded-lg bg-navy-50/50 dark:bg-navy-700/30">
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-teal-500" />
                          <span className="text-sm font-medium">{v.label}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{v.value}</span>
                          <span className="text-xs text-navy-400 ml-1">{v.unit}</span>
                        </div>
                      </div>
                    )
                  })}
                  {/* Medications */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {patient.statin ? <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs dark:bg-blue-900/30 dark:text-blue-400">Statin</span> : null}
                    {patient.htn_med ? <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs dark:bg-red-900/30 dark:text-red-400">HTN Med</span> : null}
                    {patient.metformin ? <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs dark:bg-purple-900/30 dark:text-purple-400">Metformin</span> : null}
                    {patient.sglt2i ? <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs dark:bg-green-900/30 dark:text-green-400">SGLT2i</span> : null}
                    {!patient.statin && !patient.htn_med && !patient.metformin && !patient.sglt2i && (
                      <span className="px-2 py-1 rounded-full bg-navy-100 text-navy-500 text-xs dark:bg-navy-700 dark:text-navy-400">No medications</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trend Chart */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Risk Trends</CardTitle>
                <CardDescription>Risk trajectory over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="cvdGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="t2dmGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ckdGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="date" fontSize={12} stroke="#94A3B8" />
                    <YAxis fontSize={12} stroke="#94A3B8" unit="%" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1B2A4A',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="cvd" stroke="#EF4444" fill="url(#cvdGrad)" strokeWidth={2} name="CVD" />
                    <Area type="monotone" dataKey="t2dm" stroke="#3B82F6" fill="url(#t2dmGrad)" strokeWidth={2} name="T2DM" />
                    <Area type="monotone" dataKey="ckd" stroke="#22C55E" fill="url(#ckdGrad)" strokeWidth={2} name="CKD" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle>What-If Scenarios</CardTitle>
              <CardDescription>Explore how interventions could change your risk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickActions.map(a => {
                  const Icon = a.icon
                  return (
                    <Link key={a.label} href={a.href}>
                      <div className="p-4 rounded-xl border border-navy-100 dark:border-navy-700 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-md transition-all cursor-pointer group">
                        <Icon className={`h-6 w-6 ${a.color} mb-2`} />
                        <div className="text-sm font-medium text-navy-700 dark:text-navy-200">{a.label}</div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-teal-500 group-hover:translate-x-1 transition-transform">
                          Simulate <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </>
  )
}
