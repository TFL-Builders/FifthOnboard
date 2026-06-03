import Sidebar from './Sidebar'

export default function AppShell({ children }) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-app)' }}>
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}
