import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import ClienteLayout from './layouts/ClienteLayout'
import GlobalCursor from './components/GlobalCursor'
import SFFooter from './components/SFFooter'
import { useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'

import LandingPage    from './pages/LandingPage'
import Login          from './pages/Login'
import Register       from './pages/Register'
import PedidoStatus   from './pages/PedidoStatus'
import SelecionarMesa from './pages/SelecionarMesa'

import DashboardHome          from './pages/dashboard/DashboardHome'
import CozinhaView            from './pages/dashboard/CozinhaView'
import CardapioAdmin          from './pages/dashboard/CardapioAdmin'
import UsuariosAdmin          from './pages/dashboard/UsuariosAdmin'
import NewsletterAdmin        from './pages/dashboard/NewsletterAdmin'
import MesasAdmin             from './pages/dashboard/MesasAdmin'
import ConfiguracoesAdmin     from './pages/dashboard/ConfiguracoesAdmin'
import FuncionalidadesAdmin   from './pages/dashboard/FuncionalidadesAdmin'
import PreferenciasAdmin      from './pages/dashboard/PreferenciasAdmin'
import PreferenciasAnalytics  from './pages/dashboard/PreferenciasAnalytics'
import PagamentosPendentes    from './pages/dashboard/PagamentosPendentes'
import MenuTV, { MenuTVPreview } from './pages/dashboard/MenuTV'
import HistoricoPedidos       from './pages/dashboard/HistoricoPedidos'
import ShowsAdmin             from './pages/dashboard/ShowsAdmin'
import ArtistasAdmin          from './pages/dashboard/ArtistasAdmin'
import ShowMetricas           from './pages/dashboard/ShowMetricas'

import ClienteHome     from './pages/cliente/ClienteHome'
import ClienteCardapio from './pages/cliente/ClienteCardapio'
import ClienteCarrinho from './pages/Carrinho'
import ClienteCheckout from './pages/cliente/ClienteCheckout'
import ClientePedidos  from './pages/cliente/ClientePedidos'
import ClientePerfil   from './pages/cliente/ClientePerfil'

function FeatureGate({ featureKey, children }) {
  const { user } = useAuth()
  const { features } = useTheme()
  if (user?.role === 'ADMINSF') return children
  if (!features[featureKey]) return <Navigate to={user ? '/dashboard' : '/'} replace />
  return children
}

export default function App() {
  return (
    <>
      <GlobalCursor />
      <SFFooter />
      <Routes>

        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/selecionar-mesa"
               element={<ProtectedRoute><SelecionarMesa /></ProtectedRoute>} />

        <Route path="/pedido/:id"
               element={<ProtectedRoute><PedidoStatus /></ProtectedRoute>} />

        <Route path="/menu-tv" element={
          <FeatureGate featureKey="menutv"><MenuTV /></FeatureGate>
        } />

        {/* Área do cliente */}
        <Route path="/cliente/:mesa"
               element={<ProtectedRoute><ClienteLayout /></ProtectedRoute>}>
          <Route index           element={<ClienteHome />} />
          <Route path="cardapio" element={<ClienteCardapio />} />
          <Route path="carrinho" element={<ClienteCarrinho />} />
          <Route path="checkout" element={<ClienteCheckout />} />
          <Route path="pedidos"  element={<ClientePedidos />} />
          <Route path="perfil"   element={<ClientePerfil />} />
        </Route>

        {/* Dashboard admin */}
        <Route path="/dashboard"
              element={<ProtectedRoute adminOnly><DashboardLayout /></ProtectedRoute>}>
          <Route index                         element={<DashboardHome />} />
          <Route path="cozinha"                element={<CozinhaView />} />
          <Route path="cardapio"               element={<CardapioAdmin />} />
          <Route path="usuarios"               element={<UsuariosAdmin />} />
          <Route path="newsletter"             element={<NewsletterAdmin />} />
          <Route path="historico"              element={<HistoricoPedidos />} />
          <Route path="pagamentos"             element={<PagamentosPendentes />} />
          <Route path="configuracoes"          element={<ConfiguracoesAdmin />} />
          <Route path="funcionalidades"        element={
            <ProtectedRoute adminSFOnly><FuncionalidadesAdmin /></ProtectedRoute>
          } />
          <Route path="mesas"                  element={
            <FeatureGate featureKey="mesas"><MesasAdmin /></FeatureGate>
          } />
          <Route path="menu-tv"                element={
            <FeatureGate featureKey="menutv"><MenuTVPreview /></FeatureGate>
          } />
          <Route path="preferencias"           element={
            <FeatureGate featureKey="preferencias"><PreferenciasAdmin /></FeatureGate>
          } />
          <Route path="preferencias/analytics" element={
            <FeatureGate featureKey="preferencias"><PreferenciasAnalytics /></FeatureGate>
          } />
          <Route path="shows"                  element={
            <FeatureGate featureKey="shows"><ShowsAdmin /></FeatureGate>
          } />
          <Route path="shows/:id/metricas"     element={
            <FeatureGate featureKey="shows"><ShowMetricas /></FeatureGate>
          } />
          <Route path="artistas"               element={
            <FeatureGate featureKey="shows"><ArtistasAdmin /></FeatureGate>
          } />
        </Route>

      </Routes>
    </>
  )
}