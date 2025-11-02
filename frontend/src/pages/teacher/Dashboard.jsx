import { useQuery } from 'react-query'
import { teacherService } from '../../services/teacherService'
import LoadingSpinner from '../../components/LoadingSpinner'
import { UserGroupIcon, DocumentTextIcon, BookOpenIcon, ClockIcon } from '@heroicons/react/24/outline'

const TeacherDashboard = () => {
  const { data, isLoading, error } = useQuery('teacherDashboard', teacherService.getDashboard)

  if (isLoading) return <LoadingSpinner />
  if (error) return <div className="text-red-600">Error loading dashboard</div>
  if (!data) return <LoadingSpinner />

  const { teacher, studentsCount, recentContent } = data

  const stats = [
    {
      name: 'Total Students',
      value: studentsCount,
      icon: UserGroupIcon,
      color: 'text-blue-600'
    },
    {
      name: 'Subjects',
      value: teacher?.subjects?.length || 0,
      icon: BookOpenIcon,
      color: 'text-green-600'
    },
    {
      name: 'Classes',
      value: teacher?.classes?.length || 0,
      icon: DocumentTextIcon,
      color: 'text-purple-600'
    },
    {
      name: 'Content Uploaded',
      value: recentContent?.length || 0,
      icon: ClockIcon,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {teacher?.user?.profile?.firstName || 'Teacher'}!
        </h1>
        <p className="text-gray-600">Here's your teaching overview</p>
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
        {/* Assigned Classes */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Classes</h3>
          <div className="space-y-3">
            {teacher?.classes?.map((classItem, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {classItem.class.name} - {classItem.section}
                  </p>
                  <p className="text-xs text-gray-500">Grade {classItem.class.grade}</p>
                </div>
                {classItem.isClassTeacher && (
                  <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                    Class Teacher
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Subjects */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Teaching Subjects</h3>
          <div className="space-y-3">
            {teacher?.subjects?.map((subject) => (
              <div key={subject._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{subject.name}</p>
                  <p className="text-xs text-gray-500">Code: {subject.code}</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                  {subject.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Content */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Content Uploads</h3>
        
        {!recentContent || recentContent.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No content uploaded</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start uploading content for your students.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentContent?.map((content) => (
              <div key={content._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{content.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        content.type === 'video' 
                          ? 'bg-red-100 text-red-800'
                          : content.type === 'document'
                          ? 'bg-blue-100 text-blue-800'
                          : content.type === 'link'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {content.type}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>Subject: {content.subject.name}</p>
                      {content.description && (
                        <p className="mt-1 line-clamp-2">{content.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    <p>{new Date(content.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs">Access count: {content.accessCount || 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <UserGroupIcon className="mx-auto h-8 w-8 text-blue-600 mb-2" />
          <h3 className="text-sm font-medium text-gray-900">Manage Students</h3>
          <p className="text-xs text-gray-500 mt-1">View and manage your students</p>
        </div>
        
        <div className="card text-center">
          <DocumentTextIcon className="mx-auto h-8 w-8 text-green-600 mb-2" />
          <h3 className="text-sm font-medium text-gray-900">Upload Content</h3>
          <p className="text-xs text-gray-500 mt-1">Share learning materials</p>
        </div>
        
        <div className="card text-center">
          <ClockIcon className="mx-auto h-8 w-8 text-purple-600 mb-2" />
          <h3 className="text-sm font-medium text-gray-900">Take Attendance</h3>
          <p className="text-xs text-gray-500 mt-1">Mark student attendance</p>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard