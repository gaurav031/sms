import api from './api'

export const studentService = {
  getDashboard: async () => {
    const response = await api.get('/students/dashboard')
    return response.data
  },

  getAttendance: async (params = {}) => {
    const response = await api.get('/students/attendance', { params })
    return response.data
  },

  getContent: async (params = {}) => {
    const response = await api.get('/students/content', { params })
    return response.data
  },

  applyLeave: async (leaveData) => {
    const formData = new FormData()
    Object.keys(leaveData).forEach(key => {
      if (key === 'attachments') {
        leaveData[key].forEach(file => {
          formData.append('attachments', file)
        })
      } else {
        formData.append(key, leaveData[key])
      }
    })
    
    const response = await api.post('/students/leave', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  getLeaveApplications: async () => {
    const response = await api.get('/students/leave')
    return response.data
  },

  getTimetable: async () => {
    const response = await api.get('/students/timetable')
    return response.data
  },

  getExams: async () => {
    const response = await api.get('/students/exams')
    return response.data
  }
}