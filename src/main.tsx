import { createRoot, hydrateRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "@fontsource/archivo-black"
import "@fontsource-variable/ibm-plex-sans"
import App from "./App.tsx"
import "./index.css"

const container = document.getElementById("root")

if (!container) {
  throw new Error("CupSpace root element is missing.")
}

const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

if (container.hasChildNodes()) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
