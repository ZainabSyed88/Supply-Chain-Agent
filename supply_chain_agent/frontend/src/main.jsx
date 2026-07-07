import React from "react"
import ReactDOM from "react-dom/client"
import "leaflet/dist/leaflet.css"
import App from "./App"
import "./index.css"
import { ToastProvider } from "./components/ui/Toast"
import { AuthProvider } from "./context/AuthContext"
import { LocalizationProvider } from "./context/LocalizationContext"
import { startKeepAlive } from "./utils/keepAlive"

startKeepAlive()

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LocalizationProvider>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </LocalizationProvider>
  </React.StrictMode>
)
