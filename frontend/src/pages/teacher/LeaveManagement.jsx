import { useQuery, useMutation, useQueryClient } from 'react-query'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { ClockIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'

const LeaveManagement = () => {
  const queryClient = useQueryClient()

  const { data: leaves, isLoading } = useQuery('teacherLeaves', 
    () => api.get('/teachers/leave-applications').then(res => res.data)
  )

  const updateLeaveMutation = useMutation(
    ({ id, status, comments }) => api.put(`/teachers/leave/${id}`, { status, comments }),
    {
      onSuccess: () => {
        toast.success('Leave status updated successfully!')
        queryClient.invalidateQueries('teacherLeaves')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update leave status')
      }
    }
  )

  const handleLeaveAction = (leaveId, status, comments = '') => {
    updateLeaveMutation.mutate({ id: leaveId, status, comments })
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
        <p className="text-gray-600">Review and approve student leave applications</p>
      </div>

      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Applications</h3>
        
        {!leaves?.leaves || leaves.leaves.length === 0 ? (
          <div className="text-center py-8">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leave applications</h3>
            <p className="mt-1 text-sm text-gray-500">No students have applied for leave.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaves.leaves.map((leave) => (
              <div key={leave._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {leave.student.user.profile.firstName} {leave.student.user.profile.lastName}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        leave.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : leave.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {leave.status}
                      </span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize">
                        {leave.type}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Duration:</span> {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}</p>
                      <p><span className="font-medium">Reason:</span> {leave.reason}</p>
                      <p><span className="font-medium">Applied:</span> {new Date(leave.createdAt).toLocaleDateString()}</p>
                      {leave.comments && (
                        <p><span className="font-medium">Comments:</span> {leave.comments}</p>
                      )}
                    </div>
                  </div>
                  
                  {leave.status === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleLeaveAction(leave._id, 'approved')}
                        disabled={updateLeaveMutation.isLoading}
                        className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const comments = prompt('Enter rejection reason (optional):')
                          handleLeaveAction(leave._id, 'rejected', comments || '')
                        }}
                        disabled={updateLeaveMutation.isLoading}
                        className="flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaveManagement