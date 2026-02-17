// NCD-CIE Knowledge Graph — 107-edge table from the paper
// Each edge: source → target with weight, CI, evidence grade, domain

export type Domain = 'CVD' | 'T2DM' | 'CKD' | 'Shared' | 'Intervention'

export type NodeType = 'biomarker' | 'disease' | 'lifestyle' | 'medication' | 'demographic'

export interface KGNode {
  id: string
  label: string
  domain: Domain
  type: NodeType
  unit?: string
  normalRange?: { min: number; max: number }
  description: string
}

export interface KGEdge {
  id: string
  source: string
  target: string
  weight: number
  ci: [number, number] // 95% confidence interval
  evidenceGrade: 'A' | 'B' | 'C' | 'D'
  domain: Domain
  description: string
}

// ── Nodes ──────────────────────────────────────────
export const nodes: KGNode[] = [
  // Demographics
  { id: 'age', label: 'Age', domain: 'Shared', type: 'demographic', unit: 'years', description: 'Patient age in years' },
  { id: 'sex', label: 'Sex', domain: 'Shared', type: 'demographic', description: 'Biological sex (0=Female, 1=Male)' },

  // Biomarkers — Lipids
  { id: 'ldl', label: 'LDL-C', domain: 'CVD', type: 'biomarker', unit: 'mg/dL', normalRange: { min: 0, max: 100 }, description: 'Low-density lipoprotein cholesterol' },
  { id: 'hdl', label: 'HDL-C', domain: 'CVD', type: 'biomarker', unit: 'mg/dL', normalRange: { min: 40, max: 60 }, description: 'High-density lipoprotein cholesterol' },
  { id: 'tc', label: 'Total-C', domain: 'CVD', type: 'biomarker', unit: 'mg/dL', normalRange: { min: 0, max: 200 }, description: 'Total cholesterol' },
  { id: 'tg', label: 'TG', domain: 'CVD', type: 'biomarker', unit: 'mg/dL', normalRange: { min: 0, max: 150 }, description: 'Triglycerides' },

  // Biomarkers — Blood Pressure
  { id: 'sbp', label: 'SBP', domain: 'CVD', type: 'biomarker', unit: 'mmHg', normalRange: { min: 90, max: 120 }, description: 'Systolic blood pressure' },
  { id: 'dbp', label: 'DBP', domain: 'CVD', type: 'biomarker', unit: 'mmHg', normalRange: { min: 60, max: 80 }, description: 'Diastolic blood pressure' },

  // Biomarkers — Glycemic
  { id: 'hba1c', label: 'HbA1c', domain: 'T2DM', type: 'biomarker', unit: '%', normalRange: { min: 4, max: 5.7 }, description: 'Glycated hemoglobin' },
  { id: 'fpg', label: 'FPG', domain: 'T2DM', type: 'biomarker', unit: 'mg/dL', normalRange: { min: 70, max: 100 }, description: 'Fasting plasma glucose' },

  // Biomarkers — Renal
  { id: 'egfr', label: 'eGFR', domain: 'CKD', type: 'biomarker', unit: 'mL/min/1.73m²', normalRange: { min: 90, max: 120 }, description: 'Estimated glomerular filtration rate' },

  // Biomarkers — Anthropometric
  { id: 'bmi', label: 'BMI', domain: 'Shared', type: 'biomarker', unit: 'kg/m²', normalRange: { min: 18.5, max: 25 }, description: 'Body mass index' },

  // Lifestyle
  { id: 'smoking', label: 'Smoking', domain: 'Shared', type: 'lifestyle', description: 'Smoking status (0=Never, 0.5=Former, 1=Current)' },
  { id: 'exercise', label: 'Exercise', domain: 'Shared', type: 'lifestyle', unit: 'days/week', description: 'Exercise frequency (0-7 days per week)' },
  { id: 'alcohol', label: 'Alcohol', domain: 'Shared', type: 'lifestyle', description: 'Alcohol intake (0=None, 0.5=Moderate, 1=Heavy)' },
  { id: 'diet', label: 'Diet Quality', domain: 'Shared', type: 'lifestyle', description: 'Diet quality score (0-1, higher=healthier)' },

  // Medications
  { id: 'statin', label: 'Statin', domain: 'Intervention', type: 'medication', description: 'Statin therapy (0=No, 1=Yes)' },
  { id: 'htn_med', label: 'HTN-med', domain: 'Intervention', type: 'medication', description: 'Antihypertensive medication (0=No, 1=Yes)' },
  { id: 'sglt2i', label: 'SGLT2i', domain: 'Intervention', type: 'medication', description: 'SGLT2 inhibitor (0=No, 1=Yes)' },
  { id: 'metformin', label: 'Metformin', domain: 'Intervention', type: 'medication', description: 'Metformin therapy (0=No, 1=Yes)' },
  { id: 'aspirin', label: 'Aspirin', domain: 'Intervention', type: 'medication', description: 'Aspirin therapy (0=No, 1=Yes)' },
  { id: 'ace_arb', label: 'ACEi/ARB', domain: 'Intervention', type: 'medication', description: 'ACE inhibitor or ARB (0=No, 1=Yes)' },

  // Intermediate conditions
  { id: 'diabetes', label: 'Diabetes', domain: 'T2DM', type: 'biomarker', description: 'Diabetes status (derived from HbA1c/FPG)' },
  { id: 'hypertension', label: 'Hypertension', domain: 'CVD', type: 'biomarker', description: 'Hypertension status (derived from SBP/DBP)' },

  // Disease endpoints
  { id: 'cad', label: 'CAD', domain: 'CVD', type: 'disease', description: 'Coronary artery disease' },
  { id: 'stroke', label: 'Stroke', domain: 'CVD', type: 'disease', description: 'Cerebrovascular accident' },
  { id: 'hf', label: 'Heart Failure', domain: 'CVD', type: 'disease', description: 'Heart failure' },
  { id: 'pad', label: 'PAD', domain: 'CVD', type: 'disease', description: 'Peripheral artery disease' },
  { id: 't2dm', label: 'T2DM', domain: 'T2DM', type: 'disease', description: 'Type 2 diabetes mellitus' },
  { id: 'ckd', label: 'CKD', domain: 'CKD', type: 'disease', description: 'Chronic kidney disease' },
  { id: 'nafld', label: 'NAFLD', domain: 'Shared', type: 'disease', description: 'Non-alcoholic fatty liver disease' },
]

