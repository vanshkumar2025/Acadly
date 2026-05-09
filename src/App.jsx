// App.jsx — state, actions, and routing
import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { calculateAttendancePercentage, demoLoginCredentials, initialPortalState } from './data/academicsData'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import StudentPortalPage from './pages/StudentPortalPage'

// Helper to generate readable timestamps
function timestamp() {
  return new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function App() {
  // Keep all app data in one state object.
  const [data, setData] = useState(initialPortalState)
  // Logged-in student info.
  const [session, setSession] = useState(null)

  // Simple local shortcuts so JSX is easier to read.
  const collegeProfile = data.collegeProfile
  const courses = data.courses
  const students = data.students
  const studentProfile = data.studentProfile
  const announcements = data.announcements
  const attendanceRecords = data.attendanceRecords
  const activeSession = data.activeSession

  const studentId = session ? session.entityId : studentProfile.studentId
  const currentStudent = students.find((s) => s.id === studentId) || null
  const recordsWithPercentage = attendanceRecords.map((record) => ({
    ...record,
    percentage: calculateAttendancePercentage(record.attended, record.total),
  }))

  // Student actions
  function linkStudentProfile({ courseId, sectionId }) {
    if (!courseId || !sectionId) return
    setData({
      ...data,
      studentProfile: { ...studentProfile, studentId, courseId, sectionId },
    })
  }


  // Login / Logout
  function handleLogin({ identifier, password }) {
    const id = identifier.trim().toLowerCase()
    const pw = password.trim()
    if (!id || !pw) return { ok: false, message: 'Enter both your roll number and password.' }

    const student = students.find((s) => s.rollNo.toLowerCase() === id)
    if (!student || pw !== demoLoginCredentials.password)
      return { ok: false, message: 'Login incorrect. Use a listed roll number with the demo password.' }

    setSession({ role: 'student', entityId: student.id, displayName: student.name })
    setData({ ...data, studentProfile: { ...studentProfile, studentId: student.id } })
    return { ok: true, redirectTo: '/student' }
  }

  function logout() { setSession(null) }

  // Routes
  return (
    <Routes>
      <Route path="/" element={<HomePage session={session} onLogout={logout} />} />
      <Route path="/login" element={<LoginPage session={session} onLogin={handleLogin} onLogout={logout} />} />
      <Route path="/student" element={
        session?.role !== 'student'
          ? <Navigate to="/login" replace />
          : <StudentPortalPage session={session} onLogout={logout} collegeProfile={collegeProfile} courses={courses} studentProfile={studentProfile} currentStudent={currentStudent} attendanceRecords={recordsWithPercentage} announcements={announcements} activeSession={activeSession} onLinkStudentProfile={linkStudentProfile} />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
