// ============================================================
// Данные Oniongram — чистый аккаунт, без ботов и фейк-контента.
// Всё, что вы видите в приложении, создаёте вы сами.
// В проде данные приходят из Supabase (auth + Postgres + Realtime).
// ============================================================

export type UserStatus = "online" | "idle" | "dnd" | "hidden" | "offline"

export interface User {
  id: string
  username: string // @handle — единственный публичный идентификатор
  displayName: string
  status: UserStatus
  customStatus?: string
  avatarHue: number // аватар-градиент вместо фото — анонимность
  premium: boolean
  hideLastSeen: boolean
  lastSeen?: string
}

export type MessageKind = "text" | "photo" | "file" | "voice"

export interface Message {
  id: string
  authorId: string
  kind: MessageKind
  text?: string
  fileName?: string
  fileSize?: string
  voiceSeconds?: number
  photoHue?: number
  time: string
  reactions?: Record<string, number>
  encrypted: boolean
  mine?: boolean
}

export interface Chat {
  id: string
  userId: string
  unread: number
  typing?: boolean
  messages: Message[]
}

export interface ChannelPost {
  id: string
  text: string
  time: string
  views: number
  reactions: Record<string, number>
}

export interface Channel {
  id: string
  handle: string
  name: string
  subscribers: number
  subscribed: boolean
  verified?: boolean
  posts: ChannelPost[]
}

export interface ServerRole {
  id: string
  name: string
  color: string
  permissions: string[]
}

export interface ServerChannel {
  id: string
  name: string
  type: "text" | "voice"
  activeVoices?: string[] // id участников в войсе
}

export interface Server {
  id: string
  handle: string
  name: string
  icon: string
  members: number
  roles: ServerRole[]
  channels: ServerChannel[]
  memberRoles: Record<string, string> // userId -> roleId
  messages: Record<string, Message[]> // channelId -> messages
}

// ---------- Пользователи ----------
// Только ваш аккаунт. Юзернейм подставляется из формы входа.

export const users: Record<string, User> = {
  me: {
    id: "me",
    username: "you",
    displayName: "You",
    status: "online",
    avatarHue: 265,
    premium: true,
    hideLastSeen: true,
  },
}

// Вызывается после входа: подставляет введённый @username.
export function setMyUsername(username: string) {
  users.me.username = username
  users.me.displayName = username.charAt(0).toUpperCase() + username.slice(1)
}

// ---------- Личные чаты ----------
// «Избранное» — чат с самим собой: заметки, ссылки, файлы (как в Telegram).
// Другие чаты появятся, когда будет подключён бэкенд (Supabase Realtime).

export const chats: Chat[] = [
  { id: "c-saved", userId: "me", unread: 0, messages: [] },
]

// ---------- Каналы ----------
// Пусто: подписки появятся здесь.

export const channels: Channel[] = []

// ---------- Сервера ----------
// Пусто: созданные сервера и принятые инвайты появятся здесь.

export const servers: Server[] = []

// ---------- Premium (всё бесплатно) ----------

export const premiumPerks = [
  { icon: "🎭", title: "Кастомные статусы", desc: "Любой текст и эмодзи в статусе" },
  { icon: "📦", title: "Файлы до 4 ГБ", desc: "Увеличенный лимит загрузки" },
  { icon: "✨", title: "Анимированные эмодзи", desc: "Стикеры и эмодзи с анимацией" },
  { icon: "🎨", title: "Кастомные темы", desc: "Свои акценты и стекло" },
] as const

// ---------- Устройства (для настроек) ----------
// Только текущая сессия — никаких фейковых устройств.

export const devices = [
  { id: "d1", name: "Этот браузер", location: "IP не сохраняется", current: true, lastActive: "сейчас" },
] as const
