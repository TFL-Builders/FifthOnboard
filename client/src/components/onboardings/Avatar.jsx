const AVATAR_COLORS = [
  '#3b5bdb', '#1098ad', '#0ca678', '#f59f00',
  '#e64980', '#7950f2', '#f76707', '#2f9e44',
]

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export function getAvatarColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export default function Avatar({ name = '', avatarColor, size = 30 }) {
  const bg = avatarColor || getAvatarColor(name)
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0 font-semibold"
      style={{
        width: size,
        height: size,
        backgroundColor: bg + '22',
        color: bg,
        fontSize: Math.round(size * 0.36),
      }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  )
}
