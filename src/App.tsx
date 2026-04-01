import { 
  User, 
  Activity, 
  Pill, 
  AlertCircle, 
  ClipboardCheck, 
  FileText,
  Plus,
  Trash2,
  Save,
  Printer,
  ChevronRight,
  ChevronLeft,
  Search,
  Sparkles,
  Loader2,
  FileDown,
  Calculator,
  RefreshCw,
  BookOpen,
  ShieldAlert
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  HeadingLevel,
  BorderStyle
} from 'docx';
import { saveAs } from 'file-saver';

// --- Types ---

interface PatientInfo {
  name: string;
  ageGroup: string;
  ageValue: string;
  age: string;
  gender: string;
  race: string;
  ht: string;
  wt: string;
  bmi: string;
  bsa: string;
  doa: string;
  ward: string;
  bed: string;
  hospital: string;
  allergyStatus: string;
  allergyType: string;
  allergenSubstance: string;
  reactionDescription: string;
  severity: string;
  dateOfOnset: string;
  dateLastAssessed: string;
  confirmedBy: string;
  allergyNotes: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string;
  pastMedicationHistory: string;
  complianceEvaluation: string;
  smoking: string;
  alcohol: string;
  drugAbuse: string;
  pregnant: string;
  diagnosis: string;
  vitals: {
    temp: string;
    bp: string;
    rr: string;
    pr: string;
    rbs: string;
    spo2: string;
  }
}

interface LabResult {
  parameter: string;
  normalRange: string;
  unit: string;
  values: { [date: string]: string };
}

interface Medication {
  id: string;
  drug: string;
  regimen: string;
  startDate: string;
  stopDate: string;
  indication: string;
}

