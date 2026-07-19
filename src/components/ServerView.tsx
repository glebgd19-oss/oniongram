import { motion } from "framer-motion"
import { servers, users } from "../data/mock"
import { Avatar, glassSpring } from "./Ui"

/**
 * Сервер в стиле Discord: текстовые/голосовые каналы, роли и права.
 * Слева — стеклянная панель каналов, справа — участники с ролями.
 */
export default function ServerView({
  serverId,
  channelId,
  onChannel,
  onProfile,
}: {
  serverId: string
  channelId: string
  onChannel: (id: string) => void
  onProfile: (userId: string) => void
}) {
  const server = servers.find((s) => s.id === serverId) ?? servers[0]
  const channel = server.channels.find((c) => c.id === channelId) ?? server.channels[0]
  const messages = server.messages[channel.id] ?? []

  return (
    <motion.section
      className="flex h-full gap-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={glassSpring}
    >
      {/* Каналы сервера — стеклянный слой */}
      <aside className="glass glass-refract specular relative z-10 flex w-60 shrink-0 flex-col overflow-hidden rounded-2xl max-md:w-48">
        <div className="border-b border-white/10 p-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <span className="text-lg">{server.icon}</span>
            <span className="truncate">{server.name}</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            @{server.handle} · {server.members.toLocaleString("ru-RU")}
          </p>
        </div>
        <div className="scroll-slim flex-1 overflow-y-auto p-2">
          <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Текстовые
          </p>
          {server.channels
            .filter((c) => c.type === "text")
            .map((c) => (
              <button
                key={c.id}
                onClick={() => onChannel(c.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                  channel.id === c.id
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <span className="text-slate-500">#</span> {c.name}
              </button>
            ))}
          <p className="px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Голосовые
          </p>
          {server.channels
            .filter((c) => c.type === "voice")
            .map((c) => (
              <div key={c.id} className="rounded-lg px-2.5 py-2 text-sm text-slate-400 hover:bg-white/5">
                <span className="flex items-center gap-2">
                  🔊 {c.name}
                  {(c.activeVoices?.length ?? 0) > 0 && (
                    <span className="ml-auto rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-[10px] text-emerald-300">
                      {c.activeVoices!.length} в войсе
                    </span>
                  )}
                </span>
                {c.activeVoices?.map((uid) => (
                  <span key={uid} className="mt-1.5 flex items-center gap-2 pl-5 text-xs text-slate-300">
                    <Avatar user={users[uid]} size={18} showStatus={false} /> {users[uid].displayName}
                  </span>
                ))}
              </div>
            ))}
        </div>
      </aside>

      {/* Сообщения канала — нижний слой */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <header className="glass glass-refract specular relative z-10 flex items-center gap-2 rounded-2xl px-4 py-3">
          <span className="text-lg text-slate-500">{channel.type === "text" ? "#" : "🔊"}</span>
          <span className="text-sm font-semibold text-slate-100">{channel.name}</span>
          <span className="ml-auto text-xs text-slate-500">медленный режим: 5с · антиспам вкл.</span>
        </header>
        <div className="scroll-slim flex-1 space-y-3 overflow-y-auto rounded-2xl bg-black/25 p-4">
          {messages.map((m, i) => {
            const author = users[m.authorId]
            const role = server.roles.find((r) => r.id === server.memberRoles[m.authorId])
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...glassSpring, delay: i * 0.05 }}
                className="flex gap-3 rounded-xl p-2 transition-colors hover:bg-white/4"
              >
                <button onClick={() => onProfile(author.id)} className="self-start">
                  <Avatar user={author} size={38} showStatus={false} />
                </button>
                <div className="min-w-0">
                  <p className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold" style={{ color: role?.color ?? "#e2e8f0" }}>
                      {author.displayName}
                    </span>
                    {role && (
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                        style={{ background: `${role.color}22`, color: role.color }}
                      >
                        {role.name}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500">{m.time}</span>
                  </p>
                  {m.kind === "photo" && (
                    <div
                      className="mt-1.5 h-36 w-60 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, hsl(${m.photoHue} 60% 35%), hsl(${(m.photoHue ?? 0) + 70} 60% 25%))`,
                      }}
                      role="img"
                      aria-label="Фото (демо)"
                    />
                  )}
                  {m.text && <p className="mt-0.5 text-[15px] leading-relaxed text-slate-200">{m.text}</p>}
                  {m.reactions && (
                    <span className="mt-1.5 flex gap-1.5">
                      {Object.entries(m.reactions).map(([emoji, n]) => (
                        <motion.span
                          key={emoji}
                          whileHover={{ scale: 1.12 }}
                          className="cursor-pointer rounded-full bg-white/8 px-2 py-0.5 text-xs"
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
        </div>
        <footer className="glass glass-refract relative z-10 flex items-center gap-2 rounded-2xl p-2">
          <input
            placeholder={`Сообщение в #${channel.name}`}
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[15px] outline-none placeholder:text-slate-500"
          />
          <button className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-onion-500 to-neo-500 text-lg text-white shadow-glow-violet">
            ➤
          </button>
        </footer>
      </div>

      {/* Участники и роли */}
      <aside className="glass glass-refract specular relative z-10 hidden w-56 shrink-0 flex-col overflow-hidden rounded-2xl xl:flex">
        <p className="border-b border-white/10 p-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Участники и роли
        </p>
        <div className="scroll-slim flex-1 overflow-y-auto p-2">
          {server.roles.map((role) => {
            const members = Object.entries(server.memberRoles)
              .filter(([, rid]) => rid === role.id)
              .map(([uid]) => users[uid])
            if (!members.length) return null
            return (
              <div key={role.id} className="mb-3">
                <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: role.color }}>
                  {role.name} — {members.length}
                </p>
                {members.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => onProfile(u.id)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/5"
                  >
                    <Avatar user={u} size={28} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-slate-200">{u.displayName}</span>
                      {u.customStatus && (
                        <span className="block truncate text-[11px] text-slate-500">{u.customStatus}</span>
                      )}
                    </span>
                  </button>
                ))}
                <p className="px-2 pt-1 text-[10px] leading-relaxed text-slate-600">
                  Права: {role.permissions.join(", ")}
                </p>
              </div>
            )
          })}
        </div>
      </aside>
    </motion.section>
  )
}
