import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { ErrorBoundary } from "./components/Ui"
import "./index.css"

// Блик (specular highlight) следует за курсором через CSS-переменные.
// Обновление через rAF, чтобы не дёргать стили чаще 60 раз/сек.
let rafId = 0
window.addEventListener("pointermove", (e) => {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    document.documentElement.style.setProperty(
      "--spec-x",
      `${(e.clientX / window.innerWidth) * 100}%`,
    )
    document.documentElement.style.setProperty(
      "--spec-y",
      `${(e.clientY / window.innerHeight) * 100}%`,
    )
    rafId = 0
  })
})

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
