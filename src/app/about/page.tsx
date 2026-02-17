'use client'

import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { BookOpen, Brain, Network, Shield, ExternalLink, Heart, AlertTriangle } from 'lucide-react'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-800 dark:text-white">About NCD Health+</h1>
          <p className="text-navy-500 dark:text-navy-300">Understanding the NCD-CIE framework</p>
        </div>

        {/* Hero Card */}
        <motion.div {...fadeIn}>
          <Card className="bg-gradient-to-br from-navy-800 to-navy-900 text-white border-none">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-teal-500/20">
                  <Heart className="h-8 w-8 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">NCD-CIE: Causal Inference Engine for NCDs</h2>
                  <p className="text-navy-200 leading-relaxed">
                    NCD Health+ is powered by the NCD-CIE framework — a causal inference engine that models the complex
                    relationships between risk factors, biomarkers, lifestyle choices, medications, and non-communicable
                    diseases (NCDs) using a structured knowledge graph with 107 evidence-based causal edges.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* How It Works */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-teal-500" /> How NCD-CIE Works</CardTitle>
              <CardDescription>Simplified explanation for patients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-navy-600 dark:text-navy-300">
              <div className="p-4 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
                <h3 className="font-semibold text-navy-800 dark:text-white mb-2">1. Risk Scoring</h3>
                <p>Your risk for each disease (like heart disease or diabetes) is calculated using a mathematical formula that combines all your health data:</p>
                <div className="mt-2 p-3 bg-white dark:bg-navy-800 rounded font-mono text-xs overflow-x-auto">
                  Risk = sigmoid(β₀ + Σ W × z)<br />
                  <span className="text-navy-400">Where sigmoid converts the sum into a 0-100% probability</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-navy-800 dark:text-white mb-2">2. Knowledge Graph</h3>
                <p>We use a graph of 107 causal connections between health factors, backed by medical evidence. For example:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside text-navy-500 dark:text-navy-400">
                  <li>High LDL cholesterol → increases heart disease risk (weight: +0.28)</li>
                  <li>Exercise → decreases blood pressure (weight: -0.10)</li>
                  <li>Statins → lower LDL cholesterol (weight: -0.35)</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold text-navy-800 dark:text-white mb-2">3. What-If Simulations</h3>
                <p>When you simulate an intervention (like &ldquo;start statin&rdquo;), the system traces through the causal graph to show cascade effects:</p>
                <div className="mt-2 text-navy-500 dark:text-navy-400">
                  Start statin → LDL drops → CAD risk drops → Overall CVD risk drops<br />
                  <span className="text-xs">(Effects attenuate by γ=0.7 at each hop, up to 3 hops deep)</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-navy-800 dark:text-white mb-2">4. Composite NCD Risk</h3>
                <p>Your overall NCD risk combines CVD, diabetes, and kidney disease risks:</p>
                <div className="mt-2 p-3 bg-white dark:bg-navy-800 rounded font-mono text-xs">
                  R_NCD = 1 - (1-R_CVD) × (1-R_T2DM) × (1-R_CKD)
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Factors Explained */}
        <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Network className="h-5 w-5 text-teal-500" /> Risk Factors Explained</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                {[
                  { name: 'LDL-C', desc: 'Bad cholesterol. Higher = more plaque in arteries = higher heart risk.', target: '< 100 mg/dL' },
                  { name: 'HDL-C', desc: 'Good cholesterol. Higher is protective. Helps clear LDL.', target: '> 40 mg/dL (M), > 50 (F)' },
                  { name: 'SBP', desc: 'Systolic blood pressure. The top number. High SBP damages blood vessels.', target: '< 130 mmHg' },
                  { name: 'HbA1c', desc: 'Average blood sugar over 3 months. Key diabetes marker.', target: '< 5.7% (normal)' },
                  { name: 'BMI', desc: 'Body mass index. Weight relative to height. Affects many risks.', target: '18.5-25 kg/m²' },
                  { name: 'eGFR', desc: 'Kidney filtration rate. Lower = worse kidney function.', target: '> 90 mL/min' },
                  { name: 'Smoking', desc: 'One of the strongest risk factors for heart and vascular disease.', target: 'Never / Quit' },
                  { name: 'Exercise', desc: 'Regular exercise reduces almost every risk factor. Very powerful.', target: '≥ 5 days/week' },
                ].map(item => (
                  <div key={item.name} className="p-3 rounded-lg border border-navy-100 dark:border-navy-700">
                    <div className="font-semibold text-navy-800 dark:text-white">{item.name}</div>
                    <div className="text-navy-500 dark:text-navy-400 text-xs mt-1">{item.desc}</div>
                    <div className="text-teal-600 dark:text-teal-400 text-xs mt-1 font-medium">Target: {item.target}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Evidence Grades */}
        <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-teal-500" /> Evidence Grades</CardTitle>
              <CardDescription>How we rate the strength of each causal connection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {[
                  { grade: 'A', label: 'Strong Evidence', desc: 'Multiple large RCTs or systematic reviews. High confidence.', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
                  { grade: 'B', label: 'Moderate Evidence', desc: 'Limited RCTs or consistent observational studies.', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
                  { grade: 'C', label: 'Weak Evidence', desc: 'Observational only or conflicting results.', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
                  { grade: 'D', label: 'Expert Opinion', desc: 'Based on biological plausibility and expert consensus.', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
                ].map(item => (
                  <div key={item.grade} className="flex items-start gap-3">
                    <span className={`px-2 py-1 rounded-md font-bold text-xs ${item.color}`}>Grade {item.grade}</span>
                    <div>
                      <div className="font-medium text-navy-800 dark:text-white">{item.label}</div>
                      <div className="text-xs text-navy-500 dark:text-navy-400">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Disclaimer & Credits */}
        <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-navy-800 dark:text-white mb-2">Important Disclaimer</p>
                  <p className="text-navy-500 dark:text-navy-400">
                    This application is for <strong>research and educational purposes only</strong>. It is not a substitute
                    for professional medical advice, diagnosis, or treatment. Always consult your healthcare provider
                    before making any changes to your health regimen.
                  </p>
                  <div className="mt-4 p-3 rounded-lg bg-navy-50 dark:bg-navy-700/50">
                    <p className="font-medium text-navy-700 dark:text-navy-200">Credits</p>
                    <p className="text-navy-500 dark:text-navy-400 text-xs mt-1">
                      Based on the NCD-CIE (Non-Communicable Disease — Causal Inference Engine) framework.<br />
                      Submitted to AIiH 2026 (AI in Healthcare Conference).<br />
                      107-edge knowledge graph derived from systematic review of clinical evidence.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </>
  )
}
