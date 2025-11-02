import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { adminService } from '../../services/adminService'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { CurrencyDollarIcon, PencilIcon } from '@heroicons/react/24/outline'

const FeeManagement = () => {
  const [showFeeForm, setShowFeeForm] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedClass, setSelectedClass] = useState('')
  
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, setValue } = useForm()

  const { data: classes } = useQuery('adminClasses', adminService.getClasses)
  const { data: students, isLoading } = useQuery(
    ['studentsByClass', selectedClass],
    () => adminService.getStudentsByClass(selectedClass),
    { enabled: !!selectedClass }
  )

  const updateFeesMutation = useMutation(
    ({ studentId, feeData }) => adminService.updateStudentFees(studentId, feeData),
    {
      onSuccess: () => {
        toast.success('Student fees updated successfully!')
        queryClient.invalidateQueries(['studentsByClass', selectedClass])
        setShowFeeForm(false)
        setSelectedStudent(null)
        reset()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update fees')
      }
    }
  )

  const handleEditFees = (student) => {
    setSelectedStudent(student)
    setValue('totalFees', student.feeStatus?.totalFees || 0)
    setValue('paidFees', student.feeStatus?.paidFees || 0)
    setShowFeeForm(true)
  }

  const onSubmit = (data) => {
    updateFeesMutation.mutate({
      studentId: selectedStudent._id,
      feeData: {
        totalFees: parseFloat(data.totalFees),
        paidFees: parseFloat(data.paidFees)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
        <p className="text-gray-600">Manage student fee payments and status</p>
      </div>

      {/* Class Selection */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>

      {/* Fee Update Form */}
      {showFeeForm && selectedStudent && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Update Fees - {selectedStudent.user.profile.firstName} {selectedStudent.user.profile.lastName}
            </h3>
            <button
              onClick={() => {
                setShowFeeForm(false)
                setSelectedStudent(null)
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
                  Total Fees (₹)
                </label>
                <input
                  {...register('totalFees', { 
                    required: 'Total fees is required',
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  type="number"
                  step="0.01"
                  className="input-field"
                  placeholder="Enter total fees"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paid Fees (₹)
                </label>
                <input
                  {...register('paidFees', { 
                    required: 'Paid fees is required',
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  type="number"
                  step="0.01"
                  className="input-field"
                  placeholder="Enter paid fees"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowFeeForm(false)
                  setSelectedStudent(null)
                  reset()
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateFeesMutation.isLoading}
                className="btn-primary"
              >
                {updateFeesMutation.isLoading ? 'Updating...' : 'Update Fees'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Students List */}
      {selectedClass && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Students Fee Status</h3>
          
          {isLoading ? (
            <LoadingSpinner />
          ) : !students?.students || students.students.length === 0 ? (
            <div className="text-center py-8">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">No students in the selected class.</p>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Fees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paid Fees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pending Fees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.students.map((student) => (
                    <tr key={student._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-gray-600">
                              {student.user.profile.firstName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.user.profile.firstName} {student.user.profile.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{student.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.rollNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{student.feeStatus?.totalFees || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{student.feeStatus?.paidFees || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{student.feeStatus?.pendingFees || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          (student.feeStatus?.pendingFees || 0) === 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(student.feeStatus?.pendingFees || 0) === 0 ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditFees(student)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FeeManagement