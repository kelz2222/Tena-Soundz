import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import AdminApp from './AdminApp'
import {
  IconBed, IconGlass, IconHall, IconClock, IconFork, IconShield,
  IconPhone, IconWhatsapp, IconInstagram, IconFacebook, IconCheck
} from './Icons'

const PHONE = '0243563726'
const PHONE_DISPLAY = '024 356 3726'
const WHATSAPP = '233243563726'
const HERO_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop'

const ROOMS = [
  {
    id: 'standard',
    name: 'Standard Room',
    price: 250,
    desc: 'Comfortable queen bed, fan, en-suite bathroom — perfect for a quiet overnight stay.',
    img: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'executive',
    name: 'Executive Room',
    price: 400,
    desc: 'Air-conditioned room with a king bed, work desk, and flat-screen TV.',
    img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'deluxe',
    name: 'Deluxe Suite',
    price: 600,
    desc: 'Spacious suite with a sitting area, AC, mini fridge — ideal for longer stays or guests of honour.',
    img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop',
  },
]

const SERVICES = [
  { icon: <IconBed />, name: 'Accommodation', sub: 'View rooms & rates' },
  { icon: <IconGlass />, name: 'Bar & Restaurant', sub: 'Digital menu & ordering' },
  { icon: <IconHall />, name: 'Conference Hall', sub: 'Book for events' },
  { icon: <IconClock />, name: '24Hrs Service', sub: 'Contact reception' },
  { icon: <IconFork />, name: 'Dining Hall', sub: 'Breakfast & meals' },
  { icon: <IconShield />, name: 'Safe & Secured', sub: 'CCTV monitored parking' },
]

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="toast">
      <IconCheck /> &nbsp;{message}
    </div>
  )
}

function Header({ tab, setTab }) {
  return (
    <div className="header">
      <div className="header-row">
        <div className="logo-mark">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M3 13L12 5L21 13" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 21V13M17 21V13" stroke="white" strokeWidth="2.4" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="brand-block">
          <div className="brand-name">Tena Soundz</div>
          <div className="brand-tag">Guest House</div>
          <div className="brand-loc">Awaso, Western North</div>
        </div>
      </div>
      <div className="tabbar" style={{ marginTop: 18, borderRadius: 12, overflow: 'hidden' }}>
        {['home', 'rooms', 'hall', 'mybooking'].map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'home' ? 'Home' : t === 'rooms' ? 'Rooms' : t === 'hall' ? 'Hall' : 'Find Booking'}
          </button>
        ))}
      </div>
    </div>
  )
}

function HomeView({ setTab }) {
  return (
    <>
      <div className="hero" style={{ backgroundImage: `url(${HERO_IMG})` }}>
        <div className="hero-cta">
          <button className="btn btn-primary" onClick={() => setTab('rooms')}>Book a Room</button>
          <button className="btn btn-ghost" onClick={() => setTab('hall')}>Reserve a Hall</button>
        </div>
      </div>
      <div className="section">
        <div className="section-title">Services</div>
        <div className="section-sub">Everything you need, under one roof.</div>
      </div>
      <div className="services-grid">
        {SERVICES.map((s) => (
          <div className="service-card" key={s.name}>
            <div className="service-icon">{s.icon}</div>
            <div className="service-name">{s.name}</div>
            <div className="service-sub">{s.sub}</div>
          </div>
        ))}
      </div>
    </>
  )
}

