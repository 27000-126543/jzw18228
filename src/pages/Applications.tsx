import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { useStore } from '@/store'
import { StatusBadge } from '@/components/StatusBadge'
import type { ApplicationStatus } from '@/types'

const TABS: { label: string; value: ApplicationStatus | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '草稿', value: 'draft' },
  { label: '审批中', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
  { label: '已取消', value: 'cancelled' },
]

export default function Applications() {
  const applications = useStore(s => s.applications)
  const [tab, setTab] = useState<ApplicationStatus | 'all'>('all')
  const [keyword, setKeyword] = useState('')

  const filtered = applications.filter(app => {
    const matchTab = tab === 'all' || app.status === tab
    const matchSearch = !keyword || app.applicantName.includes(keyword) || app.destination.includes(keyword) || app.purpose.includes(keyword)
    return matchTab && matchSearch
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-navy-500">出差申请</h1>
        <Link
          to="/applications/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-400 text-white rounded-lg text-sm font-medium hover:bg-accent-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建申请
        </Link>
      </div>

      <div className="flex items-center gap-4 border-b border-surface-100">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`pb-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.value ? 'text-navy-500 border-navy-500' : 'text-surface-300 border-transparent hover:text-surface-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-300" />
        <input
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="搜索申请人、目的地、行程目的..."
          className="pl-9 pr-4 py-2 bg-surface-50 rounded-lg text-sm border border-transparent focus:border-navy-300 focus:bg-white focus:outline-none w-80 transition-all"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-surface-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100 bg-surface-50">
              {['申请人', '目的地', '出行日期', '行程目的', '预估费用', '状态', '操作'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-surface-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(app => (
              <tr key={app.id} className="border-b border-surface-100 last:border-0 hover:bg-surface-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-navy-500">{app.applicantName}</div>
                  <div className="text-xs text-surface-300">{app.department}</div>
                </td>
                <td className="px-4 py-3 text-navy-500">{app.destination}</td>
                <td className="px-4 py-3 font-mono text-surface-400">
                  {format(new Date(app.departureDate), 'MM/dd')} - {format(new Date(app.returnDate), 'MM/dd')}
                </td>
                <td className="px-4 py-3 text-surface-400 max-w-[200px] truncate">{app.purpose}</td>
                <td className="px-4 py-3 font-mono text-navy-500">¥{app.estimatedCosts.total.toLocaleString()}</td>
                <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                <td className="px-4 py-3">
                  <Link to={`/applications/${app.id}`} className="text-accent-400 hover:text-accent-500 text-sm font-medium">
                    查看
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-surface-300">暂无申请记录</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