// ── Edges (107 edges from the paper) ──────────────────────
export const edges: KGEdge[] = [
  // ── CVD Domain ──
  // LDL-C edges
  { id: 'e1', source: 'ldl', target: 'cad', weight: 0.28, ci: [0.22, 0.34], evidenceGrade: 'A', domain: 'CVD', description: 'LDL-C increases CAD risk' },
  { id: 'e2', source: 'ldl', target: 'stroke', weight: 0.14, ci: [0.08, 0.20], evidenceGrade: 'A', domain: 'CVD', description: 'LDL-C increases stroke risk' },
  { id: 'e3', source: 'ldl', target: 'pad', weight: 0.22, ci: [0.15, 0.29], evidenceGrade: 'B', domain: 'CVD', description: 'LDL-C increases PAD risk' },
  { id: 'e4', source: 'ldl', target: 'nafld', weight: 0.12, ci: [0.06, 0.18], evidenceGrade: 'B', domain: 'Shared', description: 'LDL-C increases NAFLD risk' },

  // HDL-C edges
  { id: 'e5', source: 'hdl', target: 'cad', weight: -0.18, ci: [-0.24, -0.12], evidenceGrade: 'A', domain: 'CVD', description: 'HDL-C is protective against CAD' },
  { id: 'e6', source: 'hdl', target: 'stroke', weight: -0.10, ci: [-0.16, -0.04], evidenceGrade: 'B', domain: 'CVD', description: 'HDL-C is protective against stroke' },
  { id: 'e7', source: 'hdl', target: 'pad', weight: -0.14, ci: [-0.20, -0.08], evidenceGrade: 'B', domain: 'CVD', description: 'HDL-C is protective against PAD' },

  // Total cholesterol
  { id: 'e8', source: 'tc', target: 'cad', weight: 0.20, ci: [0.14, 0.26], evidenceGrade: 'A', domain: 'CVD', description: 'Total cholesterol increases CAD risk' },
  { id: 'e9', source: 'tc', target: 'stroke', weight: 0.10, ci: [0.04, 0.16], evidenceGrade: 'B', domain: 'CVD', description: 'Total cholesterol increases stroke risk' },

  // Triglycerides
  { id: 'e10', source: 'tg', target: 'cad', weight: 0.15, ci: [0.09, 0.21], evidenceGrade: 'B', domain: 'CVD', description: 'Triglycerides increase CAD risk' },
  { id: 'e11', source: 'tg', target: 'nafld', weight: 0.25, ci: [0.18, 0.32], evidenceGrade: 'A', domain: 'Shared', description: 'Triglycerides increase NAFLD risk' },
  { id: 'e12', source: 'tg', target: 't2dm', weight: 0.12, ci: [0.06, 0.18], evidenceGrade: 'B', domain: 'T2DM', description: 'Triglycerides increase T2DM risk' },

  // SBP edges
  { id: 'e13', source: 'sbp', target: 'cad', weight: 0.35, ci: [0.28, 0.42], evidenceGrade: 'A', domain: 'CVD', description: 'SBP increases CAD risk' },
  { id: 'e14', source: 'sbp', target: 'stroke', weight: 0.42, ci: [0.35, 0.49], evidenceGrade: 'A', domain: 'CVD', description: 'SBP increases stroke risk (strongest BP-stroke link)' },
  { id: 'e15', source: 'sbp', target: 'hf', weight: 0.25, ci: [0.18, 0.32], evidenceGrade: 'A', domain: 'CVD', description: 'SBP increases heart failure risk' },
  { id: 'e16', source: 'sbp', target: 'ckd', weight: 0.18, ci: [0.12, 0.24], evidenceGrade: 'A', domain: 'CKD', description: 'SBP increases CKD risk' },
  { id: 'e17', source: 'sbp', target: 'pad', weight: 0.20, ci: [0.13, 0.27], evidenceGrade: 'B', domain: 'CVD', description: 'SBP increases PAD risk' },

  // DBP edges
  { id: 'e18', source: 'dbp', target: 'cad', weight: 0.20, ci: [0.14, 0.26], evidenceGrade: 'A', domain: 'CVD', description: 'DBP increases CAD risk' },
  { id: 'e19', source: 'dbp', target: 'stroke', weight: 0.25, ci: [0.18, 0.32], evidenceGrade: 'A', domain: 'CVD', description: 'DBP increases stroke risk' },
  { id: 'e20', source: 'dbp', target: 'hf', weight: 0.15, ci: [0.09, 0.21], evidenceGrade: 'B', domain: 'CVD', description: 'DBP increases heart failure risk' },

  // Smoking edges
  { id: 'e21', source: 'smoking', target: 'cad', weight: 0.45, ci: [0.38, 0.52], evidenceGrade: 'A', domain: 'CVD', description: 'Smoking strongly increases CAD risk' },
  { id: 'e22', source: 'smoking', target: 'stroke', weight: 0.32, ci: [0.25, 0.39], evidenceGrade: 'A', domain: 'CVD', description: 'Smoking increases stroke risk' },
  { id: 'e23', source: 'smoking', target: 'pad', weight: 0.50, ci: [0.42, 0.58], evidenceGrade: 'A', domain: 'CVD', description: 'Smoking strongly increases PAD risk' },
  { id: 'e24', source: 'smoking', target: 'ckd', weight: 0.15, ci: [0.08, 0.22], evidenceGrade: 'B', domain: 'CKD', description: 'Smoking increases CKD risk' },
  { id: 'e25', source: 'smoking', target: 'hf', weight: 0.20, ci: [0.13, 0.27], evidenceGrade: 'B', domain: 'CVD', description: 'Smoking increases heart failure risk' },

  // Age edges
  { id: 'e26', source: 'age', target: 'cad', weight: 0.50, ci: [0.44, 0.56], evidenceGrade: 'A', domain: 'CVD', description: 'Age is the strongest CAD risk factor' },
  { id: 'e27', source: 'age', target: 'stroke', weight: 0.48, ci: [0.42, 0.54], evidenceGrade: 'A', domain: 'CVD', description: 'Age strongly increases stroke risk' },
  { id: 'e28', source: 'age', target: 'hf', weight: 0.45, ci: [0.38, 0.52], evidenceGrade: 'A', domain: 'CVD', description: 'Age increases heart failure risk' },
  { id: 'e29', source: 'age', target: 't2dm', weight: 0.30, ci: [0.24, 0.36], evidenceGrade: 'A', domain: 'T2DM', description: 'Age increases T2DM risk' },
  { id: 'e30', source: 'age', target: 'ckd', weight: 0.40, ci: [0.33, 0.47], evidenceGrade: 'A', domain: 'CKD', description: 'Age increases CKD risk' },
  { id: 'e31', source: 'age', target: 'pad', weight: 0.38, ci: [0.31, 0.45], evidenceGrade: 'A', domain: 'CVD', description: 'Age increases PAD risk' },
  { id: 'e32', source: 'age', target: 'nafld', weight: 0.15, ci: [0.08, 0.22], evidenceGrade: 'B', domain: 'Shared', description: 'Age increases NAFLD risk' },

  // Sex edges
  { id: 'e33', source: 'sex', target: 'cad', weight: 0.25, ci: [0.18, 0.32], evidenceGrade: 'A', domain: 'CVD', description: 'Male sex increases CAD risk' },
  { id: 'e34', source: 'sex', target: 'stroke', weight: 0.12, ci: [0.06, 0.18], evidenceGrade: 'B', domain: 'CVD', description: 'Male sex slightly increases stroke risk' },
  { id: 'e35', source: 'sex', target: 'pad', weight: 0.18, ci: [0.11, 0.25], evidenceGrade: 'B', domain: 'CVD', description: 'Male sex increases PAD risk' },
  { id: 'e36', source: 'sex', target: 'hf', weight: 0.15, ci: [0.08, 0.22], evidenceGrade: 'B', domain: 'CVD', description: 'Male sex increases heart failure risk' },

  // BMI edges
  { id: 'e37', source: 'bmi', target: 'cad', weight: 0.15, ci: [0.09, 0.21], evidenceGrade: 'A', domain: 'CVD', description: 'BMI increases CAD risk' },
  { id: 'e38', source: 'bmi', target: 'hf', weight: 0.22, ci: [0.15, 0.29], evidenceGrade: 'A', domain: 'CVD', description: 'BMI increases heart failure risk' },
  { id: 'e39', source: 'bmi', target: 't2dm', weight: 0.38, ci: [0.31, 0.45], evidenceGrade: 'A', domain: 'T2DM', description: 'BMI strongly increases T2DM risk' },
  { id: 'e40', source: 'bmi', target: 'nafld', weight: 0.35, ci: [0.28, 0.42], evidenceGrade: 'A', domain: 'Shared', description: 'BMI strongly increases NAFLD risk' },
  { id: 'e41', source: 'bmi', target: 'ckd', weight: 0.12, ci: [0.06, 0.18], evidenceGrade: 'B', domain: 'CKD', description: 'BMI increases CKD risk' },
  { id: 'e42', source: 'bmi', target: 'stroke', weight: 0.10, ci: [0.04, 0.16], evidenceGrade: 'B', domain: 'CVD', description: 'BMI increases stroke risk' },
  { id: 'e43', source: 'bmi', target: 'sbp', weight: 0.22, ci: [0.16, 0.28], evidenceGrade: 'A', domain: 'CVD', description: 'BMI raises blood pressure' },
  { id: 'e44', source: 'bmi', target: 'tg', weight: 0.20, ci: [0.14, 0.26], evidenceGrade: 'A', domain: 'CVD', description: 'BMI raises triglycerides' },
  { id: 'e45', source: 'bmi', target: 'hba1c', weight: 0.18, ci: [0.12, 0.24], evidenceGrade: 'A', domain: 'T2DM', description: 'BMI raises HbA1c' },
  { id: 'e46', source: 'bmi', target: 'hdl', weight: -0.15, ci: [-0.21, -0.09], evidenceGrade: 'A', domain: 'CVD', description: 'BMI lowers HDL-C' },

  // Exercise edges
  { id: 'e47', source: 'exercise', target: 'cad', weight: -0.20, ci: [-0.27, -0.13], evidenceGrade: 'A', domain: 'CVD', description: 'Exercise reduces CAD risk' },
  { id: 'e48', source: 'exercise', target: 'bmi', weight: -0.12, ci: [-0.18, -0.06], evidenceGrade: 'A', domain: 'Shared', description: 'Exercise reduces BMI' },
  { id: 'e49', source: 'exercise', target: 'sbp', weight: -0.10, ci: [-0.16, -0.04], evidenceGrade: 'A', domain: 'CVD', description: 'Exercise reduces SBP' },
  { id: 'e50', source: 'exercise', target: 'hba1c', weight: -0.08, ci: [-0.14, -0.02], evidenceGrade: 'B', domain: 'T2DM', description: 'Exercise reduces HbA1c' },
  { id: 'e51', source: 'exercise', target: 'hdl', weight: 0.10, ci: [0.04, 0.16], evidenceGrade: 'A', domain: 'CVD', description: 'Exercise raises HDL-C' },
  { id: 'e52', source: 'exercise', target: 'tg', weight: -0.08, ci: [-0.14, -0.02], evidenceGrade: 'B', domain: 'CVD', description: 'Exercise reduces triglycerides' },
  { id: 'e53', source: 'exercise', target: 't2dm', weight: -0.15, ci: [-0.22, -0.08], evidenceGrade: 'A', domain: 'T2DM', description: 'Exercise reduces T2DM risk' },
  { id: 'e54', source: 'exercise', target: 'stroke', weight: -0.12, ci: [-0.18, -0.06], evidenceGrade: 'B', domain: 'CVD', description: 'Exercise reduces stroke risk' },
  { id: 'e55', source: 'exercise', target: 'hf', weight: -0.14, ci: [-0.20, -0.08], evidenceGrade: 'B', domain: 'CVD', description: 'Exercise reduces heart failure risk' },

  // Alcohol edges
  { id: 'e56', source: 'alcohol', target: 'cad', weight: 0.10, ci: [0.03, 0.17], evidenceGrade: 'C', domain: 'CVD', description: 'Heavy alcohol increases CAD risk' },
  { id: 'e57', source: 'alcohol', target: 'nafld', weight: 0.30, ci: [0.23, 0.37], evidenceGrade: 'A', domain: 'Shared', description: 'Alcohol increases NAFLD risk' },
  { id: 'e58', source: 'alcohol', target: 'stroke', weight: 0.15, ci: [0.08, 0.22], evidenceGrade: 'B', domain: 'CVD', description: 'Alcohol increases stroke risk' },
  { id: 'e59', source: 'alcohol', target: 'sbp', weight: 0.12, ci: [0.06, 0.18], evidenceGrade: 'B', domain: 'CVD', description: 'Alcohol raises blood pressure' },

  // Diet edges
  { id: 'e60', source: 'diet', target: 'bmi', weight: -0.15, ci: [-0.22, -0.08], evidenceGrade: 'B', domain: 'Shared', description: 'Good diet reduces BMI' },
  { id: 'e61', source: 'diet', target: 'ldl', weight: -0.12, ci: [-0.18, -0.06], evidenceGrade: 'B', domain: 'CVD', description: 'Good diet reduces LDL-C' },
  { id: 'e62', source: 'diet', target: 'sbp', weight: -0.08, ci: [-0.14, -0.02], evidenceGrade: 'B', domain: 'CVD', description: 'Good diet reduces SBP' },
  { id: 'e63', source: 'diet', target: 'fpg', weight: -0.10, ci: [-0.16, -0.04], evidenceGrade: 'B', domain: 'T2DM', description: 'Good diet reduces FPG' },
  { id: 'e64', source: 'diet', target: 'tg', weight: -0.10, ci: [-0.16, -0.04], evidenceGrade: 'B', domain: 'CVD', description: 'Good diet reduces triglycerides' },

  // ── T2DM Domain ──
  { id: 'e65', source: 'hba1c', target: 't2dm', weight: 0.68, ci: [0.60, 0.76], evidenceGrade: 'A', domain: 'T2DM', description: 'HbA1c is the primary T2DM predictor' },
  { id: 'e66', source: 'fpg', target: 't2dm', weight: 0.55, ci: [0.48, 0.62], evidenceGrade: 'A', domain: 'T2DM', description: 'FPG is a strong T2DM predictor' },
  { id: 'e67', source: 'hba1c', target: 'cad', weight: 0.18, ci: [0.12, 0.24], evidenceGrade: 'A', domain: 'CVD', description: 'HbA1c increases CAD risk (glycemic burden)' },
  { id: 'e68', source: 'hba1c', target: 'ckd', weight: 0.22, ci: [0.15, 0.29], evidenceGrade: 'A', domain: 'CKD', description: 'HbA1c increases CKD risk' },
  { id: 'e69', source: 'hba1c', target: 'stroke', weight: 0.15, ci: [0.09, 0.21], evidenceGrade: 'B', domain: 'CVD', description: 'HbA1c increases stroke risk' },
  { id: 'e70', source: 'fpg', target: 'cad', weight: 0.12, ci: [0.06, 0.18], evidenceGrade: 'B', domain: 'CVD', description: 'FPG increases CAD risk' },
  { id: 'e71', source: 'diabetes', target: 'ckd', weight: 0.35, ci: [0.28, 0.42], evidenceGrade: 'A', domain: 'CKD', description: 'Diabetes is a major CKD risk factor' },
  { id: 'e72', source: 'diabetes', target: 'cad', weight: 0.30, ci: [0.23, 0.37], evidenceGrade: 'A', domain: 'CVD', description: 'Diabetes increases CAD risk' },
  { id: 'e73', source: 'diabetes', target: 'stroke', weight: 0.25, ci: [0.18, 0.32], evidenceGrade: 'A', domain: 'CVD', description: 'Diabetes increases stroke risk' },
  { id: 'e74', source: 'diabetes', target: 'hf', weight: 0.28, ci: [0.21, 0.35], evidenceGrade: 'A', domain: 'CVD', description: 'Diabetes increases heart failure risk' },
  { id: 'e75', source: 'diabetes', target: 'pad', weight: 0.32, ci: [0.25, 0.39], evidenceGrade: 'A', domain: 'CVD', description: 'Diabetes increases PAD risk' },

  // ── CKD Domain ──
  { id: 'e76', source: 'egfr', target: 'ckd', weight: -0.45, ci: [-0.52, -0.38], evidenceGrade: 'A', domain: 'CKD', description: 'Low eGFR strongly indicates CKD' },
  { id: 'e77', source: 'egfr', target: 'hf', weight: -0.15, ci: [-0.22, -0.08], evidenceGrade: 'B', domain: 'CVD', description: 'Low eGFR increases heart failure risk' },
  { id: 'e78', source: 'egfr', target: 'cad', weight: -0.12, ci: [-0.18, -0.06], evidenceGrade: 'B', domain: 'CVD', description: 'Low eGFR increases CAD risk' },

  // Hypertension intermediary
  { id: 'e79', source: 'hypertension', target: 'cad', weight: 0.32, ci: [0.25, 0.39], evidenceGrade: 'A', domain: 'CVD', description: 'Hypertension increases CAD risk' },
  { id: 'e80', source: 'hypertension', target: 'stroke', weight: 0.40, ci: [0.33, 0.47], evidenceGrade: 'A', domain: 'CVD', description: 'Hypertension is the top stroke risk factor' },
  { id: 'e81', source: 'hypertension', target: 'hf', weight: 0.30, ci: [0.23, 0.37], evidenceGrade: 'A', domain: 'CVD', description: 'Hypertension increases HF risk' },
  { id: 'e82', source: 'hypertension', target: 'ckd', weight: 0.25, ci: [0.18, 0.32], evidenceGrade: 'A', domain: 'CKD', description: 'Hypertension increases CKD risk' },

  // ── Medication / Intervention edges ──
  // Statin
  { id: 'e83', source: 'statin', target: 'ldl', weight: -0.35, ci: [-0.42, -0.28], evidenceGrade: 'A', domain: 'Intervention', description: 'Statins reduce LDL-C significantly' },
  { id: 'e84', source: 'statin', target: 'cad', weight: -0.22, ci: [-0.29, -0.15], evidenceGrade: 'A', domain: 'Intervention', description: 'Statins directly reduce CAD risk' },
  { id: 'e85', source: 'statin', target: 'stroke', weight: -0.12, ci: [-0.18, -0.06], evidenceGrade: 'A', domain: 'Intervention', description: 'Statins reduce stroke risk' },
  { id: 'e86', source: 'statin', target: 'tc', weight: -0.30, ci: [-0.37, -0.23], evidenceGrade: 'A', domain: 'Intervention', description: 'Statins reduce total cholesterol' },
  { id: 'e87', source: 'statin', target: 'tg', weight: -0.10, ci: [-0.16, -0.04], evidenceGrade: 'B', domain: 'Intervention', description: 'Statins slightly reduce triglycerides' },

  // HTN medication
  { id: 'e88', source: 'htn_med', target: 'sbp', weight: -0.30, ci: [-0.37, -0.23], evidenceGrade: 'A', domain: 'Intervention', description: 'HTN meds reduce SBP significantly' },
  { id: 'e89', source: 'htn_med', target: 'dbp', weight: -0.25, ci: [-0.32, -0.18], evidenceGrade: 'A', domain: 'Intervention', description: 'HTN meds reduce DBP' },
  { id: 'e90', source: 'htn_med', target: 'stroke', weight: -0.18, ci: [-0.25, -0.11], evidenceGrade: 'A', domain: 'Intervention', description: 'HTN meds reduce stroke risk directly' },
  { id: 'e91', source: 'htn_med', target: 'hf', weight: -0.15, ci: [-0.22, -0.08], evidenceGrade: 'A', domain: 'Intervention', description: 'HTN meds reduce heart failure risk' },

  // SGLT2i
  { id: 'e92', source: 'sglt2i', target: 'hba1c', weight: -0.15, ci: [-0.22, -0.08], evidenceGrade: 'A', domain: 'Intervention', description: 'SGLT2i reduces HbA1c' },
  { id: 'e93', source: 'sglt2i', target: 'hf', weight: -0.25, ci: [-0.32, -0.18], evidenceGrade: 'A', domain: 'Intervention', description: 'SGLT2i significantly reduces HF risk' },
  { id: 'e94', source: 'sglt2i', target: 'ckd', weight: -0.28, ci: [-0.35, -0.21], evidenceGrade: 'A', domain: 'Intervention', description: 'SGLT2i significantly reduces CKD progression' },
  { id: 'e95', source: 'sglt2i', target: 'egfr', weight: 0.12, ci: [0.06, 0.18], evidenceGrade: 'A', domain: 'Intervention', description: 'SGLT2i preserves eGFR' },
  { id: 'e96', source: 'sglt2i', target: 'bmi', weight: -0.08, ci: [-0.14, -0.02], evidenceGrade: 'B', domain: 'Intervention', description: 'SGLT2i causes modest weight loss' },
  { id: 'e97', source: 'sglt2i', target: 'sbp', weight: -0.06, ci: [-0.12, 0.00], evidenceGrade: 'B', domain: 'Intervention', description: 'SGLT2i slightly reduces SBP' },

  // Metformin
  { id: 'e98', source: 'metformin', target: 'hba1c', weight: -0.20, ci: [-0.27, -0.13], evidenceGrade: 'A', domain: 'Intervention', description: 'Metformin reduces HbA1c' },
  { id: 'e99', source: 'metformin', target: 'fpg', weight: -0.22, ci: [-0.29, -0.15], evidenceGrade: 'A', domain: 'Intervention', description: 'Metformin reduces FPG' },
  { id: 'e100', source: 'metformin', target: 't2dm', weight: -0.18, ci: [-0.25, -0.11], evidenceGrade: 'A', domain: 'Intervention', description: 'Metformin reduces T2DM risk/progression' },
  { id: 'e101', source: 'metformin', target: 'bmi', weight: -0.05, ci: [-0.11, 0.01], evidenceGrade: 'C', domain: 'Intervention', description: 'Metformin has modest weight effect' },
  { id: 'e102', source: 'metformin', target: 'cad', weight: -0.08, ci: [-0.15, -0.01], evidenceGrade: 'B', domain: 'Intervention', description: 'Metformin may reduce CAD risk' },

  // Aspirin
  { id: 'e103', source: 'aspirin', target: 'cad', weight: -0.15, ci: [-0.22, -0.08], evidenceGrade: 'A', domain: 'Intervention', description: 'Aspirin reduces CAD risk' },
  { id: 'e104', source: 'aspirin', target: 'stroke', weight: -0.10, ci: [-0.17, -0.03], evidenceGrade: 'B', domain: 'Intervention', description: 'Aspirin reduces stroke risk' },

  // ACEi/ARB
  { id: 'e105', source: 'ace_arb', target: 'ckd', weight: -0.22, ci: [-0.29, -0.15], evidenceGrade: 'A', domain: 'Intervention', description: 'ACEi/ARB slows CKD progression' },
  { id: 'e106', source: 'ace_arb', target: 'hf', weight: -0.20, ci: [-0.27, -0.13], evidenceGrade: 'A', domain: 'Intervention', description: 'ACEi/ARB reduces heart failure risk' },
  { id: 'e107', source: 'ace_arb', target: 'sbp', weight: -0.25, ci: [-0.32, -0.18], evidenceGrade: 'A', domain: 'Intervention', description: 'ACEi/ARB reduces blood pressure' },
]

