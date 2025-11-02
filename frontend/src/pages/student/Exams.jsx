import { useQuery } from 'react-query'
import { studentService } from '../../services/studentService'
import LoadingSpinner from '../../components/LoadingSpinner'
import { CalendarIcon, ClockIcon, AcademicCapIcon } from '@heroicons/react/24/outline'

const Exams = () => {
  const { data: exams, isLoading, error } = useQuery('studentExams', studentService.getExams)

  if (isLoading) return <LoadingSpinner />
  if (error) return <div className="text-red-600">Error loading exams</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upcoming Exams</h1>
        <p className="text-gray-600">View your scheduled examinations</p>
      </div>

      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Exam Schedule</h3>
        
        {!exams?.exams || exams.exams.length === 0 ? (
          <div className="text-center py-8">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming exams</h3>
            <p className="mt-1 text-sm text-gray-500">No exams have been scheduled yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.exams.map((exam) => (
              <div key={exam._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{exam.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        exam.type === 'final' 
                          ? 'bg-red-100 text-red-800'
                          : exam.type === 'mid-term'
                          ? 'bg-orange-100 text-orange-800'
                          : exam.type === 'unit-test'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {exam.type.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <AcademicCapIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span><strong>Subject:</strong> {exam.subject.name} ({exam.subject.code})</span>
                      </div>
                      
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span><strong>Date:</strong> {new Date(exam.date).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span><strong>Duration:</strong> {exam.duration} minutes</span>
                      </div>
                      
                      <div className="flex items-center">
                        <span><strong>Total Marks:</strong> {exam.totalMarks}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <span><strong>Passing Marks:</strong> {exam.passingMarks}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <span><strong>Created By:</strong> {exam.createdBy?.profile?.firstName} {exam.createdBy?.profile?.lastName}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 text-right">
                    <div className={`text-sm font-medium ${
                      new Date(exam.date) < new Date() 
                        ? 'text-gray-500'
                        : new Date(exam.date) - new Date() < 7 * 24 * 60 * 60 * 1000
                        ? 'text-orange-600'
                        : 'text-green-600'
                    }`}>
                      {new Date(exam.date) < new Date() 
                        ? 'Completed'
                        : new Date(exam.date) - new Date() < 7 * 24 * 60 * 60 * 1000
                        ? 'This Week'
                        : 'Upcoming'
                      }
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.ceil((new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24))} days left
                    </div>
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

export default Exams