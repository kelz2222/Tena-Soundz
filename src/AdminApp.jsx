import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

// Simple shared password for the owner. Change this before going live,
// and consider replacing with Supabase Auth once he wants multiple staff logins.
const ADMIN_PASSWORD = 'tena2026'

function AdminLogin({ onLogin }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('ts_admin', '1')
      onLogin()
    } else {
      setErr('Incorrect password.')
    }
  }

  return (
    <div className="admin-login">
      <div className="display">Tena Soundz</div>
      <p>Admin Dashboard — staff access only</p>
      <form onSubmit={submit}>
        <div className="form-field">
          <input
            type="password"
            className="form-input"
            placeholder="Enter password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
          />
        </div>
        {err && <div style={{ color: '#ff8585', fontSize: '0.82rem', marginBottom: 12 }}>{err}</div>}
        <button className="btn btn-primary btn-block" type="submit">Log In</button>
      </form>
    </div>
  )
}

function StatCard({ num, label }) {
  return (
    <div className="stat-card">
      <div className="stat-num">{num}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function BookingRow({ b, onUpdate }) {
  const updateStatus = async (status) => {
    await supabase.from('bookings').update({ status }).eq('id', b.id)
    onUpdate()
  }
  const togglePaid = async () => {
    await supabase.from('bookings').update({ paid: !b.paid }).eq('id', b.id)
    onUpdate()
  }

  return (
    <div className="booking-row">
      <div className="booking-top">
        <div className="booking-name">{b.guest_name}</div>
        <span className={`badge ${b.status === 'confirmed' ? 'badge-success' : b.status === 'cancelled' ? '' : 'badge-pending'}`}>
          {b.status}
        </span>
      </div>
      <div className="booking-meta">
        {b.room_name} · {b.phone}<br />
        {b.check_in} → {b.check_out} · {b.guests} guest(s)
        {b.purpose ? ` · ${b.purpose}` : ''}<br />
        {b.notes && <>Note: {b.notes}<br /></>}
        {b.paid ? '✓ Paid' : 'Payment pending'}
      </div>
      <div className="booking-actions">
        {b.status !== 'confirmed' && (
          <button className="mini-btn mini-btn-confirm" onClick={() => updateStatus('confirmed')}>Confirm</button>
        )}
        {b.status !== 'cancelled' && (
          <button className="mini-btn mini-btn-cancel" onClick={() => updateStatus('cancelled')}>Cancel</button>
        )}
        <button className="mini-btn mini-btn-paid" onClick={togglePaid}>
          {b.paid ? 'Mark Unpaid' : 'Mark Paid'}
        </button>
      </div>
    </div>
  )
}

function Dashboard({ onLogout }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
    setBookings(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const channel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const filtered = bookings.filter((b) => {
    if (filter === 'all') return true
    if (filter === 'rooms') return b.booking_type === 'room'
    if (filter === 'hall') return b.booking_type === 'hall'
    return b.status === filter
  })

  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length
  const unpaidCount = bookings.filter((b) => !b.paid && b.status !== 'cancelled').length

  return (
    <div className="app-shell" style={{ paddingBottom: 30 }}>
      <div className="admin-bar">
        <div className="display">Tena Soundz Admin</div>
        <button className="logout-btn" onClick={onLogout}>Log Out</button>
      </div>

      <div className="stat-row">
        <StatCard num={pendingCount} label="Pending" />
        <StatCard num={confirmedCount} label="Confirmed" />
        <StatCard num={unpaidCount} label="Unpaid" />
      </div>

      <div className="filter-chips">
        {['all', 'pending', 'confirmed', 'rooms', 'hall', 'cancelled'].map((f) => (
          <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ paddingTop: 8 }}>
        {loading ? (
          <div className="loading-spin">Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No bookings here yet.</div>
        ) : (
          filtered.map((b) => <BookingRow key={b.id} b={b} onUpdate={load} />)
        )}
      </div>
    </div>
  )
}

export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(sessionStorage.getItem('ts_admin') === '1')

  if (!loggedIn) return <AdminLogin onLogin={() => setLoggedIn(true)} />
  return <Dashboard onLogout={() => { sessionStorage.removeItem('ts_admin'); setLoggedIn(false) }} />
}
