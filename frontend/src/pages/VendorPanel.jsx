import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const PUBLISHED_COURSES = [
  { course: 'Power Yoga',         schedule: 'Mon / Wed', time: '7:00 AM'  },
  { course: 'Stretch & Restore',  schedule: 'Tue / Thu', time: '1:00 PM'  },
  { course: 'Vinyasa Flow',       schedule: 'Wed / Fri', time: '9:00 AM'  },
  { course: 'Morning Meditation', schedule: 'Daily',     time: '6:30 AM'  },
  { course: 'Core & Balance',     schedule: 'Mon / Fri', time: '11:00 AM' },
  { course: 'Hot Yoga Basics',    schedule: 'Sat',       time: '8:00 AM'  },
];

const INITIAL_NOTIFICATIONS = [
  { datetime: 'Mar 23 · 9:00 AM',  content: 'Power Yoga booking confirmed: Sarah Mitchell' },
  { datetime: 'Mar 23 · 11:30 AM', content: 'Class cancelled by member: James Thornton'   },
  { datetime: 'Mar 22 · 2:00 PM',  content: 'New review posted for Vinyasa Flow'          },
  { datetime: 'Mar 22 · 4:15 PM',  content: 'Schedule conflict flagged: Wed 9:00 AM'      },
  { datetime: 'Mar 21 · 10:00 AM', content: 'Admin approved: Morning Meditation listing'  },
  { datetime: 'Mar 20 · 3:00 PM',  content: 'Payout processed: $340.00'                   },
];

const STUDIOS = ['Happy Yoga Studio', 'Studio A', 'Studio B', 'Spin Room', 'Yoga Loft'];

const VendorPanel = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ course: '', date: '', time: '', description: '', studio: STUDIOS[0] });
  const [courses, setCourses] = useState(PUBLISHED_COURSES);
  const [selected, setSelected] = useState(null);

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [flaggedNotifs, setFlaggedNotifs] = useState(new Set());

  useEffect(() => {
    axiosInstance.get('/api/notifications?target=vendors', {
      headers: { Authorization: `Bearer ${user?.token}` },
    }).then(res => {
      const fetched = res.data.map(n => ({
        datetime: new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
          ' · ' + new Date(n.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        content: n.message,
      }));
      setNotifications(fetched);
    }).catch(() => {});
  }, [user]);

  const handleCreate = async () => {
    if (!form.course || !form.date) return;
    try {
      await axiosInstance.post('/api/courses', {
        name: form.course,
        schedule: form.date,
        time: form.time,
        description: form.description,
        studio: form.studio,
      }, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setCourses([...courses, { course: form.course, schedule: form.date, time: form.time || '—' }]);
      setForm({ course: '', date: '', time: '', description: '', studio: STUDIOS[0] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create course.');
    }
  };

  const handleSave = () => {
    if (selected === null) return;
    setCourses(courses.map((c, i) => i === selected ? { ...c, course: form.course, schedule: form.date, time: form.time, description: form.description, studio: form.studio } : c));
    setSelected(null);
    setForm({ course: '', date: '', time: '', description: '', studio: STUDIOS[0] });
  };

  const handleSelectForEdit = (i) => {
    setSelected(i);
    setForm({ course: courses[i].course, date: courses[i].schedule, time: courses[i].time, description: courses[i].description || '', studio: courses[i].studio || STUDIOS[0] });
  };

  const handleDelete = () => {
    if (selected === null || selected === undefined) return;
    setCourses(courses.filter((_, i) => i !== selected));
    setSelected(null);
    setForm({ course: '', date: '', time: '', description: '', studio: STUDIOS[0] });
  };

  const inputClass = 'w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:border-gym-green';
  const cardHeader = 'bg-gray-100 border-b border-gray-300 px-4 py-2 text-sm font-medium text-gray-700';

  return (
    <div className="min-h-screen bg-gym-cream">
      {/* Hero */}
      <div className="px-8 py-5 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800">Course Vendor Panel</h1>
      </div>

      {/* Three-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-8 py-8">

        {/* Add / Edit Course */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className={cardHeader}>Gym Course</div>
          <div className="p-4 space-y-3">
            <input
              type="text"
              placeholder="Course Name"
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
              className={inputClass}
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Date (e.g. Mon / Wed)"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Time (e.g. 7:00 AM)"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className={inputClass}
              />
            </div>
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className={`${inputClass} resize-none`}
            />
            <p className="text-sm text-gray-600 -mb-1">Venue:</p>
            <select
              value={form.studio}
              onChange={(e) => setForm({ ...form, studio: e.target.value })}
              className={inputClass}
            >
              {STUDIOS.map(s => <option key={s}>{s}</option>)}
            </select>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleCreate}
                className="px-4 py-1.5 border border-gray-400 rounded text-sm text-gray-700 hover:bg-gray-50"
              >
                Create
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 border border-gray-400 rounded text-sm text-gray-700 hover:bg-gray-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* My Published Courses */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className={cardHeader}>My Published Courses</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Course</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Schedule</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Time</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c, i) => (
                <tr
                  key={i}
                  onClick={() => setSelected(i === selected ? null : i)}
                  className={`cursor-pointer ${selected === i ? 'bg-orange-100' : i % 2 === 1 ? 'bg-gray-50' : ''} hover:bg-orange-50`}
                >
                  <td className="px-4 py-2 text-gray-600">{c.course}</td>
                  <td className="px-4 py-2 text-gray-600">{c.schedule}</td>
                  <td className="px-4 py-2 text-gray-600">{c.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-2 p-4 border-t border-gray-200">
            <button
              onClick={() => selected !== null && handleSelectForEdit(selected)}
              className="px-4 py-1.5 border border-gray-400 rounded text-sm text-gray-700 hover:bg-gray-50"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-1.5 border border-red-400 rounded text-sm text-red-500 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>

        {/* System Notifications */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className={cardHeader}>System Notifications</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Datetime</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Content</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n, i) => {
                const isSelected = selectedNotif === i;
                const isFlagged = flaggedNotifs.has(i);
                const rowClass = isSelected ? 'bg-orange-100' : i % 2 === 1 ? 'bg-gray-50' : '';
                return (
                  <tr key={i} onClick={() => setSelectedNotif(i)} className={`cursor-pointer ${rowClass} hover:bg-orange-50`}>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-600">{n.datetime}</td>
                    <td className="px-4 py-2 text-gray-600">
                      <span className="flex items-center justify-between">
                        <span>{n.content}</span>
                        {isFlagged && <span className="text-red-500 text-xs ml-2">🚩</span>}
                      </span>
                    </td>
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

export default VendorPanel;
