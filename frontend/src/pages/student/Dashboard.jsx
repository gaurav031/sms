import { useQuery } from 'react-query'
import { studentService } from '../../services/studentService'
import LoadingSpinner from '../../components/LoadingSpinner'
import { CalendarIcon, CurrencyDollarIcon, DocumentTextIcon, ClockIcon } from '@heroicons/react/24/outline'

const StudentDashboard = () => {
  const { data, isLoading, error } = useQuery('studentDashboard', studentService.getDashboard)

  if (isLoading) return <LoadingSpinner />
  if (error) return <div className="text-red-600">Error loading dashboard</div>

  const { student, attendancePercentage, recentAttendance, feeStatus, notices } = data

  const stats = [
    {
      name: 'Attendance',
      value: `${attendancePercentage}%`,
      icon: CalendarIcon,
      color: attendancePercentage >= 75 ? 'text-green-600' : 'text-red-600'
    },
    {
      name: 'Pending Fees',
      value: `₹${feeStatus.pendingFees}`,
      icon: CurrencyDollarIcon,
      color: feeStatus.pendingFees > 0 ? 'text-red-600' : 'text-green-600'
    },
    {
      name: 'Class',
      value: `${student.class.name} - ${student.section}`,
      icon: DocumentTextIcon,
      color: 'text-blue-600'
    },
    {
      name: 'Roll Number',
      value: student.rollNumber,
      icon: ClockIcon,
      color: 'text-gray-600'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {student.user.profile.firstName}!
        </h1>
        <p className="text-gray-600">Here's your academic overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Attendance</h3>
          <div className="space-y-3">
            {recentAttendance.slice(0, 5).map((record, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-sm text-gray-600">
                  {new Date(record.date).toLocaleDateString()}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  record.status === 'present' 
                    ? 'bg-green-100 text-green-800'
                    : record.status === 'absent'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notices */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Notices</h3>
          <div className="space-y-3">
            {notices.slice(0, 5).map((notice) => (
              <div key={notice._id} className="border-b border-gray-100 pb-3 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{notice.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notice.publishDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    notice.priority === 'high' 
                      ? 'bg-red-100 text-red-800'
                      : notice.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {notice.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {notice.content.substring(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fee Status */}
      {feeStatus.pendingFees > 0 && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-red-900">Fee Payment Pending</h3>
              <p className="text-red-700">
                You have pending fees of ₹{feeStatus.pendingFees}. Please contact the administration.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentDashboard