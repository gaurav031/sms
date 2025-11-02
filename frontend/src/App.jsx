import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import StudentDashboard from './pages/student/Dashboard'
import StudentAttendance from './pages/student/Attendance'
import StudentContent from './pages/student/Content'
import StudentLeave from './pages/student/Leave'
import StudentAssignments from './pages/student/Assignments'
import StudentExams from './pages/student/Exams'
import TeacherDashboard from './pages/teacher/Dashboard'
import TeacherStudents from './pages/teacher/Students'
import TeacherContent from './pages/teacher/Content'
import TeacherLeaveManagement from './pages/teacher/LeaveManagement'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminClasses from './pages/admin/Classes'
import AdminTeachers from './pages/admin/Teachers'
import AdminTimetable from './pages/admin/Timetable'
import AdminNotices from './pages/admin/Notices'
import AdminFeeManagement from './pages/admin/FeeManagement'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        {/* Student Routes */}
        {user.role === 'student' && (
          <>
            <Route path="/" element={<StudentDashboard />} />
            <Route path="/attendance" element={<StudentAttendance />} />
            <Route path="/content" element={<StudentContent />} />
            <Route path="/assignments" element={<StudentAssignments />} />
            <Route path="/exams" element={<StudentExams />} />
            <Route path="/leave" element={<StudentLeave />} />
          </>
        )}

        {/* Teacher Routes */}
        {user.role === 'teacher' && (
          <>
            <Route path="/" element={<TeacherDashboard />} />
            <Route path="/students" element={<TeacherStudents />} />
            <Route path="/content" element={<TeacherContent />} />
            <Route path="/leave-management" element={<TeacherLeaveManagement />} />
          </>
        )}

        {/* Admin Routes */}
        {(user.role === 'admin' || user.role === 'principal') && (
          <>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/classes" element={<AdminClasses />} />
            <Route path="/teachers" element={<AdminTeachers />} />
            <Route path="/timetable" element={<AdminTimetable />} />
            <Route path="/notices" element={<AdminNotices />} />
            <Route path="/fees" element={<AdminFeeManagement />} />
          </>
        )}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App