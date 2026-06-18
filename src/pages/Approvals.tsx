import { useState } from 'react'
import { useStore } from '@/store'
import { StatusBadge } from '@/components/StatusBadge'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, MessageSquare, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

export default function Approvals() {
  const [tab, setTab] = useState<'pending' | 'done'>('pending')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [comment, setComment] = useState<Record<string, string>>({})

  const applications = useStore(s => s.applications)
  const currentUser = useStore(s => s.currentUser)
  const approveApplication = useStore(s => s.approveApplication)
  const rejectApplication = useStore(s => s.rejectApplication)
  const isMyPendingApproval = useStore(s => s.isMyPendingApproval)

  const currentUserId = currentUser?.id ?? ''
  const currentUserRole = currentUser?.role ?? 'employee'

  const pendingApps = applications.filter(app =>
    isMyPendingApproval(app, currentUserId, currentUserRole)
  )

  const doneApps = applications.filter(app =>
    app.approvalFlow?.some(
      node => (node.status === 'approved' || node.status === 'rejected') &&
      (node.approverId === currentUserId ||
        (currentUserRole === 'manager' && (node.role === '直属主管' || node.role === '部门总监')) ||
        (currentUserRole === 'finance' && node.role === '财务总监') ||
        currentUserRole === 'admin')
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

  const getCurrentPendingNode = (app: (typeof applications)[number]) => {
    const idx = app.approvalFlow.findIndex(n => n.status === 'pending')
    return idx >= 0 ? app.approvalFlow[idx] : null
  }

  const getTotalNodes = (app: (typeof applications)[number]) => app.approvalFlow.length
  const getApprovedCount = (app: (typeof applications)[number]) =>
    app.approvalFlow.filter(n => n.status === 'approved').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-surface-300 hover:text-navy-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-navy-500">审批中心</h1>
          <span className="text-xs text-surface-300">
            以 <strong className="text-navy-500">{currentUser.name}</strong>（{({
              employee: '普通员工', manager: '部门主管', finance: '财务人员', admin: '系统管理员',
            })[currentUser.role]}）身份审批
          </span>
        </div>
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
            const currentNode = getCurrentPendingNode(app)
            const doneNode = app.approvalFlow?.find(
              n => (n.status === 'approved' || n.status === 'rejected') &&
              (n.approverId === currentUserId ||
                (currentUserRole === 'manager' && (n.role === '直属主管' || n.role === '部门总监')) ||
                (currentUserRole === 'finance' && n.role === '财务总监') ||
                currentUserRole === 'admin')
            )

            return (
              <div key={app.id} className="bg-white rounded-xl card-shadow overflow-hidden transition-shadow hover:card-shadow-hover">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1 grid grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-surface-300 text-xs mb-0.5">申请人</p>
                      <span className="font-medium text-navy-500">{app.applicantName}</span>
                      <p className="text-xs text-surface-300">{app.department} / {app.level}</p>
                    </div>
                    <div>
                      <p className="text-surface-300 text-xs mb-0.5">目的地</p>
                      <span className="text-navy-500">{app.destination}</span>
                    </div>
                    <div>
                      <p className="text-surface-300 text-xs mb-0.5">出行日期</p>
                      <span className="text-navy-500 font-mono text-xs">{app.departureDate} ~ {app.returnDate}</span>
                    </div>
                    <div>
                      <p className="text-surface-300 text-xs mb-0.5">预估费用</p>
                      <span className="text-navy-500 font-mono">¥{app.estimatedCosts.total.toLocaleString()}</span>
                    </div>
                    <div>
                      <p className="text-surface-300 text-xs mb-0.5">审批进度</p>
                      <div className="flex items-center gap-1 text-xs">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${currentNode && tab === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {getApprovedCount(app)}/{getTotalNodes(app)}
                        </span>
                        {currentNode && tab === 'pending' && (
                          <span className="text-surface-300">当前：{currentNode.role}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
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
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1.5">
                        <p><span className="text-surface-300">申请人：</span><span className="text-navy-500">{app.applicantName}</span></p>
                        <p><span className="text-surface-300">目的地：</span>{app.destination}</p>
                        <p><span className="text-surface-300">出行日期：</span>{app.departureDate} 至 {app.returnDate}</p>
                        <p><span className="text-surface-300">预估费用：</span><span className="font-mono">¥{app.estimatedCosts.total.toLocaleString()}</span></p>
                      </div>
                      <div className="space-y-1.5">
                        <p><span className="text-surface-300">事由：</span>{app.purpose}</p>
                        {currentNode && <p><span className="text-surface-300">当前节点：</span><span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-xs">{currentNode.role} - {currentNode.approverName}</span></p>}
                        <div>
                          <span className="text-surface-300">审批链：</span>
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            {app.approvalFlow.map((n, i) => (
                              <div key={i} className="flex items-center gap-1">
                                <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                                  n.status === 'approved' ? 'bg-emerald-50 text-emerald-600'
                                  : n.status === 'rejected' ? 'bg-red-50 text-red-600'
                                  : 'bg-amber-50 text-amber-600'
                                }`}>{n.role}</span>
                                {i < app.approvalFlow.length - 1 && <span className="text-surface-200">→</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-1 text-sm text-surface-400 mb-1">
                        <MessageSquare className="w-4 h-4" /> 审批意见
                      </label>
                      <textarea
                        value={comment[app.id] ?? ''}
                        onChange={e => setComment(prev => ({ ...prev, [app.id]: e.target.value }))}
                        className="w-full border border-surface-100 rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-navy-300 bg-white"
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
                        <CheckCircle className="inline w-4 h-4 mr-1" />同意并进入下一节点
                      </button>
                    </div>
                  </div>
                )}

                {tab === 'done' && doneNode && (
                  <div className="border-t border-surface-50 p-3 bg-surface-50 text-xs">
                    <span className="text-surface-300">你审批时的意见：</span>
                    <span className="text-navy-500 ml-1">{doneNode.comment || '（无）'}</span>
                    <span className="text-surface-300 ml-2 font-mono">{format(new Date(doneNode.timestamp), 'yyyy-MM-dd HH:mm')}</span>
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
