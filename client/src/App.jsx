import React from 'react';
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from './Components/ProtectedRoute';

import Home from "./pages/LandingPage";
import RegisterForm from './pages/Register';
import Login from './pages/Login';
import OrderManagement from './pages/AddNewOrder';
import Products from './pages/Products';
import HelpCenter from './pages/Helpcenter';
import AddProductForm from './pages/AddNewProduct';
import Users from './pages/Users';
import AboutUs from './Components/Aboutus';
import Dashboard from './pages/Dashboard/OwnerDashboard';
import ShopkeeperDashboard from './pages/Dashboard/ShopkeeperDashboard';
import Sales from './pages/Sales';
import OwnerShopkeepers from './pages/OwnerShopkeeper';
import ShopkeeperProducts from './pages/ShopkeeperProducts';
import ShopkeeperSales from './pages/ShopkeeperSales';
import SalesReport from './Components/SalesReport';

const App = () => {
  return (
      <div className="min-h-screen bg-gray-50">
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/login" element={<Login />} />

            {/* 🔐 Protected Routes */}
            <Route
              path="/owner-dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/shopkeeper-dashboard"
              element={
                <ProtectedRoute>
                  <ShopkeeperDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <Sales />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-order"
              element={
                <ProtectedRoute>
                  <OrderManagement />
                </ProtectedRoute>
              }
            />

                        <Route
              path="/owner/reports"
              element={
                <ProtectedRoute>
                  <SalesReport />
                </ProtectedRoute>
              }
            />

            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />

            <Route
              path="/products/add"
              element={
                <ProtectedRoute>
                  <AddProductForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />

            <Route
              path="/owner-shopkeepers"
              element={
                <ProtectedRoute>
                  <OwnerShopkeepers />
                </ProtectedRoute>
              }
            />

            <Route
              path="/shopkeeper-products"
              element={
                <ProtectedRoute>
                  <ShopkeeperProducts />
                </ProtectedRoute>
              }
            />

            <Route
              path="/shopkeeper-sales"
              element={
                <ProtectedRoute>
                  <ShopkeeperSales />
                </ProtectedRoute>
              }
            />

            <Route path="/help" element={<HelpCenter />} />
            <Route path="/Aboutus" element={<AboutUs />} />

          </Routes>
        </main>
      </div>
  );
};

export default App;
