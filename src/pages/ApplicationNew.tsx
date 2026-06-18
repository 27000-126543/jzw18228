import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, AlertCircle, Calculator } from 'lucide-react'
import { useStore } from '@/store'
import { calculateAllowanceDays, getDailyRate } from '@/store'
import { generateApprovalFlow } from '@/store'

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
  const employees = useStore(s => s.employees)

  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(initForm)
  const [dateError, setDateError] = useState('')

  const num = (v: string) => Number(v) || 0
  const totalCost = num(form.transportation) + num(form.accommodation) + num(form.meals) + num(form.other)

  const allowanceDays = useMemo(() => {
    if (!form.departureDate || !form.returnDate) return 0
    return calculateAllowanceDays(form.departureDate, form.returnDate)
  }, [form.departureDate, form.returnDate])

  const dailyRate = useMemo(() => getDailyRate(form.destination, cityAllowances), [form.destination, cityAllowances])

  const allowanceTotal = allowanceDays * dailyRate

  const approvalPreview = useMemo(() => {
    if (totalCost <= 0) return null
    return generateApprovalFlow(currentUser, totalCost, employees)
  }, [totalCost, currentUser, employees])

  const update = (key: keyof FormState, value: string) => {
    setForm(f => ({ ...f, [key]: value }))
    if (key === 'departureDate' || key === 'returnDate') {
      checkDates(key === 'departureDate' ? value : form.departureDate, key === 'returnDate' ? value : form.returnDate)
    }
  }

  const checkDates = (dep: string, ret: string) => {
    if (!dep || !ret) { setDateError(''); return }
    if (new Date(ret) < new Date(dep)) {
      setDateError('返回日期不能早于出发日期')
    } else {
      setDateError('')
    }
  }

  const canNext = () => {
    if (dateError) return false
    if (step === 0) return form.destination && form.departureDate && form.returnDate && form.purpose && !dateError
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
    <div className="max-w-3xl mx-auto space-y-6">
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
              i < step ? 'bg-success text-white' : i === step ? 'bg-navy-500 text-white' : 'bg-surface-100 text-surface-300'
            }`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm ${i <= step ? 'text-navy-500 font-medium' : 'text-surface-300'}`}>{label}</span>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-surface-100" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl card-shadow p-6 space-y-5">
        {step === 0 && (
          <>
            <Field label="目的地">
              <select value={form.destination} onChange={e => update('destination', e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-50 rounded-lg text-sm border border-transparent focus:border-navy-300 focus:bg-white focus:outline-none">
                <option value="">请选择城市</option>
                {cityAllowances.map(c => <option key={c.city} value={c.city}>{c.city}（{c.dailyRate}元/天 · {({ first: '一线', second: '二线', third: '三线' })[c.tier]}城市）</option>)}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="出发日期">
                <input type="date" value={form.departureDate} onChange={e => update('departureDate', e.target.value)}
                  className={`w-full px-3 py-2.5 bg-surface-50 rounded-lg text-sm border border-transparent focus:bg-white focus:outline-none ${dateError ? 'border-red-300 focus:border-red-400' : 'focus:border-navy-300'}`} />
              </Field>
              <Field label="返回日期">
                <input type="date" value={form.returnDate} onChange={e => update('returnDate', e.target.value)}
                  className={`w-full px-3 py-2.5 bg-surface-50 rounded-lg text-sm border border-transparent focus:bg-white focus:outline-none ${dateError ? 'border-red-300 focus:border-red-400' : 'focus:border-navy-300'}`} />
              </Field>
            </div>
            {dateError && (
              <div className="flex items-center gap-1.5 text-xs text-danger -mt-2">
                <AlertCircle className="w-3.5 h-3.5" /> {dateError}
              </div>
            )}

            {(form.destination || (form.departureDate && form.returnDate)) && (
              <div className="p-3 bg-accent-50 rounded-lg border border-accent-100">
                <div className="flex items-center gap-1.5 text-xs text-accent-500 mb-2">
                  <Calculator className="w-3.5 h-3.5" /> 补贴预览
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-surface-300 text-xs block mb-0.5">城市</span>
                    <strong className="text-navy-500">{form.destination || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-surface-300 text-xs block mb-0.5">标准 × 天数</span>
                    <strong className="text-navy-500 font-mono">{dailyRate} × {allowanceDays || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-surface-300 text-xs block mb-0.5">补贴合计</span>
                    <strong className="text-accent-500 font-mono">¥{allowanceTotal.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            )}

            <Field label="行程目的">
              <textarea rows={3} value={form.purpose} onChange={e => update('purpose', e.target.value)} placeholder="请描述出差目的、计划安排等"
                className="w-full px-3 py-2.5 bg-surface-50 rounded-lg text-sm border border-transparent focus:border-navy-300 focus:bg-white focus:outline-none resize-none" />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <CostField label="交通费" value={form.transportation} onChange={v => update('transportation', v)} hint="含机票、高铁、打车等" />
            <CostField label="住宿费" value={form.accommodation} onChange={v => update('accommodation', v)} hint="按每晚单价 × 天数估算" />
            <CostField label="餐饮费" value={form.meals} onChange={v => update('meals', v)} hint="日常用餐、招待等" />
            <CostField label="其他费用" value={form.other} onChange={v => update('other', v)} hint="招待、礼品等" />

            {approvalPreview && (
              <div className="p-3 bg-surface-50 rounded-lg">
                <div className="flex items-center gap-1.5 text-xs text-navy-400 mb-2">
                  <Check className="w-3.5 h-3.5" /> 根据预估金额和职级自动生成的审批链
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {approvalPreview.map((n, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-full bg-white border border-surface-100 text-xs">
                        <p className="text-navy-500 font-medium">{n.approverName}</p>
                        <p className="text-surface-300 text-[10px]">{n.role}</p>
                      </div>
                      {i < approvalPreview.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-surface-200" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-surface-100">
              <div>
                <span className="text-sm text-surface-400">费用合计</span>
                {totalCost > 5000 && <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">金额较大，将升级审批</span>}
                {totalCost > 20000 && <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded bg-red-50 text-red-600">高金额，需财务总监联合审批</span>}
              </div>
              <span className="text-lg font-semibold font-mono text-navy-500">¥{totalCost.toLocaleString()}</span>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="text-sm space-y-2 pb-3 border-b border-surface-100">
              <ReviewRow label="申请人" value={`${currentUser.name} (${currentUser.department} · ${currentUser.level})`} />
              <ReviewRow label="目的地" value={form.destination} />
              <ReviewRow label="出行日期" value={`${form.departureDate} ~ ${form.returnDate}（共${allowanceDays}天）`} />
              <ReviewRow label="行程目的" value={form.purpose} />
            </div>
            <div className="space-y-2 pb-3 border-b border-surface-100 text-sm">
              <ReviewRow label="交通费" value={`¥${num(form.transportation).toLocaleString()}`} mono />
              <ReviewRow label="住宿费" value={`¥${num(form.accommodation).toLocaleString()}`} mono />
              <ReviewRow label="餐饮费" value={`¥${num(form.meals).toLocaleString()}`} mono />
              <ReviewRow label="其他费用" value={`¥${num(form.other).toLocaleString()}`} mono />
              <ReviewRow label="费用合计" value={`¥${totalCost.toLocaleString()}`} mono bold />
            </div>
            <div className="space-y-2 text-sm">
              <ReviewRow label="日补贴标准" value={`¥${dailyRate}/天`} mono />
              <ReviewRow label="补贴天数" value={`${allowanceDays}天`} />
              <ReviewRow label="出差补贴合计" value={`¥${allowanceTotal.toLocaleString()}`} mono bold accent />
              <div className="pt-2 mt-1">
                <span className="text-xs text-surface-300">审批流程：</span>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {approvalPreview?.map((n, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-navy-50 text-navy-500">{n.role} · {n.approverName}</span>
                      {i < (approvalPreview?.length ?? 0) - 1 && <ArrowRight className="w-3 h-3 text-surface-200" />}
                    </div>
                  ))}
                </div>
              </div>
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
            <Check className="w-4 h-4" />提交申请（进入审批）
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

function CostField({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div>
      <div className="flex items-end justify-between mb-1.5">
        <span className="text-sm font-medium text-navy-500">{label}</span>
        {hint && <span className="text-[11px] text-surface-300">{hint}</span>}
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-surface-300">¥</span>
        <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder="0"
          className="w-full pl-7 pr-3 py-2.5 bg-surface-50 rounded-lg text-sm font-mono border border-transparent focus:border-navy-300 focus:bg-white focus:outline-none" />
      </div>
    </div>
  )
}

function ReviewRow({ label, value, mono, bold, accent }: { label: string; value: string; mono?: boolean; bold?: boolean; accent?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-surface-400">{label}</span>
      <span className={`${bold ? 'font-semibold' : ''} ${mono ? 'font-mono' : ''} ${accent ? 'text-accent-500' : 'text-navy-500'}`}>{value}</span>
    </div>
  )
}
