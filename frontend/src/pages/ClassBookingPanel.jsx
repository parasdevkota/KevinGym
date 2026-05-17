import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { getCourseName } from '../utils/courseNames';

const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const ClassBookingPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { search } = useLocation();
  const rescheduleId = new URLSearchParams(search).get('reschedule');

  const [booked, setBooked] = useState([]);
  const [available, setAvailable] = useState([]);
  const [selectedBooked, setSelectedBooked] = useState(null);
  const [selectedAvailable, setSelectedAvailable] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${user?.token}` } };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookingsRes, classesRes] = await Promise.all([
          axiosInstance.get('/api/bookings', authHeader),
          axiosInstance.get('/api/classes', authHeader),
        ]);
        setBooked(bookingsRes.data);
        setAvailable(classesRes.data);
      } catch {
        alert('Failed to load class data.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleBook = async () => {
    if (selectedAvailable === null) return;
    const cls = available[selectedAvailable];
    try {
      const res = await axiosInstance.post('/api/bookings', { gymClassId: cls._id }, authHeader);
      setBooked([...booked, res.data]);
      setAvailable(available.filter((_, i) => i !== selectedAvailable));
      setSelectedAvailable(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book class.');
    }
  };

  const handleCancel = async () => {
    if (selectedBooked === null) return;
    const booking = booked[selectedBooked];
    try {
      await axiosInstance.delete(`/api/bookings/${booking._id}`, authHeader);
      const freed = { ...booking };
      setAvailable([...available, { _id: booking.gymClassId, classId: booking.classId, classroom: booking.classroom, scheduledAt: booking.scheduledAt }]);
      setBooked(booked.filter((_, i) => i !== selectedBooked));
      setSelectedBooked(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const handleReschedule = async () => {
    if (selectedAvailable === null || !rescheduleId) return;
    const cls = available[selectedAvailable];
    try {
      const res = await axiosInstance.put(`/api/bookings/${rescheduleId}`, { newGymClassId: cls._id }, authHeader);
      navigate('/member-panel');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule.');
    }
  };

  const filtered = available.filter(
    (c) =>
      (c.classId || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (c.classroom || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const thClass = 'text-left px-4 py-2 font-semibold text-gray-700';
  const tdClass = 'px-4 py-2 text-gray-600';

  if (loading) {
    return <div className="min-h-screen bg-gym-cream flex items-center justify-center text-gray-500 text-sm">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gym-cream">
      {/* Hero */}
      <div className="px-8 py-5 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800">
          {rescheduleId ? 'Reschedule Class' : 'Class Booking'}
        </h1>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-8 py-8">

        {/* My Booked Classes */}
        {!rescheduleId && (
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-2">My Booked Classes</h2>
            <div className="border-b-2 border-gray-400 mb-3" />
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className={thClass}>Course ID</th>
                  <th className={thClass}>Course Name</th>
                  <th className={thClass}>Classroom</th>
                  <th className={thClass}>Time</th>
                </tr>
              </thead>
              <tbody>
                {booked.map((b, i) => (
                  <tr
                    key={b._id}
                    onClick={() => setSelectedBooked(i === selectedBooked ? null : i)}
                    className={`cursor-pointer ${selectedBooked === i ? 'bg-green-50' : i % 2 === 1 ? 'bg-gray-50' : ''} hover:bg-green-50`}
                  >
                    <td className="px-4 py-2 text-teal-600">{b.classId}</td>
                    <td className="px-4 py-2 text-teal-600">{getCourseName(b.classId, b.name)}</td>
                    <td className={tdClass}>{b.classroom}</td>
                    <td className={tdClass}>{formatTime(b.scheduledAt)}</td>
                  </tr>
                ))}
                {booked.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-4 text-center text-gray-400 text-sm">No bookings yet</td></tr>
                )}
              </tbody>
            </table>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-1.5 border border-gray-400 rounded text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        )}

        {/* Available Classes */}
        <div className={rescheduleId ? 'lg:col-span-2' : ''}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-gray-800">Available Classes</h2>
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-gym-green w-40"
            />
          </div>
          <div className="border-b-2 border-gray-400 mb-3" />
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className={thClass}>Course ID</th>
                <th className={thClass}>Course Name</th>
                <th className={thClass}>Classroom</th>
                <th className={thClass}>Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const origIdx = available.indexOf(c);
                return (
                  <tr
                    key={c._id}
                    onClick={() => setSelectedAvailable(origIdx === selectedAvailable ? null : origIdx)}
                    className={`cursor-pointer ${selectedAvailable === origIdx ? 'bg-green-50' : i % 2 === 1 ? 'bg-gray-50' : ''} hover:bg-green-50`}
                  >
                    <td className="px-4 py-2 text-teal-600">{c.classId}</td>
                    <td className="px-4 py-2 text-teal-600">{getCourseName(c.classId, c.name)}</td>
                    <td className={tdClass}>{c.classroom}</td>
                    <td className={tdClass}>{formatTime(c.scheduledAt)}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-4 text-center text-gray-400 text-sm">No classes available</td></tr>
              )}
            </tbody>
          </table>
          <div className="mt-4">
            {rescheduleId ? (
              <button
                onClick={handleReschedule}
                className="px-5 py-1.5 bg-gym-green text-white rounded text-sm font-medium hover:opacity-90"
              >
                Reschedule
              </button>
            ) : (
              <button
                onClick={handleBook}
                className="px-5 py-1.5 bg-gym-green text-white rounded text-sm font-medium hover:opacity-90"
              >
                Book Class
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClassBookingPanel;
