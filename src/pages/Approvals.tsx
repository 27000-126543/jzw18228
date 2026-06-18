import { useState } from 'react'
import { useStore } from '@/store'
import { StatusBadge } from '@/components/StatusBadge'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'

export default function Approvals() {
  const [tab, setTab] = useState<'pending' | 'done'>('pending')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [comment, setComment] = useState<Record<string, string>>({})

  const applications = useStore(s => s.applications)
  const currentUser = useStore(s => s.currentUser)
  const approveApplication = useStore(s => s.approveApplication)
  const rejectApplication = useStore(s => s.rejectApplication)

  const currentUserId = currentUser?.id ?? ''
  const currentUserRole = currentUser?.role ?? 'employee'

  const pendingApps = applications.filter(app =>
    app.approvalFlow?.some(
      node => node.status === 'pending' && (node.approverId === currentUserId || node.approverId === currentUserRole)
    )
  )

  const doneApps = applications.filter(app =>
    app.approvalFlow?.some(
      node => (node.status === 'approved' || node.status === 'rejected') && (node.approverId === currentUserId || node.approverId === currentUserRole)
    )
  )

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    const fn = action === 'approve' ? approveApplication : rejectApplication
    fn(id, currentUserId, comment[id] ?? '')
    setExpandedId(null)
    setComment(prev => { const next = { ...prev }; delete next[id]; return next })
  }

  const tabs = [
    { key: 'pending' as const, label: '待审批', count: pendingApps.length },
    { key: 'done' as const, label: '已审批', count: doneApps.length },
  ]

  const list = tab === 'pending' ? pendingApps : doneApps

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-500">审批中心</h1>
      </div>

      <div className="flex gap-2 border-b border-surface-100">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-navy-500 text-navy-500'
                : 'border-transparent text-surface-300 hover:text-navy-500'
            }`}
          >
            {t.label}（{t.count}）
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 text-surface-300">
          <Clock className="mx-auto mb-2 w-10 h-10" />
          <p>暂无{tab === 'pending' ? '待审批' : '已审批'}数据</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(app => {
            const isOpen = expandedId === app.id
            const currentNode = app.approvalFlow?.find(
              n => n.status === 'pending' && (n.approverId === currentUserId || n.approverId === currentUserRole)
            )
            const doneNode = app.approvalFlow?.find(
              n => (n.status === 'approved' || n.status === 'rejected') && (n.approverId === currentUserId || n.approverId === currentUserRole)
            )

            return (
              <div key={app.id} className="bg-white rounded-xl card-shadow overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1 grid grid-cols-5 gap-4 text-sm">
                    <span className="font-medium text-navy-500">{app.applicantName}</span>
                    <span className="text-surface-400">{app.destination}</span>
                    <span className="text-surface-400 font-mono">{app.departureDate}</span>
                    <span className="text-surface-400 font-mono">¥{app.estimatedCosts.total.toLocaleString()}</span>
                    <span className="text-surface-300">{format(new Date(app.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <StatusBadge status={app.status} />
                    {tab === 'pending' && (
                      <button
                        onClick={() => setExpandedId(isOpen ? null : app.id)}
                        className="text-navy-500 hover:text-accent-400 p-1 transition-colors"
                      >
                        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    )}
                    {tab === 'done' && doneNode && (
                      doneNode.status === 'approved'
                        ? <CheckCircle className="w-5 h-5 text-success" />
                        : <XCircle className="w-5 h-5 text-danger" />
                    )}
                  </div>
                </div>

                {tab === 'pending' && isOpen && (
                  <div className="border-t border-surface-50 p-4 bg-surface-50 space-y-4">
                    <div className="text-sm space-y-1.5">
                      <p><span className="text-surface-300">申请人：</span><span className="text-navy-500">{app.applicantName}</span></p>
                      <p><span className="text-surface-300">目的地：</span>{app.destination}</p>
                      <p><span className="text-surface-300">出行日期：</span>{app.departureDate} 至 {app.returnDate}</p>
                      <p><span className="text-surface-300">预估费用：</span><span className="font-mono">¥{app.estimatedCosts.total.toLocaleString()}</span></p>
                      <p><span className="text-surface-300">事由：</span>{app.purpose}</p>
                      {currentNode && <p><span className="text-surface-300">当前节点：</span>{currentNode.role}</p>}
                    </div>

                    <div>
                      <label className="flex items-center gap-1 text-sm text-surface-400 mb-1">
                        <MessageSquare className="w-4 h-4" /> 审批意见
                      </label>
                      <textarea
                        value={comment[app.id] ?? ''}
                        onChange={e => setComment(prev => ({ ...prev, [app.id]: e.target.value }))}
                        className="w-full border border-surface-100 rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-navy-300"
                        rows={3}
                        placeholder="请输入审批意见（可选）"
                      />
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => handleAction(app.id, 'reject')}
                        className="px-5 py-2 rounded-lg text-sm font-medium bg-danger hover:bg-red-600 text-white transition-colors"
                      >
                        <XCircle className="inline w-4 h-4 mr-1" />驳回
                      </button>
                      <button
                        onClick={() => handleAction(app.id, 'approve')}
                        className="px-5 py-2 rounded-lg text-sm font-medium bg-success hover:bg-green-600 text-white transition-colors"
                      >
                        <CheckCircle className="inline w-4 h-4 mr-1" />同意
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
