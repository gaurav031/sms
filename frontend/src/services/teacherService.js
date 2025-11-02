import api from './api'

export const teacherService = {
  getDashboard: async () => {
    const response = await api.get('/teachers/dashboard')
    return response.data
  },

  getStudents: async (params = {}) => {
    const response = await api.get('/teachers/students', { params })
    return response.data
  },

  markAttendance: async (attendanceData) => {
    const response = await api.post('/teachers/attendance', attendanceData)
    return response.data
  },

  uploadContent: async (contentData) => {
    const formData = new FormData()
    Object.keys(contentData).forEach(key => {
      if (key === 'file' && contentData[key]) {
        formData.append('file', contentData[key])
      } else {
        formData.append(key, contentData[key])
      }
    })
    
    const response = await api.post('/teachers/content', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  getContent: async (params = {}) => {
    const response = await api.get('/teachers/content', { params })
    return response.data
  },

  postNotice: async (noticeData) => {
    const response = await api.post('/teachers/notices', noticeData)
    return response.data
  },

  getAssignments: async () => {
    const response = await api.get('/teachers/assignments')
    return response.data
  }
}