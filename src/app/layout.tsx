import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NCD Health+ — Risk Prediction & What-If Platform',
  description: 'A modern NCD risk prediction platform based on the NCD-CIE causal inference framework. For research and educational purposes only.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 text-navy-800 dark:from-navy-900 dark:via-navy-900 dark:to-navy-800 dark:text-white antialiased">
        {children}
        {/* Disclaimer footer */}
        <footer className="border-t border-navy-100 dark:border-navy-700 bg-white/50 dark:bg-navy-900/50 mt-12">
          <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-navy-400 dark:text-navy-500">
            <p className="font-medium text-navy-500 dark:text-navy-400 mb-1">⚕️ For research and educational purposes only. Not a substitute for medical advice.</p>
            <p>Based on the NCD-CIE framework — AIiH 2026</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
