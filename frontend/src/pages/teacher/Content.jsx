import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { teacherService } from '../../services/teacherService'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { PlusIcon, DocumentTextIcon, PlayIcon, LinkIcon } from '@heroicons/react/24/outline'

const Content = () => {
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm()
  const contentType = watch('type')

  const { data, isLoading } = useQuery('teacherContent', teacherService.getContent)
  const { data: assignments } = useQuery('teacherAssignments', teacherService.getAssignments)

  const uploadContentMutation = useMutation(teacherService.uploadContent, {
    onSuccess: () => {
      toast.success('Content uploaded successfully!')
      queryClient.invalidateQueries('teacherContent')
      setShowForm(false)
      reset()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload content')
    }
  })

  const onSubmit = (data) => {
    if (!data.classId || !data.subject) {
      toast.error('Please select class and subject')
      return
    }
    
    const formData = {
      ...data,
      file: data.file?.[0] || null,
      tags: data.tags || ''
    }
    uploadContentMutation.mutate(formData)
  }

  const getContentIcon = (type) => {
    switch (type) {
      case 'video':
        return PlayIcon
      case 'document':
        return DocumentTextIcon
      case 'link':
        return LinkIcon
      default:
        return DocumentTextIcon
    }
  }

  const getContentTypeColor = (type) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-800'
      case 'document':
        return 'bg-blue-100 text-blue-800'
      case 'link':
        return 'bg-green-100 text-green-800'
      case 'assignment':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Upload and manage learning content for your students</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Upload Content
        </button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Upload New Content</h3>
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
                  Title
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  type="text"
                  className="input-field"
                  placeholder="Enter content title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type
                </label>
                <select
                  {...register('type', { required: 'Content type is required' })}
                  className="input-field"
                >
                  <option value="">Select type</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="link">Link</option>
                  <option value="assignment">Assignment</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <select
                  {...register('classId', { required: 'Class is required' })}
                  className="input-field"
                >
                  <option value="">Select class</option>
                  {assignments?.classes?.map((classItem) => (
                    <option key={classItem.class._id} value={classItem.class._id}>
                      {classItem.class.name} - Section {classItem.section}
                    </option>
                  ))}
                </select>
                {errors.classId && (
                  <p className="mt-1 text-sm text-red-600">{errors.classId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  {...register('subject', { required: 'Subject is required' })}
                  className="input-field"
                >
                  <option value="">Select subject</option>
                  {assignments?.subjects?.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="input-field"
                placeholder="Enter content description (optional)"
              />
            </div>

            {contentType === 'link' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  {...register('url', { 
                    required: contentType === 'link' ? 'URL is required' : false,
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'Please enter a valid URL'
                    }
                  })}
                  type="url"
                  className="input-field"
                  placeholder="https://example.com"
                />
                {errors.url && (
                  <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Upload
                </label>
                <input
                  {...register('file', { 
                    required: contentType !== 'link' ? 'File is required' : false 
                  })}
                  type="file"
                  accept={contentType === 'video' ? 'video/*' : '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx'}
                  className="input-field"
                />
                {errors.file && (
                  <p className="mt-1 text-sm text-red-600">{errors.file.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (Optional)
              </label>
              <input
                {...register('tags')}
                type="text"
                className="input-field"
                placeholder="Enter tags separated by commas"
              />
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
                disabled={uploadContentMutation.isLoading}
                className="btn-primary"
              >
                {uploadContentMutation.isLoading ? 'Uploading...' : 'Upload Content'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Content</h3>
        
        {!data?.content || data.content.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No content uploaded</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start uploading content for your students.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.content.map((item) => {
              const IconComponent = getContentIcon(item.type)
              return (
                <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <IconComponent className="h-6 w-6 text-gray-400 mr-2" />
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getContentTypeColor(item.type)}`}>
                        {item.type}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.accessCount || 0} views
                    </div>
                  </div>

                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {item.title}
                  </h4>

                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{item.class.name}</span>
                    <span>{item.subject.name}</span>
                  </div>

                  <div className="text-xs text-gray-400">
                    Uploaded: {new Date(item.createdAt).toLocaleDateString()}
                  </div>

                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {item.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Content