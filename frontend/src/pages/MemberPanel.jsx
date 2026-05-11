import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const INITIAL_NOTIFICATIONS = [
  { id: 'MSG-001', content: 'Your booking for CLS-101 is confirmed.' },
  { id: 'MSG-002', content: 'Reminder: Power Yoga tomorrow at 7:00 AM.' },
  { id: 'MSG-003', content: 'Class CLS-089 location changed to Studio B.' },
  { id: 'MSG-004', content: 'Monthly membership renewed successfully.' },
  { id: 'MSG-005', content: 'New class added: Dance Cardio on Mar 29.' },
  { id: 'MSG-006', content: "Kevin's Gym will be closed on Apr 1 (holiday)." },
];

const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const MemberPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [membershipStatus] = useState('Active');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [flaggedNotifs, setFlaggedNotifs] = useState(new Set());

  const authHeader = { headers: { Authorization: `Bearer ${user?.token}` } };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/api/auth/profile', authHeader);
        setProfile({ name: res.data.name, email: res.data.email });
      } catch {
        alert('Failed to fetch profile.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  useEffect(() => {
    const fetchBookings = async () => {
      setBookingsLoading(true);
      try {
        const res = await axiosInstance.get('/api/bookings', authHeader);
        setBookings(res.data);
      } catch {
        alert('Failed to fetch bookings.');
      } finally {
        setBookingsLoading(false);
      }
    };
    if (user) fetchBookings();
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axiosInstance.put('/api/auth/profile', profile, authHeader);
      setEditing(false);
    } catch {
      alert('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (selectedBooking === null) return;
    const booking = bookings[selectedBooking];
    try {
      await axiosInstance.delete(`/api/bookings/${booking._id}`, authHeader);
      setBookings(bookings.filter((_, i) => i !== selectedBooking));
      setSelectedBooking(null);
    } catch {
      alert('Failed to cancel booking.');
    }
  };

  const handleReschedule = () => {
    if (selectedBooking === null) return;
    const booking = bookings[selectedBooking];
    navigate(`/class-booking?reschedule=${booking._id}`);
  };

  const [firstName, ...lastParts] = (profile.name || '').split(' ');
  const lastName = lastParts.join(' ');

  const inputClass = 'w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-600';
  const labelClass = 'w-28 flex-shrink-0 px-2 py-1.5 bg-gray-100 border border-gray-300 rounded text-sm text-gray-700';

  if (loading && !profile.name) {
    return <div className="min-h-screen bg-gym-cream flex items-center justify-center text-gray-500 text-sm">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gym-cream">
      {/* Hero */}
      <div className="px-8 py-5 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800">Member Panel</h1>
        <p className="text-sm text-gray-500 mt-1">View your profile, manage booked classes, and check your notifications.</p>
      </div>

      {/* Three-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-8 py-8">

        {/* User Profile */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
            User Profile
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className={labelClass}>First Name</span>
              <input
                type="text"
                value={firstName}
                disabled={!editing}
                onChange={(e) => setProfile({ ...profile, name: `${e.target.value} ${lastName}`.trim() })}
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className={labelClass}>Last Name</span>
              <input
                type="text"
                value={lastName}
                disabled={!editing}
                onChange={(e) => setProfile({ ...profile, name: `${firstName} ${e.target.value}`.trim() })}
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className={labelClass}>Email</span>
              <input
                type="email"
                value={profile.email}
                disabled={!editing}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className={labelClass}>Phone</span>
              <input type="text" placeholder="—" disabled={!editing} className={inputClass} />
            </div>
            <div className="flex items-center gap-2">
              <span className={labelClass}>Member Since</span>
              <input type="text" defaultValue="Jan 2024" disabled className={inputClass} />
            </div>
            <div className="flex items-center gap-2">
              <span className={labelClass}>Membership Status</span>
              <input type="text" value={membershipStatus} disabled className={inputClass} />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-1.5 border border-gray-400 rounded text-sm text-gray-700 hover:bg-gray-50"
              >
                Edit Profile
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !editing}
                className="px-4 py-1.5 border border-gray-400 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Booked Classes */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
            Booked Classes
          </div>
          {bookingsLoading ? (
            <div className="p-4 text-sm text-gray-500">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">Class ID</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">Classroom</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">Time</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr
                    key={b._id}
                    onClick={() => setSelectedBooking(i === selectedBooking ? null : i)}
                    className={`cursor-pointer ${selectedBooking === i ? 'bg-green-50' : i % 2 === 1 ? 'bg-gray-50' : ''} hover:bg-green-50`}
                  >
                    <td className="px-4 py-2 text-gray-600">{b.classId}</td>
                    <td className="px-4 py-2 text-gray-600">{b.classroom}</td>
                    <td className="px-4 py-2 text-gray-600">{formatTime(b.scheduledAt)}</td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-4 text-center text-gray-400 text-sm">No bookings yet</td></tr>
                )}
              </tbody>
            </table>
          )}
          <div className="flex gap-2 p-4 border-t border-gray-200">
            <button
              onClick={handleReschedule}
              disabled={selectedBooking === null}
              className="px-4 py-1.5 border border-gray-400 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Reschedule
            </button>
            <button
              onClick={handleCancelBooking}
              disabled={selectedBooking === null}
              className="px-4 py-1.5 border border-red-400 rounded text-sm text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Cancel Booking
            </button>
            <button
              onClick={() => navigate('/class-booking')}
              className="px-4 py-1.5 border border-green-500 rounded text-sm text-green-600 hover:bg-green-50"
            >
              Browse New Class
            </button>
          </div>
        </div>

        {/* System Notifications */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
            System Notifications
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Message ID</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Content</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((msg, i) => {
                const isSelected = selectedNotif === i;
                const isFlagged = flaggedNotifs.has(i);
                const rowClass = isSelected ? 'bg-blue-50' : isFlagged ? 'bg-yellow-50' : i % 2 === 1 ? 'bg-gray-50' : '';
                return (
                  <tr key={msg.id} onClick={() => setSelectedNotif(i)} className={`cursor-pointer ${rowClass} hover:bg-blue-50`}>
                    <td className={`px-4 py-2 whitespace-nowrap ${isFlagged ? 'font-medium text-yellow-800' : 'text-gray-600'}`}>{msg.id}</td>
                    <td className={`px-4 py-2 ${isFlagged ? 'font-medium text-yellow-800' : 'text-gray-600'}`}>{msg.content}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex justify-between p-4 border-t border-gray-200">
            <button
              onClick={() => {
                if (selectedNotif === null) return;
                setFlaggedNotifs(prev => {
                  const next = new Set(prev);
                  next.has(selectedNotif) ? next.delete(selectedNotif) : next.add(selectedNotif);
                  return next;
                });
              }}
              className="px-4 py-1.5 border border-gray-400 rounded text-sm text-gray-700 hover:bg-gray-50"
            >
              Flag
            </button>
            <button
              onClick={() => {
                if (selectedNotif === null) return;
                setNotifications(prev => prev.filter((_, i) => i !== selectedNotif));
                setFlaggedNotifs(prev => {
                  const next = new Set();
                  prev.forEach(idx => { if (idx < selectedNotif) next.add(idx); else if (idx > selectedNotif) next.add(idx - 1); });
                  return next;
                });
                setSelectedNotif(null);
              }}
              className="px-4 py-1.5 border border-red-400 rounded text-sm text-red-500 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MemberPanel;
