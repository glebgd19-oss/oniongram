import { useState } from "react"
import { motion } from "framer-motion"
import { channels } from "../data/mock"
import { GlassButton, glassSpring } from "./Ui"

/**
 * Канал в стиле Telegram: посты, реакции, счётчик просмотров, подписка.
 */
export default function ChannelView({ channelId }: { channelId: string }) {
  const channel = channels.find((c) => c.id === channelId) ?? channels[0]
  const [subscribed, setSubscribed] = useState(channel.subscribed)
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>(
    Object.fromEntries(channel.posts.map((p) => [p.id, { ...p.reactions }])),
  )

  const react = (postId: string, emoji: string) =>
    setReactions((r) => ({
      ...r,
      [postId]: { ...r[postId], [emoji]: (r[postId][emoji] ?? 0) + 1 },
    }))

  return (
    <motion.section
      className="flex h-full flex-col gap-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={glassSpring}
    >
      <header className="glass glass-refract specular relative z-10 flex items-center gap-3 rounded-2xl px-4 py-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-onion-500/50 to-neo-500/40 text-lg">
          📡
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-100">
            <span className="truncate">{channel.name}</span>
            {channel.verified && <span className="text-neo-300" title="Верифицирован">✓</span>}
          </span>
          <span className="block text-xs text-slate-400">
            @{channel.handle} · {channel.subscribers.toLocaleString("ru-RU")} подписчиков
          </span>
        </span>
        <span className="ml-auto">
          <GlassButton accent={!subscribed} onClick={() => setSubscribed(!subscribed)}>
            {subscribed ? "✓ Вы подписаны" : "Подписаться"}
          </GlassButton>
        </span>
      </header>

      <div className="scroll-slim flex-1 space-y-4 overflow-y-auto rounded-2xl bg-black/25 p-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {channel.posts.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...glassSpring, delay: i * 0.07 }}
              className="rounded-2xl bg-ink-700/90 p-5"
            >
              <p className="text-[15px] leading-relaxed text-slate-100">{p.text}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {Object.entries(reactions[p.id]).map(([emoji, n]) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.1, y: -1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={glassSpring}
                    onClick={() => react(p.id, emoji)}
                    className="rounded-full bg-white/8 px-3 py-1.5 text-sm transition-colors hover:bg-onion-500/25"
                  >
                    {emoji} <span className="text-slate-300">{n}</span>
                  </motion.button>
                ))}
                <span className="ml-auto flex items-center gap-3 text-xs text-slate-500">
                  <span title="Просмотры">👁 {p.views.toLocaleString("ru-RU")}</span>
                  <span>{p.time}</span>
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
