import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BoshSahifa from './pages/BoshSahifa';
import Mashinalar from './pages/Mashinalar';
import MashinaTafsilot from './pages/MashinaTafsilot';
import BizHaqimizda from './pages/BizHaqimizda';
import Aloqa from './pages/Aloqa';
import Kirish from './pages/Kirish';
import Royxatdan from './pages/Royxatdan';
import Kabinet from './pages/Kabinet';
import AdminBoshqaruv from './pages/AdminBoshqaruv';
import Sahifa404 from './pages/Sahifa404';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-dark text-white selection:bg-primary selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<BoshSahifa />} />
          <Route path="/mashinalar" element={<Mashinalar />} />
          <Route path="/mashina/:id" element={<MashinaTafsilot />} />
          <Route path="/biz-haqimizda" element={<BizHaqimizda />} />
          <Route path="/aloqa" element={<Aloqa />} />
          <Route path="/kirish" element={<Kirish />} />
          <Route path="/royxatdan" element={<Royxatdan />} />
          <Route path="/kabinet" element={
            <ProtectedRoute>
               <Kabinet />
            </ProtectedRoute>
          } />
          <Route path="/admin-boshqaruv" element={
            <ProtectedRoute adminOnly>
               <AdminBoshqaruv />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Sahifa404 />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}


export default App;
