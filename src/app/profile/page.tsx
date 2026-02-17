'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { loadPatients, savePatients, getActivePatientId, setActivePatientId, addVisit } from '@/lib/store'
import { PatientProfile, demoPatients } from '@/lib/ncd-cie-engine'
import { Save, RotateCcw, Plus, Trash2, UserPlus } from 'lucide-react'

const fieldGroups = [
  {
    title: 'Demographics',
    fields: [
      { key: 'age', label: 'Age', unit: 'years', min: 18, max: 100, step: 1 },
      { key: 'sex', label: 'Sex', type: 'select', options: [{ value: 0, label: 'Female' }, { value: 1, label: 'Male' }] },
    ],
  },
  {
    title: 'Blood Pressure',
    fields: [
      { key: 'sbp', label: 'Systolic BP', unit: 'mmHg', min: 80, max: 220, step: 1 },
      { key: 'dbp', label: 'Diastolic BP', unit: 'mmHg', min: 40, max: 140, step: 1 },
    ],
  },
  {
    title: 'Lipid Panel',
    fields: [
      { key: 'ldl', label: 'LDL-C', unit: 'mg/dL', min: 30, max: 300, step: 1 },
      { key: 'hdl', label: 'HDL-C', unit: 'mg/dL', min: 15, max: 100, step: 1 },
      { key: 'tc', label: 'Total Cholesterol', unit: 'mg/dL', min: 100, max: 400, step: 1 },
      { key: 'tg', label: 'Triglycerides', unit: 'mg/dL', min: 30, max: 500, step: 1 },
    ],
  },
  {
    title: 'Glycemic',
    fields: [
      { key: 'hba1c', label: 'HbA1c', unit: '%', min: 3.5, max: 14, step: 0.1 },
      { key: 'fpg', label: 'Fasting Glucose', unit: 'mg/dL', min: 50, max: 300, step: 1 },
    ],
  },
  {
    title: 'Renal & Anthropometric',
    fields: [
      { key: 'egfr', label: 'eGFR', unit: 'mL/min/1.73m²', min: 10, max: 130, step: 1 },
      { key: 'bmi', label: 'BMI', unit: 'kg/m²', min: 14, max: 50, step: 0.1 },
    ],
  },
  {
    title: 'Lifestyle',
    fields: [
      { key: 'smoking', label: 'Smoking', type: 'select', options: [{ value: 0, label: 'Never' }, { value: 0.5, label: 'Former' }, { value: 1, label: 'Current' }] },
      { key: 'exercise', label: 'Exercise', unit: 'days/week', min: 0, max: 7, step: 1 },
      { key: 'alcohol', label: 'Alcohol', type: 'select', options: [{ value: 0, label: 'None' }, { value: 0.5, label: 'Moderate' }, { value: 1, label: 'Heavy' }] },
      { key: 'diet', label: 'Diet Quality', unit: '0-1', min: 0, max: 1, step: 0.1 },
    ],
  },
]

const medications = [
  { key: 'statin', label: 'Statin' },
  { key: 'htn_med', label: 'Antihypertensive' },
  { key: 'sglt2i', label: 'SGLT2 Inhibitor' },
  { key: 'metformin', label: 'Metformin' },
  { key: 'aspirin', label: 'Aspirin' },
  { key: 'ace_arb', label: 'ACEi/ARB' },
]

export default function ProfilePage() {
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [activeId, setActiveId] = useState('')
  const [form, setForm] = useState<PatientProfile | null>(null)
  const [mounted, setMounted] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setMounted(true)
    const p = loadPatients()
    setPatients(p)
    const id = getActivePatientId()
    setActiveId(id)
    const active = p.find(x => x.id === id) || p[0]
    if (active) setForm({ ...active })
  }, [])

  const selectPatient = (id: string) => {
    setActiveId(id)
    setActivePatientId(id)
    const p = patients.find(x => x.id === id)
    if (p) setForm({ ...p })
  }

  const updateField = (key: string, value: number) => {
    if (!form) return
    setForm({ ...form, [key]: value })
  }

  const handleSave = () => {
    if (!form) return
    const updated = patients.map(p => p.id === form.id ? form : p)
    setPatients(updated)
    savePatients(updated)
    addVisit(form.id, form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    const demo = demoPatients.find(d => d.id === activeId)
    if (demo) {
      setForm({ ...demo })
    }
  }

  const addNewPatient = () => {
    const newP: PatientProfile = {
      ...demoPatients[1],
      id: `patient-${Date.now()}`,
      name: `Patient ${patients.length + 1}`,
    }
    const updated = [...patients, newP]
    setPatients(updated)
    savePatients(updated)
    selectPatient(newP.id)
  }

  if (!mounted || !form) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-teal-500">Loading...</div>
    </div>
  )

  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-800 dark:text-white">Patient Profile</h1>
            <p className="text-navy-500 dark:text-navy-300">Enter or update patient data</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {patients.map(p => (
              <Button key={p.id} variant={p.id === activeId ? 'default' : 'outline'} size="sm" onClick={() => selectPatient(p.id)}>
                {p.name.split(' ')[0]}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={addNewPatient}>
              <UserPlus className="h-4 w-4 mr-1" /> New
            </Button>
          </div>
        </div>

        {/* Name */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium w-20">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="flex-1 rounded-lg border border-navy-200 px-3 py-2 text-sm bg-white dark:bg-navy-800 dark:border-navy-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Field groups */}
        <div className="grid md:grid-cols-2 gap-6">
          {fieldGroups.map(group => (
            <Card key={group.title}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{group.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.fields.map(field => (
                  <div key={field.key} className="flex items-center gap-3">
                    <label className="text-sm font-medium w-32 text-navy-600 dark:text-navy-300">{field.label}</label>
                    {field.type === 'select' ? (
                      <select
                        value={(form as any)[field.key]}
                        onChange={e => updateField(field.key, parseFloat(e.target.value))}
                        className="flex-1 rounded-lg border border-navy-200 px-3 py-2 text-sm bg-white dark:bg-navy-800 dark:border-navy-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        {field.options!.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="number"
                          value={(form as any)[field.key]}
                          onChange={e => updateField(field.key, parseFloat(e.target.value) || 0)}
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          className="w-24 rounded-lg border border-navy-200 px-3 py-2 text-sm bg-white dark:bg-navy-800 dark:border-navy-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        {field.unit && <span className="text-xs text-navy-400">{field.unit}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {/* Medications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Current Medications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {medications.map(med => (
                <div key={med.key} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-navy-600 dark:text-navy-300">{med.label}</label>
                  <Switch
                    checked={(form as any)[med.key] === 1}
                    onCheckedChange={checked => updateField(med.key, checked ? 1 : 0)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {saved ? '✓ Saved!' : 'Save & Record Visit'}
          </Button>
          <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset to Demo
          </Button>
        </div>
      </main>
    </>
  )
}