interface SOAPNote {
  id: string;
  title: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

// --- Initial Data ---

const initialPatientInfo: PatientInfo = {
  name: '', ageGroup: '', ageValue: '', age: '', gender: '', race: '', ht: '', wt: '', bmi: '', bsa: '', doa: '',
  ward: '', bed: '', hospital: 'Dhamar Hospital', 
  allergyStatus: 'Allergy Status Not Yet Assessed',
  allergyType: '', allergenSubstance: '', reactionDescription: '', severity: '',
  dateOfOnset: '', dateLastAssessed: '', confirmedBy: '', allergyNotes: '',
  chiefComplaint: '', historyOfPresentIllness: '', pastMedicalHistory: '',
  pastMedicationHistory: '', complianceEvaluation: '',
  smoking: '', alcohol: '', drugAbuse: '', pregnant: 'No', diagnosis: '',
  vitals: { temp: '', bp: '', rr: '', pr: '', rbs: '', spo2: '' }
};

const initialLabs: LabResult[] = [
  // Hematology
  { parameter: 'TWBC', normalRange: '4–11', unit: 'x10⁹/L', values: {} },
  { parameter: 'Hb', normalRange: '11.5-16.5', unit: 'g/dL', values: {} },
  { parameter: 'Platelet', normalRange: '150-400', unit: 'x10⁹/L', values: {} },
  { parameter: 'RBC', normalRange: '4.5-5.5', unit: 'x10¹²/L', values: {} },
  { parameter: 'Hct', normalRange: '36-50', unit: '%', values: {} },
  { parameter: 'MCV', normalRange: '80-100', unit: 'fL', values: {} },
  { parameter: 'MCH', normalRange: '27-32', unit: 'pg', values: {} },
  { parameter: 'MCHC', normalRange: '32-36', unit: 'g/dL', values: {} },
  
  // Renal / Electrolytes
  { parameter: 'Urea', normalRange: '1.7-8.3', unit: 'mmol/L', values: {} },
  { parameter: 'SCr', normalRange: '0.3-1.2', unit: 'mg/dl', values: {} },
  { parameter: 'Na+', normalRange: '135-145', unit: 'mmol/L', values: {} },
  { parameter: 'K+', normalRange: '3.5-5.0', unit: 'mmol/L', values: {} },
  { parameter: 'Cl-', normalRange: '98-107', unit: 'mmol/L', values: {} },
  { parameter: 'HCO3-', normalRange: '22-28', unit: 'mmol/L', values: {} },
  { parameter: 'Ca2+', normalRange: '2.1-2.6', unit: 'mmol/L', values: {} },
  { parameter: 'Mg2+', normalRange: '0.7-1.0', unit: 'mmol/L', values: {} },
  { parameter: 'PO4', normalRange: '0.8-1.5', unit: 'mmol/L', values: {} },
  { parameter: 'Uric Acid', normalRange: '0.15-0.45', unit: 'mmol/L', values: {} },
  
  // Liver Function
  { parameter: 'Albumin', normalRange: '35-50', unit: 'g/L', values: {} },
  { parameter: 'ALT', normalRange: '< 41', unit: 'U/L', values: {} },
  { parameter: 'AST', normalRange: '< 40', unit: 'U/L', values: {} },
  { parameter: 'ALP', normalRange: '40-129', unit: 'U/L', values: {} },
  { parameter: 'T. Bilirubin', normalRange: '< 21', unit: 'μmol/L', values: {} },
  { parameter: 'D. Bilirubin', normalRange: '< 5', unit: 'μmol/L', values: {} },
  { parameter: 'T. Protein', normalRange: '60-80', unit: 'g/L', values: {} },
  
  // Lipid Profile
  { parameter: 'T. Cholesterol', normalRange: '< 5.2', unit: 'mmol/L', values: {} },
  { parameter: 'Triglycerides', normalRange: '< 1.7', unit: 'mmol/L', values: {} },
  { parameter: 'HDL', normalRange: '> 1.0', unit: 'mmol/L', values: {} },
  { parameter: 'LDL', normalRange: '< 3.4', unit: 'mmol/L', values: {} },
  
  // Diabetes
  { parameter: 'Fasting Glucose', normalRange: '3.9-5.5', unit: 'mmol/L', values: {} },
  { parameter: 'HbA1c', normalRange: '4.0-6.0', unit: '%', values: {} },
  
  // Inflammatory / Cardiac / Coagulation
  { parameter: 'CRP', normalRange: '< 5', unit: 'mg/L', values: {} },
  { parameter: 'ESR', normalRange: '< 20', unit: 'mm/hr', values: {} },
  { parameter: 'Troponin I', normalRange: '< 0.04', unit: 'ng/mL', values: {} },
  { parameter: 'PT', normalRange: '11-13.5', unit: 'sec', values: {} },
  { parameter: 'INR', normalRange: '0.8-1.2', unit: '-', values: {} },
  { parameter: 'aPTT', normalRange: '25-35', unit: 'sec', values: {} },
  { parameter: 'Lactate', normalRange: '0.5-2.2', unit: 'mmol/L', values: {} },
];

// --- Constants ---

const DRUG_DATABASE = [
  { name: 'Paracetamol', dose: '500mg', route: 'Oral', form: 'Tablet', indication: 'Pain / Fever' },
  { name: 'Amoxicillin', dose: '500mg', route: 'Oral', form: 'Capsule', indication: 'Bacterial Infection' },
  { name: 'Metformin', dose: '500mg', route: 'Oral', form: 'Tablet', indication: 'Type 2 Diabetes Mellitus' },
  { name: 'Atorvastatin', dose: '20mg', route: 'Oral', form: 'Tablet', indication: 'Hypercholesterolemia' },
  { name: 'Amlodipine', dose: '5mg', route: 'Oral', form: 'Tablet', indication: 'Hypertension' },
  { name: 'Omeprazole', dose: '20mg', route: 'Oral', form: 'Capsule', indication: 'GERD / Peptic Ulcer' },
  { name: 'Salbutamol', dose: '100mcg', route: 'Inhalation', form: 'Inhaler', indication: 'Asthma / COPD' },
  { name: 'Insulin Glargine', dose: '10 units', route: 'Subcutaneous', form: 'Injection', indication: 'Diabetes Mellitus' },
  { name: 'Warfarin', dose: '5mg', route: 'Oral', form: 'Tablet', indication: 'Anticoagulation' },
  { name: 'Ciprofloxacin', dose: '500mg', route: 'Oral', form: 'Tablet', indication: 'Bacterial Infection' },
  { name: 'Furosemide', dose: '40mg', route: 'Oral', form: 'Tablet', indication: 'Edema / Heart Failure' },
  { name: 'Lisinopril', dose: '10mg', route: 'Oral', form: 'Tablet', indication: 'Hypertension / Heart Failure' },
  { name: 'Metoprolol', dose: '50mg', route: 'Oral', form: 'Tablet', indication: 'Hypertension / Angina' },
  { name: 'Clopidogrel', dose: '75mg', route: 'Oral', form: 'Tablet', indication: 'Antiplatelet' },
  { name: 'Levothyroxine', dose: '50mcg', route: 'Oral', form: 'Tablet', indication: 'Hypothyroidism' },
  { name: 'Prednisolone', dose: '5mg', route: 'Oral', form: 'Tablet', indication: 'Inflammation / Allergy' },
  { name: 'Aspirin', dose: '75mg', route: 'Oral', form: 'Tablet', indication: 'Antiplatelet' },
  { name: 'Gabapentin', dose: '300mg', route: 'Oral', form: 'Capsule', indication: 'Neuropathic Pain' },
  { name: 'Sertraline', dose: '50mg', route: 'Oral', form: 'Tablet', indication: 'Depression / Anxiety' },
  { name: 'Losartan', dose: '50mg', route: 'Oral', form: 'Tablet', indication: 'Hypertension' },
  { name: 'Azithromycin', dose: '500mg', route: 'Oral', form: 'Tablet', indication: 'Bacterial Infection' },
  { name: 'Ceftriaxone', dose: '1g', route: 'IV/IM', form: 'Injection', indication: 'Bacterial Infection' },
  { name: 'Dexamethasone', dose: '4mg', route: 'Oral/IV', form: 'Tablet/Injection', indication: 'Inflammation / Edema' },
  { name: 'Enoxaparin', dose: '40mg', route: 'Subcutaneous', form: 'Injection', indication: 'VTE Prophylaxis' },
  { name: 'Heparin', dose: '5000 units', route: 'Subcutaneous/IV', form: 'Injection', indication: 'Anticoagulation' },
  { name: 'Hydrochlorothiazide', dose: '25mg', route: 'Oral', form: 'Tablet', indication: 'Hypertension / Edema' },
  { name: 'Ibuprofen', dose: '400mg', route: 'Oral', form: 'Tablet', indication: 'Pain / Inflammation' },
  { name: 'Pantoprazole', dose: '40mg', route: 'Oral/IV', form: 'Tablet/Injection', indication: 'GERD / PUD' },
  { name: 'Spironolactone', dose: '25mg', route: 'Oral', form: 'Tablet', indication: 'Heart Failure / Edema' },
  { name: 'Vancomycin', dose: '1g', route: 'IV', form: 'Injection', indication: 'Bacterial Infection (MRSA)' },
];

// --- Components ---

export default function App() {
  const [activeTab, setActiveTab] = useState('demographics');
  const [patientInfo, setPatientInfo] = useState<PatientInfo>(initialPatientInfo);
  const [labs, setLabs] = useState<LabResult[]>(initialLabs);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [drps, setDrps] = useState<SOAPNote[]>([]);
  const [pcis, setPcis] = useState<SOAPNote[]>([]);
  const [conclusion, setConclusion] = useState({ summary: '', prognosis: '' });
  const [labDates, setLabDates] = useState<string[]>(['13/2', '14/2', '15/2', '16/2']);
  const [drugSearch, setDrugSearch] = useState<{index: number, query: string} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false);
  const [interactions, setInteractions] = useState<string>('');
  const [isGeneratingEducation, setIsGeneratingEducation] = useState(false);
  const [educationContent, setEducationContent] = useState<string>('');

  // Tools State
  const [calcWeight, setCalcWeight] = useState('');
  const [calcDose, setCalcDose] = useState('');
  const [calcFrequency, setCalcFrequency] = useState('1');
  const [calcResult, setCalcResult] = useState<string | null>(null);

  const [convValue, setConvValue] = useState('');
  const [convType, setConvType] = useState('kg-lb');
  const [convResult, setConvResult] = useState<string | null>(null);

  const calculateDosage = () => {
    if (!calcWeight || !calcDose) return;
    const totalDose = parseFloat(calcWeight) * parseFloat(calcDose);
    const perDose = totalDose / parseFloat(calcFrequency);
    setCalcResult(`${totalDose.toFixed(2)} mg/day (${perDose.toFixed(2)} mg per dose)`);
  };

  const convertUnit = () => {
    if (!convValue) return;
    const val = parseFloat(convValue);
    let res = 0;
    switch (convType) {
      case 'kg-lb': res = val * 2.20462; break;
      case 'lb-kg': res = val / 2.20462; break;
      case 'cm-in': res = val / 2.54; break;
      case 'in-cm': res = val * 2.54; break;
      case 'mgdl-mmol': res = val / 18.0182; break; // Glucose
      case 'mmol-mgdl': res = val * 18.0182; break; // Glucose
      case 'mgdl-umol': res = val * 88.4; break; // Creatinine
      case 'umol-mgdl': res = val / 88.4; break; // Creatinine
    }
    setConvResult(res.toFixed(2));
  };

