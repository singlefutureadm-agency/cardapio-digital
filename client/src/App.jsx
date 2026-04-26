import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import ClienteLayout from './layouts/ClienteLayout'
import GlobalCursor from './components/GlobalCursor'

import LandingPage    from './pages/LandingPage'
import Login          from './pages/Login'
import Register       from './pages/Register'
import PedidoStatus   from './pages/PedidoStatus'
import SelecionarMesa from './pages/SelecionarMesa'

import DashboardHome         from './pages/dashboard/DashboardHome'
import CozinhaView           from './pages/dashboard/CozinhaView'
import CardapioAdmin         from './pages/dashboard/CardapioAdmin'
import UsuariosAdmin         from './pages/dashboard/UsuariosAdmin'
import NewsletterAdmin       from './pages/dashboard/NewsletterAdmin'
import MesasAdmin            from './pages/dashboard/MesasAdmin'
import ConfiguracoesAdmin    from './pages/dashboard/ConfiguracoesAdmin'
import PreferenciasAdmin     from './pages/dashboard/PreferenciasAdmin'
import PreferenciasAnalytics from './pages/dashboard/PreferenciasAnalytics'
import PagamentosPendentes   from './pages/dashboard/PagamentosPendentes'
import MenuTV, { MenuTVPreview } from './pages/dashboard/MenuTV'
import HistoricoPedidos      from './pages/dashboard/HistoricoPedidos'
import ShowsAdmin            from './pages/dashboard/ShowsAdmin'
import ArtistasAdmin         from './pages/dashboard/ArtistasAdmin'
import ShowMetricas          from './pages/dashboard/ShowMetricas'

import ClienteHome     from './pages/cliente/ClienteHome'
import ClienteCardapio from './pages/cliente/ClienteCardapio'
import ClienteCarrinho from './pages/Carrinho'
import ClienteCheckout from './pages/cliente/ClienteCheckout'
import ClientePedidos  from './pages/cliente/ClientePedidos'
import ClientePerfil   from './pages/cliente/ClientePerfil'

export default function App() {
  return (
    <>
      <GlobalCursor />
      <Routes>

        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/selecionar-mesa"
               element={<ProtectedRoute><SelecionarMesa /></ProtectedRoute>} />

        <Route path="/pedido/:id"
               element={<ProtectedRoute><PedidoStatus /></ProtectedRoute>} />

        <Route path="/menu-tv" element={<MenuTV />} />

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
          <Route index                          element={<DashboardHome />} />
          <Route path="cozinha"                 element={<CozinhaView />} />
          <Route path="cardapio"                element={<CardapioAdmin />} />
          <Route path="usuarios"                element={<UsuariosAdmin />} />
          <Route path="newsletter"              element={<NewsletterAdmin />} />
          <Route path="mesas"                   element={<MesasAdmin />} />
          <Route path="preferencias"            element={<PreferenciasAdmin />} />
          <Route path="preferencias/analytics"  element={<PreferenciasAnalytics />} />
          <Route path="configuracoes"           element={<ConfiguracoesAdmin />} />
          <Route path="menu-tv"                 element={<MenuTVPreview />} />
          <Route path="pagamentos"              element={<PagamentosPendentes />} />
          <Route path="historico"               element={<HistoricoPedidos />} />
          <Route path="shows"                   element={<ShowsAdmin />} />
          <Route path="shows/:id/metricas"      element={<ShowMetricas />} />
          <Route path="artistas"                element={<ArtistasAdmin />} />
        </Route>

      </Routes>
    </>
  )
}