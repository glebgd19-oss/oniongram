import { useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { chats, users, type Message } from "../data/mock"
import { createRateLimiter, demoDecrypt, demoEncrypt } from "../lib/security"
import { Avatar, TypingDots, glassSpring } from "./Ui"

// Отправленные сообщения хранятся в памяти до перезагрузки страницы
// (бэкенда нет) — переживают переключение разделов и чатов.
const sentStore: Record<string, Message[]> = {}

/**
 * Окно личного чата: текст, фото, файлы, голосовые.
 * Сообщения — нижний слой без стекла (читаемость),
 * шапка и поле ввода — стеклянные слои сверху.
 * E2E-демо: текст шифруется перед «отправкой» и расшифровывается при рендере.
 * Rate-limit: не более 5 сообщений за 10 секунд — защита от спам-ботов.
 */
export default function ChatWindow({
  chatId,
  onCall,
  onProfile,
}: {
  chatId: string
  onCall: (userId: string, video: boolean) => void
  onProfile: (userId: string) => void
}) {
  const chat = chats.find((c) => c.id === chatId) ?? chats[0]
  const peer = users[chat.userId]
  const isSaved = chat.userId === "me"
  const [extra, setExtra] = useState<Message[]>(() => sentStore[chat.id] ?? [])
  const [draft, setDraft] = useState("")
  const [limitMsg, setLimitMsg] = useState<string | null>(null)
  const limiter = useMemo(() => createRateLimiter(5, 10_000), [chatId])
  const bottomRef = useRef<HTMLDivElement>(null)

  const send = () => {
    const text = draft.trim()
    if (!text) return
    const gate = limiter.tryConsume()
    if (!gate.ok) {
      setLimitMsg(
        `Слишком быстро — антиспам. Подождите ${Math.ceil(gate.retryInMs / 1000)} с.`,
      )
      window.setTimeout(() => setLimitMsg(null), 2500)
      return
    }
    // Имитация E2E: храним шифротекст, расшифровываем при рендере
    const cipher = demoEncrypt(text)
    setExtra((xs) => {
      const next: Message[] = [
        ...xs,
        {
          id: `x${Date.now()}`,
          authorId: "me",
          kind: "text",
          text: cipher,
          time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
          encrypted: true,
          mine: true,
        },
      ]
      sentStore[chat.id] = next
      return next
    })
    setDraft("")
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }))
  }

  const renderText = (m: Message) =>
    m.id.startsWith("x") && m.text ? demoDecrypt(m.text) : m.text

  const all = [...chat.messages, ...extra]

  return (
    <motion.section
      className="flex h-full flex-col gap-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={glassSpring}
    >
      {/* Шапка — стеклянный слой */}
      <header className="glass glass-refract specular relative z-10 flex items-center gap-3 rounded-2xl px-4 py-3">
        <button onClick={() => onProfile(peer.id)} className="flex items-center gap-3 text-left">
          {isSaved ? (
            <span className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-onion-500/60 to-neo-500/50 text-lg">
              📌
            </span>
          ) : (
            <Avatar user={peer} size={42} />
          )}
          <span>
            <span className="block text-sm font-semibold text-slate-100">
              {isSaved ? "Избранное" : peer.displayName} {!isSaved && peer.premium && "✨"}
            </span>
            <span className="block text-xs text-slate-400">
              {isSaved ? (
                "личные заметки — видны только вам"
              ) : (
                <>
                  @{peer.username} ·{" "}
                  {chat.typing ? (
                    <span className="text-neo-300">
                      печатает <TypingDots />
                    </span>
                  ) : peer.hideLastSeen ? (
                    "был(а) недавно 🕶️"
                  ) : peer.status === "online" ? (
                    "в сети"
                  ) : (
                    `был(а) ${peer.lastSeen ?? "давно"}`
                  )}
                </>
              )}
            </span>
          </span>
        </button>
        <span className="ml-2 hidden items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-300 md:flex">
          🔐 E2E-шифрование
        </span>
        {!isSaved && (
          <span className="ml-auto flex gap-2">
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} onClick={() => onCall(peer.id, false)} title="Голосовой звонок" className="glass grid h-11 w-11 place-items-center rounded-xl text-lg">
              📞
            </motion.button>
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} onClick={() => onCall(peer.id, true)} title="Видеозвонок" className="glass grid h-11 w-11 place-items-center rounded-xl text-lg">
              🎥
            </motion.button>
          </span>
        )}
      </header>

      {/* Лента сообщений — нижний слой, без стекла */}
      <div className="scroll-slim flex-1 space-y-3 overflow-y-auto rounded-2xl bg-black/25 p-4">
        {all.length === 0 && (
          <div className="grid h-full place-items-center">
            <p className="max-w-xs text-center text-sm leading-relaxed text-slate-500">
              {isSaved
                ? "📌 Это «Избранное» — личный чат для заметок, ссылок и файлов. Напишите первое сообщение — оно зашифруется локально."
                : "Здесь пока пусто — напишите первое сообщение."}
            </p>
          </div>
        )}
        {all.map((m, i) => {
          const author = users[m.authorId]
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...glassSpring, delay: Math.min(i * 0.03, 0.3) }}
              className={`flex items-end gap-2.5 ${m.mine ? "flex-row-reverse" : ""}`}
            >
              {!m.mine && <Avatar user={author} size={32} showStatus={false} />}
              <div
                className={`max-w-[62%] rounded-2xl px-4 py-2.5 max-md:max-w-[80%] ${
                  m.mine
                    ? "rounded-br-md bg-gradient-to-br from-onion-600/85 to-onion-500/70 text-white"
                    : "rounded-bl-md bg-ink-700/90 text-slate-100"
                }`}
              >
                {m.kind === "photo" && (
                  <div
                    className="mb-2 h-40 w-64 max-w-full rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, hsl(${m.photoHue} 60% 35%), hsl(${(m.photoHue ?? 0) + 70} 60% 25%))`,
                    }}
                    role="img"
                    aria-label="Фото (демо)"
                  />
                )}
                {m.kind === "file" && (
                  <span className="mb-1 flex items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-neo-500/25 text-base">📄</span>
                    <span>
                      <span className="block text-sm font-medium">{m.fileName}</span>
                      <span className="block text-xs opacity-70">{m.fileSize} · зашифрован</span>
                    </span>
                  </span>
                )}
                {m.kind === "voice" && (
                  <span className="flex items-center gap-2 py-1">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-sm">▶</span>
                    <span className="flex h-6 items-center gap-0.5">
                      {Array.from({ length: 24 }).map((_, j) => (
                        <span
                          key={j}
                          className="wave-bar w-0.5 rounded-full bg-white/70"
                          style={{ height: 6 + ((j * 7) % 16), animationDelay: `${j * 0.06}s` }}
                        />
                      ))}
                    </span>
                    <span className="text-xs opacity-80">0:{String(m.voiceSeconds).padStart(2, "0")}</span>
                  </span>
                )}
                {m.text && m.kind !== "file" && (
                  <p className="text-[15px] leading-relaxed">{renderText(m)}</p>
                )}
                <span className="mt-1 flex items-center justify-end gap-1.5 text-[11px] opacity-60">
                  {m.encrypted && <span title="Зашифровано">🔒</span>}
                  {m.time}
                  {m.mine && <span>✓✓</span>}
                </span>
                {m.reactions && (
                  <span className="mt-1.5 flex flex-wrap gap-1.5">
                    {Object.entries(m.reactions).map(([emoji, n]) => (
                      <motion.span
                        key={emoji}
                        whileHover={{ scale: 1.15 }}
                        className="cursor-pointer rounded-full bg-white/12 px-2 py-0.5 text-xs"
                      >
                        {emoji} {n}
                      </motion.span>
                    ))}
                  </span>
                )}
              </div>
            </motion.div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Поле ввода — стеклянный слой */}
      <footer className="glass glass-refract specular relative z-10 rounded-2xl p-2">
        <AnimatePresence>
          {limitMsg && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-3 pb-1 text-xs text-amber-300"
            >
              ⚠️ {limitMsg}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-2">
          <button title="Прикрепить файл" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg transition-colors hover:bg-white/10">
            📎
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={
              isSaved
                ? "Заметка для себя… (шифруется локально)"
                : `Сообщение для @${peer.username}… (шифруется локально)`
            }
            className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-[15px] outline-none placeholder:text-slate-500"
          />
          <button title="Голосовое сообщение" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg transition-colors hover:bg-white/10">
            🎙️
          </button>
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            transition={glassSpring}
            onClick={send}
            title="Отправить"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-onion-500 to-neo-500 text-lg text-white shadow-glow-violet"
          >
            ➤
          </motion.button>
        </div>
      </footer>
    </motion.section>
  )
}
