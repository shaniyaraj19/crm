import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
// HelmetProvider not needed for react-helmet
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import AnalyticsDashboard from './pages/analytics-dashboard';
import ContactDetails from './pages/contact-details';
import LoginPage from './pages/login';
import Dashboard from './pages/dashboard';
import ContactsList from './pages/contacts-list';
import CompaniesPage from './pages/companies/MainPage';
import SettingsPage from './pages/settings';
import Layout from "components/Layout";
import CompanyDetails from "pages/companies-list/index";

const Routes: React.FC = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
      {/* Define your route here */}
      
      <Route path="/" element={<Dashboard />} />
      <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
      <Route path="/contact-details" element={<ContactDetails />} />
      <Route path="/contact-details/:id" element={<ContactDetails />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/contacts-list" element={<ContactsList />} />
      <Route path="/companies" element={<Layout><CompaniesPage /></Layout>} />
      <Route path="/companies/:id" element={<Layout><CompanyDetails /></Layout>} /> 
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;