import { Compass, CheckCircle2, Users, BarChart3 } from 'lucide-react'

const features = [
  { icon: CheckCircle2, text: 'Guided onboarding flows for every role' },
  { icon: Users,        text: 'Manage your whole team in one place'   },
  { icon: BarChart3,    text: 'Track progress with real-time insights' },
]

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-app)' }}>

      {/* ── Left brand panel — desktop only ── */}
      <aside
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        aria-hidden="true"
        style={{ background: 'var(--auth-panel-bg)' }}
      >
        {/* Dot-grid texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Soft radial glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(255,255,255,0.09) 0%, transparent 68%)',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-lg"
            style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}
          >
            <Compass size={20} className="text-white" aria-hidden="true" />
          </div>
          <span className="text-[20px] font-semibold text-white tracking-tight">
            Columbus
          </span>
        </div>

        {/* Tagline + feature list */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-[38px] font-bold text-white leading-[1.15]">
              Onboarding<br />made human.
            </h2>
            <p
              className="mt-3 text-[15px] leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.62)' }}
            >
              Everything your team needs to get up to speed — fast.
            </p>
          </div>

          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div
                  className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}
                >
                  <Icon size={14} className="text-white" aria-hidden="true" />
                </div>
                <span
                  className="text-[14px]"
                  style={{ color: 'rgba(255,255,255,0.82)' }}
                >
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Copyright footer */}
        <p
          className="relative z-10 text-[12px]"
          style={{ color: 'rgba(255,255,255,0.32)' }}
        >
          &copy; {new Date().getFullYear()} Columbus. All rights reserved.
        </p>
      </aside>

      {/* ── Right form panel ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-5 py-12"
        style={{ backgroundColor: 'var(--bg-app)' }}
      >
        {/* Mobile-only wordmark */}
        <div className="lg:hidden mb-8 flex items-center gap-2">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Compass size={16} className="text-white" aria-hidden="true" />
          </div>
          <span
            className="text-[18px] font-semibold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Columbus
          </span>
        </div>

        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>

    </div>
  )
}
