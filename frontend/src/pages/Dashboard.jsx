import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/api/apiClient";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Heart, User, LogOut, Package, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [bookingsRes, favoritesRes] = await Promise.all([
          apiClient.get("/bookings/my/"),
          apiClient.get("/favorites/my/"),
        ]);
        setBookings(bookingsRes.data.results || []);
        setFavorites(favoritesRes.data.results || []);
      } catch (err) {
        console.error("Dashboard data fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#121212] pt-24 pb-12 px-[8%] lg:px-[12%]">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-[320px] h-fit">
          <div className="bg-[#1e1f22] rounded-3xl p-8 border border-gray-800 shadow-xl">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center mb-4 border-2 border-red-600/20">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User size={48} className="text-red-600" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 bricolage-font">
                {user.first_name} {user.last_name || user.username}
              </h3>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>

            <nav className="space-y-4">
              <button
                onClick={() => setActiveTab("bookings")}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                  activeTab === "bookings" ? "bg-red-600 text-white shadow-lg shadow-red-600/30" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Calendar size={20} />
                <span className="font-bold">Mening Bronlarim</span>
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                  activeTab === "favorites" ? "bg-red-600 text-white shadow-lg shadow-red-600/30" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Heart size={20} />
                <span className="font-bold">Sevimlilar</span>
              </button>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-400 hover:bg-gray-800 hover:text-red-500 transition-all mt-8"
              >
                <LogOut size={20} />
                <span className="font-bold">Chiqish</span>
              </button>
            </nav>
            {user.is_staff && (
                <Link to="/admin-panel" className="block mt-4">
                     <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-yellow-600/10 text-yellow-600 border border-yellow-600/20 hover:bg-yellow-600/20 transition-all">
                        <Package size={20} />
                        <span className="font-bold">Admin Panel</span>
                    </button>
                </Link>
            )}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
               <p>Ma'lumotlar yuklanmoqda...</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {activeTab === "bookings" && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-white mb-8 bricolage-font border-l-4 border-red-600 pl-4">Mening Bronlarim</h2>
                  {bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <div key={booking.id} className="bg-[#1e1f22] rounded-3xl p-6 border border-gray-800 group hover:border-red-600/50 transition-all shadow-xl">
                        <div className="flex flex-col md:flex-row gap-6">
                          <img
                            src={booking.car_info?.main_image || "/Image/car-1.jpg"}
                            alt={booking.car_info?.model}
                            className="w-full md:w-[240px] h-[160px] rounded-2xl object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-2xl font-bold text-white mb-2">{booking.car_info?.brand} {booking.car_info?.model}</h4>
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                  <MapPin size={16} className="text-red-600" />
                                  <span>{booking.car_info?.district_info?.name} tumani</span>
                                </div>
                              </div>
                              <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                                booking.status === 'approved' ? 'bg-green-600/20 text-green-500' :
                                booking.status === 'pending' ? 'bg-yellow-600/20 text-yellow-500' :
                                'bg-red-600/20 text-red-500'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-gray-800 pt-4 mt-2">
                                <div>
                                    <span className="text-gray-500 text-[10px] uppercase block mb-1">Muddati</span>
                                    <span className="text-white text-sm font-bold">{booking.start_date} → {booking.end_date}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 text-[10px] uppercase block mb-1">Jami Narx</span>
                                    <span className="text-white text-sm font-bold text-red-500">{Number(booking.total_price).toLocaleString()} so'm</span>
                                </div>
                                <div className="flex items-center justify-end">
                                     <Link to={`/car/${booking.car}`} className="text-gray-400 hover:text-white transition-colors text-xs font-bold">Avtomobil sahifasi →</Link>
                                </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-[#1e1f22] p-16 rounded-3xl border border-gray-800 text-center">
                        <Calendar size={64} className="text-gray-700 mx-auto mb-6" />
                         <p className="text-gray-500 text-xl">Sizda hali hech qanday bron mavjud emas.</p>
                         <Link to="/cars" className="inline-block mt-6 text-red-600 font-bold hover:underline">Hozir band qilish →</Link>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "favorites" && (
                <div className="space-y-6">
                   <h2 className="text-3xl font-bold text-white mb-8 bricolage-font border-l-4 border-red-600 pl-4">Sevimli Avtomobillarim</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {favorites.length > 0 ? (
                       favorites.map((fav) => (
                         <div key={fav.id} className="bg-[#1e1f22] rounded-3xl overflow-hidden border border-gray-800 hover:border-red-600/30 transition-all group">
                             <div className="relative h-[200px]">
                                <img src={fav.car_info?.main_image || "/Image/car-1.jpg"} alt={fav.car_info?.model} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                                <div className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-xl border border-red-500/50">
                                   <Heart size={16} fill="white" />
                                </div>
                             </div>
                             <div className="p-6">
                                <h4 className="text-xl font-bold text-white mb-2">{fav.car_info?.brand} {fav.car_info?.model}</h4>
                                <div className="flex justify-between items-center mt-4">
                                   <span className="text-red-500 font-bold">{Number(fav.car_info?.daily_price).toLocaleString()} so'm/kun</span>
                                   <Link to={`/car/${fav.car}`} className="bg-gray-800 hover:bg-white hover:text-black text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">Batafsil</Link>
                                </div>
                             </div>
                         </div>
                       ))
                     ) : (
                        <div className="bg-[#1e1f22] col-span-2 p-16 rounded-3xl border border-gray-800 text-center">
                            <Heart size={64} className="text-gray-700 mx-auto mb-6" />
                            <p className="text-gray-500 text-xl">Sevimlilar ro'yxati bo'sh.</p>
                        </div>
                     )}
                   </div>
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
