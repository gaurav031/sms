import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { adminService } from '../../services/adminService'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { PlusIcon, ClockIcon } from '@heroicons/react/24/outline'

const Timetable = () => {
  const [showGenerator, setShowGenerator] = useState(false)
  const [selectedClass, setSelectedClass] = useState('')
  const [subjectTeachers, setSubjectTeachers] = useState([])
  
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, watch } = useForm()

  const { data: classes } = useQuery('adminClasses', adminService.getClasses)
  const { data: subjects } = useQuery('adminSubjects', adminService.getSubjects)
  const { data: teachers } = useQuery('adminTeachers', adminService.getTeachers)

  const generateTimetableMutation = useMutation(
    (data) => adminService.generateTimetable(data),
    {
      onSuccess: () => {
        toast.success('Timetable generated successfully!')
        setShowGenerator(false)
        setSubjectTeachers([])
        reset()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to generate timetable')
      }
    }
  )

  const addSubjectTeacher = () => {
    setSubjectTeachers([...subjectTeachers, { subjectId: '', teacherId: '' }])
  }

  const removeSubjectTeacher = (index) => {
    setSubjectTeachers(subjectTeachers.filter((_, i) => i !== index))
  }

  const updateSubjectTeacher = (index, field, value) => {
    const updated = [...subjectTeachers]
    updated[index][field] = value
    setSubjectTeachers(updated)
  }

  const onSubmit = () => {
    if (!selectedClass || subjectTeachers.length === 0) {
      toast.error('Please select class and add subject-teacher pairs')
      return
    }

    generateTimetableMutation.mutate({
      classId: selectedClass,
      subjects: subjectTeachers
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable Management</h1>
          <p className="text-gray-600">Generate and manage class timetables</p>
        </div>
        
        <button
          onClick={() => setShowGenerator(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Generate Timetable
        </button>
      </div>

      {/* Timetable Generator */}
      {showGenerator && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Generate New Timetable</h3>
            <button
              onClick={() => {
                setShowGenerator(false)
                setSubjectTeachers([])
                reset()
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Class Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="input-field"
              >
                <option value="">Select a class</option>
                {classes?.classes?.map((classItem) => (
                  <option key={classItem._id} value={classItem._id}>
                    {classItem.name} (Grade {classItem.grade})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject-Teacher Pairs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Subject-Teacher Assignments
                </label>
                <button
                  onClick={addSubjectTeacher}
                  className="btn-secondary text-sm"
                >
                  Add Subject
                </button>
              </div>

              <div className="space-y-3">
                {subjectTeachers.map((item, index) => (
                  <div key={index} className="grid grid-cols-3 gap-3 items-end">
                    <div>
                      <select
                        value={item.subjectId}
                        onChange={(e) => updateSubjectTeacher(index, 'subjectId', e.target.value)}
                        className="input-field"
                      >
                        <option value="">Select Subject</option>
                        {subjects?.subjects?.map((subject) => (
                          <option key={subject._id} value={subject._id}>
                            {subject.name} ({subject.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <select
                        value={item.teacherId}
                        onChange={(e) => updateSubjectTeacher(index, 'teacherId', e.target.value)}
                        className="input-field"
                      >
                        <option value="">Select Teacher</option>
                        {teachers?.teachers?.map((teacher) => (
                          <option key={teacher._id} value={teacher._id}>
                            {teacher.user.profile.firstName} {teacher.user.profile.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      onClick={() => removeSubjectTeacher(index)}
                      className="btn-secondary text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {subjectTeachers.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No subject-teacher pairs added. Click "Add Subject" to start.
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowGenerator(false)
                  setSubjectTeachers([])
                  reset()
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={generateTimetableMutation.isLoading}
                className="btn-primary"
              >
                {generateTimetableMutation.isLoading ? 'Generating...' : 'Generate Timetable'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Timetables */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Class Timetables</h3>
        
        {!classes?.classes || classes.classes.length === 0 ? (
          <div className="text-center py-8">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No timetables</h3>
            <p className="mt-1 text-sm text-gray-500">Generate timetables for your classes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.classes.map((classItem) => (
              <div key={classItem._id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  {classItem.name} (Grade {classItem.grade})
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {classItem.sections?.length || 0} sections
                </p>
                <div className="text-xs text-gray-500">
                  {classItem.timetable && classItem.timetable.length > 0 ? (
                    <span className="text-green-600">✓ Timetable generated</span>
                  ) : (
                    <span className="text-gray-400">No timetable</span>
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

export default Timetable