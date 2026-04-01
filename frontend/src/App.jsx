import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Fleet from './pages/Fleet';
import CarDetail from './pages/CarDetail';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import AdminManagement from './pages/AdminManagement';
import NotFound from './pages/NotFound';

// New Pages
import ElectricCars from './pages/ElectricCars';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Chauffeur from './pages/Chauffeur';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-dark text-white selection:bg-primary selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/car/:id" element={<CarDetail />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* New Routes */}
          <Route path="/ev-fleet" element={<ElectricCars />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/chauffeur" element={<Chauffeur />} />

          <Route path="/profile" element={
            <ProtectedRoute>
               <Profile />
            </ProtectedRoute>
          } />
          <Route path="/admin-management" element={
            <ProtectedRoute adminOnly>
               <AdminManagement />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
