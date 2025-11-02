import { useState } from 'react'
import { useQuery } from 'react-query'
import { studentService } from '../../services/studentService'
import LoadingSpinner from '../../components/LoadingSpinner'
import { CalendarIcon } from '@heroicons/react/24/outline'

const Attendance = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const { data, isLoading, error } = useQuery(
    ['studentAttendance', selectedMonth, selectedYear],
    () => studentService.getAttendance({ month: selectedMonth, year: selectedYear })
  )

  if (isLoading) return <LoadingSpinner />
  if (error) return <div className="text-red-600">Error loading attendance</div>

  const { attendance, attendancePercentage } = data

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800'
      case 'absent':
        return 'bg-red-100 text-red-800'
      case 'late':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600">Track your attendance record</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="input-field w-auto"
          >
            {months.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="input-field w-auto"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="card">
        <div className="flex items-center">
          <CalendarIcon className="h-8 w-8 text-primary-600" />
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">
              Attendance Percentage: {attendancePercentage}%
            </h3>
            <p className="text-gray-600">
              {months[selectedMonth - 1]} {selectedYear}
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                attendancePercentage >= 75 ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${attendancePercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {attendancePercentage >= 75 ? 'Good attendance!' : 'Attendance below 75% - improvement needed'}
          </p>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Records</h3>
        
        {attendance.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
            <p className="mt-1 text-sm text-gray-500">
              No attendance records found for the selected period.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marked By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map((record, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.subject?.name || 'General'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.markedBy?.profile?.firstName} {record.markedBy?.profile?.lastName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Attendance