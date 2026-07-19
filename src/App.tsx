import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Auth from "./components/Auth"
import Sidebar, { type Section } from "./components/Sidebar"
import ChatWindow from "./components/ChatWindow"
import ChannelView from "./components/ChannelView"
import ServerView from "./components/ServerView"
import CallWindow, { type CallState } from "./components/CallWindow"
import Settings from "./components/Settings"
import Search from "./components/Search"
import ProfileCard from "./components/ProfileCard"
import { chats, channels, servers, setMyUsername, users } from "./data/mock"
import { EmptyState, glassSpring } from "./components/Ui"

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [section, setSection] = useState<Section>("chats")
  const [loading, setLoading] = useState(false)

  const [activeChatId, setActiveChatId] = useState(chats[0]?.id ?? "")
  const [activeChannelId, setActiveChannelId] = useState(channels[0]?.id ?? "")
  const [activeServerId, setActiveServerId] = useState(servers[0]?.id ?? "")
  const [activeServerChannelId, setActiveServerChannelId] = useState(
    servers[0]?.channels[0]?.id ?? "",
  )

  const [call, setCall] = useState<CallState | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileUserId, setProfileUserId] = useState<string | null>(null)

  // Skeleton-загрузка при смене раздела — имитация сетевого запроса
  const switchSection = (s: Section) => {
    if (s === section) return
    setSection(s)
    setLoading(true)
    window.setTimeout(() => setLoading(false), 550)
  }

  // ⌘K / Ctrl+K — глобальный поиск
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
      if (e.key === "Escape") {
        setSearchOpen(false)
        setSettingsOpen(false)
        setProfileUserId(null)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const startCall = (userId: string, video: boolean) =>
    setCall({ userId, video, startedAt: Date.now() })

  // ВАЖНО: переключение auth → app и разделов сделано простыми условиями,
  // без AnimatePresence mode="wait" — вход в приложение не должен зависеть
  // от завершения exit-анимации (в некоторых браузерах она может зависнуть).
  return (
    <div className="relative h-full">
      <div className="bg-scene" aria-hidden>
        <div className="blob blob-violet" />
        <div className="blob blob-cyan" />
        <div className="blob blob-magenta" />
      </div>

      {!authed ? (
        <Auth
          onSuccess={(username) => {
            setMyUsername(username)
            setAuthed(true)
          }}
        />
      ) : (
        <motion.div
          key="app"
          className="relative z-10 mx-auto flex h-full max-w-[2400px] gap-4 p-4"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={glassSpring}
        >
          <Sidebar
            section={section}
            onSection={switchSection}
            loading={loading}
            activeChatId={activeChatId}
            onChat={setActiveChatId}
            activeChannelId={activeChannelId}
            onChannel={setActiveChannelId}
            activeServerId={activeServerId}
            onServer={(id) => {
              setActiveServerId(id)
              const s = servers.find((x) => x.id === id)
              if (s?.channels[0]) setActiveServerChannelId(s.channels[0].id)
            }}
            onSearch={() => setSearchOpen(true)}
            onSettings={() => setSettingsOpen(true)}
            onProfile={() => setProfileUserId("me")}
          />

          <main className="relative min-w-0 flex-1">
            {section === "chats" &&
              (chats.length > 0 && activeChatId ? (
                <ChatWindow
                  key={`chat-${activeChatId}`}
                  chatId={activeChatId}
                  onCall={startCall}
                  onProfile={setProfileUserId}
                />
              ) : (
                <EmptyState
                  icon="💬"
                  title="Чатов пока нет"
                  desc="Собеседники появятся, когда к Oniongram подключится бэкенд. Пока загляните в «Избранное» — личный чат для заметок."
                />
              ))}
            {section === "channels" &&
              (channels.length > 0 && activeChannelId ? (
                <ChannelView key={`ch-${activeChannelId}`} channelId={activeChannelId} />
              ) : (
                <EmptyState
                  icon="📡"
                  title="Каналов пока нет"
                  desc="Здесь появятся ваши подписки: посты, реакции и просмотры — как в Telegram."
                />
              ))}
            {section === "servers" &&
              (servers.length > 0 && activeServerId ? (
                <ServerView
                  key={`s-${activeServerId}-${activeServerChannelId}`}
                  serverId={activeServerId}
                  channelId={activeServerChannelId}
                  onChannel={setActiveServerChannelId}
                  onProfile={setProfileUserId}
                />
              ) : (
                <EmptyState
                  icon="🏠"
                  title="Серверов пока нет"
                  desc="Создайте свой сервер или примите инвайт — текстовые и голосовые каналы появятся здесь."
                />
              ))}
          </main>
        </motion.div>
      )}

      {call && <CallWindow call={call} onEnd={() => setCall(null)} />}
      {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
      {searchOpen && (
        <Search
          onClose={() => setSearchOpen(false)}
          onOpenChat={(chatId) => {
            switchSection("chats")
            setActiveChatId(chatId)
            setSearchOpen(false)
          }}
          onOpenChannel={(id) => {
            switchSection("channels")
            setActiveChannelId(id)
            setSearchOpen(false)
          }}
          onOpenServer={(id) => {
            switchSection("servers")
            setActiveServerId(id)
            setSearchOpen(false)
          }}
          onCall={(userId) => {
            setSearchOpen(false)
            startCall(userId, false)
          }}
        />
      )}
      {profileUserId && (
        <ProfileCard
          user={users[profileUserId]}
          onClose={() => setProfileUserId(null)}
          onCall={(video) => {
            const uid = profileUserId
            setProfileUserId(null)
            if (uid !== "me") startCall(uid, video)
          }}
        />
      )}
    </div>
  )
}
