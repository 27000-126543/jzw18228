import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import { Plane, Building2, Star, Search, Check, Calendar, MapPin, Link as LinkIcon, AlertCircle, CreditCard } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { Link } from 'react-router-dom'

type Tab = 'flight' | 'hotel'

export default function Bookings() {
  const [tab, setTab] = useState<Tab>('flight')
  const [selectedAppId, setSelectedAppId] = useState('')
  const [flightFrom, setFlightFrom] = useState('')
  const [flightTo, setFlightTo] = useState('')
  const [flightDate, setFlightDate] = useState('')
  const [hotelCity, setHotelCity] = useState('')
  const [hotelCheckIn, setHotelCheckIn] = useState('')
  const [hotelCheckOut, setHotelCheckOut] = useState('')

  const applications = useStore(s => s.applications)
  const currentUser = useStore(s => s.currentUser)
  const mockFlights = useStore(s => s.mockFlights)
  const mockHotels = useStore(s => s.mockHotels)
  const addBooking = useStore(s => s.addBooking)

  const approvedApps = applications.filter(a =>
    a.status === 'approved' &&
    a.actualExpenses === null &&
    a.applicantId === currentUser.id
  )
  const selectedApp = applications.find(a => a.id === selectedAppId)

  useEffect(() => {
    if (selectedApp) {
      setFlightTo(selectedApp.destination)
      setFlightDate(selectedApp.departureDate)
      setHotelCity(selectedApp.destination)
      setHotelCheckIn(selectedApp.departureDate)
      setHotelCheckOut(selectedApp.returnDate)
      if (!flightFrom) setFlightFrom('北京')
    }
  }, [selectedAppId, selectedApp?.id])

  const bookingTotal = (selectedApp?.bookings ?? []).reduce((sum, b) => {
    const price = (b.details as any).price ?? 0
    const nights = (b.details as any).nights
    const add = b.type === 'hotel' && nights ? price * nights : price
    return sum + add
  }, 0)

  const filteredFlights = mockFlights.filter(f => {
    if (flightFrom && !f.departure.includes(flightFrom)) return false
    if (flightTo && !f.arrival.includes(flightTo)) return false
    if (flightDate && !f.departureTime.startsWith(flightDate)) return false
    return true
  })

  const filteredHotels = mockHotels.filter(h => {
    if (hotelCity && !h.city.includes(hotelCity)) return false
    return true
  })

  const handleBookFlight = (flight: typeof mockFlights[0]) => {
    if (!selectedAppId) return
    addBooking({
      type: 'flight',
      applicationId: selectedAppId,
      details: {
        airline: flight.airline,
        flightNo: flight.flightNo,
        departure: flight.departure,
        arrival: flight.arrival,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        price: flight.price,
      },
    })
  }

  const calcNights = () => {
    if (hotelCheckIn && hotelCheckOut) {
      const d = Math.round((new Date(hotelCheckOut).getTime() - new Date(hotelCheckIn).getTime()) / 86400000)
      return Math.max(1, d)
    }
    return 1
  }

  const handleBookHotel = (hotel: typeof mockHotels[0]) => {
    if (!selectedAppId) return
    const nights = calcNights()
    addBooking({
      type: 'hotel',
      applicationId: selectedAppId,
      details: {
        hotelName: hotel.hotelName,
        roomType: hotel.roomType,
        checkIn: hotelCheckIn || selectedApp?.departureDate || '2025-07-15',
        checkOut: hotelCheckOut || selectedApp?.returnDate || addDays(new Date(selectedApp?.returnDate || new Date()), 1).toISOString().slice(0, 10),
        price: hotel.price,
        nights,
        starRating: hotel.starRating,
      },
    })
  }

  const renderStars = (count: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < count ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">预订中心</h1>
          <p className="text-xs text-surface-300 mt-1">关联出差申请后，自动带出目的地与出行日期</p>
        </div>
      </div>

      <div className="bg-white rounded-xl card-shadow p-5">
        <label className="block text-sm font-semibold text-navy-500 mb-2 flex items-center gap-1.5">
          <LinkIcon className="w-4 h-4 text-accent-400" /> 关联出差申请
        </label>
        <select
          value={selectedAppId}
          onChange={e => setSelectedAppId(e.target.value)}
          className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 bg-surface-50"
        >
          <option value="">-- 请选择已通过的出差申请（仅显示您本人未报销的） --</option>
          {approvedApps.length === 0 ? (
            <option value="" disabled>暂无可用申请，请先去审批中申请</option>
          ) : (
            approvedApps.map(a => (
              <option key={a.id} value={a.id}>
                [{a.id}] {a.destination} · {a.departureDate}~{a.returnDate} · {a.purpose.slice(0, 16)}...
              </option>
            ))
          )}
        </select>
        {!selectedAppId ? (
          <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> 请先选择出差申请再进行预订
          </p>
        ) : selectedApp && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-2.5 bg-navy-50 rounded-lg">
              <p className="text-[11px] text-surface-300">目的地</p>
              <p className="text-sm font-semibold text-navy-500">{selectedApp.destination}</p>
            </div>
            <div className="p-2.5 bg-navy-50 rounded-lg">
              <p className="text-[11px] text-surface-300">往返日期</p>
              <p className="text-sm font-mono text-navy-500">{selectedApp.departureDate} ~ {selectedApp.returnDate}</p>
            </div>
            <div className="p-2.5 bg-navy-50 rounded-lg">
              <p className="text-[11px] text-surface-300">预估上限</p>
              <p className="text-sm font-mono text-navy-500">¥{selectedApp.estimatedCosts.total.toLocaleString()}</p>
            </div>
            <div className="p-2.5 bg-accent-50 rounded-lg">
              <p className="text-[11px] text-accent-500 flex items-center gap-1"><CreditCard className="w-3 h-3" /> 已预订累计</p>
              <p className="text-sm font-mono text-accent-500">¥{bookingTotal.toLocaleString()} / {selectedApp.bookings.length}笔</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('flight')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition ${
            tab === 'flight' ? 'bg-navy-500 text-white card-shadow' : 'bg-white text-navy-500 border border-surface-100 hover:bg-navy-50'
          }`}
        >
          <Plane className="w-4 h-4" /> 机票预订
        </button>
        <button
          onClick={() => setTab('hotel')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition ${
            tab === 'hotel' ? 'bg-navy-500 text-white card-shadow' : 'bg-white text-navy-500 border border-surface-100 hover:bg-navy-50'
          }`}
        >
          <Building2 className="w-4 h-4" /> 酒店预订
        </button>
      </div>

      {tab === 'flight' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl card-shadow p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-surface-300 mb-1">出发地</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 text-surface-300" />
                <input value={flightFrom} onChange={e => setFlightFrom(e.target.value)} placeholder="如：北京"
                  className="w-full border border-surface-200 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 bg-surface-50" />
              </div>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-surface-300 mb-1">目的地</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 text-accent-400" />
                <input value={flightTo} onChange={e => setFlightTo(e.target.value)} placeholder="如：上海"
                  className="w-full border border-surface-200 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-300 bg-surface-50 font-medium" />
              </div>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-surface-300 mb-1">出发日期</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 w-4 h-4 text-surface-300" />
                <input type="date" value={flightDate} onChange={e => setFlightDate(e.target.value)}
                  className="w-full border border-surface-200 rounded-lg pl-8 pr-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-navy-300 bg-surface-50" />
              </div>
            </div>
            <Search className="w-5 h-5 text-surface-300 self-center" />
          </div>

          <div className="space-y-3">
            {filteredFlights.map(f => (
              <div key={f.id} className="bg-white rounded-xl card-shadow p-4 flex items-center justify-between hover:card-shadow-hover transition-shadow">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                    <Plane className="w-6 h-6 text-navy-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy-500">{f.airline} <span className="font-mono text-accent-500 text-sm">{f.flightNo}</span></div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-surface-400">
                      <span className="font-mono">{format(new Date(f.departureTime), 'HH:mm')} <strong className="text-navy-500">{f.departure}</strong></span>
                      <div className="w-16 h-px bg-surface-100 relative">
                        <Plane className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 text-surface-200" />
                      </div>
                      <span className="font-mono"><strong className="text-navy-500">{f.arrival}</strong> {format(new Date(f.arrivalTime), 'HH:mm')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xl font-bold text-accent-400 font-mono">¥{f.price.toLocaleString()}</div>
                    <div className="text-xs text-surface-300">经济舱 · 可退改</div>
                  </div>
                  <button
                    onClick={() => handleBookFlight(f)}
                    disabled={!selectedAppId}
                    className="flex items-center gap-1 px-5 py-2 rounded-lg text-sm font-medium bg-navy-500 text-white hover:bg-navy-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Check className="w-4 h-4" /> 预订
                  </button>
                </div>
              </div>
            ))}
            {filteredFlights.length === 0 && (
              <p className="text-center text-surface-300 py-8">暂无符合条件的航班</p>
            )}
          </div>
        </div>
      )}

      {tab === 'hotel' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl card-shadow p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-surface-300 mb-1">城市</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 text-accent-400" />
                <input value={hotelCity} onChange={e => setHotelCity(e.target.value)} placeholder="如：上海"
                  className="w-full border border-surface-200 rounded-lg pl-8 pr-3 py-2.5 text-sm bg-surface-50 font-medium focus:outline-none focus:ring-2 focus:ring-accent-300" />
              </div>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-surface-300 mb-1">入住日期</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 w-4 h-4 text-surface-300" />
                <input type="date" value={hotelCheckIn} onChange={e => setHotelCheckIn(e.target.value)}
                  className="w-full border border-surface-200 rounded-lg pl-8 pr-3 py-2.5 text-sm font-mono bg-surface-50 focus:outline-none focus:ring-2 focus:ring-navy-300" />
              </div>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-surface-300 mb-1">退房日期</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 w-4 h-4 text-surface-300" />
                <input type="date" value={hotelCheckOut} onChange={e => setHotelCheckOut(e.target.value)}
                  className="w-full border border-surface-200 rounded-lg pl-8 pr-3 py-2.5 text-sm font-mono bg-surface-50 focus:outline-none focus:ring-2 focus:ring-navy-300" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-accent-500 bg-accent-50 px-3 py-2 rounded-lg self-end">
              <CreditCard className="w-3.5 h-3.5" /> 共{calcNights()}晚
            </div>
            <Search className="w-5 h-5 text-surface-300 self-end" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHotels.map(h => (
              <div key={h.id} className="bg-white rounded-xl card-shadow overflow-hidden hover:card-shadow-hover transition-shadow">
                <div className="h-32 bg-gradient-to-br from-navy-300 via-navy-400 to-accent-400 flex items-center justify-center relative">
                  <Building2 className="w-12 h-12 text-white/70" />
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur text-[11px] text-white">{renderStars(h.starRating)}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/90 text-[11px] text-navy-500 font-medium">{h.rating}分</span>
                  </div>
                </div>
                <div className="p-4 space-y-2.5">
                  <h3 className="font-semibold text-navy-500 truncate">{h.hotelName}</h3>
                  <div className="flex items-center justify-between text-xs text-surface-400">
                    <span>{h.roomType}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-surface-50">
                    <div>
                      <span className="text-xl font-bold text-accent-400 font-mono">¥{h.price.toLocaleString()}</span>
                      <span className="text-xs text-surface-300 ml-1">/晚</span>
                      {calcNights() > 1 && (
                        <p className="text-[11px] text-surface-300 mt-0.5">
                          共{calcNights()}晚合计 <strong className="text-navy-500 font-mono">¥{(h.price * calcNights()).toLocaleString()}</strong>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleBookHotel(h)}
                      disabled={!selectedAppId}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-navy-500 text-white hover:bg-navy-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Check className="w-4 h-4" /> 预订
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredHotels.length === 0 && (
            <p className="text-center text-surface-300 py-8">暂无符合条件的酒店</p>
          )}
        </div>
      )}

      {selectedApp && (
        <div className="bg-white rounded-xl card-shadow p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-navy-500 flex items-center gap-2">
              <Check className="w-5 h-5 text-success" /> 预订记录（申请 {selectedApp.id}）
            </h2>
            {selectedApp.bookings.length > 0 && (
              <div className="text-sm">
                <span className="text-surface-300">预订总额：</span>
                <strong className="text-accent-500 font-mono text-lg">¥{bookingTotal.toLocaleString()}</strong>
                <span className="text-surface-300 mx-1">·</span>
                <Link to={`/applications/${selectedApp.id}`} className="text-accent-400 hover:underline text-xs">查看申请详情</Link>
              </div>
            )}
          </div>
          {selectedApp.bookings.length === 0 ? (
            <p className="text-sm text-surface-300 py-4 text-center border border-dashed border-surface-100 rounded-lg">暂无预订，选择上方机票/酒店进行预订</p>
          ) : (
            <div className="space-y-2">
              {selectedApp.bookings.map(b => {
                const d = b.details as any
                const isHotel = b.type === 'hotel'
                const sub = isHotel ? `${d.checkIn} 入住 · ${d.nights}晚 · ¥${d.price.toLocaleString()}/晚` : `${d.airline} ${d.flightNo}`
                const total = isHotel ? d.price * (d.nights || 1) : d.price
                return (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg hover:bg-navy-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isHotel ? 'bg-accent-100 text-accent-500' : 'bg-navy-100 text-navy-500'}`}>
                        {isHotel ? <Building2 className="w-4 h-4" /> : <Plane className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-medium text-navy-500 text-sm">
                          {isHotel ? d.hotelName : `${d.departure} → ${d.arrival}`}
                        </div>
                        <div className="text-xs text-surface-300 mt-0.5 font-mono">{sub}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono font-semibold text-accent-500">¥{total.toLocaleString()}</div>
                        <div className="text-[10px] text-surface-300">{format(new Date(b.bookedAt), 'MM-dd HH:mm')} 预订</div>
                      </div>
                      <span className="px-2.5 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-600 font-medium">已确认</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
