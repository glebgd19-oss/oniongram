import { motion } from "framer-motion"
import type { User } from "../data/mock"
import { Avatar, GlassButton, glassSpring } from "./Ui"

/**
 * Карточка профиля — стеклянный оверлей.
 * Показывает только @username и то, что пользователь сам разрешил:
 * никаких телефонов, email и реальных имён.
 */
export default function ProfileCard({
  user,
  onClose,
  onCall,
}: {
  user: User
  onClose: () => void
  onCall: (video: boolean) => void
}) {
  const isMe = user.id === "me"
  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="glass-strong glass-refract specular relative w-full max-w-sm overflow-hidden rounded-3xl"
        initial={{ opacity: 0, y: 28, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.96 }}
        transition={glassSpring}
      >
        <div
          className="h-24"
          style={{
            background: `linear-gradient(120deg, hsl(${user.avatarHue} 65% 45% / .55), hsl(${
              user.avatarHue + 80
            } 65% 40% / .45))`,
          }}
        />
        <div className="-mt-10 px-6 pb-6">
          <div className="mb-3 w-fit rounded-full border-4 border-ink-900/60">
            <Avatar user={user} size={76} />
          </div>
          <h3 className="text-lg font-semibold text-white">
            {user.displayName} {user.premium && <span title="Premium (бесплатно)">✨</span>}
          </h3>
          <p className="text-sm text-onion-300">@{user.username}</p>

          {user.customStatus && (
            <p className="glass mt-3 w-fit rounded-xl px-3 py-1.5 text-sm text-slate-200">
              {user.customStatus}
            </p>
          )}

          <div className="mt-4 space-y-1.5 text-xs text-slate-400">
            <p>
              Статус:{" "}
              {user.status === "hidden" ? (
                <span className="text-slate-300">🕶️ невидимка</span>
              ) : user.status === "online" ? (
                <span className="text-emerald-300">в сети</span>
              ) : (
                <span className="text-slate-300">{user.status}</span>
              )}
            </p>
            <p>
              Последний визит:{" "}
              {user.hideLastSeen ? "скрыт настройками приватности 🔒" : user.lastSeen ?? "—"}
            </p>
            <p>🔐 Личные чаты зашифрованы сквозным шифрованием</p>
          </div>

          {!isMe && (
            <div className="mt-5 flex gap-2">
              <GlassButton accent className="flex-1" onClick={() => onCall(false)}>
                📞 Позвонить
              </GlassButton>
              <GlassButton className="flex-1" onClick={() => onCall(true)}>
                🎥 Видео
              </GlassButton>
            </div>
          )}
          {isMe && (
            <p className="mt-5 rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-400">
              Это ваш публичный профиль: только @username, аватар-градиент и статус.
              Никаких персональных данных.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
