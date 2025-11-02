import api from './api'

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard')
    return response.data
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params })
    return response.data
  },

  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData)
    return response.data
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData)
    return response.data
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`)
    return response.data
  },

  getClasses: async () => {
    const response = await api.get('/admin/classes')
    return response.data
  },

  createClass: async (classData) => {
    const response = await api.post('/admin/classes', classData)
    return response.data
  },

  getSubjects: async () => {
    const response = await api.get('/admin/subjects')
    return response.data
  },

  createSubject: async (subjectData) => {
    const response = await api.post('/admin/subjects', subjectData)
    return response.data
  },

  updateStudentFees: async (studentId, feeData) => {
    const response = await api.put(`/admin/students/${studentId}/fees`, feeData)
    return response.data
  },

  getTeachers: async () => {
    const response = await api.get('/admin/teachers')
    return response.data
  },

  assignTeacher: async (teacherId, assignmentData) => {
    const response = await api.post(`/admin/teachers/${teacherId}/assign`, assignmentData)
    return response.data
  },

  getStudentsByClass: async (classId) => {
    const response = await api.get(`/admin/students/class/${classId}`)
    return response.data
  },

  postNotice: async (noticeData) => {
    const response = await api.post('/admin/notices', noticeData)
    return response.data
  },

  generateTimetable: async (timetableData) => {
    const response = await api.post('/admin/timetable/generate', timetableData)
    return response.data
  }
}