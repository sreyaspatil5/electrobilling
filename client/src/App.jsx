import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import PageSkeleton from './components/common/PageSkeleton';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Customers = lazy(() => import('./pages/Customers'));
const Products = lazy(() => import('./pages/Products'));
const CreateBill = lazy(() => import('./pages/CreateBill'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const PendingUsers = lazy(() => import('./pages/PendingUsers'));
const AdminsList = lazy(() => import('./pages/AdminsList'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const SITE_URL = 'https://billing.vops.digital';

const ROUTE_METADATA = {
  '/': {
    title: 'ElectroBill | Free GST Billing for Businesses',
    description: 'Free billing software for businesses across industries. Create GST invoices, manage products, services, customers and stock, share PDF bills, and track sales.',
    index: true,
  },
  '/login': {
    title: 'Sign in or apply | ElectroBill',
    description: 'Sign in to ElectroBill or apply for free access to business billing, inventory and sales tools.',
  },
  '/dashboard': {
    title: 'Business dashboard | ElectroBill',
    description: 'Review recent invoices and daily, weekly and monthly sales in your ElectroBill business dashboard.',
  },
  '/invoices': {
    title: 'Invoice history | ElectroBill',
    description: 'Search invoices, review payment status and share PDF bills with ElectroBill.',
  },
  '/invoices/new': {
    title: 'Create a GST invoice | ElectroBill',
    description: 'Create a GST invoice with products, customer details, tax, discounts and payment status in ElectroBill.',
  },
  '/customers': {
    title: 'Customer records | ElectroBill',
    description: 'Keep customer contact and GST details organized for faster billing with ElectroBill.',
  },
  '/products': {
    title: 'Products and stock | ElectroBill',
    description: 'Manage products, services, prices, tax rates and stock for your business with ElectroBill.',
  },
  '/reports': {
    title: 'Sales reports | ElectroBill',
    description: 'Explore monthly revenue, invoice activity, top customers and popular products in ElectroBill reports.',
  },
  '/settings': {
    title: 'Business settings | ElectroBill',
    description: 'Manage business details and invoice preferences in your ElectroBill workspace.',
  },
  '/admins': {
    title: 'Admin accounts | ElectroBill',
    description: 'Manage ElectroBill administrator accounts.',
  },
  '/pending-users': {
    title: 'Pending account applications | ElectroBill',
    description: 'Review ElectroBill administrator account applications.',
  },
};

const setMetaContent = (selector, attribute, value) => {
  const element = document.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
};

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageSkeleton message="Checking your account..." />;
  return isAuthenticated ? <Layout><Outlet /></Layout> : <Navigate to="/login" replace />;
};

const RouteMetadata = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
    const metadata = ROUTE_METADATA[path];
    const title = metadata?.title || 'Page not found | ElectroBill';
    const description = metadata?.description || 'This ElectroBill page could not be found. Return to the product page or sign in to your workspace.';
    const robots = document.querySelector('meta[name="robots"]');
    const canonicalUrl = path === '/bill/new'
      ? `${SITE_URL}/invoices/new`
      : metadata
        ? `${SITE_URL}${path === '/' ? '/' : path}`
        : null;
    const canonical = document.querySelector('link[rel="canonical"]');

    document.title = title;
    setMetaContent('meta[name="description"]', 'content', description);
    setMetaContent('meta[property="og:title"]', 'content', title);
    setMetaContent('meta[property="og:description"]', 'content', description);
    setMetaContent('meta[property="og:url"]', 'content', canonicalUrl || `${SITE_URL}${path}`);
    setMetaContent('meta[name="twitter:title"]', 'content', title);
    setMetaContent('meta[name="twitter:description"]', 'content', description);
    robots?.setAttribute('content', metadata?.index
      ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      : 'noindex, follow');

    if (canonicalUrl) {
      const canonicalTag = canonical || document.createElement('link');
      canonicalTag.rel = 'canonical';
      canonicalTag.href = canonicalUrl;
      if (!canonical) document.head.appendChild(canonicalTag);
    } else {
      canonical?.remove();
    }
  }, [pathname]);

  return null;
};

const App = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <RouteMetadata />
    <Suspense fallback={<PageSkeleton message="Loading ElectroBill..." />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/bill/new" element={<Navigate to="/invoices/new" replace />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/new" element={<CreateBill />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/products" element={<Products />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/pending-users" element={<PendingUsers />} />
          <Route path="/admins" element={<AdminsList />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;
