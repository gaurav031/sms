import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { DocumentTextIcon, PaperClipIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'

const Assignments = () => {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset } = useForm()

  const { data: assignments, isLoading } = useQuery('studentAssignments', 
    () => api.get('/assignments').then(res => res.data)
  )

  const submitAssignmentMutation = useMutation(
    ({ id, formData }) => api.post(`/assignments/${id}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    {
      onSuccess: () => {
        toast.success('Assignment submitted successfully!')
        queryClient.invalidateQueries('studentAssignments')
        setShowSubmissionForm(false)
        setSelectedAssignment(null)
        reset()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to submit assignment')
      }
    }
  )

  const onSubmit = (data) => {
    const formData = new FormData()
    formData.append('text', data.text || '')
    
    if (data.files) {
      Array.from(data.files).forEach(file => {
        formData.append('files', file)
      })
    }

    submitAssignmentMutation.mutate({ id: selectedAssignment._id, formData })
  }

  const handleSubmitAssignment = (assignment) => {
    setSelectedAssignment(assignment)
    setShowSubmissionForm(true)
  }

  const isSubmitted = (assignment) => {
    return assignment.submissions?.some(sub => sub.student === assignment.studentId)
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-600">View and submit your assignments</p>
      </div>

      {/* Submission Form */}
      {showSubmissionForm && selectedAssignment && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Submit: {selectedAssignment.title}
            </h3>
            <button
              onClick={() => {
                setShowSubmissionForm(false)
                setSelectedAssignment(null)
                reset()
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submission Text
              </label>
              <textarea
                {...register('text')}
                rows={6}
                className="input-field"
                placeholder="Enter your submission text..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Files (Optional)
              </label>
              <input
                {...register('files')}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                className="input-field"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowSubmissionForm(false)
                  setSelectedAssignment(null)
                  reset()
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitAssignmentMutation.isLoading}
                className="btn-primary"
              >
                {submitAssignmentMutation.isLoading ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Assignments</h3>
        
        {!assignments?.assignments || assignments.assignments.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments</h3>
            <p className="mt-1 text-sm text-gray-500">No assignments have been posted yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.assignments.map((assignment) => (
              <div key={assignment._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {assignment.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        new Date() > new Date(assignment.dueDate)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {new Date() > new Date(assignment.dueDate) ? 'Overdue' : 'Active'}
                      </span>
                      {isSubmitted(assignment) && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          Submitted
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Subject:</span> {assignment.subject?.name}
                      </div>
                      <div>
                        <span className="font-medium">Total Marks:</span> {assignment.totalMarks}
                      </div>
                      <div>
                        <span className="font-medium">Due Date:</span> {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Assigned By:</span> {assignment.assignedBy?.profile?.firstName} {assignment.assignedBy?.profile?.lastName}
                      </div>
                    </div>

                    {assignment.attachments && assignment.attachments.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Attachments:</p>
                        <div className="flex flex-wrap gap-2">
                          {assignment.attachments.map((file, index) => (
                            <a
                              key={index}
                              href={`/api/uploads/${file.filename}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                            >
                              <PaperClipIcon className="h-3 w-3 mr-1" />
                              {file.originalName}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    {!isSubmitted(assignment) && new Date() <= new Date(assignment.dueDate) && (
                      <button
                        onClick={() => handleSubmitAssignment(assignment)}
                        className="btn-primary text-sm"
                      >
                        Submit
                      </button>
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

export default Assignments