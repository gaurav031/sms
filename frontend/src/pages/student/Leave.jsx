import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { studentService } from '../../services/studentService'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

const Leave = () => {
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: leaves, isLoading } = useQuery('studentLeaves', studentService.getLeaveApplications)

  const applyLeaveMutation = useMutation(studentService.applyLeave, {
    onSuccess: () => {
      toast.success('Leave application submitted successfully!')
      queryClient.invalidateQueries('studentLeaves')
      setShowForm(false)
      reset()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit leave application')
    }
  })

  const onSubmit = (data) => {
    const formData = {
      ...data,
      attachments: data.attachments ? Array.from(data.attachments) : []
    }
    applyLeaveMutation.mutate(formData)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Applications</h1>
          <p className="text-gray-600">Apply for leave and track your applications</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Apply for Leave
        </button>
      </div>

      {/* Leave Application Form */}
      {showForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">New Leave Application</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leave Type
                </label>
                <select
                  {...register('type', { required: 'Leave type is required' })}
                  className="input-field"
                >
                  <option value="">Select leave type</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Leave</option>
                  <option value="emergency">Emergency Leave</option>
                  <option value="other">Other</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  {...register('startDate', { required: 'Start date is required' })}
                  type="date"
                  className="input-field"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  {...register('endDate', { required: 'End date is required' })}
                  type="date"
                  className="input-field"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments (Optional)
                </label>
                <input
                  {...register('attachments')}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <textarea
                {...register('reason', { required: 'Reason is required' })}
                rows={4}
                className="input-field"
                placeholder="Please provide a detailed reason for your leave..."
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={applyLeaveMutation.isLoading}
                className="btn-primary"
              >
                {applyLeaveMutation.isLoading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leave Applications List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Leave Applications</h3>
        
        {!leaves?.leaves || leaves.leaves.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leave applications</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't submitted any leave applications yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaves.leaves.map((leave) => (
              <div key={leave._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-sm font-medium text-gray-900 capitalize">
                        {leave.type} Leave
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Duration:</span>{' '}
                        {new Date(leave.startDate).toLocaleDateString()} to{' '}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">Reason:</span> {leave.reason}
                      </p>
                      {leave.comments && (
                        <p>
                          <span className="font-medium">Comments:</span> {leave.comments}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    <p>Applied: {new Date(leave.createdAt).toLocaleDateString()}</p>
                    {leave.approvalDate && (
                      <p>
                        {leave.status === 'approved' ? 'Approved' : 'Rejected'}:{' '}
                        {new Date(leave.approvalDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Leave