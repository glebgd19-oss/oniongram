import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { users } from "../data/mock"
import { Avatar, glassSpring } from "./Ui"

export type CallState = { userId: string; video: boolean; startedAt: number }

/**
 * Оверлей звонка — верхний стеклянный слой над всем интерфейсом.
 * В демо звонок имитируется; в проде — WebRTC через бесплатный STUN
 * + сигналинг через Supabase Realtime (бесплатный тариф).
 */
export default function CallWindow({
  call,
  onEnd,
}: {
  call: CallState
  onEnd: () => void
}) {
  const peer = users[call.userId]
  const [seconds, setSeconds] = useState(0)
  const [muted, setMuted] = useState(false)
  const [camOff, setCamOff] = useState(!call.video)

  useEffect(() => {
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(t)
  }, [])

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0")
  const ss = String(seconds % 60).padStart(2, "0")

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="glass-strong glass-refract specular relative w-full max-w-lg overflow-hidden rounded-3xl p-8 text-center"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={glassSpring}
      >
        {call.video && !camOff && (
          <div
            className="absolute inset-0 -z-10 opacity-60"
            style={{
              background: `radial-gradient(600px 400px at 50% 30%, hsl(${peer.avatarHue} 60% 30% / .8), transparent 70%)`,
            }}
          />
        )}

        <motion.div
          className="mx-auto mb-4 w-fit"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Avatar user={peer} size={96} showStatus={false} />
        </motion.div>

        <h2 className="text-xl font-semibold text-white">{peer.displayName}</h2>
        <p className="text-sm text-slate-400">@{peer.username}</p>

        <p className="mt-3 flex items-center justify-center gap-2 text-sm text-neo-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          {call.video ? "Видеозвонок" : "Голосовой звонок"} · {mm}:{ss}
        </p>
        <p className="mt-1 text-xs text-slate-500">🔐 сквозное шифрование · P2P (демо)</p>

        <div className="mt-7 flex items-center justify-center gap-3">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setMuted(!muted)}
            title={muted ? "Включить микрофон" : "Выключить микрофон"}
            className={`glass grid h-14 w-14 place-items-center rounded-2xl text-xl ${muted ? "bg-red-500/25" : ""}`}
          >
            {muted ? "🔇" : "🎙️"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setCamOff(!camOff)}
            title={camOff ? "Включить камеру" : "Выключить камеру"}
            className={`glass grid h-14 w-14 place-items-center rounded-2xl text-xl ${camOff ? "bg-white/5 opacity-60" : ""}`}
          >
            🎥
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onEnd}
            title="Завершить звонок"
            className="grid h-14 w-20 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-xl text-white shadow-[0_0_24px_rgba(239,68,68,.4)]"
          >
            📞
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
