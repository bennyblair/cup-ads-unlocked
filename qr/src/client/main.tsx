import { lazy, Suspense } from "react"
import { createRoot } from "react-dom/client"

import { Login } from "./Login"
import "./styles.css"

const Dashboard = lazy(() => import("./Dashboard"))

const root = document.getElementById("root")
if (!root) throw new Error("Missing root.")

const onLogin = window.location.pathname === "/login"

createRoot(root).render(
  onLogin ? (
    <Login />
  ) : (
    <Suspense fallback={<p className="loading-page">Loading QR Studio…</p>}>
      <Dashboard />
    </Suspense>
  ),
)
