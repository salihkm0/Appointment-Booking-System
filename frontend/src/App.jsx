import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes';
import { getMe } from './redux/slices/authSlice';
import { getServices } from './redux/slices/serviceSlice';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          await dispatch(getMe()).unwrap();
        }
        
        await dispatch(getServices());
      } catch (error) {
        console.error('App initialization error:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <AppRoutes />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </>
  );
}

export default App;