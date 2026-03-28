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
  ChevronLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

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
  { parameter: 'TWBC', normalRange: '4–11', unit: 'x10⁹/L', values: {} },
  { parameter: 'Hb', normalRange: '11.5-16.5', unit: 'g/dL', values: {} },
  { parameter: 'Platelet', normalRange: '150-400', unit: 'x10⁹/L', values: {} },
  { parameter: 'Urea', normalRange: '1.7-8.3', unit: 'mmol/L', values: {} },
  { parameter: 'Na+', normalRange: '135-145', unit: 'mmol/L', values: {} },
  { parameter: 'K+', normalRange: '3.5-5.0', unit: 'mmol/L', values: {} },
  { parameter: 'SCr', normalRange: '0.3-1.2', unit: 'mg/dl', values: {} },
  { parameter: 'Albumin', normalRange: '35-50', unit: 'g/L', values: {} },
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

  const tabs = [
    { id: 'demographics', label: 'Demographics', icon: User },
    { id: 'labs', label: 'Labs', icon: Activity },
    { id: 'meds', label: 'Medications', icon: Pill },
    { id: 'drps', label: 'DRPs', icon: AlertCircle },
    { id: 'pcis', label: 'PCIs', icon: ClipboardCheck },
    { id: 'conclusion', label: 'Conclusion', icon: FileText },
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
          <h1 className="text-xl font-bold flex items-center gap-2 text-blue-400">
            <Activity size={24} />
            CareManager
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

        <div className="mt-auto pt-6 border-t border-slate-800">
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
                    <button 
                      onClick={() => setLabDates([...labDates, 'New'])}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Date
                    </button>
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
                            <td className="sticky left-0 z-10 bg-white font-medium">{lab.parameter}</td>
                            <td className="text-slate-500 text-xs">{lab.normalRange}</td>
                            <td className="text-slate-500 text-xs">{lab.unit}</td>
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
                              <td className="p-2">
                                <input value={med.drug} onChange={e => {
                                  const newMeds = [...medications];
                                  newMeds[idx].drug = e.target.value;
                                  setMedications(newMeds);
                                }} placeholder="Drug Name" className="mb-1" />
                                <input value={med.regimen} onChange={e => {
                                  const newMeds = [...medications];
                                  newMeds[idx].regimen = e.target.value;
                                  setMedications(newMeds);
                                }} placeholder="Regimen (e.g. 1g BiD)" className="text-xs text-slate-500" />
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
                          <div><label>Subjective</label><textarea rows={3} value={note.subjective} onChange={e => {
                            const list = activeTab === 'drps' ? [...drps] : [...pcis];
                            list[idx].subjective = e.target.value;
                            activeTab === 'drps' ? setDrps(list) : setPcis(list);
                          }} /></div>
                          <div><label>Objective</label><textarea rows={3} value={note.objective} onChange={e => {
                            const list = activeTab === 'drps' ? [...drps] : [...pcis];
                            list[idx].objective = e.target.value;
                            activeTab === 'drps' ? setDrps(list) : setPcis(list);
                          }} /></div>
                        </div>
                        <div className="space-y-4">
                          <div><label>Assessment</label><textarea rows={3} value={note.assessment} onChange={e => {
                            const list = activeTab === 'drps' ? [...drps] : [...pcis];
                            list[idx].assessment = e.target.value;
                            activeTab === 'drps' ? setDrps(list) : setPcis(list);
                          }} /></div>
                          <div><label>Plan</label><textarea rows={3} value={note.plan} onChange={e => {
                            const list = activeTab === 'drps' ? [...drps] : [...pcis];
                            list[idx].plan = e.target.value;
                            activeTab === 'drps' ? setDrps(list) : setPcis(list);
                          }} /></div>
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