// Helper: get edges from a specific source
export function getEdgesFrom(nodeId: string): KGEdge[] {
  return edges.filter(e => e.source === nodeId)
}

// Helper: get edges to a specific target
export function getEdgesTo(nodeId: string): KGEdge[] {
  return edges.filter(e => e.target === nodeId)
}

// Helper: get all edges in a domain
export function getEdgesByDomain(domain: Domain): KGEdge[] {
  return edges.filter(e => e.domain === domain)
}

// Helper: get node by id
export function getNode(nodeId: string): KGNode | undefined {
  return nodes.find(n => n.id === nodeId)
}

// Topological order for causal cascade
export const topologicalOrder: string[] = [
  // Interventions first
  'statin', 'htn_med', 'sglt2i', 'metformin', 'aspirin', 'ace_arb',
  // Lifestyle
  'exercise', 'diet', 'smoking', 'alcohol',
  // Demographics
  'age', 'sex',
  // Primary biomarkers affected by interventions
  'bmi', 'ldl', 'hdl', 'tc', 'tg', 'sbp', 'dbp', 'hba1c', 'fpg', 'egfr',
  // Intermediate conditions
  'diabetes', 'hypertension',
  // Disease endpoints
  'cad', 'stroke', 'hf', 'pad', 't2dm', 'ckd', 'nafld',
]
