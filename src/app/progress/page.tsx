'use client'

import { useState, useEffect, useMemo } from 'react'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { loadPatients, getActivePatientId, loadHistory, LabVisit } from '@/lib/store'
import { PatientProfile, computeAllRisks, getRiskColor, getRiskLevel } from '@/lib/ncd-cie-engine'
import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp, Award, Calendar, FileDown, Minus } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'

export default function ProgressPage() {
  const [patient, setPatient] = useState<PatientProfile | null>(null)
  const [history, setHistory] = useState<LabVisit[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const patients = loadPatients()
    const id = getActivePatientId()
    const p = patients.find(x => x.id === id) || patients[0]
    setPatient(p)
    if (p) {
      let h = loadHistory(p.id)
      // If no history, create synthetic demo data
      if (h.length === 0 && p) {
        const now = new Date()
        h = Array.from({ length: 6 }, (_, i) => {
          const date = new Date(now)
          date.setMonth(date.getMonth() - (5 - i))
          const factor = 1 + (5 - i) * 0.04 // gradually worse in the past
          return {
            date: date.toISOString().split('T')[0],
            profile: {
              ...p,
              sbp: Math.round(p.sbp * (1 + (5 - i) * 0.02)),
              ldl: Math.round(p.ldl * (1 + (5 - i) * 0.03)),
              hba1c: +(p.hba1c * (1 + (5 - i) * 0.015)).toFixed(1),
              bmi: +(p.bmi * (1 + (5 - i) * 0.01)).toFixed(1),
            }
          }
        })
      }
      setHistory(h)
    }
  }, [])

  const trendData = useMemo(() => {
    return history.map(v => {
      const r = computeAllRisks(v.profile)
      return {
        date: v.date.slice(5), // MM-DD
        fullDate: v.date,
        cvd: +(r.cvd_composite * 100).toFixed(1),
        t2dm: +(r.t2dm * 100).toFixed(1),
        ckd: +(r.ckd * 100).toFixed(1),
        ncd: +(r.ncd_composite * 100).toFixed(1),
        sbp: v.profile.sbp,
        ldl: v.profile.ldl,
        hba1c: v.profile.hba1c,
        bmi: v.profile.bmi,
      }
    })
  }, [history])

  // Improvement scores
  const improvement = useMemo(() => {
    if (trendData.length < 2) return null
    const first = trendData[0]
    const last = trendData[trendData.length - 1]
    return {
      cvd: ((first.cvd - last.cvd) / first.cvd * 100),
      t2dm: ((first.t2dm - last.t2dm) / first.t2dm * 100),
      ckd: ((first.ckd - last.ckd) / first.ckd * 100),
      ncd: ((first.ncd - last.ncd) / first.ncd * 100),
    }
  }, [trendData])

  // Milestones
  const milestones = useMemo(() => {
    const ms: { date: string; text: string; icon: string }[] = []
    for (let i = 1; i < trendData.length; i++) {
      const prev = trendData[i - 1]
      const curr = trendData[i]
      if (prev.ncd >= 20 && curr.ncd < 20) ms.push({ date: curr.fullDate, text: 'NCD risk dropped below 20%!', icon: '🎉' })
      if (prev.cvd >= 10 && curr.cvd < 10) ms.push({ date: curr.fullDate, text: 'CVD risk now in low range!', icon: '💚' })
      if (prev.ncd > curr.ncd + 2) ms.push({ date: curr.fullDate, text: `NCD risk improved by ${(prev.ncd - curr.ncd).toFixed(1)}%`, icon: '📉' })
    }
    return ms
  }, [trendData])

  if (!mounted || !patient) return <div className="flex items-center justify-center min-h-screen"><div className="animate-pulse text-teal-500">Loading...</div></div>

  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-800 dark:text-white">Progress Tracker</h1>
            <p className="text-navy-500 dark:text-navy-300">Tracking {patient.name}&apos;s journey over time</p>
          </div>
        </div>

        {/* Improvement Scores */}
        {improvement && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'CVD', val: improvement.cvd },
              { label: 'T2DM', val: improvement.t2dm },
              { label: 'CKD', val: improvement.ckd },
              { label: 'Overall NCD', val: improvement.ncd },
            ].map(item => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className={`text-2xl font-bold ${item.val > 0 ? 'text-green-600' : item.val < 0 ? 'text-red-500' : 'text-navy-500'}`}>
                      {item.val > 0 ? (
                        <span className="flex items-center justify-center gap-1"><TrendingDown className="h-5 w-5" /> {item.val.toFixed(1)}%</span>
                      ) : item.val < 0 ? (
                        <span className="flex items-center justify-center gap-1"><TrendingUp className="h-5 w-5" /> {Math.abs(item.val).toFixed(1)}%</span>
                      ) : (
                        <span className="flex items-center justify-center gap-1"><Minus className="h-5 w-5" /> 0%</span>
                      )}
                    </div>
                    <div className="text-sm text-navy-500 dark:text-navy-400 mt-1">{item.label} Improvement</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Risk Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Trends Over Time</CardTitle>
            <CardDescription>Composite risk scores across visits</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="ncdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cvdG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="t2dmG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ckdG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" fontSize={12} stroke="#94A3B8" />
                <YAxis fontSize={12} stroke="#94A3B8" unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#1B2A4A', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
                <Area type="monotone" dataKey="ncd" stroke="#8B5CF6" fill="url(#ncdGrad)" strokeWidth={3} name="Overall NCD" />
                <Area type="monotone" dataKey="cvd" stroke="#EF4444" fill="url(#cvdG)" strokeWidth={2} name="CVD" />
                <Area type="monotone" dataKey="t2dm" stroke="#3B82F6" fill="url(#t2dmG)" strokeWidth={2} name="T2DM" />
                <Area type="monotone" dataKey="ckd" stroke="#22C55E" fill="url(#ckdG)" strokeWidth={2} name="CKD" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Biomarker Trends */}
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { label: 'Blood Pressure (SBP)', key: 'sbp', color: '#EF4444', unit: 'mmHg' },
            { label: 'LDL Cholesterol', key: 'ldl', color: '#F59E0B', unit: 'mg/dL' },
            { label: 'HbA1c', key: 'hba1c', color: '#3B82F6', unit: '%' },
            { label: 'BMI', key: 'bmi', color: '#8B5CF6', unit: 'kg/m²' },
          ].map(biomarker => (
            <Card key={biomarker.key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{biomarker.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="date" fontSize={10} stroke="#94A3B8" />
                    <YAxis fontSize={10} stroke="#94A3B8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1B2A4A', border: 'none', borderRadius: '8px', color: 'white', fontSize: '11px' }} />
                    <Line type="monotone" dataKey={biomarker.key} stroke={biomarker.color} strokeWidth={2} dot={{ r: 3 }} name={biomarker.label} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Milestones */}
        {milestones.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-yellow-500" /> Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {milestones.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/20 dark:to-transparent">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <div className="text-sm font-medium">{m.text}</div>
                      <div className="text-xs text-navy-400 flex items-center gap-1"><Calendar className="h-3 w-3" />{m.date}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visit Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Visit Timeline</CardTitle>
            <CardDescription>Lab results history across visits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-100 dark:border-navy-700">
                    <th className="text-left py-2 px-3 text-navy-500">Date</th>
                    <th className="text-right py-2 px-3 text-navy-500">SBP</th>
                    <th className="text-right py-2 px-3 text-navy-500">LDL</th>
                    <th className="text-right py-2 px-3 text-navy-500">HbA1c</th>
                    <th className="text-right py-2 px-3 text-navy-500">BMI</th>
                    <th className="text-right py-2 px-3 text-navy-500">NCD Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((visit, i) => {
                    const r = computeAllRisks(visit.profile)
                    return (
                      <tr key={i} className="border-b border-navy-50 dark:border-navy-800">
                        <td className="py-2 px-3 font-medium">{visit.date}</td>
                        <td className="py-2 px-3 text-right">{visit.profile.sbp}</td>
                        <td className="py-2 px-3 text-right">{visit.profile.ldl}</td>
                        <td className="py-2 px-3 text-right">{visit.profile.hba1c}</td>
                        <td className="py-2 px-3 text-right">{visit.profile.bmi}</td>
                        <td className="py-2 px-3 text-right">
                          <span className="font-medium" style={{ color: getRiskColor(r.ncd_composite) }}>
                            {(r.ncd_composite * 100).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
