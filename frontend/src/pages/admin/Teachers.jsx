import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { adminService } from '../../services/adminService'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { UserGroupIcon, AcademicCapIcon } from '@heroicons/react/24/outline'

const Teachers = () => {
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, setValue, watch } = useForm()

  const { data: teachers, isLoading: teachersLoading } = useQuery('adminTeachers', adminService.getTeachers)
  const { data: classes } = useQuery('adminClasses', adminService.getClasses)
  const { data: subjects } = useQuery('adminSubjects', adminService.getSubjects)

  const assignTeacherMutation = useMutation(
    ({ id, data }) => adminService.assignTeacher(id, data),
    {
      onSuccess: () => {
        toast.success('Teacher assigned successfully!')
        queryClient.invalidateQueries('adminTeachers')
        setShowAssignForm(false)
        setSelectedTeacher(null)
        reset()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to assign teacher')
      }
    }
  )

  const onSubmit = (data) => {
    const assignmentData = {
      subjects: data.subjects || [],
      classes: data.classes?.map(classId => ({
        class: classId,
        section: data[`section_${classId}`] || 'A',
        isClassTeacher: data[`isClassTeacher_${classId}`] || false
      })) || []
    }
    
    assignTeacherMutation.mutate({ id: selectedTeacher._id, data: assignmentData })
  }

  const handleAssign = (teacher) => {
    setSelectedTeacher(teacher)
    setValue('subjects', teacher.subjects?.map(s => s._id) || [])
    setValue('classes', teacher.classes?.map(c => c.class._id) || [])
    setShowAssignForm(true)
  }

  if (teachersLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Management</h1>
        <p className="text-gray-600">Assign teachers to classes and subjects</p>
      </div>

      {/* Assignment Form */}
      {showAssignForm && selectedTeacher && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Assign {selectedTeacher.user.profile.firstName} {selectedTeacher.user.profile.lastName}
            </h3>
            <button
              onClick={() => {
                setShowAssignForm(false)
                setSelectedTeacher(null)
                reset()
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Subjects Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Subjects
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-3">
                {subjects?.subjects?.map((subject) => (
                  <label key={subject._id} className="flex items-center">
                    <input
                      {...register('subjects')}
                      type="checkbox"
                      value={subject._id}
                      className="mr-2"
                    />
                    <span className="text-sm">{subject.name} ({subject.code})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Classes Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Classes
              </label>
              <div className="space-y-3">
                {classes?.classes?.map((classItem) => (
                  <div key={classItem._id} className="border rounded p-3">
                    <label className="flex items-center mb-2">
                      <input
                        {...register('classes')}
                        type="checkbox"
                        value={classItem._id}
                        className="mr-2"
                      />
                      <span className="font-medium">{classItem.name} (Grade {classItem.grade})</span>
                    </label>
                    
                    {watch('classes')?.includes(classItem._id) && (
                      <div className="ml-6 space-y-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Section</label>
                          <select
                            {...register(`section_${classItem._id}`)}
                            className="input-field text-sm"
                          >
                            {classItem.sections?.map((section) => (
                              <option key={section.name} value={section.name}>
                                Section {section.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <label className="flex items-center">
                          <input
                            {...register(`isClassTeacher_${classItem._id}`)}
                            type="checkbox"
                            className="mr-2"
                          />
                          <span className="text-xs text-gray-600">Class Teacher</span>
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAssignForm(false)
                  setSelectedTeacher(null)
                  reset()
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={assignTeacherMutation.isLoading}
                className="btn-primary"
              >
                {assignTeacherMutation.isLoading ? 'Assigning...' : 'Assign Teacher'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teachers List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Teachers</h3>
        
        {!teachers?.teachers || teachers.teachers.length === 0 ? (
          <div className="text-center py-8">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No teachers found</h3>
            <p className="mt-1 text-sm text-gray-500">Create teacher accounts first.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {teachers.teachers.map((teacher) => (
              <div key={teacher._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-600">
                          {teacher.user.profile.firstName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {teacher.user.profile.firstName} {teacher.user.profile.lastName}
                        </h4>
                        <p className="text-xs text-gray-500">{teacher.user.email}</p>
                        <p className="text-xs text-gray-500">ID: {teacher.teacherId}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Subjects:</p>
                        {teacher.subjects?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {teacher.subjects.map((subject) => (
                              <span
                                key={subject._id}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                              >
                                {subject.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">No subjects assigned</span>
                        )}
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Classes:</p>
                        {teacher.classes?.length > 0 ? (
                          <div className="space-y-1">
                            {teacher.classes.map((classItem, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-xs">
                                  {classItem.class.name} - {classItem.section}
                                </span>
                                {classItem.isClassTeacher && (
                                  <span className="px-1 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                                    CT
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">No classes assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleAssign(teacher)}
                    className="btn-primary text-sm"
                  >
                    Assign
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Teachers