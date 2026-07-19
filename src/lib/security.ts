// ============================================================
// Безопасность: имитация E2E-шифрования, rate-limit и капча.
// В демо всё работает локально; в проде — libsodium/WebCrypto + сервер.
// ============================================================

/**
 * Имитация E2E: XOR + base64 на локальном сессионном ключе.
 * Это ДЕМО-шифрование для визуализации пайплайна, НЕ криптография.
 * В проде: X25519 + XChaCha20-Poly1305 (libsodium) или MLS.
 */
const SESSION_KEY = (() => {
  const makeKey = () =>
    Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  // sessionStorage может быть заблокирован настройками приватности браузера
  // (анти-трекинг, VPN-расширения, отключённые cookies) — не падаем, а
  // используем ключ в памяти на время сессии.
  try {
    const stored = sessionStorage.getItem("og_session_key")
    if (stored) return stored
    const key = makeKey()
    sessionStorage.setItem("og_session_key", key)
    return key
  } catch {
    return makeKey()
  }
})()

export function demoEncrypt(plain: string): string {
  const bytes = new TextEncoder().encode(plain)
  const out = bytes.map((b, i) => b ^ SESSION_KEY.charCodeAt(i % SESSION_KEY.length))
  let bin = ""
  out.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin)
}

export function demoDecrypt(cipher: string): string {
  try {
    const bin = atob(cipher)
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    const out = bytes.map((b, i) => b ^ SESSION_KEY.charCodeAt(i % SESSION_KEY.length))
    return new TextDecoder().decode(out)
  } catch {
    return cipher
  }
}

/**
 * Rate-limit отправки сообщений: не более N сообщений за окно.
 * Защита от спам-ботов на клиенте; в проде дублируется на сервере
 * (Supabase RLS + edge functions).
 */
export function createRateLimiter(maxEvents = 5, windowMs = 10_000) {
  let stamps: number[] = []
  return {
    tryConsume(): { ok: boolean; retryInMs: number } {
      const now = Date.now()
      stamps = stamps.filter((t) => now - t < windowMs)
      if (stamps.length >= maxEvents) {
        return { ok: false, retryInMs: windowMs - (now - stamps[0]) }
      }
      stamps.push(now)
      return { ok: true, retryInMs: 0 }
    },
  }
}

/** Простая арифметическая капча для регистрации (демо-аналог hCaptcha). */
export function makeCaptcha() {
  const a = 2 + Math.floor(Math.random() * 8)
  const b = 2 + Math.floor(Math.random() * 8)
  return { question: `${a} + ${b} = ?`, answer: a + b }
}

/** Валидация юзернейма: только a-z, 0-9, подчёркивания, 3–20 символов. */
export function validateUsername(name: string): string | null {
  if (!/^[a-z0-9_]{3,20}$/.test(name)) {
    return "Юзернейм: 3–20 символов, только a-z, 0-9 и _"
  }
  return null
}

/** Оценка силы пароля 0..4 для индикатора. */
export function passwordStrength(pw: string): number {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-ZА-Я]/.test(pw) && /[a-zа-я]/.test(pw)) score++
  if (/\d/.test(pw) && /[^\w\s]/.test(pw)) score++
  return score
}