  const checkInteractions = async () => {
    if (medications.length < 2) {
      alert("Please add at least two medications to check for interactions.");
      return;
    }
    setIsCheckingInteractions(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `
        As a clinical pharmacist, analyze the following medication list for drug-drug interactions:
        ${medications.map(m => m.drug).join(', ')}
        
        Provide a concise summary of major and moderate interactions, including the mechanism and clinical recommendation.
        Format in Markdown.
      `;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });
      setInteractions(response.text || 'No significant interactions found.');
    } catch (error) {
      console.error("Interaction check failed:", error);
      setInteractions("Failed to check interactions.");
    } finally {
      setIsCheckingInteractions(false);
    }
  };

  const generateEducation = async () => {
    setIsGeneratingEducation(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `
        Create a patient-friendly education leaflet for a patient with the following profile:
        Diagnosis: ${patientInfo.diagnosis}
        Medications: ${medications.map(m => `${m.drug} (${m.indication})`).join(', ')}
        
        Focus on:
        1. What their medications are for.
        2. How to take them correctly.
        3. Common side effects to watch for.
        4. When to call the doctor.
        5. Lifestyle advice related to their diagnosis.
        
        Use simple, non-medical language. Format in Markdown.
      `;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });
      setEducationContent(response.text || 'Failed to generate education content.');
    } catch (error) {
      console.error("Education generation failed:", error);
      setEducationContent("Failed to generate education content.");
    } finally {
      setIsGeneratingEducation(false);
    }
  };

  const analyzeCase = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const prompt = `
        You are a world-class Clinical Pharmacy Expert. Perform a deep clinical case analysis based on the provided patient data.
        
        PATIENT DATA:
        Demographics: ${JSON.stringify(patientInfo)}
        Labs: ${JSON.stringify(labs)}
        Medications: ${JSON.stringify(medications)}
        
        INSTRUCTIONS:
        Follow the "DRP Formatting Template" strictly:
        1) Identify up to 6 Drug-Related Problems (DRPs) and 3-4 Pharmaceutical Care Issues (PCIs).
        2) Format each DRP in detailed SOAP format (Subjective, Objective, Assessment, Plan).
        3) Assessment must be deep, guideline-based (AHA/ASA, SCCM, ACC/AHA, ADA, KDIGO), and academically rich.
        4) Use Vancouver style for references within the assessment.
        5) Format each PCI in SOAP format, directed at patient/caregiver/staff.
        6) Provide a Conclusion with Executive Summary, DRP Summary, and Final Prognostic Summary.
        7) Formatting: Use bullet points, bold terms, and structured lines for clinical data.
        
        OUTPUT FORMAT:
        Return ONLY a JSON object with the following structure:
        {
          "drps": [
            { "title": "DRP Title", "subjective": "...", "objective": "...", "assessment": "...", "plan": "..." }
          ],
          "pcis": [
            { "title": "PCI Title", "subjective": "...", "objective": "...", "assessment": "...", "plan": "..." }
          ],
          "conclusion": {
            "summary": "Full executive summary and DRP 1-6 summary...",
            "prognosis": "Final prognostic summary..."
          }
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              drps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    subjective: { type: Type.STRING },
                    objective: { type: Type.STRING },
                    assessment: { type: Type.STRING },
                    plan: { type: Type.STRING }
                  },
                  required: ["title", "subjective", "objective", "assessment", "plan"]
                }
              },
              pcis: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    subjective: { type: Type.STRING },
                    objective: { type: Type.STRING },
                    assessment: { type: Type.STRING },
                    plan: { type: Type.STRING }
                  },
                  required: ["title", "subjective", "objective", "assessment", "plan"]
                }
              },
              conclusion: {
                type: Type.OBJECT,
                properties: {
                  summary: { type: Type.STRING },
                  prognosis: { type: Type.STRING }
                },
                required: ["summary", "prognosis"]
              }
            },
            required: ["drps", "pcis", "conclusion"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setDrps(result.drps.map((d: any) => ({ ...d, id: Math.random().toString(36).substr(2, 9) })));
      setPcis(result.pcis.map((p: any) => ({ ...p, id: Math.random().toString(36).substr(2, 9) })));
      setConclusion(result.conclusion);
      setActiveTab('drps'); // Switch to DRPs tab to show results
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("AI Analysis failed. Please check console for details.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportToWord = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "Clinical Pharmacy Case Report",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Patient Name: ", bold: true }),
              new TextRun(patientInfo.name || "N/A"),
            ],
            spacing: { after: 200 },
          }),
          
          // Demographics Section
          new Paragraph({ text: "1. Demographics & Clinical History", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Age", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph(patientInfo.age || "N/A")] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Gender", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph(patientInfo.gender || "N/A")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Diagnosis", bold: true })] })] }),
                  new TableCell({ columnSpan: 3, children: [new Paragraph(patientInfo.diagnosis || "N/A")] }),
                ],
              }),
            ],
          }),

          // Labs Section
          new Paragraph({ text: "2. Laboratory Investigations", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Parameter", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Normal Range", bold: true })] })] }),
                  ...labDates.map(date => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: date, bold: true })] })] })),
                ],
              }),
              ...labs.map(lab => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(lab.parameter)] }),
                  new TableCell({ children: [new Paragraph(`${lab.normalRange} ${lab.unit}`)] }),
                  ...labDates.map(date => new TableCell({ children: [new Paragraph(lab.values[date] || "-")] })),
                ],
              })),
            ],
          }),

          // Medications Section
          new Paragraph({ text: "3. Medications", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Drug / Regimen", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Indication", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Start Date", bold: true })] })] }),
                ],
              }),
              ...medications.map(med => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(med.drug), new Paragraph({ children: [new TextRun({ text: med.regimen, size: 16 })] })] }),
                  new TableCell({ children: [new Paragraph(med.indication)] }),
                  new TableCell({ children: [new Paragraph(med.startDate)] }),
                ],
              })),
            ],
          }),

          // DRPs Section
          new Paragraph({ text: "4. Drug-Related Problems (DRPs)", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),
          ...drps.flatMap(drp => [
            new Paragraph({ text: drp.title, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: "Subjective: ", bold: true }), new TextRun(drp.subjective)] }),
            new Paragraph({ children: [new TextRun({ text: "Objective: ", bold: true }), new TextRun(drp.objective)] }),
            new Paragraph({ children: [new TextRun({ text: "Assessment: ", bold: true }), new TextRun(drp.assessment)] }),
            new Paragraph({ children: [new TextRun({ text: "Plan: ", bold: true }), new TextRun(drp.plan)] }),
          ]),

          // PCIs Section
          new Paragraph({ text: "5. Pharmaceutical Care Issues (PCIs)", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),
          ...pcis.flatMap(pci => [
            new Paragraph({ text: pci.title, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: "Subjective: ", bold: true }), new TextRun(pci.subjective)] }),
            new Paragraph({ children: [new TextRun({ text: "Objective: ", bold: true }), new TextRun(pci.objective)] }),
            new Paragraph({ children: [new TextRun({ text: "Assessment: ", bold: true }), new TextRun(pci.assessment)] }),
            new Paragraph({ children: [new TextRun({ text: "Plan: ", bold: true }), new TextRun(pci.plan)] }),
          ]),

          // Conclusion Section
          new Paragraph({ text: "6. Conclusion", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "Executive Summary", bold: true })] }),
          new Paragraph({ text: conclusion.summary, spacing: { after: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "Final Prognostic Summary", bold: true })] }),
          new Paragraph({ text: conclusion.prognosis }),
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `Clinical_Report_${patientInfo.name || "Patient"}.docx`);
    });
  };

  const addLabParameter = () => {
    const newLab: LabResult = { parameter: 'New Parameter', normalRange: '-', unit: '-', values: {} };
    setLabs([...labs, newLab]);
  };

  const removeLabParameter = (index: number) => {
    const newLabs = labs.filter((_, i) => i !== index);
    setLabs(newLabs);
  };

  const tabs = [
    { id: 'demographics', label: 'Demographics', icon: User },
    { id: 'labs', label: 'Labs', icon: Activity },
    { id: 'meds', label: 'Medications', icon: Pill },
    { id: 'drps', label: 'DRPs', icon: AlertCircle },
    { id: 'pcis', label: 'PCIs', icon: ClipboardCheck },
    { id: 'conclusion', label: 'Conclusion', icon: FileText },
    { id: 'tools', label: 'Clinical Tools', icon: Calculator },
    { id: 'education', label: 'Patient Education', icon: BookOpen },
  ];

  const addMedication = () => {
    const newMed: Medication = {
      id: Math.random().toString(36).substr(2, 9),
      drug: '', regimen: '', startDate: '', stopDate: 'Ongoing', indication: ''
    };
    setMedications([...medications, newMed]);
  };

  const addDrp = () => {
    const newDrp: SOAPNote = {
      id: Math.random().toString(36).substr(2, 9),
      title: `DRP ${drps.length + 1}`,
      subjective: '', objective: '', assessment: '', plan: ''
    };
    setDrps([...drps, newDrp]);
  };

  const addPci = () => {
    const newPci: SOAPNote = {
      id: Math.random().toString(36).substr(2, 9),
      title: `PCI ${pcis.length + 1}`,
      subjective: '', objective: '', assessment: '', plan: ''
    };
    setPcis([...pcis, newPci]);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col gap-8">
        <div>
          <h1 className="text-xl font-bold flex flex-col gap-0 text-blue-400">
            <span className="flex items-center gap-2">
              <Activity size={24} />
              Medora
            </span>
            <span className="text-[10px] text-slate-500 font-normal ml-8">by Dr Yousif Jassar</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Pharmacotherapy Tool</p>
        </div>

        <nav className="flex flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800 flex flex-col gap-2">
          <button 
            onClick={exportToWord}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm transition-colors"
          >
            <FileDown size={16} />
            Export Word
          </button>
          <button className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-md text-sm transition-colors">
            <Printer size={16} />
            Export PDF
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{tabs.find(t => t.id === activeTab)?.label}</h2>
              <p className="text-slate-500 text-sm">Patient: {patientInfo.name || 'New Patient'}</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={analyzeCase}
                disabled={isAnalyzing}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    AI Clinical Analysis
                  </>
                )}
              </button>
              <div className="bg-red-50 border border-red-200 px-4 py-2 rounded-md w-72">
                <label className="text-[10px] font-bold text-red-500 uppercase tracking-tighter block mb-1">Allergy Status</label>
                <select 
                  className="text-sm font-bold text-red-700 bg-transparent border-none p-0 focus:ring-0 w-full cursor-pointer"
                  value={patientInfo.allergyStatus} 
                  onChange={e => setPatientInfo({...patientInfo, allergyStatus: e.target.value})}
                >
                  <option value="No Known Allergy (NKDA)">No Known Allergy (NKDA)</option>
                  <option value="Known Allergy">Known Allergy</option>
                  <option value="Allergy Status Not Yet Assessed">Allergy Status Not Yet Assessed</option>
                  <option value="Suspected Allergy">Suspected Allergy</option>
                  <option value="Confirmed Allergy">Confirmed Allergy</option>
                </select>
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'demographics' && (
                <div className="space-y-6">
                  {['Known Allergy', 'Suspected Allergy', 'Confirmed Allergy'].includes(patientInfo.allergyStatus) && (
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                      <h3 className="text-lg font-semibold mb-4 text-slate-700 border-b pb-2">Allergy Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label>Allergy Type</label>
                          <select 
                            value={patientInfo.allergyType} 
                            onChange={e => setPatientInfo({...patientInfo, allergyType: e.target.value})}
                          >
                            <option value="">Select</option>
                            <option value="Drug">Drug</option>
                            <option value="Food">Food</option>
                            <option value="Latex">Latex</option>
                            <option value="Contrast Dye">Contrast Dye</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label>Allergen / Substance</label>
                          <select 
                            value={patientInfo.allergenSubstance} 
                            onChange={e => setPatientInfo({...patientInfo, allergenSubstance: e.target.value})}
                          >
                            <option value="">Select</option>
                            <option value="Paracetamol">Paracetamol</option>
                            <option value="Penicillin">Penicillin</option>
                            <option value="Shrimp">Shrimp</option>
                            <option value="Latex">Latex</option>
                            <option value="Other">Other (specify in notes)</option>
                          </select>
                        </div>
                        <div>
                          <label>Reaction Description</label>
                          <select 
                            value={patientInfo.reactionDescription} 
                            onChange={e => setPatientInfo({...patientInfo, reactionDescription: e.target.value})}
                          >
                            <option value="">Select</option>
                            <option value="Rash">Rash</option>
                            <option value="Itching">Itching</option>
                            <option value="Swelling">Swelling</option>
                            <option value="Shortness of breath">Shortness of breath</option>
                            <option value="Anaphylaxis">Anaphylaxis</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label>Severity</label>
                          <select 
                            value={patientInfo.severity} 
                            onChange={e => setPatientInfo({...patientInfo, severity: e.target.value})}
                          >
                            <option value="">Select</option>
                            <option value="Mild">Mild</option>
                            <option value="Moderate">Moderate</option>
                            <option value="Severe">Severe</option>
                            <option value="Anaphylaxis">Anaphylaxis</option>
                          </select>
                        </div>
                        <div>
                          <label>Date of Onset / Reaction</label>
                          <input type="date" value={patientInfo.dateOfOnset} onChange={e => setPatientInfo({...patientInfo, dateOfOnset: e.target.value})} />
                        </div>
                        <div>
                          <label>Date Last Assessed</label>
                          <input type="date" value={patientInfo.dateLastAssessed} onChange={e => setPatientInfo({...patientInfo, dateLastAssessed: e.target.value})} />
                        </div>
                        <div>
                          <label>Confirmed By</label>
                          <select 
                            value={patientInfo.confirmedBy} 
                            onChange={e => setPatientInfo({...patientInfo, confirmedBy: e.target.value})}
                          >
                            <option value="">Select</option>
                            <option value="Clinical history">Clinical history</option>
                            <option value="Skin test">Skin test</option>
                            <option value="Lab test">Lab test</option>
                            <option value="Challenge test">Challenge test</option>
                            <option value="Not confirmed">Not confirmed</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label>Notes / Additional Comments</label>
                          <textarea rows={2} value={patientInfo.allergyNotes} onChange={e => setPatientInfo({...patientInfo, allergyNotes: e.target.value})} placeholder="Any other comments?" />
                        </div>
                      </div>
                    </section>
                  )}

                  <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold mb-4 text-slate-700 border-b pb-2">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label>Patient Name</label>
                        <input value={patientInfo.name} onChange={e => setPatientInfo({...patientInfo, name: e.target.value})} placeholder="H.A" />
                      </div>
                      <div>
                        <label>Age Group</label>
                        <select 
                          value={patientInfo.ageGroup} 
                          onChange={e => {
                            const group = e.target.value;
                            setPatientInfo({
                              ...patientInfo, 
                              ageGroup: group, 
                              ageValue: '',
                              age: '' 
                            });
                          }}
                        >
                          <option value="">Select Group</option>
                          <option value="Newborn">Newborn (under 1 month)</option>
                          <option value="Infant">Infant (under 1 year)</option>
                          <option value="Child">Child (1–17 years)</option>
                          <option value="Adult">Adult (18–64 years)</option>
                          <option value="Geriatric">Geriatric (65+ years)</option>
                        </select>
                      </div>
                      {patientInfo.ageGroup && (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-200">
                          <label>
                            {patientInfo.ageGroup === 'Newborn' ? 'Days' : 
                             patientInfo.ageGroup === 'Infant' ? 'Months' : 'Years'}
                          </label>
                          <select 
                            value={patientInfo.ageValue} 
                            onChange={e => {
                              const val = e.target.value;
                              const suffix = patientInfo.ageGroup === 'Newborn' ? ' days' : 
                                            patientInfo.ageGroup === 'Infant' ? ' months' : ' years';
                              setPatientInfo({
                                ...patientInfo, 
                                ageValue: val,
                                age: val + suffix
                              });
                            }}
                          >
                            <option value="">Select</option>
                            {patientInfo.ageGroup === 'Newborn' && Array.from({length: 29}, (_, i) => i + 1).map(d => (
                              <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>
                            ))}
                            {patientInfo.ageGroup === 'Infant' && Array.from({length: 11}, (_, i) => i + 1).map(m => (
                              <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>
                            ))}
                            {patientInfo.ageGroup === 'Child' && Array.from({length: 17}, (_, i) => i + 1).map(y => (
                              <option key={y} value={y}>{y} year{y > 1 ? 's' : ''}</option>
                            ))}
                            {patientInfo.ageGroup === 'Adult' && Array.from({length: 47}, (_, i) => i + 18).map(y => (
                              <option key={y} value={y}>{y} years</option>
                            ))}
                            {patientInfo.ageGroup === 'Geriatric' && [
                              ...Array.from({length: 35}, (_, i) => i + 65).map(y => (
                                <option key={y} value={y}>{y} years</option>
                              )),
                              <option key="100+" value="100+">100 years and above</option>
                            ]}
                          </select>
                        </div>
                      )}
                      <div className="hidden">
                        <label>Age (Hidden)</label>
                        <input value={patientInfo.age} readOnly />
                      </div>
                      <div>
                        <label>Gender</label>
                        <select value={patientInfo.gender} onChange={e => setPatientInfo({...patientInfo, gender: e.target.value})}>
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      <div>
                        <label>Race</label>
                        <input value={patientInfo.race} onChange={e => setPatientInfo({...patientInfo, race: e.target.value})} placeholder="Yemeni" />
                      </div>
                      <div>
                        <label>Date of Admission</label>
                        <input type="date" value={patientInfo.doa} onChange={e => setPatientInfo({...patientInfo, doa: e.target.value})} />
                      </div>
                      <div>
                        <label>Hospital</label>
                        <select 
                          value={patientInfo.hospital === 'Dhamar General Hospital' ? 'Dhamar General Hospital' : (patientInfo.hospital ? 'Other' : '')} 
                          onChange={e => {
                            const val = e.target.value;
                            if (val === 'Other') {
                              setPatientInfo({...patientInfo, hospital: ''});
                            } else {
                              setPatientInfo({...patientInfo, hospital: val});
                            }
                          }}
                        >
                          <option value="">Select Hospital</option>
                          <option value="Dhamar General Hospital">Dhamar General Hospital</option>
                          <option value="Other">Other Hospital (Add New)</option>
                        </select>
                        {(patientInfo.hospital !== 'Dhamar General Hospital' && patientInfo.hospital !== undefined) && (
                          <input 
                            className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200"
                            value={patientInfo.hospital} 
                            onChange={e => setPatientInfo({...patientInfo, hospital: e.target.value})} 
                            placeholder="Enter Hospital Name" 
                          />
                        )}
                      </div>
                      <div>
                        <label>Ward</label>
                        <select 
                          value={['Internal Medicine Ward', 'Surgery Ward', 'Pediatrics Ward', 'ICU', 'CCU'].includes(patientInfo.ward) ? patientInfo.ward : (patientInfo.ward ? 'Other' : '')} 
                          onChange={e => {
                            const val = e.target.value;
                            if (val === 'Other') {
                              setPatientInfo({...patientInfo, ward: ''});
                            } else {
                              setPatientInfo({...patientInfo, ward: val});
                            }
                          }}
                        >
                          <option value="">Select Ward</option>
                          <option value="Internal Medicine Ward">Internal Medicine Ward</option>
                          <option value="Surgery Ward">Surgery Ward</option>
                          <option value="Pediatrics Ward">Pediatrics Ward</option>
                          <option value="ICU">ICU</option>
                          <option value="CCU">CCU</option>
                          <option value="Other">Other Ward (Specify)</option>
                        </select>
                        {(!['Internal Medicine Ward', 'Surgery Ward', 'Pediatrics Ward', 'ICU', 'CCU'].includes(patientInfo.ward) && patientInfo.ward !== undefined) && (
                          <input 
                            className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200"
                            value={patientInfo.ward} 
                            onChange={e => setPatientInfo({...patientInfo, ward: e.target.value})} 
                            placeholder="Specify Ward" 
                          />
                        )}
                      </div>
                      <div>
                        <label>Bed Number</label>
                        <input 
                          type="number" 
                          min="0"
                          value={patientInfo.bed} 
                          onChange={e => setPatientInfo({...patientInfo, bed: e.target.value})} 
                          placeholder="0" 
                        />
                      </div>
                    </div>
                  </section>

                  <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold mb-4 text-slate-700 border-b pb-2">Vitals & Measurements</h3>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div><label>HT (cm)</label><input value={patientInfo.ht} onChange={e => setPatientInfo({...patientInfo, ht: e.target.value})} /></div>
                      <div><label>WT (kg)</label><input value={patientInfo.wt} onChange={e => setPatientInfo({...patientInfo, wt: e.target.value})} /></div>
                      <div><label>BMI</label><input value={patientInfo.bmi} onChange={e => setPatientInfo({...patientInfo, bmi: e.target.value})} /></div>
                      <div><label>BSA</label><input value={patientInfo.bsa} onChange={e => setPatientInfo({...patientInfo, bsa: e.target.value})} /></div>
                      <div><label>Temp (°C)</label><input value={patientInfo.vitals.temp} onChange={e => setPatientInfo({...patientInfo, vitals: {...patientInfo.vitals, temp: e.target.value}})} /></div>
                      <div><label>BP (mmHg)</label><input value={patientInfo.vitals.bp} onChange={e => setPatientInfo({...patientInfo, vitals: {...patientInfo.vitals, bp: e.target.value}})} /></div>
                      <div><label>RR (bpm)</label><input value={patientInfo.vitals.rr} onChange={e => setPatientInfo({...patientInfo, vitals: {...patientInfo.vitals, rr: e.target.value}})} /></div>
                      <div><label>PR (bpm)</label><input value={patientInfo.vitals.pr} onChange={e => setPatientInfo({...patientInfo, vitals: {...patientInfo.vitals, pr: e.target.value}})} /></div>
                      <div><label>RBS (mg/dL)</label><input value={patientInfo.vitals.rbs} onChange={e => setPatientInfo({...patientInfo, vitals: {...patientInfo.vitals, rbs: e.target.value}})} /></div>
                      <div><label>SpO2 (%)</label><input value={patientInfo.vitals.spo2} onChange={e => setPatientInfo({...patientInfo, vitals: {...patientInfo.vitals, spo2: e.target.value}})} /></div>
                    </div>
                  </section>

                  <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold mb-4 text-slate-700 border-b pb-2">Clinical History</h3>
                    <div className="space-y-4">
                      <div><label>Chief Complaint</label><textarea rows={2} value={patientInfo.chiefComplaint} onChange={e => setPatientInfo({...patientInfo, chiefComplaint: e.target.value})} /></div>
                      <div><label>History of Present Illness</label><textarea rows={3} value={patientInfo.historyOfPresentIllness} onChange={e => setPatientInfo({...patientInfo, historyOfPresentIllness: e.target.value})} /></div>
                      <div><label>Past Medical History</label><textarea rows={3} value={patientInfo.pastMedicalHistory} onChange={e => setPatientInfo({...patientInfo, pastMedicalHistory: e.target.value})} /></div>
                      <div><label>Diagnosis</label><textarea rows={2} className="font-bold text-blue-800" value={patientInfo.diagnosis} onChange={e => setPatientInfo({...patientInfo, diagnosis: e.target.value})} /></div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'labs' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-slate-700">Laboratory Investigations</h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={addLabParameter}
                        className="text-xs bg-slate-600 text-white px-3 py-1 rounded hover:bg-slate-700 flex items-center gap-1"
                      >
                        <Plus size={14} /> Add Parameter
                      </button>
                      <button 
                        onClick={() => setLabDates([...labDates, 'New'])}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Plus size={14} /> Add Date
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full lab-table">
                      <thead>
                        <tr>
                          <th className="sticky left-0 z-10 bg-slate-100">Parameter</th>
                          <th>Normal Range</th>
                          <th>Unit</th>
                          {labDates.map((date, idx) => (
                            <th key={idx} className="text-center min-w-[80px]">
                              <input 
                                className="bg-transparent border-none text-center font-bold p-0 focus:ring-0" 
                                value={date} 
                                onChange={(e) => {
                                  const newDates = [...labDates];
                                  newDates[idx] = e.target.value;
                                  setLabDates(newDates);
                                }}
                              />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {labs.map((lab, labIdx) => (
                          <tr key={labIdx}>
                            <td className="sticky left-0 z-10 bg-white font-medium group">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => removeLabParameter(labIdx)}
                                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                                >
                                  <Trash2 size={12} />
                                </button>
                                <input 
                                  className="bg-transparent border-none p-0 focus:ring-0 w-full font-medium" 
                                  value={lab.parameter} 
                                  onChange={(e) => {
                                    const newLabs = [...labs];
                                    newLabs[labIdx].parameter = e.target.value;
                                    setLabs(newLabs);
                                  }}
                                />
                              </div>
                            </td>
                            <td className="text-slate-500 text-xs">
                              <input 
                                className="bg-transparent border-none p-0 focus:ring-0 w-full text-xs" 
                                value={lab.normalRange} 
                                onChange={(e) => {
                                  const newLabs = [...labs];
                                  newLabs[labIdx].normalRange = e.target.value;
                                  setLabs(newLabs);
                                }}
                              />
                            </td>
                            <td className="text-slate-500 text-xs">
                              <input 
                                className="bg-transparent border-none p-0 focus:ring-0 w-full text-xs" 
                                value={lab.unit} 
                                onChange={(e) => {
                                  const newLabs = [...labs];
                                  newLabs[labIdx].unit = e.target.value;
                                  setLabs(newLabs);
                                }}
                              />
                            </td>
                            {labDates.map((date, dateIdx) => (
                              <td key={dateIdx} className="p-0">
                                <input 
                                  className="border-none text-center focus:ring-0 h-full py-2" 
                                  value={lab.values[date] || ''} 
                                  onChange={(e) => {
                                    const newLabs = [...labs];
                                    newLabs[labIdx].values[date] = e.target.value;
                                    setLabs(newLabs);
                                  }}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'meds' && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button onClick={addMedication} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm">
                      <Plus size={18} /> Add Medication
                    </button>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="p-4 text-left font-semibold text-slate-600">Drug / Regimen</th>
                          <th className="p-4 text-left font-semibold text-slate-600">Start Date</th>
                          <th className="p-4 text-left font-semibold text-slate-600">Stop Date</th>
                          <th className="p-4 text-left font-semibold text-slate-600">Indication</th>
                          <th className="p-4 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {medications.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 italic">No medications recorded</td>
                          </tr>
                        ) : (
                          medications.map((med, idx) => (
                            <tr key={med.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                              <td className="p-2 relative">
                                <div className="flex flex-col gap-1">
                                  <div className="relative">
                                    <input 
                                      value={med.drug} 
                                      onChange={e => {
                                        const newMeds = [...medications];
                                        newMeds[idx].drug = e.target.value;
                                        setMedications(newMeds);
                                        setDrugSearch({ index: idx, query: e.target.value });
                                      }} 
                                      onFocus={() => setDrugSearch({ index: idx, query: med.drug })}
                                      placeholder="Search Drug Name..." 
                                      className="pl-8"
                                    />
                                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    
                                    {drugSearch?.index === idx && drugSearch.query.length > 0 && (
                                      <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                        {DRUG_DATABASE.filter(d => 
                                          d.name.toLowerCase().includes(drugSearch.query.toLowerCase())
                                        ).map((d, dIdx) => (
                                          <button
                                            key={dIdx}
                                            className="w-full text-left px-4 py-2 hover:bg-blue-50 flex flex-col border-b last:border-0"
                                            onClick={() => {
                                              const newMeds = [...medications];
                                              newMeds[idx].drug = d.name;
                                              newMeds[idx].regimen = `${d.dose} ${d.route} (${d.form})`;
                                              
                                              // Auto-fill indication based on drug and patient diagnosis
                                              let indication = d.indication;
                                              if (patientInfo.diagnosis && patientInfo.diagnosis.toLowerCase().includes(d.name.toLowerCase())) {
                                                indication = patientInfo.diagnosis;
                                              } else if (patientInfo.diagnosis) {
                                                // If diagnosis is present, we can append it or use it as context
                                                indication = `${d.indication} (for ${patientInfo.diagnosis})`;
                                              }
                                              
                                              newMeds[idx].indication = indication;
                                              setMedications(newMeds);
                                              setDrugSearch(null);
                                            }}
                                          >
                                            <span className="font-bold text-slate-800">{d.name}</span>
                                            <span className="text-xs text-slate-500">{d.dose} • {d.route} • {d.form}</span>
                                          </button>
                                        ))}
                                        {DRUG_DATABASE.filter(d => 
                                          d.name.toLowerCase().includes(drugSearch.query.toLowerCase())
                                        ).length === 0 && (
                                          <div className="p-4 text-center text-slate-400 text-xs italic">
                                            No matches found. Continue typing to add custom drug.
                                          </div>
                                        )}
                                        <button 
                                          className="w-full text-center py-2 text-xs text-blue-600 font-medium bg-slate-50 hover:bg-slate-100"
                                          onClick={() => setDrugSearch(null)}
                                        >
                                          Close Search
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  <input 
                                    value={med.regimen} 
                                    onChange={e => {
                                      const newMeds = [...medications];
                                      newMeds[idx].regimen = e.target.value;
                                      setMedications(newMeds);
                                    }} 
                                    placeholder="Regimen (e.g. 1g BiD)" 
                                    className="text-xs text-slate-500" 
                                  />
                                </div>
                              </td>
                              <td className="p-2"><input type="date" value={med.startDate} onChange={e => {
                                const newMeds = [...medications];
                                newMeds[idx].startDate = e.target.value;
                                setMedications(newMeds);
                              }} /></td>
                              <td className="p-2"><input value={med.stopDate} onChange={e => {
                                const newMeds = [...medications];
                                newMeds[idx].stopDate = e.target.value;
                                setMedications(newMeds);
                              }} /></td>
                              <td className="p-2"><input value={med.indication} onChange={e => {
                                const newMeds = [...medications];
                                newMeds[idx].indication = e.target.value;
                                setMedications(newMeds);
                              }} placeholder="Reason for use" /></td>
                              <td className="p-2">
                                <button onClick={() => setMedications(medications.filter(m => m.id !== med.id))} className="text-slate-300 hover:text-red-500 p-2">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {(activeTab === 'drps' || activeTab === 'pcis') && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <button 
                      onClick={activeTab === 'drps' ? addDrp : addPci} 
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                    >
                      <Plus size={18} /> Add {activeTab === 'drps' ? 'DRP' : 'PCI'}
                    </button>
                  </div>
                  
                  {(activeTab === 'drps' ? drps : pcis).map((note, idx) => (
                    <section key={note.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                        <input 
                          className="bg-transparent border-none font-bold text-slate-700 p-0 focus:ring-0 w-1/2" 
                          value={note.title} 
                          onChange={(e) => {
                            const list = activeTab === 'drps' ? [...drps] : [...pcis];
                            list[idx].title = e.target.value;
                            activeTab === 'drps' ? setDrps(list) : setPcis(list);
                          }}
                        />
                        <button 
                          onClick={() => {
                            const list = activeTab === 'drps' ? drps.filter(n => n.id !== note.id) : pcis.filter(n => n.id !== note.id);
                            activeTab === 'drps' ? setDrps(list) : setPcis(list);
                          }}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-blue-600 font-bold uppercase text-[10px] tracking-wider mb-1 block">Subjective</label>
                            <textarea rows={4} className="bg-slate-50 border-slate-200" value={note.subjective} onChange={e => {
                              const list = activeTab === 'drps' ? [...drps] : [...pcis];
                              list[idx].subjective = e.target.value;
                              activeTab === 'drps' ? setDrps(list) : setPcis(list);
                            }} />
                          </div>
                          <div>
                            <label className="text-blue-600 font-bold uppercase text-[10px] tracking-wider mb-1 block">Objective</label>
                            <textarea rows={4} className="bg-slate-50 border-slate-200" value={note.objective} onChange={e => {
                              const list = activeTab === 'drps' ? [...drps] : [...pcis];
                              list[idx].objective = e.target.value;
                              activeTab === 'drps' ? setDrps(list) : setPcis(list);
                            }} />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="text-blue-600 font-bold uppercase text-[10px] tracking-wider mb-1 block">Assessment</label>
                            <textarea rows={8} className="bg-slate-50 border-slate-200 font-serif leading-relaxed" value={note.assessment} onChange={e => {
                              const list = activeTab === 'drps' ? [...drps] : [...pcis];
                              list[idx].assessment = e.target.value;
                              activeTab === 'drps' ? setDrps(list) : setPcis(list);
                            }} />
                          </div>
                          <div>
                            <label className="text-blue-600 font-bold uppercase text-[10px] tracking-wider mb-1 block">Plan</label>
                            <textarea rows={6} className="bg-slate-50 border-slate-200" value={note.plan} onChange={e => {
                              const list = activeTab === 'drps' ? [...drps] : [...pcis];
                              list[idx].plan = e.target.value;
                              activeTab === 'drps' ? setDrps(list) : setPcis(list);
                            }} />
                          </div>
                        </div>
                      </div>
                    </section>
                  ))}
                  
                  {(activeTab === 'drps' ? drps : pcis).length === 0 && (
                    <div className="bg-white p-12 rounded-xl border-2 border-dashed border-slate-200 text-center">
                      <p className="text-slate-400 italic">No {activeTab === 'drps' ? 'Drug-Related Problems' : 'Pharmaceutical Care Issues'} recorded yet.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'conclusion' && (
                <div className="space-y-6">
                  <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold mb-4 text-slate-700 border-b pb-2">Executive Summary</h3>
                    <textarea 
                      rows={8} 
                      placeholder="Summarize the clinical status..." 
                      value={conclusion.summary}
                      onChange={e => setConclusion({...conclusion, summary: e.target.value})}
                    />
                  </section>
                  <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold mb-4 text-slate-700 border-b pb-2">Final Prognostic Summary</h3>
                    <textarea 
                      rows={4} 
                      placeholder="Final outlook..." 
                      value={conclusion.prognosis}
                      onChange={e => setConclusion({...conclusion, prognosis: e.target.value})}
                    />
                  </section>
                </div>
              )}

              {activeTab === 'tools' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dosage Calculator */}
                  <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-4 text-blue-600 border-b pb-2">
                      <Calculator size={20} />
                      <h3 className="text-lg font-semibold text-slate-700">Dosage Calculator (mg/kg)</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label>Weight (kg)</label>
                          <input type="number" value={calcWeight} onChange={e => setCalcWeight(e.target.value)} placeholder="70" />
                        </div>
                        <div>
                          <label>Dose (mg/kg)</label>
                          <input type="number" value={calcDose} onChange={e => setCalcDose(e.target.value)} placeholder="15" />
                        </div>
                      </div>
                      <div>
                        <label>Frequency (times/day)</label>
                        <select value={calcFrequency} onChange={e => setCalcFrequency(e.target.value)}>
                          <option value="1">Once daily (QD)</option>
                          <option value="2">Twice daily (BID)</option>
                          <option value="3">Three times daily (TID)</option>
                          <option value="4">Four times daily (QID)</option>
                        </select>
                      </div>
                      <button 
                        onClick={calculateDosage}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Calculate
                      </button>
                      {calcResult && (
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-center">
                          <p className="text-xs text-blue-600 font-bold uppercase mb-1">Result</p>
                          <p className="text-xl font-bold text-blue-800">{calcResult}</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Unit Converter */}
                  <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-4 text-green-600 border-b pb-2">
                      <RefreshCw size={20} />
                      <h3 className="text-lg font-semibold text-slate-700">Unit Converter</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label>Conversion Type</label>
                        <select value={convType} onChange={e => setConvType(e.target.value)}>
                          <option value="kg-lb">Weight: kg to lb</option>
                          <option value="lb-kg">Weight: lb to kg</option>
                          <option value="cm-in">Height: cm to in</option>
                          <option value="in-cm">Height: in to cm</option>
                          <option value="mgdl-mmol">Glucose: mg/dL to mmol/L</option>
                          <option value="mmol-mgdl">Glucose: mmol/L to mg/dL</option>
                          <option value="mgdl-umol">Creatinine: mg/dL to μmol/L</option>
                          <option value="umol-mgdl">Creatinine: μmol/L to mg/dL</option>
                        </select>
                      </div>
                      <div>
                        <label>Value</label>
                        <input type="number" value={convValue} onChange={e => setConvValue(e.target.value)} placeholder="Enter value..." />
                      </div>
                      <button 
                        onClick={convertUnit}
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Convert
                      </button>
                      {convResult && (
                        <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-center">
                          <p className="text-xs text-green-600 font-bold uppercase mb-1">Result</p>
                          <p className="text-xl font-bold text-green-800">{convResult}</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Drug Interaction Checker */}
                  <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2">
                    <div className="flex items-center justify-between mb-4 border-b pb-2">
                      <div className="flex items-center gap-2 text-red-600">
                        <ShieldAlert size={20} />
                        <h3 className="text-lg font-semibold text-slate-700">Drug Interaction Checker</h3>
                      </div>
                      <button 
                        onClick={checkInteractions}
                        disabled={isCheckingInteractions || medications.length < 2}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isCheckingInteractions ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                        Check Interactions
                      </button>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-lg min-h-[200px] prose prose-slate max-w-none">
                      {interactions ? (
                        <div className="whitespace-pre-wrap text-sm text-slate-700">{interactions}</div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 italic">
                          <ShieldAlert size={48} className="mb-2 opacity-20" />
                          <p>Add medications and click "Check Interactions" to analyze potential risks.</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'education' && (
                <div className="space-y-6">
                  <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-6 border-b pb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">Patient Education Materials</h3>
                        <p className="text-sm text-slate-500">Generate personalized education based on current case</p>
                      </div>
                      <button 
                        onClick={generateEducation}
                        disabled={isGeneratingEducation || !patientInfo.diagnosis}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                      >
                        {isGeneratingEducation ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                        Generate Leaflet
                      </button>
                    </div>
                    
                    <div className="bg-slate-50 p-8 rounded-2xl min-h-[400px] border border-slate-100">
                      {educationContent ? (
                        <div className="prose prose-blue max-w-none">
                          <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">{educationContent}</div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
                          <BookOpen size={64} className="mb-4 opacity-10" />
                          <p className="text-lg font-medium">No education content generated yet.</p>
                          <p className="text-sm">Ensure patient diagnosis and medications are filled first.</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <footer className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-center text-slate-400 text-xs">
            <p>© 2026 Clinical Pharmacy Department - Dhamar Hospital</p>
            <div className="flex gap-4">
              <button className="hover:text-slate-600">Help</button>
              <button className="hover:text-slate-600">Privacy</button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
