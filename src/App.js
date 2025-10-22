import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/common/ProtectedRoute';

import Home from './pages/user/Home';
import AdminDashboard from './pages/admin/DashBoard';
import Profile from './pages/user/Profile';
import Orders from './pages/orders/Orders';
import OrderDetails from './pages/orders/OrdersDetails';
import Cart from './components/cart/CartItem'
import ProductDescription from './components/products/Product_desc';
import Users from './pages/admin/Users';
import ProductList from './components/products/ProductList';
import OrderConfirmation from './components/cart/OrderConfirmation';
import Featured from './components/common/Featured';
import Categories from './components/common/Catogries';
import Products from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders'
const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes (any authenticated user) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Admin-only Route */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path='/profile' element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />


        <Route path='/catogries' element={
          <ProtectedRoute>
            < Categories/>
          </ProtectedRoute>
        } />


          <Route
          path="/feature"
          element={
            <ProtectedRoute >
              <Featured/>
            </ProtectedRoute>
          }
        />

        <Route path='/orders' element={

          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>

        } />


        <Route path='/orders/:orderId' element={

          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>

        } />

        <Route path='/product_desc/:Id' element={

          <ProtectedRoute>
            <ProductDescription />
          </ProtectedRoute>

        } />


         <Route path='/admin/products' element={

          <ProtectedRoute>
            <Products/>
          </ProtectedRoute>

        } />


        


        <Route path='/users' element={

          <ProtectedRoute requiredRole="admin">
            <Users />
          </ProtectedRoute>
        } />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductList />
            </ProtectedRoute>
          }
        />

        <Route
          path='/order-confirmation/:orderId'
          element={
            <ProtectedRoute>
              <OrderConfirmation />
            </ProtectedRoute>
          }
        />

         <Route
          path='/admin/orders'
          element={
            <ProtectedRoute>
              <AdminOrders/>
            </ProtectedRoute>
          }
        />



        <Route path="/cart" element={
          <ProtectedRoute><Cart /></ProtectedRoute>} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
