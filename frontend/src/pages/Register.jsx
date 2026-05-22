import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Register = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'member' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/auth/register', formData);
      alert('Registration successful. Please log in.');
      navigate('/login');
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gym-cream flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-md p-6 shadow-md rounded-lg">
        <h1 className="text-2xl font-semibold mb-5 text-center text-gray-800">Create Account</h1>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-1/2 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gym-green"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-1/2 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gym-green"
          />
        </div>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-3 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gym-green"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gym-green"
        />

        {/* Role selection */}
        <p className="text-sm text-gray-600 mb-2">Register as:</p>
        <div className="flex gap-6 mb-5">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.role === 'member'}
              onChange={() => setFormData({ ...formData, role: 'member' })}
              className="accent-gym-green"
            />
            Gym Member
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.role === 'vendor'}
              onChange={() => setFormData({ ...formData, role: 'vendor' })}
              className="accent-gym-green"
            />
            Course Vendor
          </label>
        </div>

        <button type="submit" className="w-full bg-gym-green text-white py-2 rounded text-sm font-medium hover:opacity-90">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
