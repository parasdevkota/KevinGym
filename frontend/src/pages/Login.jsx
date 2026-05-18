import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      const { role } = response.data;
      if (role === 'admin') navigate('/admin');
      else if (role === 'vendor') navigate('/vendor');
      else navigate('/member');
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gym-cream">
      {/* Auth card */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">

          {/* Illustration */}
          <div className="bg-gym-tan">
            <img src="/gym-illustration.png" alt="Kevin's Gym" className="w-full h-auto object-contain" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5">
            <input
              type="email"
              placeholder="User Email"
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

            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="px-5 py-2 border border-gray-800 rounded text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Register
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-gym-green text-white rounded text-sm font-medium hover:opacity-90"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  disabled
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-sm text-gray-600 opacity-60 cursor-not-allowed"
                  title="Google sign-in not yet implemented"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input type="checkbox" className="accent-gym-green" />
              Remember me
            </label>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