function RoomsView({ onSelectRoom }) {
  return (
    <div style={{ paddingTop: 22 }}>
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="section-title">Accommodation</div>
        <div className="section-sub">Pick a room, then choose your dates.</div>
      </div>
      {ROOMS.map((r) => (
        <div className="room-card" key={r.id}>
          <img className="room-img" src={r.img} alt={r.name} />
          <div className="room-body">
            <div className="room-top">
              <div className="room-name">{r.name}</div>
              <div className="room-price">GHS {r.price}<br /><small>per night</small></div>
            </div>
            <div className="room-desc">{r.desc}</div>
            <button className="btn btn-primary btn-block" onClick={() => onSelectRoom(r)}>
              Book This Room
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function BookingForm({ bookingType, room, onCancel, onSuccess }) {
  const [form, setForm] = useState({
    name: '', phone: '', checkin: '', checkout: '', guests: 1,
    eventDate: '', headcount: '', purpose: '', notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Please enter your name and phone number.')
      return
    }
    if (bookingType === 'room' && (!form.checkin || !form.checkout)) {
      setError('Please select check-in and check-out dates.')
      return
    }
    if (bookingType === 'hall' && !form.eventDate) {
      setError('Please select an event date.')
      return
    }

    setSubmitting(true)
    const payload = {
      booking_type: bookingType,
      room_name: bookingType === 'room' ? room.name : 'Conference / Event Hall',
      guest_name: form.name.trim(),
      phone: form.phone.trim(),
      check_in: bookingType === 'room' ? form.checkin : form.eventDate,
      check_out: bookingType === 'room' ? form.checkout : form.eventDate,
      guests: bookingType === 'room' ? Number(form.guests) || 1 : Number(form.headcount) || 1,
      purpose: bookingType === 'hall' ? form.purpose : null,
      notes: form.notes || null,
      status: 'pending',
      paid: false,
    }

    const { data, error: dbError } = await supabase
      .from('bookings')
      .insert([payload])
      .select()
      .single()

    setSubmitting(false)

    if (dbError) {
      setError('Something went wrong sending your booking. Please try again or WhatsApp us directly.')
      console.error(dbError)
      return
    }

    onSuccess(data)
  }

  return (
    <div style={{ padding: '22px 20px' }}>
      <div className="section-title">
        {bookingType === 'room' ? `Book ${room?.name}` : 'Reserve the Hall'}
      </div>
      <div className="section-sub">
        {bookingType === 'room'
          ? 'Fill in your details — we will confirm by phone or WhatsApp.'
          : 'For conferences, dining hall, weddings & events.'}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">Full Name</label>
          <input className="form-input" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Kofi Mensah" />
        </div>
        <div className="form-field">
          <label className="form-label">Phone Number</label>
          <input className="form-input" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="024 xxx xxxx" />
        </div>

        {bookingType === 'room' ? (
          <>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Check-in</label>
                <input type="date" className="form-input" value={form.checkin} onChange={(e) => update('checkin', e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label">Check-out</label>
                <input type="date" className="form-input" value={form.checkout} onChange={(e) => update('checkout', e.target.value)} />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Number of Guests</label>
              <input type="number" min="1" className="form-input" value={form.guests} onChange={(e) => update('guests', e.target.value)} />
            </div>
          </>
        ) : (
          <>
            <div className="form-field">
              <label className="form-label">Event Date</label>
              <input type="date" className="form-input" value={form.eventDate} onChange={(e) => update('eventDate', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Expected Headcount</label>
                <input type="number" min="1" className="form-input" value={form.headcount} onChange={(e) => update('headcount', e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label">Purpose</label>
                <select className="form-select" value={form.purpose} onChange={(e) => update('purpose', e.target.value)}>
                  <option value="">Select</option>
                  <option>Conference</option>
                  <option>Wedding</option>
                  <option>Funeral</option>
                  <option>Birthday / Party</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div className="form-field">
          <label className="form-label">Notes (optional)</label>
          <textarea className="form-textarea" rows="3" value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Any special request..." />
        </div>

        {error && <div style={{ color: '#D8302B', fontSize: '0.82rem', marginBottom: 12, fontWeight: 600 }}>{error}</div>}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Sending...' : 'Submit Booking Request'}
        </button>
        <button type="button" className="btn btn-outline btn-block" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </div>
  )
}

function FindBookingView() {
  const [phone, setPhone] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const search = async () => {
    if (!phone.trim()) return
    setLoading(true)
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('phone', phone.trim())
      .order('created_at', { ascending: false })
    setResults(data || [])
    setLoading(false)
  }

  return (
    <div style={{ padding: '22px 20px' }}>
      <div className="section-title">Find Your Booking</div>
      <div className="section-sub">Enter the phone number you booked with.</div>
      <div className="form-field" style={{ display: 'flex', gap: 8 }}>
        <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="024 xxx xxxx" />
        <button className="btn btn-primary" style={{ flex: '0 0 auto', padding: '12px 18px' }} onClick={search}>
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {results && results.length === 0 && (
        <div className="empty-state">No bookings found for that number.</div>
      )}

      {results && results.map((b) => (
        <div className="booking-row" key={b.id}>
          <div className="booking-top">
            <div className="booking-name">{b.room_name}</div>
            <span className={`badge ${b.status === 'confirmed' ? 'badge-success' : 'badge-pending'}`}>
              {b.status}
            </span>
          </div>
          <div className="booking-meta">
            {b.check_in} → {b.check_out} · {b.guests} guest(s)<br />
            {b.paid ? 'Payment received' : 'Payment pending'}
          </div>
        </div>
      ))}
    </div>
  )
}

function ContactBar() {
  return (
    <div className="contact-bar">
      <a className="contact-phone" href={`tel:${PHONE}`}>
        <IconPhone /> {PHONE_DISPLAY}
      </a>
      <div className="contact-icons">
        <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"><IconWhatsapp /></a>
        <a href="https://instagram.com" target="_blank" rel="noreferrer"><IconInstagram /></a>
        <a href="https://facebook.com" target="_blank" rel="noreferrer"><IconFacebook /></a>
      </div>
    </div>
  )
}

function GuestApp() {
  const [tab, setTab] = useState('home')
  const [bookingType, setBookingType] = useState(null) // 'room' | 'hall' | null
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [toast, setToast] = useState(null)

  const handleSelectRoom = (room) => {
    setSelectedRoom(room)
    setBookingType('room')
  }

  const handleSuccess = () => {
    setBookingType(null)
    setSelectedRoom(null)
    setTab('home')
    setToast('Booking sent! We will confirm by phone or WhatsApp shortly.')
  }

  return (
    <div className="app-shell">
      <Header tab={tab} setTab={(t) => { setTab(t); setBookingType(null) }} />

      {bookingType ? (
        <BookingForm
          bookingType={bookingType}
          room={selectedRoom}
          onCancel={() => setBookingType(null)}
          onSuccess={handleSuccess}
        />
      ) : tab === 'home' ? (
        <HomeView setTab={setTab} />
      ) : tab === 'rooms' ? (
        <RoomsView onSelectRoom={handleSelectRoom} />
      ) : tab === 'hall' ? (
        <div style={{ padding: '22px 20px' }}>
          <div className="section-title">Conference & Event Hall</div>
          <div className="section-sub">Book the hall for conferences, weddings, funerals, parties and dining.</div>
          <button className="btn btn-primary btn-block" onClick={() => setBookingType('hall')}>
            Reserve the Hall
          </button>
        </div>
      ) : (
        <FindBookingView />
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      <ContactBar />
    </div>
  )
}

export default function App() {
  const isAdmin = window.location.pathname.startsWith('/admin')
  return isAdmin ? <AdminApp /> : <GuestApp />
}
