import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import { SettlementBadge } from '@/components/StatusBadge'
import { Banknote, CheckSquare, AlertTriangle, ChevronDown, ChevronUp, Filter } from 'lucide-react'
import { format } from 'date-fns'

export default function Settlements() {
  const applications = useStore(s => s.applications)
  const settleApplications = useStore(s => s.settleApplications)
  const returnApplication = useStore(s => s.returnApplication)

  const [dept, setDept] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const departments = useMemo(() => [...new Set(applications.map(a => a.department))], [applications])

  const filtered = useMemo(() => {
    return applications.filter(a => {
      if (!a.actualExpenses) return false
      if (dept && a.department !== dept) return false
      if (statusFilter && a.settlementStatus !== statusFilter) return false
      if (dateFrom && a.departureDate < dateFrom) return false
      if (dateTo && a.departureDate > dateTo) return false
      return true
    })
  }, [applications, dept, statusFilter, dateFrom, dateTo])

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(a => a.id)))
  }
  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const handleBatchSettle = () => {
    settleApplications([...selected])
    setSelected(new Set())
  }

  const fmt = (n: number) => `¥${n.toLocaleString()}`

  return (
    <div className="p-6 pb-28">
      <div className="flex items-center gap-3 mb-6">
        <Banknote className="w-6 h-6 text-navy-500" />
        <h1 className="text-2xl font-bold text-navy-500">财务核销</h1>
      </div>

      <div className="bg-white rounded-xl shadow-card p-4 mb-6 flex flex-wrap items-end gap-4">
        <Filter className="w-4 h-4 text-surface-300 mb-2" />
        <label className="flex flex-col text-xs text-surface-400">
          部门
          <select value={dept} onChange={e => setDept(e.target.value)}
            className="mt-1 border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy-400">
            <option value="">全部</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="flex flex-col text-xs text-surface-400">
          起始日期
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="mt-1 border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy-400" />
        </label>
        <label className="flex flex-col text-xs text-surface-400">
          截止日期
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="mt-1 border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy-400" />
        </label>
        <label className="flex flex-col text-xs text-surface-400">
          核销状态
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="mt-1 border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy-400">
            <option value="">全部</option>
            <option value="unsettled">待核销</option>
            <option value="settled">已核销</option>
            <option value="returned">已退回</option>
          </select>
        </label>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-50 text-surface-400 text-xs">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={filtered.length > 0 && selected.size === filtered.length}
                  onChange={toggleAll} className="accent-navy-500" />
              </th>
              <th className="px-4 py-3 text-left">申请单号</th>
              <th className="px-4 py-3 text-left">申请人</th>
              <th className="px-4 py-3 text-left">部门</th>
              <th className="px-4 py-3 text-left">目的地</th>
              <th className="px-4 py-3 text-left">出行日期</th>
              <th className="px-4 py-3 text-right">预估费用</th>
              <th className="px-4 py-3 text-right">实际费用</th>
              <th className="px-4 py-3 text-right">补贴金额</th>
              <th className="px-4 py-3 text-center">超预算</th>
              <th className="px-4 py-3 text-center">核销状态</th>
              <th className="px-4 py-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <>
                <tr key={a.id} className="border-t border-surface-100 hover:bg-surface-50/50 cursor-pointer"
                  onClick={() => toggleExpand(a.id)}>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)}
                      className="accent-navy-500" />
                  </td>
                  <td className="px-4 py-3 font-medium text-navy-500">{a.id}</td>
                  <td className="px-4 py-3">{a.applicantName}</td>
                  <td className="px-4 py-3">{a.department}</td>
                  <td className="px-4 py-3">{a.destination}</td>
                  <td className="px-4 py-3">{format(new Date(a.departureDate), 'yyyy-MM-dd')}</td>
                  <td className="px-4 py-3 text-right">{fmt(a.estimatedCosts.total)}</td>
                  <td className="px-4 py-3 text-right">{fmt(a.actualExpenses!.total)}</td>
                  <td className="px-4 py-3 text-right text-accent-500">{fmt(a.dailyAllowance.total)}</td>
                  <td className="px-4 py-3 text-center">
                    {a.overBudgetNote ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-medium">
                        <AlertTriangle className="w-3 h-3" />超
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center"><SettlementBadge status={a.settlementStatus} /></td>
                  <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      {a.settlementStatus === 'unsettled' && (
                        <button onClick={() => returnApplication(a.id)}
                          className="text-red-500 hover:text-red-600 text-xs">退回</button>
                      )}
                      {expanded.has(a.id) ? <ChevronUp className="w-4 h-4 text-surface-300" /> : <ChevronDown className="w-4 h-4 text-surface-300" />}
                    </div>
                  </td>
                </tr>
                {expanded.has(a.id) && (
                  <tr key={`${a.id}-detail`} className="border-t border-surface-100 bg-surface-50/30">
                    <td colSpan={12} className="px-8 py-4">
                      <div className="grid grid-cols-3 gap-6 text-sm">
                        <div>
                          <p className="text-surface-400 text-xs mb-2">费用明细</p>
                          <div className="space-y-1">
                            <div className="flex justify-between"><span>交通</span><span>{fmt(a.actualExpenses!.transportation)}</span></div>
                            <div className="flex justify-between"><span>住宿</span><span>{fmt(a.actualExpenses!.accommodation)}</span></div>
                            <div className="flex justify-between"><span>餐饮</span><span>{fmt(a.actualExpenses!.meals)}</span></div>
                            <div className="flex justify-between"><span>其他</span><span>{fmt(a.actualExpenses!.other)}</span></div>
                          </div>
                        </div>
                        <div>
                          <p className="text-surface-400 text-xs mb-2">补贴详情</p>
                          <div className="space-y-1">
                            <div className="flex justify-between"><span>城市</span><span>{a.dailyAllowance.city}</span></div>
                            <div className="flex justify-between"><span>日补贴</span><span>{fmt(a.dailyAllowance.dailyRate)}/天</span></div>
                            <div className="flex justify-between"><span>天数</span><span>{a.dailyAllowance.days}天</span></div>
                            <div className="flex justify-between font-medium"><span>补贴合计</span><span className="text-accent-500">{fmt(a.dailyAllowance.total)}</span></div>
                          </div>
                        </div>
                        <div>
                          <p className="text-surface-400 text-xs mb-2">超预算说明</p>
                          {a.overBudgetNote ? (
                            <p className="text-red-600 bg-red-50 rounded-lg p-3 text-xs">{a.overBudgetNote}</p>
                          ) : (
                            <p className="text-surface-300 text-xs">无超预算</p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-surface-300">暂无待核销数据</div>
        )}
      </div>

      {selected.size > 0 && (
        <div className="fixed bottom-0 left-[220px] right-0 h-16 bg-white/95 backdrop-blur-md border-t border-surface-100 shadow-lg flex items-center justify-between px-8 z-50">
          <span className="text-sm text-surface-500">已选择 <strong className="text-navy-500">{selected.size}</strong> 条记录</span>
          <button onClick={handleBatchSettle}
            className="flex items-center gap-2 px-6 py-2.5 bg-navy-500 text-white rounded-lg hover:bg-navy-600 transition-colors font-medium text-sm">
            <CheckSquare className="w-4 h-4" />批量核销
          </button>
        </div>
      )}
    </div>
  )
}
