import { useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { Calendar, Home, Settings, LogOut, User, Menu } from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  const isProvider = user?.role === 'provider';

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    ...(isProvider
      ? [
          { name: 'Services', href: '/services', icon: Settings },
          { name: 'Availability', href: '/availability', icon: Calendar },
          { name: 'Reports', href: '/reports', icon: User },
        ]
      : [{ name: 'Book', href: '/book', icon: Calendar }]),
    { name: 'Appointments', href: '/appointments', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/*---------------- Desktop Sidebar -----------------*/}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-1 bg-white border-r">
          <div className="flex items-center h-16 px-4 border-b">
            <h1 className="text-xl font-bold text-primary-600">BookIt</h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm rounded-lg transition-colors
                    ${isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-medium">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*------------------- Mobile Header --------------------------*/}
      <div className="md:hidden bg-white border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <h1 className="text-lg font-bold text-primary-600">BookIt</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        {mobileMenuOpen && (
          <div className="px-4 pb-4 border-t">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </nav>
          </div>
        )}
      </div>

      {/*------------------ Main Content ---------------------------*/}
      <main className="md:pl-64">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;