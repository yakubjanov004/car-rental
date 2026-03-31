import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/api/apiClient";
import { useNavigate, Link } from "react-router-dom";
import { 
  Users, 
  BarChart, 
  Package, 
  MessageSquare, 
  ClipboardCheck, 
  Settings, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.is_staff) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookingsRes, carsRes, messagesRes] = await Promise.all([
          apiClient.get("/bookings/all/"),
          apiClient.get("/cars/"),
          apiClient.get("/contact/list/"),
        ]);
        setBookings(bookingsRes.data.results || []);
        setCars(carsRes.data.results || []);
        setMessages(messagesRes.data.results || []);
      } catch (err) {
        console.error("Admin data fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  const updateBookingStatus = async (id, status) => {
    try {
      await apiClient.patch(`/bookings/${id}/status/`, { status });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi!");
    }
  };

  const deleteCar = async (id) => {
    if (!window.confirm("Rostdan ham o'chirmoqchimisiz?")) return;
    try {
      await apiClient.delete(`/cars/${id}/`);
      setCars(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Xatolik!");
    }
  };

  if (!user || !user.is_staff) return null;

  const tabs = [
    { id: "bookings", icon: <ClipboardCheck size={20} />, label: "Bronlar" },
    { id: "cars", icon: <Package size={20} />, label: "Avtomobillar" },
    { id: "messages", icon: <MessageSquare size={20} />, label: "Xabarlar" },
  ];

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col lg:flex-row pt-24">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-[300px] h-fit lg:min-h-screen bg-[#1e1f22] p-8 border-r border-gray-800">
        <div className="mb-10">
           <h2 className="text-2xl font-bold text-white mb-2 bricolage-font">Admin <span className="text-red-600">Panel</span></h2>
           <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Management System v1.0</p>
        </div>

        <nav className="space-y-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                activeTab === tab.id ? "bg-red-600 text-white shadow-lg shadow-red-600/30" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {tab.icon}
              <span className="font-bold">{tab.label}</span>
            </button>
          ))}
          <Link to="/dashboard" className="block mt-10">
              <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-500 hover:bg-gray-800 hover:text-white transition-all">
                <Users size={20} />
                <span className="font-bold">Mening Profilim</span>
              </button>
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-12 overflow-x-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p>Admin ma'lumotlari yuklanmoqda...</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <AnimatePresence mode="wait">
              
              {/* Bookings Tab */}
              {activeTab === "bookings" && (
                <div key="bookings">
                  <div className="flex justify-between items-center mb-8">
                     <h2 className="text-3xl font-bold text-white bricolage-font border-l-4 border-red-600 pl-4 uppercase tracking-tighter">Barcha bronlar</h2>
                     <span className="bg-gray-800 text-gray-400 px-4 py-2 rounded-xl text-xs font-bold font-mono">Count: {bookings.length}</span>
                  </div>

                  <div className="space-y-4">
                    {bookings.map(b => (
                      <div key={b.id} className="bg-[#1e1f22] p-6 rounded-3xl border border-gray-800 hover:border-red-600/20 transition-all flex flex-col md:flex-row gap-6">
                         <div className="flex-1">
                            <div className="flex justify-between items-start mb-4">
                               <div>
                                  <h4 className="text-xl font-bold text-white mb-1 uppercase tracking-tighter">{b.car_info?.brand} {b.car_info?.model}</h4>
                                  <p className="text-gray-400 text-sm font-bold"><span className="text-red-500">Client:</span> {b.full_name} ({b.phone_number})</p>
                               </div>
                               <div className="text-right">
                                  <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Status</p>
                                  <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                                    b.status === 'approved' ? 'bg-green-600/20 text-green-500' :
                                    b.status === 'pending' ? 'bg-yellow-600/20 text-yellow-500' :
                                    'bg-red-600/20 text-red-500'
                                  }`}>
                                    {b.status}
                                  </span>
                               </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-800 mt-2">
                               <div>
                                  <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Duration</p>
                                  <p className="text-white text-sm font-bold">{b.start_date} <span className="text-red-500">→</span> {b.end_date}</p>
                               </div>
                               <div>
                                  <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Total Bill</p>
                                  <p className="text-white text-sm font-bold text-red-500 underline decoration-red-500/30 underline-offset-4">{Number(b.total_price).toLocaleString()} so'm</p>
                               </div>
                               <div className="flex items-center gap-3 justify-end">
                                  {b.status === 'pending' && (
                                    <>
                                      <button onClick={() => updateBookingStatus(b.id, 'approved')} className="p-3 bg-green-600/20 text-green-500 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-lg hover:shadow-green-600/20"><CheckCircle size={20} /></button>
                                      <button onClick={() => updateBookingStatus(b.id, 'rejected')} className="p-3 bg-red-600/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-lg hover:shadow-red-600/20"><XCircle size={20} /></button>
                                    </>
                                  )}
                                  <button onClick={() => updateBookingStatus(b.id, 'completed')} className="p-3 bg-blue-600/20 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-lg hover:shadow-blue-600/20"><Clock size={20} /></button>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))}
                    {bookings.length === 0 && <p className="text-gray-500 text-center py-20 bg-[#1e1f22] rounded-3xl border border-gray-800">No bookings found.</p>}
                  </div>
                </div>
              )}

              {/* Cars Tab */}
              {activeTab === "cars" && (
                <div key="cars">
                  <div className="flex justify-between items-center mb-10">
                     <h2 className="text-3xl font-bold text-white bricolage-font border-l-4 border-red-600 pl-4 uppercase tracking-tighter">Avtomobillar ro'yxati</h2>
                     <button className="bg-red-600 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-red-600/30 hover:scale-105 active:scale-95 transition-all">Yangi qo'shish +</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                     {cars.map(car => (
                       <div key={car.id} className="bg-[#1e1f22] rounded-3xl overflow-hidden border border-gray-800 group hover:border-red-600/30 transition-all shadow-2xl">
                          <div className="h-[200px] overflow-hidden relative">
                             <img src={car.main_image || "/Image/car-1.jpg"} alt={car.model} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                             <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-4 py-1 rounded-xl text-white font-bold text-xs">
                                {car.daily_price} so'm
                             </div>
                          </div>
                          <div className="p-6">
                             <h4 className="text-xl font-bold text-white mb-2 uppercase tracking-tighter">{car.brand} {car.model}</h4>
                             <div className="flex justify-between items-center mt-6">
                                <div className="flex items-center gap-2">
                                   <div className="bg-yellow-500/20 text-yellow-500 p-2 rounded-lg"><Star size={14} fill="currentColor" /></div>
                                   <span className="text-white font-bold text-xs">{car.rating}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                   <button className="p-2 bg-gray-800 text-gray-400 rounded-xl hover:bg-white hover:text-black transition-all cursor-pointer"><Edit size={18} /></button>
                                   <button onClick={() => deleteCar(car.id)} className="p-2 bg-gray-800 text-gray-400 rounded-xl hover:bg-red-600 hover:text-white transition-all cursor-pointer"><Trash2 size={18} /></button>
                                </div>
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
                </div>
              )}

              {/* Messages Tab */}
              {activeTab === "messages" && (
                <div key="messages">
                  <h2 className="text-3xl font-bold text-white mb-8 bricolage-font border-l-4 border-red-600 pl-4 uppercase tracking-tighter">Kontakt xabarlari</h2>
                  <div className="space-y-4">
                    {messages.map(m => (
                      <div key={m.id} className="bg-[#1e1f22] p-8 rounded-3xl border border-gray-800 hover:border-red-600/20 transition-all shadow-xl">
                         <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-800">
                           <div>
                              <h4 className="text-xl font-bold text-white mb-1 uppercase tracking-tighter">{m.name}</h4>
                              <p className="text-gray-500 text-xs font-mono">{m.email}</p>
                           </div>
                           <span className="text-gray-600 text-[10px] font-bold uppercase">{m.created_at}</span>
                         </div>
                         <p className="text-gray-300 leading-relaxed italic border-l-2 border-red-600/30 pl-4 mb-4">"{m.message}"</p>
                      </div>
                    ))}
                    {messages.length === 0 && <p className="text-gray-500 text-center py-20 bg-[#1e1f22] rounded-3xl border border-gray-800">No messages found.</p>}
                  </div>
                </div>
              )}

            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
