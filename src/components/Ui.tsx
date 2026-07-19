import { motion } from "framer-motion"
import { Component } from "react"
import type { ReactNode } from "react"
import type { User, UserStatus } from "../data/mock"

// Общая spring-физика «перетекания» стекла (300–400 мс)
export const glassSpring = {
  type: "spring" as const,
  stiffness: 320,
  damping: 30,
  mass: 0.9,
}

export function Avatar({
  user,
  size = 40,
  showStatus = true,
}: {
  user: User
  size?: number
  showStatus?: boolean
}) {
  const statusColor: Record<UserStatus, string> = {
    online: "#34d399",
    idle: "#fbbf24",
    dnd: "#f87171",
    hidden: "#64748b",
    offline: "#475569",
  }
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="grid h-full w-full place-items-center rounded-full font-semibold text-white/90"
        style={{
          fontSize: size * 0.38,
          background: `linear-gradient(135deg, hsl(${user.avatarHue} 70% 55%), hsl(${
            user.avatarHue + 60
          } 70% 40%))`,
          boxShadow: `0 0 ${size / 3}px hsl(${user.avatarHue} 80% 60% / .35)`,
        }}
      >
        {user.displayName[0]}
      </div>
      {showStatus && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-ink-900 ${
            user.status === "online" ? "dot-online" : ""
          }`}
          style={{
            width: size * 0.3,
            height: size * 0.3,
            background: statusColor[user.status],
          }}
          title={user.status}
        />
      )}
    </div>
  )
}

export function GlassButton({
  children,
  onClick,
  accent = false,
  className = "",
  title,
}: {
  children: ReactNode
  onClick?: () => void
  accent?: boolean
  className?: string
  title?: string
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={glassSpring}
      onClick={onClick}
      title={title}
      className={`glass glass-refract rounded-xl px-4 py-2 text-sm font-medium ${
        accent
          ? "bg-gradient-to-r from-onion-500/40 to-neo-500/30 text-white shadow-glow-violet"
          : "text-slate-200 hover:bg-white/10"
      } ${className}`}
    >
      {children}
    </motion.button>
  )
}

export function Modal({
  children,
  onClose,
  width = 720,
}: {
  children: ReactNode
  onClose: () => void
  width?: number
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="glass-strong glass-refract specular relative max-h-[85vh] w-full overflow-hidden rounded-2xl"
        style={{ maxWidth: width }}
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={glassSpring}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export function EmptyState({
  icon,
  title,
  desc,
}: {
  icon: string
  title: string
  desc: string
}) {
  return (
    <motion.div
      className="grid h-full place-items-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={glassSpring}
    >
      <div className="glass glass-refract specular max-w-sm rounded-3xl p-8 text-center">
        <span className="text-4xl">{icon}</span>
        <p className="mt-3 text-base font-semibold text-white">{title}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{desc}</p>
      </div>
    </motion.div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className="skeleton h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-2/5 rounded" />
        <div className="skeleton h-3 w-4/5 rounded" />
      </div>
    </div>
  )
}

export function TypingDots() {
  return (
    <span className="inline-flex items-end gap-0.5 align-middle">
      {[0, 1, 2].map((i) => (
        <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-neo-400" />
      ))}
    </span>
  )
}

/** Предохранитель: любая ошибка рендера показывает понятный экран вместо пустого/серого */
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: 24,
            background: "#07070f",
            color: "#e2e8f0",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ maxWidth: 560, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧅</div>
            <h1 style={{ fontSize: 20, marginBottom: 8 }}>Что-то пошло не так</h1>
            <p style={{ opacity: 0.7, fontSize: 14, marginBottom: 16 }}>
              Обновите страницу (Ctrl+F5). Если не помогло — ниже техническая деталь ошибки.
            </p>
            <code
              style={{
                display: "block",
                padding: 12,
                borderRadius: 12,
                background: "rgba(255,255,255,.06)",
                fontSize: 12,
                wordBreak: "break-word",
              }}
            >
              {String(this.state.error)}
            </code>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
