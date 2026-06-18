import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plane, Hotel, FileText, CircleDot, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { useStore } from '@/store'
import { StatusBadge, SettlementBadge } from '@/components/StatusBadge'
import type { FlightDetail, HotelDetail } from '@/types'

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const app = useStore(s => s.applications.find(a => a.id === id))

  if (!app) return (
    <div className="text-center py-20 text-surface-300">未找到该申请</div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/applications')} className="text-surface-300 hover:text-navy-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-navy-500">申请详情</h1>
          <StatusBadge status={app.status} />
        </div>
        {app.status === 'approved' && (
          <Link to={`/expenses?appId=${app.id}`}
            className="px-4 py-2 bg-accent-400 text-white rounded-lg text-sm font-medium hover:bg-accent-500 transition-colors">
            提交报销
          </Link>
        )}
      </div>

      <Card title="基本信息">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <Row label="申请编号" value={app.id} mono />
          <Row label="申请人" value={`${app.applicantName} (${app.department})`} />
          <Row label="目的地" value={app.destination} />
          <Row label="出行日期" value={`${format(new Date(app.departureDate), 'yyyy/MM/dd')} ~ ${format(new Date(app.returnDate), 'yyyy/MM/dd')}`} />
          <Row label="行程目的" value={app.purpose} />
          <Row label="职级" value={app.level} />
        </div>
      </Card>

      <Card title="费用预估">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <Row label="交通费" value={`¥${app.estimatedCosts.transportation.toLocaleString()}`} mono />
          <Row label="住宿费" value={`¥${app.estimatedCosts.accommodation.toLocaleString()}`} mono />
          <Row label="餐饮费" value={`¥${app.estimatedCosts.meals.toLocaleString()}`} mono />
          <Row label="其他费用" value={`¥${app.estimatedCosts.other.toLocaleString()}`} mono />
          <Row label="合计" value={`¥${app.estimatedCosts.total.toLocaleString()}`} mono bold />
        </div>
      </Card>

      <Card title="审批流程">
        {app.approvalFlow.length === 0 ? (
          <p className="text-sm text-surface-300">暂无审批记录</p>
        ) : (
          <div className="space-y-0">
            {app.approvalFlow.map((node, i) => (
              <div key={i} className="flex gap-3 relative">
                <div className="flex flex-col items-center">
                  <CircleDot className={`w-5 h-5 shrink-0 ${
                    node.status === 'approved' ? 'text-emerald-500' : node.status === 'rejected' ? 'text-red-500' : 'text-amber-400'
                  }`} />
                  {i < app.approvalFlow.length - 1 && <div className="w-px flex-1 bg-surface-100 my-1" />}
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-navy-500">{node.approverName}</span>
                    <span className="text-xs text-surface-300">{node.role}</span>
                  </div>
                  {node.comment && <p className="text-xs text-surface-400 mt-0.5">{node.comment}</p>}
                  {node.timestamp && <p className="text-xs text-surface-300 mt-0.5 font-mono">{format(new Date(node.timestamp), 'yyyy-MM-dd HH:mm')}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="关联预订">
        {app.bookings.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-surface-300">暂无预订记录</p>
            {app.status === 'approved' && (
              <Link to="/bookings"
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium bg-navy-500 text-white hover:bg-navy-600 transition-colors">
                去预订中心 →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {(() => {
              const total = app.bookings.reduce((sum, b) => {
                const d = b.details as any
                const p = Number(d.price) || 0
                const n = b.type === 'hotel' ? (Number(d.nights) || 1) : 1
                return sum + p * n
              }, 0)
              return (
                <div className="flex items-center justify-between p-3 bg-accent-50 rounded-lg border border-accent-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent-400 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-accent-500">预订总费用</p>
                      <p className="text-sm text-navy-500">共 {app.bookings.length} 笔预订</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xl text-accent-500">¥{total.toLocaleString()}</span>
                </div>
              )
            })()}
            <div className="space-y-3">
            {app.bookings.map(bk => bk.type === 'flight' ? (
              <BookingItem key={bk.id} icon={<Plane className="w-4 h-4" />} label="机票">
                <FlightInfo detail={bk.details as FlightDetail} />
              </BookingItem>
            ) : (
              <BookingItem key={bk.id} icon={<Hotel className="w-4 h-4" />} label="酒店">
                <HotelInfo detail={bk.details as HotelDetail} />
              </BookingItem>
            ))}
          </div>
          </div>
        )}
      </Card>

      {app.actualExpenses && (
        <Card title="费用记录">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <Row label="交通费" value={`¥${app.actualExpenses.transportation.toLocaleString()}`} mono />
            <Row label="住宿费" value={`¥${app.actualExpenses.accommodation.toLocaleString()}`} mono />
            <Row label="餐饮费" value={`¥${app.actualExpenses.meals.toLocaleString()}`} mono />
            <Row label="其他费用" value={`¥${app.actualExpenses.other.toLocaleString()}`} mono />
            <Row label="合计" value={`¥${app.actualExpenses.total.toLocaleString()}`} mono bold />
          </div>
          {app.overBudgetNote && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-600">{app.overBudgetNote}</div>
          )}
        </Card>
      )}

      <Card title="补贴明细">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <Row label="城市" value={app.dailyAllowance.city} />
          <Row label="日补贴标准" value={`¥${app.dailyAllowance.dailyRate}`} mono />
          <Row label="出差天数" value={`${app.dailyAllowance.days}天`} />
          <Row label="补贴合计" value={`¥${app.dailyAllowance.total.toLocaleString()}`} mono bold />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-surface-400">核销状态</span>
          <SettlementBadge status={app.settlementStatus} />
        </div>
      </Card>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-5">
      <h2 className="text-sm font-semibold text-navy-500 mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4 text-accent-400" />{title}
      </h2>
      {children}
    </div>
  )
}

function Row({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-surface-400">{label}</span>
      <span className={`text-sm ${bold ? 'font-semibold text-navy-500' : 'text-navy-500'} ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

function BookingItem({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-surface-50 rounded-lg">
      <div className="text-navy-500 mt-0.5">{icon}</div>
      <div className="flex-1">
        <span className="text-sm font-medium text-navy-500">{label}</span>
        {children}
      </div>
    </div>
  )
}

function FlightInfo({ detail }: { detail: FlightDetail }) {
  return (
    <div className="text-xs text-surface-400 mt-1 space-y-0.5">
      <p>{detail.airline} {detail.flightNo} · {detail.departure} → {detail.arrival}</p>
      <p className="font-mono">{format(new Date(detail.departureTime), 'MM/dd HH:mm')} - {format(new Date(detail.arrivalTime), 'HH:mm')}</p>
      <p className="font-mono text-navy-500">¥{detail.price.toLocaleString()}</p>
    </div>
  )
}

function HotelInfo({ detail }: { detail: HotelDetail }) {
  return (
    <div className="text-xs text-surface-400 mt-1 space-y-0.5">
      <p>{detail.hotelName} · {detail.roomType} · {'★'.repeat(detail.starRating)}</p>
      <p className="font-mono">{detail.checkIn} 入住 · {detail.nights}晚</p>
      <p className="font-mono text-navy-500">¥{detail.price.toLocaleString()}/晚</p>
    </div>
  )
}
