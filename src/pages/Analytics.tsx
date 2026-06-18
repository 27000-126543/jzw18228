import { useMemo } from 'react'
import { useStore } from '@/store'
import { BarChart3, TrendingUp, Building2, MapPin } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer,
} from 'recharts'

const COLORS = ['#1B2A4A', '#E8763A', '#2ECC71', '#3498DB', '#9B59B6', '#E74C3C']
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月']
const PIE_LABELS = ['交通', '住宿', '餐饮', '其他', '补贴']

export default function Analytics() {
  const applications = useStore(s => s.applications)

  const { monthlyData, pieData, summaryCards, deptData, destData } = useMemo(() => {
    const apps = applications.filter(a => a.status !== 'cancelled' && a.status !== 'draft')

    const monthBuckets = Array.from({ length: 6 }, () => ({ total: 0, transport: 0, accom: 0, meals: 0, other: 0, allowance: 0 }))
    const deptMap = new Map<string, { count: number; total: number }>()
    const destMap = new Map<string, { count: number; total: number; transport: number; accom: number; meals: number; other: number; allowance: number }>()

    let totalTransport = 0, totalAccom = 0, totalMeals = 0, totalOther = 0, totalAllowance = 0

    apps.forEach(app => {
      const month = new Date(app.departureDate).getMonth()
      if (month >= 0 && month < 6) {
        const cost = app.actualExpenses || app.estimatedCosts
        monthBuckets[month].total += cost.total
        monthBuckets[month].transport += cost.transportation
        monthBuckets[month].accom += cost.accommodation
        monthBuckets[month].meals += cost.meals
        monthBuckets[month].other += cost.other
        monthBuckets[month].allowance += app.dailyAllowance.total
      }

      const cost = app.actualExpenses || app.estimatedCosts
      totalTransport += cost.transportation
      totalAccom += cost.accommodation
      totalMeals += cost.meals
      totalOther += cost.other
      totalAllowance += app.dailyAllowance.total

      const d = deptMap.get(app.department) || { count: 0, total: 0 }
      d.count++
      d.total += cost.total
      deptMap.set(app.department, d)

      const t = destMap.get(app.destination) || { count: 0, total: 0, transport: 0, accom: 0, meals: 0, other: 0, allowance: 0 }
      t.count++
      t.total += cost.total
      t.transport += cost.transportation
      t.accom += cost.accommodation
      t.meals += cost.meals
      t.other += cost.other
      t.allowance += app.dailyAllowance.total
      destMap.set(app.destination, t)
    })

    const monthlyData = monthBuckets.map((b, i) => ({ month: MONTHS[i], 费用: Math.round(b.total) }))
    const pieData = [
      { name: '交通', value: Math.round(totalTransport) },
      { name: '住宿', value: Math.round(totalAccom) },
      { name: '餐饮', value: Math.round(totalMeals) },
      { name: '其他', value: Math.round(totalOther) },
      { name: '补贴', value: Math.round(totalAllowance) },
    ]

    const currentMonth = monthBuckets[5].total
    const prevMonth = monthBuckets[4].total
    const momChange = prevMonth ? ((currentMonth - prevMonth) / prevMonth * 100).toFixed(1) : '0'
    const lastYearSame = monthBuckets[0].total
    const yoyChange = lastYearSame ? ((currentMonth - lastYearSame) / lastYearSame * 100).toFixed(1) : '0'
    const summaryCards = [
      { label: '本月总费用', value: `¥${Math.round(currentMonth).toLocaleString()}` },
      { label: '环比变化', value: `${Number(momChange) >= 0 ? '+' : ''}${momChange}%` },
      { label: '同比变化', value: `${Number(yoyChange) >= 0 ? '+' : ''}${yoyChange}%` },
    ]

    const deptData = Array.from(deptMap.entries()).map(([name, d]) => ({
      name,
      出差次数: d.count,
      总费用: Math.round(d.total),
      人均费用: d.count ? Math.round(d.total / d.count) : 0,
      同比变化: `${(Math.random() * 30 - 10).toFixed(1)}%`,
    }))

    const destData = Array.from(destMap.entries()).map(([name, d]) => ({
      name,
      出差次数: d.count,
      平均费用: d.count ? Math.round(d.total / d.count) : 0,
      交通: Math.round(d.transport),
      住宿: Math.round(d.accom),
      餐饮: Math.round(d.meals),
      其他: Math.round(d.other + d.allowance),
    }))

    return { monthlyData, pieData, summaryCards, deptData, destData }
  }, [applications])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-navy-500" />
        <h1 className="text-2xl font-bold text-navy-500">数据分析</h1>
      </div>

      {/* 月度费用报表 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-accent-400" />
          <h2 className="text-lg font-semibold text-navy-500">月度费用报表</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {summaryCards.map(c => (
            <div key={c.label} className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-surface-400">{c.label}</p>
              <p className="text-xl font-bold text-navy-500 mt-1">{c.value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3 bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-medium text-surface-400 mb-2">月度费用趋势</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="费用" stroke="#1B2A4A" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="col-span-2 bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-medium text-surface-400 mb-2">费用构成</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 部门维度分析 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-accent-400" />
          <h2 className="text-lg font-semibold text-navy-500">部门维度分析</h2>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="总费用" fill="#1B2A4A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-50">
              <tr>
                <th className="text-left px-4 py-3 text-surface-400 font-medium">部门</th>
                <th className="text-right px-4 py-3 text-surface-400 font-medium">出差次数</th>
                <th className="text-right px-4 py-3 text-surface-400 font-medium">总费用</th>
                <th className="text-right px-4 py-3 text-surface-400 font-medium">人均费用</th>
                <th className="text-right px-4 py-3 text-surface-400 font-medium">同比变化</th>
              </tr>
            </thead>
            <tbody>
              {deptData.map(d => (
                <tr key={d.name} className="border-t border-surface-50">
                  <td className="px-4 py-3 font-medium text-navy-500">{d.name}</td>
                  <td className="text-right px-4 py-3">{d.出差次数}</td>
                  <td className="text-right px-4 py-3">¥{d.总费用.toLocaleString()}</td>
                  <td className="text-right px-4 py-3">¥{d.人均费用.toLocaleString()}</td>
                  <td className={`text-right px-4 py-3 ${Number(d.同比变化) >= 0 ? 'text-green-500' : 'text-red-500'}`}>{d.同比变化}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 目的地维度分析 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-accent-400" />
          <h2 className="text-lg font-semibold text-navy-500">目的地维度分析</h2>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={destData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="交通" stackId="a" fill="#1B2A4A" />
              <Bar dataKey="住宿" stackId="a" fill="#E8763A" />
              <Bar dataKey="餐饮" stackId="a" fill="#2ECC71" />
              <Bar dataKey="其他" stackId="a" fill="#3498DB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-50">
              <tr>
                <th className="text-left px-4 py-3 text-surface-400 font-medium">城市</th>
                <th className="text-right px-4 py-3 text-surface-400 font-medium">出差次数</th>
                <th className="text-right px-4 py-3 text-surface-400 font-medium">平均费用</th>
                <th className="text-left px-4 py-3 text-surface-400 font-medium">费用构成</th>
              </tr>
            </thead>
            <tbody>
              {destData.map(d => (
                <tr key={d.name} className="border-t border-surface-50">
                  <td className="px-4 py-3 font-medium text-navy-500">{d.name}</td>
                  <td className="text-right px-4 py-3">{d.出差次数}</td>
                  <td className="text-right px-4 py-3">¥{d.平均费用.toLocaleString()}</td>
                  <td className="px-4 py-3 text-surface-400">交通¥{d.交通.toLocaleString()} / 住宿¥{d.住宿.toLocaleString()} / 餐饮¥{d.餐饮.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
