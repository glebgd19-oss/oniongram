import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { devices, premiumPerks, users } from "../data/mock"
import { Avatar, Modal, glassSpring } from "./Ui"

type Tab = "privacy" | "notifications" | "appearance" | "devices" | "data" | "premium"

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        on ? "bg-onion-500/70" : "bg-white/10"
      }`}
    >
      <motion.span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white"
        animate={{ left: on ? 22 : 2 }}
        transition={glassSpring}
      />
    </button>
  )
}

function Row({
  title,
  desc,
  children,
}: {
  title: string
  desc?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-white/4">
      <span className="min-w-0">
        <span className="block text-sm text-slate-100">{title}</span>
        {desc && <span className="block text-xs text-slate-500">{desc}</span>}
      </span>
      {children}
    </div>
  )
}

/**
 * Настройки в стиле Telegram + Discord: приватность, уведомления,
 * темы, устройства, экспорт данных, блокировки, premium (бесплатно для всех).
 */
export default function Settings({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("privacy")
  const [hideLastSeen, setHideLastSeen] = useState(true)
  const [hideOnline, setHideOnline] = useState(true)
  const [twoFa, setTwoFa] = useState(false)
  const [notifChats, setNotifChats] = useState(true)
  const [notifChannels, setNotifChannels] = useState(false)
  const [notifSound, setNotifSound] = useState(true)
  const [blocked, setBlocked] = useState<string[]>([])
  const [exported, setExported] = useState(false)
  const [accent, setAccent] = useState<"violet" | "cyan" | "magenta">("violet")

  const tabs: Array<{ id: Tab; icon: string; label: string }> = [
    { id: "privacy", icon: "🔒", label: "Приватность" },
    { id: "notifications", icon: "🔔", label: "Уведомления" },
    { id: "appearance", icon: "🎨", label: "Оформление" },
    { id: "devices", icon: "📱", label: "Устройства" },
    { id: "data", icon: "📦", label: "Данные" },
    { id: "premium", icon: "✨", label: "Premium" },
  ]

  return (
    <Modal onClose={onClose} width={860}>
      <div className="flex max-h-[85vh] min-h-[520px] max-md:flex-col">
        {/* Навигация */}
        <nav className="w-56 shrink-0 border-r border-white/10 p-3 max-md:w-full max-md:border-b max-md:border-r-0">
          <div className="mb-4 flex items-center gap-3 px-2 pt-1">
            <Avatar user={users.me} size={40} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-slate-100">
                {users.me.displayName} ✨
              </span>
              <span className="block truncate text-xs text-slate-400">@{users.me.username}</span>
            </span>
          </div>
          <div className="space-y-0.5 max-md:flex max-md:gap-1 max-md:space-y-0 max-md:overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors max-md:w-auto max-md:shrink-0 ${
                  tab === t.id ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab === t.id && (
                  <motion.span
                    layoutId="settings-tab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-onion-500/35 to-neo-500/25"
                    transition={glassSpring}
                  />
                )}
                <span className="relative">{t.icon}</span>
                <span className="relative">{t.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Контент */}
        <div className="scroll-slim min-w-0 flex-1 overflow-y-auto p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {tabs.find((t) => t.id === tab)!.label}
            </h2>
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="glass grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:text-white"
            >
              ✕
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={glassSpring}
              className="space-y-1"
            >
              {tab === "privacy" && (
                <>
                  <Row title="Скрыть «последний визит»" desc="Никто не увидит, когда вы были в сети">
                    <Toggle on={hideLastSeen} onToggle={() => setHideLastSeen(!hideLastSeen)} />
                  </Row>
                  <Row title="Скрыть статус онлайн" desc="Вы всегда отображаетесь как «невидимка»">
                    <Toggle on={hideOnline} onToggle={() => setHideOnline(!hideOnline)} />
                  </Row>
                  <Row title="Двухфакторная защита" desc="Дополнительный код при входе (TOTP)">
                    <Toggle on={twoFa} onToggle={() => setTwoFa(!twoFa)} />
                  </Row>
                  <Row title="E2E-шифрование личных чатов" desc="Включено всегда, отключить нельзя">
                    <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs text-emerald-300">
                      всегда вкл.
                    </span>
                  </Row>
                  <div className="pt-3">
                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Заблокированные пользователи — {blocked.length}
                    </p>
                    {blocked.map((b) => (
                      <Row key={b} title={`@${b}`}>
                        <button
                          onClick={() => setBlocked((xs) => xs.filter((x) => x !== b))}
                          className="rounded-lg bg-white/8 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/15"
                        >
                          Разблокировать
                        </button>
                      </Row>
                    ))}
                    {blocked.length === 0 && (
                      <p className="px-3 py-2 text-sm text-slate-500">Список пуст 🎉</p>
                    )}
                  </div>
                </>
              )}

              {tab === "notifications" && (
                <>
                  <Row title="Личные чаты" desc="Звук и баннеры новых сообщений">
                    <Toggle on={notifChats} onToggle={() => setNotifChats(!notifChats)} />
                  </Row>
                  <Row title="Каналы" desc="Уведомления о новых постах">
                    <Toggle on={notifChannels} onToggle={() => setNotifChannels(!notifChannels)} />
                  </Row>
                  <Row title="Звук" desc="Тихий неоновый «блип»">
                    <Toggle on={notifSound} onToggle={() => setNotifSound(!notifSound)} />
                  </Row>
                </>
              )}

              {tab === "appearance" && (
                <>
                  <p className="px-3 pb-2 text-sm text-slate-400">
                    Тёмная тема включена по умолчанию. Акцент стекла:
                  </p>
                  <div className="flex gap-3 px-3">
                    {(
                      [
                        ["violet", "#8b5cf6", "Фиолетовый"],
                        ["cyan", "#22d3ee", "Бирюзовый"],
                        ["magenta", "#d946ef", "Маджента"],
                      ] as const
                    ).map(([id, color, label]) => (
                      <motion.button
                        key={id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setAccent(id)}
                        className={`glass flex-1 rounded-2xl p-4 text-center text-sm ${
                          accent === id ? "ring-2 ring-white/40" : ""
                        }`}
                      >
                        <span
                          className="mx-auto mb-2 block h-8 w-8 rounded-full"
                          style={{ background: color, boxShadow: `0 0 16px ${color}66` }}
                        />
                        {label}
                      </motion.button>
                    ))}
                  </div>
                  <p className="px-3 pt-3 text-xs text-slate-500">
                    ✨ Кастомные темы — premium-функция, бесплатная для всех.
                  </p>
                </>
              )}

              {tab === "devices" && (
                <>
                  {devices.map((d) => (
                    <Row key={d.id} title={`${d.current ? "🟢 " : ""}${d.name}`} desc={`${d.location} · ${d.lastActive}`}>
                      {d.current ? (
                        <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs text-emerald-300">
                          текущее
                        </span>
                      ) : (
                        <button className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/25">
                          Завершить
                        </button>
                      )}
                    </Row>
                  ))}
                  <p className="px-3 pt-2 text-xs text-slate-500">
                    IP-адреса не сохраняются — показывается только тип устройства.
                  </p>
                </>
              )}

              {tab === "data" && (
                <>
                  <Row title="Экспорт данных" desc="Вся переписка и настройки одним JSON-архивом">
                    <button
                      onClick={() => {
                        setExported(true)
                        window.setTimeout(() => setExported(false), 2500)
                      }}
                      className="rounded-lg bg-gradient-to-r from-onion-500/60 to-neo-500/50 px-4 py-2 text-xs font-medium text-white"
                    >
                      {exported ? "✓ Готово (демо)" : "Экспортировать"}
                    </button>
                  </Row>
                  <Row title="Автоудаление сообщений" desc="Самоуничтожение через 24 часа">
                    <Toggle on={false} onToggle={() => {}} />
                  </Row>
                  <Row title="Удалить аккаунт" desc="Безвозвратно и сразу — мы ничего не храним">
                    <button className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/25">
                      Удалить
                    </button>
                  </Row>
                </>
              )}

              {tab === "premium" && (
                <>
                  <div className="glass glass-refract mb-3 rounded-2xl p-4 text-center">
                    <p className="text-sm font-semibold text-white">
                      ✨ Oniongram Premium — бесплатно для всех
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Никакой монетизации: все функции уже включены у каждого аккаунта.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                    {premiumPerks.map((p) => (
                      <motion.div
                        key={p.title}
                        whileHover={{ y: -3 }}
                        transition={glassSpring}
                        className="glass rounded-2xl p-4"
                      >
                        <span className="text-2xl">{p.icon}</span>
                        <p className="mt-2 text-sm font-medium text-slate-100">{p.title}</p>
                        <p className="text-xs text-slate-400">{p.desc}</p>
                        <p className="mt-2 text-[11px] font-medium text-emerald-300">✓ активно</p>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  )
}
