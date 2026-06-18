import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useStore } from '@/store'

const STEPS = ['基本信息', '费用预估', '确认提交']

interface FormState {
  destination: string
  departureDate: string
  returnDate: string
  purpose: string
  transportation: string
  accommodation: string
  meals: string
  other: string
}

const initForm: FormState = {
  destination: '', departureDate: '', returnDate: '', purpose: '',
  transportation: '', accommodation: '', meals: '', other: '',
}

export default function ApplicationNew() {
  const navigate = useNavigate()
  const addApplication = useStore(s => s.addApplication)
  const currentUser = useStore(s => s.currentUser)
  const cityAllowances = useStore(s => s.cityAllowances)

  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(initForm)

  const num = (v: string) => Number(v) || 0
  const totalCost = num(form.transportation) + num(form.accommodation) + num(form.meals) + num(form.other)

  const update = (key: keyof FormState, value: string) => setForm(f => ({ ...f, [key]: value }))

  const canNext = () => {
    if (step === 0) return form.destination && form.departureDate && form.returnDate && form.purpose
    if (step === 1) return totalCost > 0
    return true
  }

  const handleSubmit = () => {
    addApplication({
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      department: currentUser.department,
      level: currentUser.level,
      destination: form.destination,
      departureDate: form.departureDate,
      returnDate: form.returnDate,
      purpose: form.purpose,
      estimatedCosts: {
        transportation: num(form.transportation),
        accommodation: num(form.accommodation),
        meals: num(form.meals),
        other: num(form.other),
        total: totalCost,
      },
      status: 'pending',
    })
    navigate('/applications')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/applications')} className="text-surface-300 hover:text-navy-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-navy-500">新建出差申请</h1>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium shrink-0 ${
              i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-navy-500 text-white' : 'bg-surface-100 text-surface-300'
            }`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm ${i <= step ? 'text-navy-500 font-medium' : 'text-surface-300'}`}>{label}</span>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-surface-100" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-6 space-y-5">
        {step === 0 && (
          <>
            <Field label="目的地">
              <select value={form.destination} onChange={e => update('destination', e.target.value)}
                className="w-full px-3 py-2 bg-surface-50 rounded-lg text-sm border border-transparent focus:border-navy-300 focus:bg-white focus:outline-none">
                <option value="">请选择城市</option>
                {cityAllowances.map(c => <option key={c.city} value={c.city}>{c.city}（{c.dailyRate}元/天）</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="出发日期">
                <input type="date" value={form.departureDate} onChange={e => update('departureDate', e.target.value)}
                  className="w-full px-3 py-2 bg-surface-50 rounded-lg text-sm border border-transparent focus:border-navy-300 focus:bg-white focus:outline-none" />
              </Field>
              <Field label="返回日期">
                <input type="date" value={form.returnDate} onChange={e => update('returnDate', e.target.value)}
                  className="w-full px-3 py-2 bg-surface-50 rounded-lg text-sm border border-transparent focus:border-navy-300 focus:bg-white focus:outline-none" />
              </Field>
            </div>
            <Field label="行程目的">
              <textarea rows={3} value={form.purpose} onChange={e => update('purpose', e.target.value)} placeholder="请描述出差目的"
                className="w-full px-3 py-2 bg-surface-50 rounded-lg text-sm border border-transparent focus:border-navy-300 focus:bg-white focus:outline-none resize-none" />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <CostField label="交通费" value={form.transportation} onChange={v => update('transportation', v)} />
            <CostField label="住宿费" value={form.accommodation} onChange={v => update('accommodation', v)} />
            <CostField label="餐饮费" value={form.meals} onChange={v => update('meals', v)} />
            <CostField label="其他费用" value={form.other} onChange={v => update('other', v)} />
            <div className="flex justify-between items-center pt-4 border-t border-surface-100">
              <span className="text-sm text-surface-400">费用合计</span>
              <span className="text-lg font-semibold font-mono text-navy-500">¥{totalCost.toLocaleString()}</span>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <ReviewRow label="申请人" value={`${currentUser.name} (${currentUser.department})`} />
            <ReviewRow label="目的地" value={form.destination} />
            <ReviewRow label="出行日期" value={`${form.departureDate} ~ ${form.returnDate}`} />
            <ReviewRow label="行程目的" value={form.purpose} />
            <div className="border-t border-surface-100 pt-3 space-y-2">
              <ReviewRow label="交通费" value={`¥${num(form.transportation).toLocaleString()}`} mono />
              <ReviewRow label="住宿费" value={`¥${num(form.accommodation).toLocaleString()}`} mono />
              <ReviewRow label="餐饮费" value={`¥${num(form.meals).toLocaleString()}`} mono />
              <ReviewRow label="其他费用" value={`¥${num(form.other).toLocaleString()}`} mono />
              <ReviewRow label="费用合计" value={`¥${totalCost.toLocaleString()}`} mono bold />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={() => step > 0 ? setStep(step - 1) : navigate('/applications')}
          className="px-4 py-2 text-sm text-surface-400 hover:text-navy-500 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />{step === 0 ? '返回列表' : '上一步'}
        </button>
        {step < 2 ? (
          <button disabled={!canNext()} onClick={() => setStep(step + 1)}
            className="px-6 py-2 bg-navy-500 text-white rounded-lg text-sm font-medium hover:bg-navy-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1">
            下一步<ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit}
            className="px-6 py-2 bg-accent-400 text-white rounded-lg text-sm font-medium hover:bg-accent-500 transition-colors flex items-center gap-1">
            <Check className="w-4 h-4" />提交申请
          </button>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-navy-500">{label}</label>
      {children}
    </div>
  )
}

function CostField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-surface-400 w-20 shrink-0">{label}</span>
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-surface-300">¥</span>
        <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder="0"
          className="w-full pl-7 pr-3 py-2 bg-surface-50 rounded-lg text-sm font-mono border border-transparent focus:border-navy-300 focus:bg-white focus:outline-none" />
      </div>
    </div>
  )
}

function ReviewRow({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-surface-400">{label}</span>
      <span className={`text-sm ${bold ? 'font-semibold text-navy-500' : 'text-navy-500'} ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
