import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { adminService } from '../../services/adminService'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { PlusIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline'

const Notices = () => {
  const [showForm, setShowForm] = useState(false)
  
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: classes } = useQuery('adminClasses', adminService.getClasses)

  const postNoticeMutation = useMutation(adminService.postNotice, {
    onSuccess: () => {
      toast.success('Notice posted successfully!')
      setShowForm(false)
      reset()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to post notice')
    }
  })

  const onSubmit = (data) => {
    const noticeData = {
      title: data.title,
      content: data.content,
      type: data.type,
      priority: data.priority,
      targetRoles: data.targetRoles || ['all'],
      targetClasses: data.targetClasses || []
    }
    
    postNoticeMutation.mutate(noticeData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notice Management</h1>
          <p className="text-gray-600">Post and manage school notices</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Post Notice
        </button>
      </div>

      {/* Notice Form */}
      {showForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Post New Notice</h3>
            <button
              onClick={() => {
                setShowForm(false)
                reset()
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  type="text"
                  className="input-field"
                  placeholder="Enter notice title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  {...register('type', { required: 'Type is required' })}
                  className="input-field"
                >
                  <option value="">Select type</option>
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="event">Event</option>
                  <option value="holiday">Holiday</option>
                  <option value="urgent">Urgent</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  {...register('priority')}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience
                </label>
                <select
                  {...register('targetRoles')}
                  multiple
                  className="input-field"
                >
                  <option value="all">All Users</option>
                  <option value="student">Students</option>
                  <option value="teacher">Teachers</option>
                  <option value="parent">Parents</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                {...register('content', { required: 'Content is required' })}
                rows={6}
                className="input-field"
                placeholder="Enter notice content..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Classes (Optional)
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                {classes?.classes?.map((classItem) => (
                  <label key={classItem._id} className="flex items-center text-sm">
                    <input
                      {...register('targetClasses')}
                      type="checkbox"
                      value={classItem._id}
                      className="mr-2"
                    />
                    {classItem.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  reset()
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={postNoticeMutation.isLoading}
                className="btn-primary"
              >
                {postNoticeMutation.isLoading ? 'Posting...' : 'Post Notice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notice Preview */}
      <div className="card">
        <div className="flex items-center mb-4">
          <SpeakerWaveIcon className="h-6 w-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Notice Board</h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <p>Notices will appear here after posting</p>
        </div>
      </div>
    </div>
  )
}

export default Notices