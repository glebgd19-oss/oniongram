import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  makeCaptcha,
  passwordStrength,
  validateUsername,
} from "../lib/security"
import { glassSpring } from "./Ui"

/**
 * Экран входа/регистрации.
 * Только логин + пароль: никаких телефонов и email.
 * Капча на регистрации — защита от ботов. Опциональная 2FA.
 */
export default function Auth({ onSuccess }: { onSuccess: (username: string) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [twoFa, setTwoFa] = useState(false)
  const [captchaInput, setCaptchaInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const captcha = useMemo(makeCaptcha, [mode])
  const strength = passwordStrength(password)

  const submit = () => {
    const clean = username.replace(/^@/, "").toLowerCase()
    const nameErr = validateUsername(clean)
    if (nameErr) return setError(nameErr)
    if (password.length < 8) return setError("Пароль минимум 8 символов")
    if (mode === "register" && Number(captchaInput) !== captcha.answer) {
      return setError("Капча не пройдена — попробуйте ещё раз")
    }
    setError(null)
    onSuccess(clean)
  }

  return (
    <motion.div
      className="relative z-10 grid h-full place-items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
    >
      <motion.div
        className="glass-strong glass-refract specular relative w-full max-w-md rounded-3xl p-8"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={glassSpring}
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-onion-500/60 to-neo-500/50 text-3xl shadow-glow-violet">
            🧅
          </div>
          <h1 className="font-display bg-gradient-to-r from-white via-onion-300 to-neo-300 bg-clip-text text-[26px] font-semibold text-transparent">
            Oniongram
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Анонимно. Зашифровано. Без телефона и email.
          </p>
        </div>

        <div className="glass mb-6 flex rounded-xl p-1">
          {(
            [
              ["login", "Вход"],
              ["register", "Регистрация"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              onClick={() => {
                setMode(m)
                setError(null)
              }}
              className={`relative flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                mode === m ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {mode === m && (
                <motion.span
                  layoutId="auth-tab"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-onion-500/40 to-neo-500/30"
                  transition={glassSpring}
                />
              )}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Юзернейм
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@username"
              autoComplete="username"
              className="glass w-full rounded-xl bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-onion-400/50"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Пароль
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="glass w-full rounded-xl bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
            />
            {mode === "register" && password && (
              <div className="mt-2 flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1 flex-1 rounded-full"
                    animate={{
                      backgroundColor:
                        i < strength
                          ? ["#f87171", "#fbbf24", "#22d3ee", "#34d399"][strength - 1]
                          : "rgba(255,255,255,.1)",
                    }}
                  />
                ))}
              </div>
            )}
          </label>

          {mode === "register" && (
            <>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                  Капча · защита от ботов
                </span>
                <div className="flex items-center gap-3">
                  <span className="glass rounded-xl px-4 py-3 font-mono text-sm text-neo-300">
                    {captcha.question}
                  </span>
                  <input
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    inputMode="numeric"
                    placeholder="Ответ"
                    className="glass w-full rounded-xl bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
                  />
                </div>
              </label>

              <button
                onClick={() => setTwoFa(!twoFa)}
                className="flex w-full items-center justify-between rounded-xl px-1 py-1 text-left"
              >
                <span className="text-sm text-slate-300">
                  Двухфакторная защита <span className="text-slate-500">(опционально)</span>
                </span>
                <span
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    twoFa ? "bg-onion-500/70" : "bg-white/10"
                  }`}
                >
                  <motion.span
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white"
                    animate={{ left: twoFa ? 22 : 2 }}
                    transition={glassSpring}
                  />
                </span>
              </button>
            </>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={glassSpring}
            onClick={submit}
            className="w-full rounded-xl bg-gradient-to-r from-onion-500 to-neo-500 py-3 text-sm font-semibold text-white shadow-glow-violet"
          >
            {mode === "login" ? "Войти анонимно" : "Создать аккаунт"}
          </motion.button>

          <p className="text-center text-xs leading-relaxed text-slate-500">
            🔐 Переписка шифруется локально (E2E-демо). Мы не спрашиваем
            телефон, email и имя — только @username и пароль.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
