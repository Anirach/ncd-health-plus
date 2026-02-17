'use client'

import { motion } from 'framer-motion'
import { getRiskColor, getRiskLevel } from '@/lib/ncd-cie-engine'

interface RiskGaugeProps {
  label: string
  value: number
  ciLow?: number
  ciHigh?: number
  size?: 'sm' | 'md' | 'lg'
  showCI?: boolean
}

export default function RiskGauge({ label, value, ciLow, ciHigh, size = 'md', showCI = false }: RiskGaugeProps) {
  const color = getRiskColor(value)
  const level = getRiskLevel(value)
  const percentage = Math.min(value * 100, 100)

  const dimensions = {
    sm: { r: 40, stroke: 8, fontSize: 14, labelSize: 10, outer: 100 },
    md: { r: 55, stroke: 10, fontSize: 20, labelSize: 12, outer: 140 },
    lg: { r: 70, stroke: 12, fontSize: 26, labelSize: 14, outer: 180 },
  }

  const d = dimensions[size]
  const circumference = 2 * Math.PI * d.r
  const arcLength = circumference * 0.75 // 270 degrees
  const offset = arcLength - (arcLength * percentage) / 100

  return (
    <div className="flex flex-col items-center">
      <svg width={d.outer} height={d.outer} viewBox={`0 0 ${d.outer} ${d.outer}`}>
        {/* Background arc */}
        <circle
          cx={d.outer / 2}
          cy={d.outer / 2}
          r={d.r}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={d.stroke}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={0}
          transform={`rotate(135 ${d.outer / 2} ${d.outer / 2})`}
          className="dark:stroke-navy-700"
        />
        {/* Value arc */}
        <motion.circle
          cx={d.outer / 2}
          cy={d.outer / 2}
          r={d.r}
          fill="none"
          stroke={color}
          strokeWidth={d.stroke}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          transform={`rotate(135 ${d.outer / 2} ${d.outer / 2})`}
        />
        {/* Percentage text */}
        <text
          x={d.outer / 2}
          y={d.outer / 2 - 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={d.fontSize}
          fontWeight="bold"
          fill={color}
        >
          {percentage.toFixed(1)}%
        </text>
        {/* Level text */}
        <text
          x={d.outer / 2}
          y={d.outer / 2 + d.fontSize - 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={d.labelSize}
          className="fill-navy-500 dark:fill-navy-300"
        >
          {level}
        </text>
      </svg>
      <span className="mt-1 text-sm font-medium text-navy-700 dark:text-navy-200">{label}</span>
      {showCI && ciLow !== undefined && ciHigh !== undefined && (
        <span className="text-xs text-navy-400 dark:text-navy-400">
          95% CI: {(ciLow * 100).toFixed(1)}–{(ciHigh * 100).toFixed(1)}%
        </span>
      )}
    </div>
  )
}
