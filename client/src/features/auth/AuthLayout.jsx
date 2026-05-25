export default function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--bg-app)' }}
    >
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <span className="text-[22px] font-semibold tracking-tight text-primary">
            Columbus
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
