import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Bell, Calendar, Ticket, BookOpen } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useContext(AuthContext);

  const quickActions = [
    {
      name: 'View Notifications',
      href: '/notifications',
      icon: Bell,
      description: 'Check your recent notifications'
    },
    {
      name: 'Book Resources',
      href: '/bookings',
      icon: Calendar,
      description: 'Schedule resource bookings'
    },
    {
      name: 'Submit Tickets',
      href: '/tickets',
      icon: Ticket,
      description: 'Report issues and get support'
    },
    {
      name: 'Browse Resources',
      href: '/resources',
      icon: BookOpen,
      description: 'Find available campus resources'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening in your Smart Campus Hub.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <action.icon className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-medium text-gray-900">{action.name}</h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Notification System Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Notification System</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✅ Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Backend API</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✅ Connected
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Real-time Updates</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              🔄 Polling
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center text-gray-500 py-8">
          <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p>No recent activity yet.</p>
          <p className="text-sm mt-2">Activity will appear here when you start using the system.</p>
        </div>
      </div>
    </div>
  );
}
