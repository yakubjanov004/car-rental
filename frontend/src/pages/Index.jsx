import React, { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import { Search, MapPin, Calendar, CreditCard, ChevronRight, Star, ShieldCheck, Zap, Gauge, Fuel } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../services/api/apiClient";

const Index = () => {
  const navigate = useNavigate();
  const [topCars, setTopCars] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState({
    district: "",
    minPrice: "",
    maxPrice: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carsRes, districtsRes] = await Promise.all([
          apiClient.get('/cars/?ordering=-rating'),
          apiClient.get('/districts/')
        ]);
        setTopCars(carsRes.data.results.slice(0, 3));
        setDistricts(districtsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchQuery.district) queryParams.set('district', searchQuery.district);
    if (searchQuery.minPrice) queryParams.set('minPrice', searchQuery.minPrice);
    if (searchQuery.maxPrice) queryParams.set('maxPrice', searchQuery.maxPrice);
    navigate(`/cars?${queryParams.toString()}`);
  };

  return (
    <div className="bg-[#121212] overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          speed={1500}
          className="h-full w-full"
        >
          {[1, 2, 3].map((s) => (
            <SwiperSlide key={s}>
              <div className="relative h-full w-full">
                <div 
                  className={`absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] scale-110`}
                  style={{ backgroundImage: `url('/Image/hero-bg-${s}.jpg')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
                <div className="absolute inset-0 bg-black/30"></div>
                
                <div className="relative z-10 h-full flex flex-col justify-center px-[8%] lg:px-[12%]">
                  <motion.p initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="uppercase font-black text-xs lg:text-sm text-red-600 tracking-[8px] mb-6">- Luxury Experience</motion.p>
                  <motion.h1 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-6xl lg:text-[120px] font-black text-white px-2 bricolage-font leading-[0.9] uppercase tracking-tighter shadow-2xl mb-8">
                    Drive Your <br />
                    <span className="text-red-600">Ambition.</span>
                  </motion.h1>
                  <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }} className="flex flex-wrap gap-4 pt-4">
                     <Link to="/cars" className="bg-red-600 text-white px-10 py-5 rounded-3xl font-black text-[12px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-2xl shadow-red-600/30 active:scale-95">Explore Fleet →</Link>
                     <Link to="/about" className="bg-white/10 backdrop-blur-xl text-white px-10 py-5 rounded-3xl font-black text-[12px] uppercase tracking-widest border border-white/10 hover:bg-white hover:text-black transition-all active:scale-95">Our Story</Link>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Floating Interactive Search Panel */}
        <motion.div 
            initial={{ opacity: 0, y: 100 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, delay: 0.8 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-6xl px-8 z-50 pointer-events-none"
        >
          <form onSubmit={handleSearch} className="pointer-events-auto bg-[#1e1f22]/80 backdrop-blur-3xl border border-white/5 p-4 lg:p-6 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="flex flex-col px-6 border-r border-white/5">
                   <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-2 flex items-center gap-2"><MapPin size={12} className="text-red-600" /> Location</label>
                   <select 
                      value={searchQuery.district} 
                      onChange={(e) => setSearchQuery({...searchQuery, district: e.target.value})}
                      className="bg-transparent text-white font-black text-sm outline-none appearance-none cursor-pointer"
                   >
                       <option value="">Tashkent City</option>
                       {districts.map(d => <option key={d.id} value={d.id}>{d.name} Tuman</option>)}
                   </select>
               </div>
               <div className="flex flex-col px-6 border-r border-white/5">
                   <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-2 flex items-center gap-2"><CreditCard size={12} className="text-red-600" /> Min Price</label>
                   <input 
                      type="number" 
                      placeholder="e.g. 200,000" 
                      value={searchQuery.minPrice}
                      onChange={(e) => setSearchQuery({...searchQuery, minPrice: e.target.value})}
                      className="bg-transparent text-white font-black text-sm outline-none placeholder:text-white/20" 
                   />
               </div>
               <div className="flex flex-col px-6 border-r border-white/5">
                   <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-2 flex items-center gap-2"><CreditCard size={12} className="text-red-600" /> Max Price</label>
                   <input 
                      type="number" 
                      placeholder="e.g. 1,000,000" 
                      value={searchQuery.maxPrice}
                      onChange={(e) => setSearchQuery({...searchQuery, maxPrice: e.target.value})}
                      className="bg-transparent text-white font-black text-sm outline-none placeholder:text-white/20" 
                   />
               </div>
               <div className="flex items-center justify-center p-2">
                   <button type="submit" className="w-full h-full bg-red-600 hover:bg-white hover:text-black text-white font-black py-4 rounded-3xl transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-3 text-xs uppercase tracking-widest">
                       <Search size={18} /> Search Fleet
                   </button>
               </div>
          </form>
        </motion.div>
      </section>

      {/* Featured Section */}
      <section className="py-32 px-[8%] lg:px-[12%] relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[120px] rounded-full"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-20">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }}>
                  <h6 className="uppercase font-black text-[10px] text-red-600 tracking-[8px] mb-6">- Curated Collection</h6>
                  <h2 className="text-5xl lg:text-7xl font-black text-white bricolage-font uppercase tracking-tighter leading-none">Global Standard <br /><span className="text-red-600">Local Service.</span></h2>
              </motion.div>
              <Link to="/cars" className="text-gray-500 font-black text-[10px] uppercase tracking-widest hover:text-red-600 transition-all flex items-center gap-4 group mb-4">View All Vehicles <div className="p-3 border border-gray-800 rounded-full group-hover:border-red-600 transition-all"><ChevronRight size={16} /></div></Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {topCars.map((car, idx) => (
                  <motion.div 
                    key={car.id} 
                    initial={{ opacity: 0, y: 50 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-[#1e1f22] rounded-[40px] overflow-hidden border border-gray-800/80 hover:border-red-600 transition-all duration-700 shadow-2xl relative"
                  >
                     <div className="h-[300px] overflow-hidden">
                        <img src={car.main_image || "/Image/car-1.jpg"} alt={car.model} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" />
                        <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-xl px-4 py-1.5 rounded-2xl border border-white/5">
                            <Star size={14} fill="#eab308" className="text-yellow-500" />
                            <span className="text-white font-black text-xs">{car.rating}</span>
                        </div>
                        <div className="absolute top-6 right-6 bg-red-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black shadow-xl shadow-red-600/30 uppercase tracking-widest">
                            Best Seller
                        </div>
                     </div>
                     <div className="p-10">
                        <h4 className="text-3xl font-black text-white bricolage-font uppercase tracking-tighter mb-8">{car.brand} {car.model}</h4>
                        
                        <div className="flex gap-4 mb-10 overflow-x-auto no-scrollbar pb-2">
                             {[
                                { icon: <Gauge size={14} />, val: car.transmission },
                                { icon: <Fuel size={14} />, val: car.fuel_type },
                                { icon: <Users size={14} />, val: `${car.seats} Seats` }
                             ].map((item, i) => (
                               <div key={i} className="flex items-center gap-2 bg-[#121212] px-4 py-2.5 rounded-3xl border border-gray-800 whitespace-nowrap">
                                  <div className="text-red-500">{item.icon}</div>
                                  <span className="text-gray-400 text-[10px] font-black uppercase tracking-tighter">{item.val}</span>
                               </div>
                             ))}
                        </div>

                        <div className="flex justify-between items-center bg-black/20 p-2 rounded-3xl border border-white/5">
                            <div className="pl-6">
                               <p className="text-gray-500 text-[9px] uppercase font-black tracking-widest opacity-60">Per Day</p>
                               <p className="text-white font-black text-xl tracking-tight">{Number(car.daily_price).toLocaleString()} <span className="text-xs opacity-40">so'm</span></p>
                            </div>
                            <Link to={`/car/${car.id}`} className="bg-white text-black h-14 w-14 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-xl"><ChevronRight /></Link>
                        </div>
                     </div>
                  </motion.div>
              ))}
          </div>
      </section>

      {/* Trust & Features Banner */}
      <section className="bg-[#1e1f22] py-20 px-[8%] lg:px-[12%]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 border-y border-white/5 py-24">
              {[
                { title: "Elite Security", desc: "Every rental is protected by top-tier comprehensive insurance and 24/7 monitoring.", icon: <ShieldCheck size={40} className="text-red-600" /> },
                { title: "Direct Delivery", desc: "We deliver your chosen masterpiece directly to your location anywhere in Tashkent.", icon: <Zap size={40} className="text-red-600" /> },
                { title: "Transparent Pricing", desc: "No hidden fees. What you see is what you pay. Guaranteed local market competitive rates.", icon: <MapPin size={40} className="text-red-600" /> }
              ].map((f, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-6">
                    <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center border border-white/10 shadow-2xl">{f.icon}</div>
                    <h5 className="text-2xl font-black text-white bricolage-font uppercase tracking-tighter">{f.title}</h5>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{f.desc}</p>
                </div>
              ))}
          </div>
      </section>

      {/* Call to Action Wrapper */}
      <section className="py-40 px-[8%] lg:px-[12%] relative text-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-red-600/10 blur-[150px] rounded-full -z-10"></div>
            <motion.h2 initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="text-6xl lg:text-[100px] font-black text-white bricolage-font tracking-tighter leading-none uppercase mb-12">
                Ready to <br /><span className="text-red-600">Elevate Your Journey?</span>
            </motion.h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-16 text-lg font-medium opacity-80">Don't settle for ordinary. Experience the pinnacle of automotive luxury in Tashkent. Book your ride in less than 2 minutes.</p>
            <Link to="/cars" className="bg-white text-black px-16 py-7 rounded-[30px] font-black uppercase text-sm tracking-[4px] hover:bg-red-600 hover:text-white transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95 inline-block">Reserve Now</Link>
      </section>
    </div>
  );
};

export default Index;
