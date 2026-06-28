import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import Layout from "./components/layout/Layout"
import Auth from "./pages/Auth"
import Chat from "./pages/Chat"
import Dashboard from "./pages/Dashboard"
import ESG from "./pages/ESG"
import Forbidden from "./pages/Forbidden"
import Landing from "./pages/Landing"
import Orders from "./pages/Orders"
import Reports from "./pages/Reports"
import Shipments from "./pages/Shipments"
import Suppliers from "./pages/Suppliers"
import Support from "./pages/Support"
import SupplyChainMap from "./pages/SupplyChainMap"
import Warehouses from "./pages/Warehouses"
import WarRoom from "./pages/WarRoom"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/forbidden" element={<Forbidden />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route element={<ProtectedRoute allowedRoles={["admin", "analyst", "viewer"]} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/map" element={<SupplyChainMap />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/support" element={<Support />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/shipments" element={<Shipments />} />
              <Route path="/warehouses" element={<Warehouses />} />
              <Route path="/esg" element={<ESG />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["admin", "analyst"]} />}>
              <Route path="/war-room" element={<WarRoom />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
