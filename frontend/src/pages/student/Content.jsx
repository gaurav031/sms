import { useState } from 'react'
import { useQuery } from 'react-query'
import { studentService } from '../../services/studentService'
import LoadingSpinner from '../../components/LoadingSpinner'
import { DocumentTextIcon, PlayIcon, LinkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

const Content = () => {
  const [filters, setFilters] = useState({
    type: '',
    subject: '',
    page: 1
  })

  const { data, isLoading, error } = useQuery(
    ['studentContent', filters],
    () => studentService.getContent(filters),
    { keepPreviousData: true }
  )

  if (isLoading) return <LoadingSpinner />
  if (error) return <div className="text-red-600">Error loading content</div>

  const { content, pagination } = data

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

  const handleDownload = (content) => {
    if (content.content.file) {
      const link = document.createElement('a')
      link.href = `/api/uploads/${content.content.file.filename}`
      link.download = content.content.file.originalName
      link.click()
    } else if (content.content.url) {
      window.open(content.content.url, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Learning Content</h1>
        <p className="text-gray-600">Access your class materials and resources</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
              <option value="link">Links</option>
              <option value="assignment">Assignments</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value, page: 1 })}
              className="input-field"
            >
              <option value="">All Subjects</option>
              {/* Add subject options dynamically */}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ type: '', subject: '', page: 1 })}
              className="btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {content.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No content available</h3>
          <p className="mt-1 text-sm text-gray-500">
            No learning content found for the selected filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item) => {
            const IconComponent = getContentIcon(item.type)
            return (
              <div key={item._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <IconComponent className="h-6 w-6 text-gray-400 mr-2" />
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getContentTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownload(item)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Download/Open"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </button>
                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{item.subject.name}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="mt-3 text-xs text-gray-400">
                  Uploaded by: {item.uploadedBy.profile.firstName} {item.uploadedBy.profile.lastName}
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

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {pagination.current} of {pagination.pages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page === pagination.pages}
              className="btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Content