import type { ApplicationStatus, SettlementStatus } from '@/types'

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  draft: { label: '草稿', className: 'bg-surface-100 text-surface-400' },
  pending: { label: '审批中', className: 'bg-amber-50 text-amber-600' },
  approved: { label: '已通过', className: 'bg-emerald-50 text-emerald-600' },
  rejected: { label: '已驳回', className: 'bg-red-50 text-red-600' },
  cancelled: { label: '已取消', className: 'bg-surface-100 text-surface-400' },
}

const settlementConfig: Record<SettlementStatus, { label: string; className: string }> = {
  unsettled: { label: '待核销', className: 'bg-amber-50 text-amber-600' },
  settled: { label: '已核销', className: 'bg-emerald-50 text-emerald-600' },
  returned: { label: '已退回', className: 'bg-red-50 text-red-600' },
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

export function SettlementBadge({ status }: { status: SettlementStatus }) {
  const config = settlementConfig[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
