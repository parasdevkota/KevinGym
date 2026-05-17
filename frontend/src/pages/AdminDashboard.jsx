import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const ROLE_LABELS = { member: 'Member', admin: 'Admin', vendor: 'Vendor' };

const AdminDashboard = () => {
  const { user } = useAuth();
  const authHeader = { headers: { Authorization: `Bearer ${user?.token}` } };

  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null); // user being edited
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', role: 'member' });

  const [notifications, setNotifications] = useState([]);
  const [showNotifForm, setShowNotifForm] = useState(false);
  const [notifForm, setNotifForm] = useState({ message: '', target: 'members' });
  const [selectedNotif, setSelectedNotif] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/users', authHeader);
      setUsers(res.data);
    } catch {
      alert('Failed to load users.');
    }
  };

  useEffect(() => { if (user) fetchUsers(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get('/api/notifications', authHeader);
      setNotifications(res.data);
    } catch {
      alert('Failed to load notifications.');
    }
  };

  useEffect(() => { if (user) fetchNotifications(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    try {
      const res = await axiosInstance.post('/api/admin/users', form, authHeader);
      setUsers([...users, res.data]);
      setForm({ firstName: '', lastName: '', email: '', role: 'member' });
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to create user.');
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    try {
      const name = `${form.firstName} ${form.lastName}`.trim();
      const res = await axiosInstance.put(`/api/admin/users/${selected._id}`, { name, email: form.email, role: form.role }, authHeader);
      setUsers(users.map(u => u._id === selected._id ? { ...u, ...res.data } : u));
      setSelected(null);
      setForm({ firstName: '', lastName: '', email: '', role: 'member' });
    } catch {
      alert('Failed to update user.');
    }
  };

  const handleSelectForEdit = (u) => {
    const [firstName, ...rest] = (u.name || '').split(' ');
    setSelected(u);
    setForm({ firstName, lastName: rest.join(' '), email: u.email, role: u.role });
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/admin/users/${id}`, authHeader);
      setUsers(users.filter(u => u._id !== id));
      if (selected?._id === id) { setSelected(null); setForm({ firstName: '', lastName: '', email: '', role: 'member' }); }
    } catch {
      alert('Failed to delete user.');
    }
  };

  const inputClass = 'w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:border-gym-green';
  const cardHeader = 'bg-gray-100 border-b border-gray-300 px-4 py-2 text-sm font-medium text-gray-700';

  return (
    <div className="min-h-screen bg-gym-cream">
      {/* Hero */}
      <div className="px-8 py-5 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800">Administrator Panel</h1>
      </div>

      {/* Three-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-8 py-8">

        {/* Add / Edit User */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className={cardHeader}>{selected ? 'Edit User' : 'Add a New User'}</div>
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="First Name"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className={inputClass}
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className={inputClass}
            >
              <option value="member">Member</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
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

        {/* Existing Users */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className={cardHeader}>Existing Users</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Name</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Email</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u._id}
                  onClick={() => handleSelectForEdit(u)}
                  className={`cursor-pointer ${selected?._id === u._id ? 'bg-green-50' : i % 2 === 1 ? 'bg-gray-50' : ''} hover:bg-green-50`}
                >
                  <td className="px-4 py-2 text-gray-600">{u.name}</td>
                  <td className="px-4 py-2 text-gray-600">{u.email}</td>
                  <td className="px-4 py-2 text-gray-600">{ROLE_LABELS[u.role] ?? u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-2 p-4 border-t border-gray-200">
            <button
              onClick={() => selected && handleSelectForEdit(selected)}
              className="px-4 py-1.5 border border-gray-400 rounded text-sm text-gray-700 hover:bg-gray-50"
            >
              Update
            </button>
            <button
              onClick={() => selected && handleDelete(selected._id)}
              className="px-4 py-1.5 border border-red-400 rounded text-sm text-red-500 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>

        {/* System Notifications */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className={cardHeader}>System Notifications</div>

          {showNotifForm ? (
            <div className="p-4 space-y-3">
              <textarea
                rows={3}
                placeholder="Notification message"
                value={notifForm.message}
                onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:border-gym-green resize-none"
              />
              <select
                value={notifForm.target}
                onChange={(e) => setNotifForm({ ...notifForm, target: e.target.value })}
                className={inputClass}
              >
                <option value="members">Members</option>
                <option value="vendors">Vendors</option>
                <option value="all">All</option>
              </select>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={async () => {
                    if (!notifForm.message.trim()) return;
                    try {
                      const res = await axiosInstance.post('/api/notifications', {
                        message: `[To: ${notifForm.target}] ${notifForm.message.trim()}`,
                        target: notifForm.target,
                      }, authHeader);
                      setNotifications([res.data, ...notifications]);
                      setNotifForm({ message: '', target: 'members' });
                      setShowNotifForm(false);
                    } catch {
                      alert('Failed to send notification.');
                    }
                  }}
                  className="px-4 py-1.5 border border-gray-400 rounded text-sm text-gray-700 hover:bg-gray-50"
                >
                  Send
                </button>
                <button
                  onClick={() => { setShowNotifForm(false); setNotifForm({ message: '', target: 'members' }); }}
                  className="px-4 py-1.5 border border-gray-300 rounded text-sm text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">Message</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n, i) => (
                  <tr
                    key={n._id}
                    onClick={() => setSelectedNotif(n._id === selectedNotif ? null : n._id)}
                    className={`cursor-pointer ${selectedNotif === n._id ? 'bg-green-50' : i % 2 === 1 ? 'bg-gray-50' : ''} hover:bg-green-50`}
                  >
                    <td className="px-4 py-2 text-gray-600">{n.message}</td>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{formatDate(n.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!showNotifForm && (
            <div className="flex justify-between p-4 border-t border-gray-200">
              <button
                onClick={() => setShowNotifForm(true)}
                className="px-4 py-1.5 border border-gray-400 rounded text-sm text-gray-700 hover:bg-gray-50"
              >
                Create
              </button>
              <button
                onClick={async () => {
                  if (!selectedNotif) return;
                  try {
                    await axiosInstance.delete(`/api/notifications/${selectedNotif}`, authHeader);
                    setNotifications(notifications.filter(n => n._id !== selectedNotif));
                    setSelectedNotif(null);
                  } catch {
                    alert('Failed to delete notification.');
                  }
                }}
                className="px-4 py-1.5 border border-red-400 rounded text-sm text-red-500 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
