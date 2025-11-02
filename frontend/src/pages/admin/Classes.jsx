import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { adminService } from '../../services/adminService'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { PlusIcon, BuildingOfficeIcon, BookOpenIcon } from '@heroicons/react/24/outline'

const Classes = () => {
  const [showClassForm, setShowClassForm] = useState(false)
  const [showSubjectForm, setShowSubjectForm] = useState(false)
  
  const queryClient = useQueryClient()
  const { register: registerClass, handleSubmit: handleClassSubmit, reset: resetClass, formState: { errors: classErrors } } = useForm()
  const { register: registerSubject, handleSubmit: handleSubjectSubmit, reset: resetSubject, formState: { errors: subjectErrors } } = useForm()

  const { data: classes, isLoading: classesLoading } = useQuery('adminClasses', adminService.getClasses)
  const { data: subjects, isLoading: subjectsLoading } = useQuery('adminSubjects', adminService.getSubjects)

  const createClassMutation = useMutation(adminService.createClass, {
    onSuccess: () => {
      toast.success('Class created successfully!')
      queryClient.invalidateQueries('adminClasses')
      setShowClassForm(false)
      resetClass()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create class')
    }
  })

  const createSubjectMutation = useMutation(adminService.createSubject, {
    onSuccess: () => {
      toast.success('Subject created successfully!')
      queryClient.invalidateQueries('adminSubjects')
      setShowSubjectForm(false)
      resetSubject()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create subject')
    }
  })

  const onClassSubmit = (data) => {
    const classData = {
      ...data,
      sections: data.sections ? data.sections.split(',').map(s => ({ name: s.trim(), capacity: 40 })) : []
    }
    createClassMutation.mutate(classData)
  }

  const onSubjectSubmit = (data) => {
    createSubjectMutation.mutate(data)
  }

  if (classesLoading || subjectsLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Classes & Subjects</h1>
        <p className="text-gray-600">Manage academic classes and subjects</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Classes</h2>
            <button
              onClick={() => setShowClassForm(true)}
              className="btn-primary flex items-center text-sm"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Class
            </button>
          </div>

          {/* Class Form */}
          {showClassForm && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-gray-900">Add New Class</h3>
                <button
                  onClick={() => setShowClassForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleClassSubmit(onClassSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name
                  </label>
                  <input
                    {...registerClass('name', { required: 'Class name is required' })}
                    type="text"
                    className="input-field"
                    placeholder="e.g., Class 10"
                  />
                  {classErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{classErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade
                  </label>
                  <input
                    {...registerClass('grade', { 
                      required: 'Grade is required',
                      valueAsNumber: true,
                      min: { value: 1, message: 'Grade must be at least 1' }
                    })}
                    type="number"
                    className="input-field"
                    placeholder="10"
                  />
                  {classErrors.grade && (
                    <p className="mt-1 text-sm text-red-600">{classErrors.grade.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sections (comma separated)
                  </label>
                  <input
                    {...registerClass('sections')}
                    type="text"
                    className="input-field"
                    placeholder="A, B, C"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowClassForm(false)}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createClassMutation.isLoading}
                    className="btn-primary text-sm"
                  >
                    {createClassMutation.isLoading ? 'Creating...' : 'Create Class'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Classes List */}
          <div className="card">
            {!classes?.classes || classes.classes.length === 0 ? (
              <div className="text-center py-8">
                <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No classes found</h3>
                <p className="mt-1 text-sm text-gray-500">Create your first class to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {classes.classes.map((classItem) => (
                  <div key={classItem._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {classItem.name}
                        </h4>
                        <p className="text-xs text-gray-500">Grade {classItem.grade}</p>
                        {classItem.sections && classItem.sections.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {classItem.sections.map((section, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                              >
                                Section {section.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {classItem.subjects?.length || 0} subjects
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Subjects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Subjects</h2>
            <button
              onClick={() => setShowSubjectForm(true)}
              className="btn-primary flex items-center text-sm"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Subject
            </button>
          </div>

          {/* Subject Form */}
          {showSubjectForm && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-gray-900">Add New Subject</h3>
                <button
                  onClick={() => setShowSubjectForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubjectSubmit(onSubjectSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Name
                  </label>
                  <input
                    {...registerSubject('name', { required: 'Subject name is required' })}
                    type="text"
                    className="input-field"
                    placeholder="e.g., Mathematics"
                  />
                  {subjectErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{subjectErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Code
                  </label>
                  <input
                    {...registerSubject('code', { required: 'Subject code is required' })}
                    type="text"
                    className="input-field"
                    placeholder="e.g., MATH101"
                  />
                  {subjectErrors.code && (
                    <p className="mt-1 text-sm text-red-600">{subjectErrors.code.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...registerSubject('description')}
                    rows={3}
                    className="input-field"
                    placeholder="Subject description (optional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credits
                    </label>
                    <input
                      {...registerSubject('credits', { valueAsNumber: true })}
                      type="number"
                      className="input-field"
                      placeholder="1"
                      defaultValue={1}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select {...registerSubject('type')} className="input-field">
                      <option value="core">Core</option>
                      <option value="elective">Elective</option>
                      <option value="practical">Practical</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowSubjectForm(false)}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createSubjectMutation.isLoading}
                    className="btn-primary text-sm"
                  >
                    {createSubjectMutation.isLoading ? 'Creating...' : 'Create Subject'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Subjects List */}
          <div className="card">
            {!subjects?.subjects || subjects.subjects.length === 0 ? (
              <div className="text-center py-8">
                <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No subjects found</h3>
                <p className="mt-1 text-sm text-gray-500">Create your first subject to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {subjects.subjects.map((subject) => (
                  <div key={subject._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {subject.name}
                        </h4>
                        <p className="text-xs text-gray-500">Code: {subject.code}</p>
                        {subject.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {subject.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          subject.type === 'core' 
                            ? 'bg-blue-100 text-blue-800'
                            : subject.type === 'elective'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {subject.type}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {subject.credits} credit{subject.credits !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Classes