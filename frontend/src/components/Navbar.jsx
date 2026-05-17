import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const homeRoute = user?.role === 'admin' ? '/admin'
    : user?.role === 'vendor' ? '/vendor'
    : user ? '/member'
    : '/';

  return (
    <nav className="bg-gym-green text-white px-8 py-3 flex justify-between items-center">
      <div>
        <Link to={homeRoute} className="text-xl font-bold tracking-wide">Kevin's Gym</Link>
        <p className="text-xs text-green-200 mt-0.5">Family Fitness at Brisbane</p>
      </div>
      <div className="flex items-center gap-6 text-sm">
        {user ? (
          <>
            <a href="mailto:admin@kevinsgym.com" className="hover:text-green-200">Contact Us</a>
            <button onClick={markAllRead} className="relative hover:text-green-200">
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button onClick={handleLogout} className="hover:text-green-200">Log Out</button>
          </>
        ) : (
          <>
            <a href="mailto:admin@kevinsgym.com" className="hover:text-green-200">Contact Us</a>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
