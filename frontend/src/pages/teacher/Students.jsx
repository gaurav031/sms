import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { teacherService } from '../../services/teacherService'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { UserGroupIcon, CalendarIcon } from '@heroicons/react/24/outline'

const Students = () => {
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [showAttendanceForm, setShowAttendanceForm] = useState(false)
  const [attendanceData, setAttendanceData] = useState([])
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  
  const queryClient = useQueryClient()

  const { data: assignments } = useQuery('teacherAssignments', teacherService.getAssignments)
  
  const { data: students, isLoading } = useQuery(
    ['teacherStudents', selectedClass, selectedSection],
    () => teacherService.getStudents({ classId: selectedClass, section: selectedSection }),
    { enabled: !!selectedClass }
  )

  const markAttendanceMutation = useMutation(teacherService.markAttendance, {
    onSuccess: () => {
      toast.success('Attendance marked successfully!')
      setShowAttendanceForm(false)
      setAttendanceData([])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark attendance')
    }
  })

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => {
      const existing = prev.find(item => item.studentId === studentId)
      if (existing) {
        return prev.map(item => 
          item.studentId === studentId ? { ...item, status } : item
        )
      } else {
        return [...prev, { studentId, status }]
      }
    })
  }

  const submitAttendance = () => {
    if (attendanceData.length === 0) {
      toast.error('Please mark attendance for at least one student')
      return
    }

    markAttendanceMutation.mutate({
      classId: selectedClass,
      section: selectedSection,
      date: attendanceDate,
      attendance: attendanceData
    })
  }

  const initializeAttendance = () => {
    if (students?.students) {
      const initialData = students.students.map(student => ({
        studentId: student._id,
        status: 'present'
      }))
      setAttendanceData(initialData)
      setShowAttendanceForm(true)
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage your students and take attendance</p>
        </div>
        
        {students?.students && students.students.length > 0 && (
          <button
            onClick={initializeAttendance}
            className="btn-primary flex items-center"
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            Take Attendance
          </button>
        )}
      </div>

      {/* Class Selection */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value)
                setSelectedSection('')
              }}
              className="input-field"
            >
              <option value="">Select a class</option>
              {assignments?.classes?.map((classItem) => (
                <option key={classItem.class._id} value={classItem.class._id}>
                  {classItem.class.name} (Grade {classItem.class.grade})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="input-field"
              disabled={!selectedClass}
            >
              <option value="">Select a section</option>
              {selectedClass && assignments?.classes
                ?.find(c => c.class._id === selectedClass)
                ?.class.sections?.map((section) => (
                  <option key={section.name} value={section.name}>
                    Section {section.name}
                  </option>
                ))
              }
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Form */}
      {showAttendanceForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Mark Attendance</h3>
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="input-field w-auto"
              />
              <button
                onClick={() => setShowAttendanceForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {students?.students.map((student) => {
              const currentStatus = attendanceData.find(item => item.studentId === student._id)?.status || 'present'
              
              return (
                <div key={student._id} className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {student.rollNumber}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {student.user.profile.firstName} {student.user.profile.lastName}
                      </p>
                      <p className="text-xs text-gray-500">Roll: {student.rollNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {['present', 'absent', 'late'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleAttendanceChange(student._id, status)}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          currentStatus === status
                            ? status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : status === 'absent'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowAttendanceForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={submitAttendance}
              disabled={markAttendanceMutation.isLoading}
              className="btn-primary"
            >
              {markAttendanceMutation.isLoading ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </div>
        </div>
      )}

      {/* Students List */}
      {selectedClass && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Students List
            {selectedSection && ` - Section ${selectedSection}`}
          </h3>
          
          {!students?.students || students.students.length === 0 ? (
            <div className="text-center py-8">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No students are assigned to the selected class and section.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.students.map((student) => (
                    <tr key={student._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.rollNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-gray-600">
                              {student.user.profile.firstName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.user.profile.firstName} {student.user.profile.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.attendancePercentage || 0}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          student.isActive 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Students