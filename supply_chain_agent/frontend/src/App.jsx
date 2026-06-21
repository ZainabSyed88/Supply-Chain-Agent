import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import Layout from "./components/layout/Layout"
import Auth from "./pages/Auth"
import Chat from "./pages/Chat"
import Dashboard from "./pages/Dashboard"
import ESG from "./pages/ESG"
import Landing from "./pages/Landing"
import Reports from "./pages/Reports"
import Shipments from "./pages/Shipments"
import Suppliers from "./pages/Suppliers"
import SupplyChainMap from "./pages/SupplyChainMap"
import WarRoom from "./pages/WarRoom"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/war-room" element={<WarRoom />} />
            <Route path="/map" element={<SupplyChainMap />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/esg" element={<ESG />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
