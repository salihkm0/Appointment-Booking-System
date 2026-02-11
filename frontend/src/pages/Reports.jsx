import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { reportApi } from '../api/reportApi';
import { 
  Calendar,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const isProvider = user?.role === 'provider';

  useEffect(() => {
    if (isProvider) {
      fetchReports();
    }
  }, [isProvider]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await reportApi.getProviderReports();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeSlot) => {
    if (!timeSlot) return '';
    return timeSlot.replace(' AM', 'am').replace(' PM', 'pm');
  };

  if (!isProvider) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Provider Access Required</h2>
        <p className="text-gray-600">Only service providers can view reports.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Business Reports</h1>
        <p className="text-gray-600 mt-1">Your business performance overview</p>
      </div>

      {/*------------------------ Refresh Button -----------------------------*/}
      <div className="flex justify-end">
        <Button onClick={fetchReports} variant="secondary" className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </Button>
      </div>

      {/*----------------------------- Overview Stats --------------------------*/}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-800">{reportData?.todayAppointments || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-800">{reportData?.completedAppointments || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">${(reportData?.totalRevenue || 0).toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-gray-800">{reportData?.activeClients || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-800">{reportData?.cancelledAppointments || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-800">
                {((reportData?.completionRate || 0) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/*------------------------ Appointment Summary --------------------------*/}
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Appointment Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-primary-600">{reportData?.totalAppointments || 0}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded">
            <p className="text-2xl font-bold text-blue-600">{reportData?.bookedAppointments || 0}</p>
            <p className="text-sm text-gray-600">Booked</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <p className="text-2xl font-bold text-green-600">{reportData?.completedAppointments || 0}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded">
            <p className="text-2xl font-bold text-red-600">{reportData?.cancelledAppointments || 0}</p>
            <p className="text-sm text-gray-600">Cancelled</p>
          </div>
        </div>
      </Card>

      {/*------------------------ Busiest Times --------------------------*/}
      {reportData?.busiestTimes?.timeSlots?.length > 0 && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-800">Busiest Times of Day</h2>
          </div>
          
          <div className="space-y-3">
            {reportData.busiestTimes.timeSlots.map((slot, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium text-gray-700">{formatTime(slot.time)}</span>
                  <span className="text-sm text-gray-500">({slot.percentage}%)</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{slot.count} appointments</p>
                </div>
              </div>
            ))}
            
            {reportData.busiestTimes.totalCount > 0 && (
              <div className="text-sm text-gray-600 mt-4 text-center">
                Based on {reportData.busiestTimes.totalCount} total appointments
              </div>
            )}
          </div>
        </Card>
      )}

      {/*------------------------ Quick Stats --------------------------*/}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-800 mb-3">Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Appointments</span>
              <span className="font-medium">{reportData?.totalAppointments || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-medium text-green-600">
                {((reportData?.completionRate || 0) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Clients</span>
              <span className="font-medium">{reportData?.activeClients || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenue per Client</span>
              <span className="font-medium">
                ${(reportData?.activeClients > 0 
                  ? (reportData?.totalRevenue || 0) / reportData.activeClients 
                  : 0).toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-800 mb-3">Appointment Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Booked</span>
              </div>
              <span className="font-medium">{reportData?.bookedAppointments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Completed</span>
              </div>
              <span className="font-medium">{reportData?.completedAppointments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Cancelled</span>
              </div>
              <span className="font-medium">{reportData?.cancelledAppointments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Today's Bookings</span>
              </div>
              <span className="font-medium">{reportData?.todayAppointments || 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;