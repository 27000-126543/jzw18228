import { useState } from 'react'
import { useStore } from '@/store'
import { Plane, Building2, Star, Search, Check, Calendar, MapPin } from 'lucide-react'
import { format } from 'date-fns'

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
  const mockFlights = useStore(s => s.mockFlights)
  const mockHotels = useStore(s => s.mockHotels)
  const addBooking = useStore(s => s.addBooking)

  const approvedApps = applications.filter(a => a.status === 'approved' && a.bookings.length === 0)
  const selectedApp = applications.find(a => a.id === selectedAppId)

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

  const handleBookHotel = (hotel: typeof mockHotels[0]) => {
    if (!selectedAppId) return
    const nights = hotelCheckIn && hotelCheckOut
      ? Math.max(1, Math.round((new Date(hotelCheckOut).getTime() - new Date(hotelCheckIn).getTime()) / 86400000))
      : 1
    addBooking({
      type: 'hotel',
      applicationId: selectedAppId,
      details: {
        hotelName: hotel.hotelName,
        roomType: hotel.roomType,
        checkIn: hotelCheckIn || '2025-07-15',
        checkOut: hotelCheckOut || '2025-07-18',
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
        <h1 className="text-2xl font-bold text-gray-900">预订中心</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">关联出差申请</label>
        <select
          value={selectedAppId}
          onChange={e => setSelectedAppId(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
        >
          <option value="">请选择已审批的出差申请</option>
          {approvedApps.map(a => (
            <option key={a.id} value={a.id}>
              {a.id} - {a.applicantName} | {a.destination} | {a.purpose.slice(0, 12)}...
            </option>
          ))}
        </select>
        {!selectedAppId && (
          <p className="mt-1 text-xs text-amber-600">请先选择出差申请再进行预订</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('flight')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition ${
            tab === 'flight' ? 'bg-navy-500 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
          }`}
        >
          <Plane className="w-4 h-4" /> 机票预订
        </button>
        <button
          onClick={() => setTab('hotel')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition ${
            tab === 'hotel' ? 'bg-navy-500 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
          }`}
        >
          <Building2 className="w-4 h-4" /> 酒店预订
        </button>
      </div>

      {tab === 'flight' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-gray-500 mb-1">出发地</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                <input value={flightFrom} onChange={e => setFlightFrom(e.target.value)} placeholder="如：北京"
                  className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
              </div>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-gray-500 mb-1">目的地</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                <input value={flightTo} onChange={e => setFlightTo(e.target.value)} placeholder="如：上海"
                  className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
              </div>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-gray-500 mb-1">出发日期</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                <input type="date" value={flightDate} onChange={e => setFlightDate(e.target.value)}
                  className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
              </div>
            </div>
            <Search className="w-5 h-5 text-gray-400 self-center" />
          </div>

          <div className="space-y-3">
            {filteredFlights.map(f => (
              <div key={f.id} className="bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between hover:shadow-md transition">
                <div className="flex items-center gap-6">
                  <Plane className="w-8 h-8 text-navy-500" />
                  <div>
                    <div className="font-semibold text-gray-900">{f.airline} {f.flightNo}</div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{f.departure} {format(new Date(f.departureTime), 'HH:mm')}</span>
                      <span className="text-gray-300">→</span>
                      <span>{f.arrival} {format(new Date(f.arrivalTime), 'HH:mm')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-accent-400">¥{f.price}</div>
                    <div className="text-xs text-gray-400">经济舱</div>
                  </div>
                  <button
                    onClick={() => handleBookFlight(f)}
                    disabled={!selectedAppId}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-navy-500 text-white hover:bg-navy-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <Check className="w-4 h-4" /> 预订
                  </button>
                </div>
              </div>
            ))}
            {filteredFlights.length === 0 && (
              <p className="text-center text-gray-400 py-8">暂无符合条件的航班</p>
            )}
          </div>
        </div>
      )}

      {tab === 'hotel' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-gray-500 mb-1">城市</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                <input value={hotelCity} onChange={e => setHotelCity(e.target.value)} placeholder="如：上海"
                  className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
              </div>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-gray-500 mb-1">入住日期</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                <input type="date" value={hotelCheckIn} onChange={e => setHotelCheckIn(e.target.value)}
                  className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
              </div>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-gray-500 mb-1">退房日期</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                <input type="date" value={hotelCheckOut} onChange={e => setHotelCheckOut(e.target.value)}
                  className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
              </div>
            </div>
            <Search className="w-5 h-5 text-gray-400 self-center" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHotels.map(h => (
              <div key={h.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
                <div className="h-32 bg-gradient-to-br from-navy-100 to-accent-100 flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-navy-400" />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">{h.hotelName}</h3>
                    <div className="flex">{renderStars(h.starRating)}</div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{h.roomType}</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />{h.rating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-lg font-bold text-accent-400">¥{h.price}</span>
                      <span className="text-xs text-gray-400">/晚</span>
                    </div>
                    <button
                      onClick={() => handleBookHotel(h)}
                      disabled={!selectedAppId}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-navy-500 text-white hover:bg-navy-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <Check className="w-4 h-4" /> 预订
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredHotels.length === 0 && (
            <p className="text-center text-gray-400 py-8">暂无符合条件的酒店</p>
          )}
        </div>
      )}

      {selectedApp && selectedApp.bookings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" /> 预订记录
          </h2>
          {selectedApp.bookings.map(b => (
            <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
              <div className="flex items-center gap-3">
                {b.type === 'flight' ? (
                  <Plane className="w-5 h-5 text-navy-500" />
                ) : (
                  <Building2 className="w-5 h-5 text-navy-500" />
                )}
                <div>
                  <div className="font-medium text-gray-800">
                    {b.type === 'flight'
                      ? `${(b.details as any).airline} ${(b.details as any).flightNo}  ${(b.details as any).departure}→${(b.details as any).arrival}`
                      : `${(b.details as any).hotelName}  ${(b.details as any).roomType}`}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {format(new Date(b.bookedAt), 'yyyy-MM-dd HH:mm')} 预订
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent-400 font-semibold">¥{(b.details as any).price}</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">已确认</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
