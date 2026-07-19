import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { channels, chats, servers, users } from "../data/mock"
import { Avatar, glassSpring } from "./Ui"

/**
 * Глобальный поиск (⌘K): пользователи, каналы, сервера, сообщения.
 * Поиск по @username — основной способ найти собеседника и позвонить.
 */
export default function Search({
  onClose,
  onOpenChat,
  onOpenChannel,
  onOpenServer,
  onCall,
}: {
  onClose: () => void
  onOpenChat: (chatId: string) => void
  onOpenChannel: (id: string) => void
  onOpenServer: (id: string) => void
  onCall: (userId: string) => void
}) {
  const [q, setQ] = useState("")
  const query = q.trim().toLowerCase().replace(/^@/, "")

  const results = useMemo(() => {
    if (!query) return null
    const userHits = Object.values(users).filter(
      (u) =>
        u.id !== "me" &&
        (u.username.includes(query) || u.displayName.toLowerCase().includes(query)),
    )
    const channelHits = channels.filter(
      (c) => c.handle.includes(query) || c.name.toLowerCase().includes(query),
    )
    const serverHits = servers.filter(
      (s) => s.handle.includes(query) || s.name.toLowerCase().includes(query),
    )
    const messageHits = chats
      .flatMap((c) => c.messages.map((m) => ({ chat: c, m })))
      .filter(({ m }) => m.text && !m.text.includes("=") && m.text.toLowerCase().includes(query))
      .slice(0, 5)
    return { userHits, channelHits, serverHits, messageHits }
  }, [query])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-center bg-black/45 p-4 pt-[10vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="glass-strong glass-refract specular relative h-fit max-h-[70vh] w-full max-w-xl overflow-hidden rounded-2xl"
        initial={{ opacity: 0, y: -24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.98 }}
        transition={glassSpring}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
          <span className="text-lg">🔍</span>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск: @username, каналы, сервера, сообщения…"
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-slate-500"
          />
          <kbd className="rounded-md bg-white/8 px-2 py-1 text-[11px] text-slate-400">Esc</kbd>
        </div>

        <div className="scroll-slim max-h-[55vh] overflow-y-auto p-2">
          {!results && (
            <p className="px-3 py-6 text-center text-sm text-slate-500">
              Начните вводить — ищем по всему Oniongram.
              <br />
              <span className="text-xs">@username, каналы, сервера и ваши сообщения</span>
            </p>
          )}

          {results && (
            <>
              {results.userHits.length > 0 && (
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Пользователи
                </p>
              )}
              {results?.userHits.map((u) => {
                const chat = chats.find((c) => c.userId === u.id)
                return (
                  <div key={u.id} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5">
                    <Avatar user={u} size={34} />
                    <button
                      onClick={() => chat && onOpenChat(chat.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate text-sm text-slate-100">
                        {u.displayName} {u.premium && "✨"}
                      </span>
                      <span className="block truncate text-xs text-slate-400">@{u.username}</span>
                    </button>
                    <button
                      onClick={() => onCall(u.id)}
                      title={`Позвонить @${u.username}`}
                      className="glass grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm"
                    >
                      📞
                    </button>
                  </div>
                )
              })}

              {results.channelHits.length > 0 && (
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Каналы
                </p>
              )}
              {results.channelHits.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onOpenChannel(c.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-white/5"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-onion-500/25 text-sm">📡</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-slate-100">{c.name}</span>
                    <span className="block truncate text-xs text-slate-400">
                      @{c.handle} · {c.subscribers.toLocaleString("ru-RU")}
                    </span>
                  </span>
                </button>
              ))}

              {results.serverHits.length > 0 && (
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Сервера
                </p>
              )}
              {results.serverHits.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onOpenServer(s.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-white/5"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-neo-500/20 text-sm">{s.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-slate-100">{s.name}</span>
                    <span className="block truncate text-xs text-slate-400">
                      @{s.handle} · {s.members.toLocaleString("ru-RU")} участников
                    </span>
                  </span>
                </button>
              ))}

              {results.messageHits.length > 0 && (
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Сообщения
                </p>
              )}
              {results.messageHits.map(({ chat, m }) => (
                <button
                  key={m.id}
                  onClick={() => onOpenChat(chat.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-white/5"
                >
                  <Avatar user={users[chat.userId]} size={34} showStatus={false} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-slate-100">
                      {users[chat.userId].displayName}
                    </span>
                    <span className="block truncate text-xs text-slate-400">{m.text}</span>
                  </span>
                  <span className="shrink-0 text-[11px] text-slate-500">{m.time}</span>
                </button>
              ))}

              {results.userHits.length +
                results.channelHits.length +
                results.serverHits.length +
                results.messageHits.length ===
                0 && (
                <p className="px-3 py-6 text-center text-sm text-slate-500">
                  Ничего не найдено по «{q}» 🧅
                </p>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
