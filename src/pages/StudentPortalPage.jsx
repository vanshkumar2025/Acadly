// StudentPortalPage — student dashboard with attendance, timetable, quotes API
import { useState } from 'react'
import PortalShell from '../components/PortalShell'
import SectionCard from '../components/SectionCard'
import EmptyState from '../components/EmptyState'
import AnnouncementCard from '../components/AnnouncementCard'
import AttendanceChart from '../components/AttendanceChart'
import { calculateAttendancePercentage, calculateOverallAttendance, getSectionById } from '../data/academicsData'
import qrImg from '../image/img.png'

// Keep only core tabs for a simple student flow.
const tabs = ['Dashboard', 'Attendance', 'Timetable']
const inputClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition-colors focus:border-blue-500'

export default function StudentPortalPage({ session, onLogout, collegeProfile, courses, studentProfile, currentStudent, attendanceRecords, announcements, activeSession, onLinkStudentProfile }) {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [setupCourseId, setSetupCourseId] = useState(studentProfile.courseId || '')
  const [setupSectionId, setSetupSectionId] = useState(studentProfile.sectionId || '')

  const isProfileLinked = studentProfile.courseId && studentProfile.sectionId
  const overallAttendance = calculateOverallAttendance(attendanceRecords)
  const studentCourse = courses.find(c => c.id === studentProfile.courseId)
  const studentSection = isProfileLinked ? getSectionById(courses, studentProfile.courseId, studentProfile.sectionId) : null
  const relevantAnnouncements = announcements.filter((a) => a.audience === 'all' || a.audience === studentProfile.courseId)
  const activeStudentSession = activeSession?.sectionId === studentProfile.sectionId ? activeSession : null
  const weeklyClasses = studentSection?.timetable.reduce((sum, d) => sum + d.slots.length, 0) || 0

  function handleTabChange(tab) {
    setActiveTab(tab)
  }

  // Profile setup screen (shown if not linked yet)
  if (!isProfileLinked) {
    const setupCourse = courses.find(c => c.id === setupCourseId)
    return (
      <PortalShell portalName="Student" session={session} onLogout={onLogout} accent="blue" eyebrow="Student setup" title="Connect your student profile" description="Choose the course and section that should power your timetable, attendance view, and announcements.">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <SectionCard title="Profile setup" description="A one-time link is enough to load the student experience with the right academic context.">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Institution</label>
                <div className="rounded-[22px] bg-blue-50 px-4 py-4">
                  <p className="font-semibold text-blue-700">{collegeProfile.name}</p>
                  <p className="mt-1 text-sm text-blue-600">{collegeProfile.location}</p>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Course</label>
                <select value={setupCourseId} onChange={(e) => { setSetupCourseId(e.target.value); setSetupSectionId('') }} className={inputClass}>
                  <option value="">Choose your course</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Section</label>
                <select value={setupSectionId} onChange={e => setSetupSectionId(e.target.value)} className={inputClass}>
                  <option value="">Choose your section</option>
                  {setupCourse?.sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <button type="button" onClick={() => onLinkStudentProfile({ courseId: setupCourseId, sectionId: setupSectionId })} disabled={!setupCourseId || !setupSectionId} className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Save Student Setup</button>
            </div>
          </SectionCard>
          <SectionCard title="What this unlocks" description="The linked section drives the rest of the student portal.">
            <div className="space-y-3">
              {['Your weekly timetable', 'Announcements for your course', 'Attendance records by subject', 'Live QR sessions for your section'].map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">{item}</div>
              ))}
            </div>
          </SectionCard>
        </div>
      </PortalShell>
    )
  }

  const stats = [
    { icon: '📊', value: `${overallAttendance}%`, label: 'Overall Attendance', color: 'teal', note: 'Across all recorded subjects' },
    { icon: '📚', value: attendanceRecords.length, label: 'Tracked Subjects', color: 'orange', note: 'Lecture and lab visibility' },
    { icon: '📢', value: relevantAnnouncements.length, label: 'Relevant Notices', color: 'blue', note: 'Announcements for your course' },
  ]

  return (
    <PortalShell portalName="Student" session={session} onLogout={onLogout} accent="blue" eyebrow="Student workspace" title={`Welcome, ${currentStudent?.name || 'Student'}`}
      description="Your section schedule, attendance health, and course announcements are organized here so the day is easier to read at a glance."
      meta={[studentCourse?.name || 'Course pending', studentSection?.name || 'Section pending', collegeProfile.name]}
      action={<div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Student Snapshot</p>
        <div className="mt-4 rounded-[24px] border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Signed in as</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">{currentStudent?.name || 'Student'}</h2>
          <p className="mt-2 text-sm text-slate-500">{currentStudent?.rollNo}</p>
        </div>
        <div className="mt-4 space-y-3">
          {[{ label: 'Course', value: studentCourse?.name || 'Not linked' }, { label: 'Section', value: studentSection?.name || 'Not linked' }, { label: 'Weekly load', value: `${weeklyClasses} class blocks` }].map((item) => (
            <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{item.value}</p>
            </div>
          ))}
        </div>
      </div>}
      stats={stats} tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange}
    >
      {activeTab === 'Dashboard' && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <SectionCard title="Daily overview" description="The most important student actions are grouped together so the dashboard reads clearly.">
            <div className="grid gap-4 md:grid-cols-2">
              <button type="button" onClick={() => setActiveTab('Attendance')} className="rounded-[24px] bg-blue-50 p-5 text-left transition-colors hover:bg-blue-100">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Quick action</p>
                <h3 className="mt-3 text-xl font-bold text-blue-800">Scan attendance</h3>
                <p className="mt-2 text-sm text-blue-700">{activeStudentSession ? `${activeStudentSession.subject} is live for ${activeStudentSession.sectionName}.` : 'No live section session is active right now.'}</p>
              </button>
              <button type="button" onClick={() => setActiveTab('Timetable')} className="rounded-[24px] bg-slate-50 p-5 text-left transition-colors hover:bg-slate-100">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Schedule</p>
                <h3 className="mt-3 text-xl font-bold text-slate-900">Open beginner timetable</h3>
                <p className="mt-2 text-sm text-slate-500">The weekly timetable now follows beginner JavaScript and React basics topics only.</p>
              </button>
            </div>
            <div className="mt-6 rounded-[24px] border border-slate-200/80 bg-white/82 p-5">
              <h3 className="text-lg font-bold text-slate-900">Attendance summary</h3>
              <div className="mt-4"><AttendanceChart records={attendanceRecords} /></div>
            </div>
          </SectionCard>
          <div className="space-y-6">
            <SectionCard title="Latest notices" description="Course-level updates stay visible without crowding the rest of the dashboard.">
              <div className="space-y-3">{relevantAnnouncements.slice(0, 3).map((a) => <AnnouncementCard key={a.id} announcement={a} />)}</div>
            </SectionCard>

          </div>
        </div>
      )}

      {activeTab === 'Attendance' && (
        <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <SectionCard title="QR attendance" description="This flow simulates scanning, verification, and the attendance response for your section.">
            <div className="text-center">
              <div>
                <img
                  src={qrImg}
                  alt="Attendance QR"
                  className="mx-auto mb-5 h-52 w-52 rounded-[28px] border border-slate-200/80 bg-white object-contain"
                />
                <div className={`mb-6 rounded-[24px] p-5 ${activeStudentSession ? 'bg-green-50' : 'bg-slate-50'}`}>
                  <p className={`text-sm font-semibold ${activeStudentSession ? 'text-green-700' : 'text-slate-500'}`}>{activeStudentSession ? `Live session: ${activeStudentSession.subject}` : 'No active session right now'}</p>
                  <p className={`mt-1 text-xs ${activeStudentSession ? 'text-green-600' : 'text-slate-400'}`}>{activeStudentSession ? `${activeStudentSession.sectionName} • ${activeStudentSession.time}` : 'Ask the academic team to start attendance for this section.'}</p>
                </div>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Subject-wise attendance" description="Keep track of the lecture and lab subjects independently so nothing gets lost in the overall average.">
            <div className="overflow-hidden rounded-[24px] border border-slate-200/80"><div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Subject</th><th>Attended</th><th>Total</th><th>Percentage</th></tr></thead>
                <tbody>
                  {attendanceRecords.map((r) => {
                    const pct = calculateAttendancePercentage(r.attended, r.total)
                    return <tr key={r.id}><td>{r.subject}</td><td>{r.attended}</td><td>{r.total}</td><td><span className={`rounded-full px-3 py-1 text-xs font-semibold ${pct >= 75 ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>{pct}%</span></td></tr>
                  })}
                </tbody>
              </table>
            </div></div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'Timetable' && (
        <SectionCard title="Beginner timetable" description="This timetable is aligned with your basic JavaScript and React learning topics.">
          {studentSection ? (
            <div className="overflow-hidden rounded-[24px] border border-slate-200/80"><div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Day</th><th>Subject</th><th>Time</th></tr></thead>
                <tbody>
                  {studentSection.timetable.map((day) => (
                    day.slots.length > 0 ? day.slots.map((slot, i) => (
                      <tr key={`${day.day}-${slot.subject}-${slot.time}`}>
                        {i === 0 && <td rowSpan={day.slots.length}>{day.day}</td>}
                        <td>{slot.subject}</td><td>{slot.time}</td>
                      </tr>
                    )) : <tr key={day.day}><td>{day.day}</td><td colSpan="2">No classes scheduled.</td></tr>
                  ))}
                </tbody>
              </table>
            </div></div>
          ) : <EmptyState icon="📅" title="Timetable not available" description="Link a course and section to unlock your timetable." />}
        </SectionCard>
      )}

    </PortalShell>
  )
}
