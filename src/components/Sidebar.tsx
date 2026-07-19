import { motion } from "framer-motion"
import { chats, channels, servers, users } from "../data/mock"
import { Avatar, SkeletonRow, TypingDots, glassSpring } from "./Ui"

export type Section = "chats" | "channels" | "servers"

/**
 * Сайдбар — верхний стеклянный слой навигации:
 * рейл разделов (чаты/каналы/сервера) + список текущего раздела.
 * Списки плотные — стекло умеренное ради читаемости.
 */
export default function Sidebar(props: {
  section: Section
  onSection: (s: Section) => void
  loading: boolean
  activeChatId: string
  onChat: (id: string) => void
  activeChannelId: string
  onChannel: (id: string) => void
  activeServerId: string
  onServer: (id: string) => void
  onSearch: () => void
  onSettings: () => void
  onProfile: () => void
}) {
  const me = users.me
  const rail: Array<{ id: Section; icon: string; label: string }> = [
    { id: "chats", icon: "💬", label: "Чаты" },
    { id: "channels", icon: "📡", label: "Каналы" },
    { id: "servers", icon: "🏠", label: "Сервера" },
  ]

  return (
    <motion.aside
      className="glass glass-refract specular relative z-20 flex w-[340px] shrink-0 flex-col overflow-hidden rounded-2xl max-lg:w-[290px] max-md:w-[240px]"
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={glassSpring}
    >
      {/* Шапка */}
      <div className="flex items-center gap-2 border-b border-white/10 p-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-onion-500/60 to-neo-500/50 text-lg shadow-glow-violet">
          🧅
        </span>
        <span className="font-display bg-gradient-to-r from-white via-onion-300 to-neo-300 bg-clip-text text-[17px] font-semibold text-transparent">
          Oniongram
        </span>
        <button
          onClick={props.onSearch}
          title="Глобальный поиск (⌘K)"
          className="glass ml-auto flex min-h-[36px] items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-400 transition-colors hover:text-white"
        >
          🔍 <span className="max-md:hidden">⌘K</span>
        </button>
      </div>

      {/* Рейл разделов */}
      <div className="flex gap-1 border-b border-white/10 p-2">
        {rail.map((r) => (
          <button
            key={r.id}
            onClick={() => props.onSection(r.id)}
            className={`relative flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl text-sm font-medium transition-colors ${
              props.section === r.id ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {props.section === r.id && (
              <motion.span
                layoutId="rail-active"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-onion-500/35 to-neo-500/25"
                transition={glassSpring}
              />
            )}
            <span className="relative">{r.icon}</span>
            <span className="relative max-md:hidden">{r.label}</span>
          </button>
        ))}
      </div>

      {/* Список */}
      <div className="scroll-slim flex-1 overflow-y-auto p-2">
        {props.loading ? (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </>
        ) : props.section === "chats" ? (
          chats.map((c, i) => {
            const u = users[c.userId]
            const isSaved = c.userId === "me"
            const last =
              c.messages.length > 0 ? c.messages[c.messages.length - 1] : undefined
            return (
              <motion.button
                key={c.id}
                onClick={() => props.onChat(c.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...glassSpring, delay: i * 0.04 }}
                whileHover={{ x: 3 }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  props.activeChatId === c.id ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                {isSaved ? (
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-onion-500/60 to-neo-500/50 text-base">
                    📌
                  </span>
                ) : (
                  <Avatar user={u} />
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium text-slate-100">
                      {isSaved ? "Избранное" : u.displayName}
                      {!isSaved && u.premium && <span title="Premium"> ✨</span>}
                    </span>
                    <span className="shrink-0 text-[11px] text-slate-500">{last?.time ?? ""}</span>
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-slate-400">
                      {c.typing ? (
                        <span className="text-neo-300">
                          печатает <TypingDots />
                        </span>
                      ) : !last ? (
                        "Заметки, ссылки и файлы — видны только вам"
                      ) : last.kind === "voice" ? (
                        "🎙️ Голосовое"
                      ) : last.kind === "photo" ? (
                        "🖼️ Фото"
                      ) : last.kind === "file" ? (
                        `📎 ${last.fileName}`
                      ) : (
                        last.text
                      )}
                    </span>
                    {c.unread > 0 && (
                      <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-gradient-to-r from-onion-500 to-neo-500 px-1.5 text-[11px] font-semibold text-white">
                        {c.unread}
                      </span>
                    )}
                  </span>
                </span>
              </motion.button>
            )
          })
        ) : props.section === "channels" ? (
          channels.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm leading-relaxed text-slate-500">
              📡 Каналов пока нет.
              <br />
              Ваши подписки появятся здесь.
            </p>
          ) : (
            channels.map((ch, i) => (
            <motion.button
              key={ch.id}
              onClick={() => props.onChannel(ch.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...glassSpring, delay: i * 0.04 }}
              whileHover={{ x: 3 }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                props.activeChannelId === ch.id ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-onion-500/50 to-neo-500/40 text-base">
                📡
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 text-sm font-medium text-slate-100">
                  <span className="truncate">{ch.name}</span>
                  {ch.verified && <span title="Верифицирован" className="text-neo-300">✓</span>}
                </span>
                <span className="block truncate text-xs text-slate-400">
                  @{ch.handle} · {ch.subscribers.toLocaleString("ru-RU")} подписчиков
                </span>
              </span>
              {!ch.subscribed && (
                <span className="shrink-0 rounded-full bg-onion-500/25 px-2 py-0.5 text-[11px] text-onion-300">
                  новое
                </span>
              )}
            </motion.button>
          ))
          )
        ) : servers.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm leading-relaxed text-slate-500">
            🏠 Серверов пока нет.
            <br />
            Создайте свой или примите инвайт.
          </p>
        ) : (
          servers.map((s, i) => (
            <motion.button
              key={s.id}
              onClick={() => props.onServer(s.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...glassSpring, delay: i * 0.04 }}
              whileHover={{ x: 3 }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                props.activeServerId === s.id ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-onion-500/40 to-neo-500/30 text-lg">
                {s.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-100">{s.name}</span>
                <span className="block truncate text-xs text-slate-400">
                  @{s.handle} · {s.members.toLocaleString("ru-RU")} участников
                </span>
              </span>
            </motion.button>
          ))
        )}
      </div>

      {/* Профиль + настройки */}
      <div className="flex items-center gap-2 border-t border-white/10 p-3">
        <button onClick={props.onProfile} className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl p-1 text-left transition-colors hover:bg-white/5">
          <Avatar user={me} size={36} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-slate-100">
              {me.displayName} ✨
            </span>
            <span className="block truncate text-xs text-slate-400">@{me.username}</span>
          </span>
        </button>
        <button
          onClick={props.onSettings}
          title="Настройки"
          className="glass grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg transition-transform hover:rotate-45"
        >
          ⚙️
        </button>
      </div>
    </motion.aside>
  )
}
