import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getUserDashboard, 
  getProviderDashboard,
  selectCurrentDashboard,
  selectDashboardStats,
  selectRecentAppointments,
  selectUpcomingAppointments
} from '../redux/slices/dashboardSlice';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Calendar, 
  Users, 
  DollarSign,  
  CheckCircle, 
  XCircle,
  Plus,
  FileText,
  Target,
  Percent
} from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { data: dashboardData, loading, isProvider } = useSelector(selectCurrentDashboard);
  const stats = useSelector(selectDashboardStats);
  const recentAppointments = useSelector(selectRecentAppointments);
  const upcomingAppointments = useSelector(selectUpcomingAppointments);

  useEffect(() => {
    if (user) {
      if (user.role === 'provider') {
        dispatch(getProviderDashboard());
      } else {
        dispatch(getUserDashboard());
      }
    }
  }, [dispatch, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-800 mb-2">No dashboard data available</h2>
        <p className="text-gray-600">Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name || 'User'}!
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {isProvider ? 'Service Provider' : 'User'} Dashboard Overview
          </p>
        </div>
        
        {!isProvider && (
          <a href="/book">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </a>
        )}
      </div>

      {/*--------------------------- Stats Grid ---------------------------------------*/}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isProvider ? (
          //!---------------------- Provider Stats --------------------------
          <>
            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats?.today || 0}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ${stats?.totalRevenue?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats?.completionRate || 0}%
                  </p>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active Clients</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats?.activeClients || 0}
                  </p>
                </div>
              </div>
            </Card>
          </>
        ) : (
          //!------------------ User Stats -------------------
          <>
            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats?.today || 0}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats?.completed || 0}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats?.cancelled || 0}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Percent className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Cancellation Rate</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats?.cancellationRate || 0}%
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/*-------------------------- Detailed Stats Card -------------------------------*/}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Detailed Statistics
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{stats?.total || 0}</p>
            <p className="text-sm text-gray-600">Total Appointments</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats?.upcoming || 0}</p>
            <p className="text-sm text-gray-600">Upcoming</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats?.booked || 0}</p>
            <p className="text-sm text-gray-600">Currently Booked</p>
          </div>
          
        </div>
      </Card>

      {/*------------------------ Quick Actions -------------------*/}
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isProvider ? (
            //!-------------------- Provider Actions ------------------------------
            <>
              <a 
                href="/services" 
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Manage Services</h3>
                    <p className="text-sm text-gray-600">Add or edit services</p>
                  </div>
                </div>
              </a>
              
              <a 
                href="/availability" 
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Set Availability</h3>
                    <p className="text-sm text-gray-600">Set working hours</p>
                  </div>
                </div>
              </a>
              
              <a 
                href="/appointments" 
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">View Appointments</h3>
                    <p className="text-sm text-gray-600">Manage bookings</p>
                  </div>
                </div>
              </a>
            </>
          ) : (
            //!------------------ User Actions -------------------
            <>
              <a 
                href="/book" 
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg mr-3">
                    <Plus className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Book Appointment</h3>
                    <p className="text-sm text-gray-600">Schedule new service</p>
                  </div>
                </div>
              </a>
              
              <a 
                href="/appointments" 
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">My Appointments</h3>
                    <p className="text-sm text-gray-600">View bookings</p>
                  </div>
                </div>
              </a>
              
              <a 
                href="/services" 
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Browse Services</h3>
                    <p className="text-sm text-gray-600">Find services</p>
                  </div>
                </div>
              </a>
            </>
          )}
        </div>
      </Card>

      {/*-------------------------- Recent Appointments -------------------------------*/}
      {recentAppointments.length > 0 && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Appointments
            </h2>
            <a 
              href="/appointments" 
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all →
            </a>
          </div>
          
          <div className="space-y-3">
            {recentAppointments.map((appointment, index) => (
              <div 
                key={appointment._id || index} 
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {appointment.service?.name || 'Appointment'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {appointment.date 
                        ? new Date(appointment.date).toLocaleDateString() 
                        : 'No date'}
                    </p>
                    {isProvider && appointment.user?.name && (
                      <p className="text-sm text-gray-500 mt-1">
                        Client: {appointment.user.name}
                      </p>
                    )}
                    {!isProvider && appointment.provider?.name && (
                      <p className="text-sm text-gray-500 mt-1">
                        Provider: {appointment.provider.name}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    appointment.status === 'booked' 
                      ? 'bg-blue-100 text-blue-800' 
                      : appointment.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status || 'Unknown'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/*-------------------------- Upcoming Appointments / Today's Schedule -------------------------------*/}
      {upcomingAppointments.length > 0 && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {isProvider ? "Today's Schedule" : "Upcoming Appointments"}
            </h2>
            <a 
              href="/appointments" 
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all →
            </a>
          </div>
          
          <div className="space-y-3">
            {upcomingAppointments.map((appointment, index) => (
              <div 
                key={appointment._id || index} 
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {appointment.service?.name || 'Appointment'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {appointment.startTime ? `${appointment.startTime}` : ''}
                      {appointment.duration && ` (${appointment.duration} mins)`}
                    </p>
                    {isProvider && appointment.user?.name && (
                      <p className="text-sm text-gray-500 mt-1">
                        Client: {appointment.user.name}
                      </p>
                    )}
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {appointment.status || 'Booked'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/*-------------------------- Empty State -------------------------------*/}
      {!recentAppointments.length && !upcomingAppointments.length && (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No appointments yet</h3>
          <p className="text-gray-600 mb-4">
            {isProvider 
              ? 'Start by setting up your services and availability' 
              : 'Book your first appointment to get started'}
          </p>
          {!isProvider ? (
            <a href="/book" className="inline-block">
              <Button>Book Appointment</Button>
            </a>
          ) : (
            <div className="flex gap-3 justify-center">
              <a href="/services">
                <Button variant="secondary">Add Services</Button>
              </a>
              <a href="/availability">
                <Button>Set Availability</Button>
              </a>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default Dashboard;