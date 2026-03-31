import React, { useState, useEffect } from 'react';
import apiClient from '../services/api/apiClient';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Gauge, Fuel, Users, Star, SlidersHorizontal, ArrowUpDown, ChevronRight } from 'lucide-react';
import { CarCardSkeleton } from '../components/Skeleton';

const Cars = () => {
    const [cars, setCars] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [sortBy, setSortBy] = useState("-created_at");
    const [filters, setFilters] = useState({
        transmission: "",
        fuel_type: "",
        minPrice: "",
        maxPrice: ""
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const districtsRes = await apiClient.get('/districts/');
                setDistricts(districtsRes.data || []);
            } catch (err) {
                console.error("Error fetching districts", err);
            }
        };
        fetchInitialData();
    }, []);

    const fetchCars = async () => {
        setLoading(true);
        let url = `/cars/?search=${searchTerm}&district=${selectedDistrict}&transmission=${filters.transmission}&fuel_type=${filters.fuel_type}&minPrice=${filters.minPrice}&maxPrice=${filters.maxPrice}&ordering=${sortBy}`;
        try {
            const res = await apiClient.get(url);
            setCars(res.data.results || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCars();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedDistrict, filters, sortBy]);

    return (
        <div className="bg-[#121212] min-h-screen pt-24 pb-20">
            {/* Header Banner */}
            <div className="relative h-[350px] lg:h-[450px] flex items-center justify-center overflow-hidden px-[8%] lg:px-[12%]">
                <div className="absolute inset-0 bg-[url('/Image/cars-hero.jpg')] bg-cover bg-center bg-fixed opacity-30 scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/0 via-[#121212]/60 to-[#121212]"></div>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 text-center">
                    <h6 className="uppercase font-black text-xs lg:text-sm text-red-600 tracking-[8px] mb-6">- Exclusive Fleet</h6>
                    <h1 className="text-5xl lg:text-8xl font-black text-white bricolage-font tracking-tighter uppercase mb-4 leading-none">Choose Your <br /><span className="text-red-600">Style</span></h1>
                    <p className="text-gray-400 text-sm lg:text-lg max-w-2xl mx-auto font-medium opacity-80 italic">From luxury sedans to powerful SUVs, our collection is curated for those who demand excellence on every turn.</p>
                </motion.div>
            </div>
            
            <div className="flex flex-col xl:flex-row gap-12 px-[8%] lg:px-[12%] mt-[-50px] relative z-20">
                
                {/* Modern Sidebar Filters */}
                <aside className="w-full xl:w-[350px] space-y-8">
                    <div className="bg-[#1e1f22] rounded-[40px] p-10 border border-gray-800 shadow-2xl">
                        <div className="flex items-center gap-4 mb-10 pb-4 border-b border-gray-800/50">
                            <SlidersHorizontal size={20} className="text-red-600" />
                            <h4 className="text-xl font-bold text-white uppercase tracking-tighter bricolage-font">Filters</h4>
                        </div>

                        {/* Search Input */}
                        <div className="mb-10">
                            <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4">Quick Search</label>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 group-focus-within:scale-110 transition-all" size={18} />
                                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#121212] px-12 py-4 rounded-2xl text-white border border-gray-700 outline-none focus:border-red-600 transition-all font-bold text-sm" placeholder="Search car model..." />
                            </div>
                        </div>

                        {/* District Filter */}
                        <div className="mb-10">
                            <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4">Location (Tashkent)</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 group-focus-within:scale-110 transition-all" size={18} />
                                <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="w-full bg-[#121212] px-12 py-4 rounded-2xl text-white border border-gray-700 outline-none focus:border-red-600 transition-all font-bold text-sm appearance-none">
                                    <option value="">All Tumanlar</option>
                                    {districts.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                                </select>
                            </div>
                        </div>

                        {/* Price Range Filter */}
                        <div className="mb-10">
                            <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4">Budget Range (Daily)</label>
                            <div className="flex gap-4 items-center">
                                <div className="relative group flex-1">
                                    <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters({...filters, minPrice: e.target.value})} className="w-full bg-[#121212] px-4 py-4 rounded-2xl text-white border border-gray-700 outline-none focus:border-red-600 transition-all font-bold text-xs" />
                                </div>
                                <span className="text-gray-700 font-black">-</span>
                                <div className="relative group flex-1">
                                    <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} className="w-full bg-[#121212] px-4 py-4 rounded-2xl text-white border border-gray-700 outline-none focus:border-red-600 transition-all font-bold text-xs" />
                                </div>
                            </div>
                        </div>

                        {/* Transmission Radio Filter */}
                        <div className="mb-10">
                            <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-6">Drive Type</label>
                            <div className="grid grid-cols-2 gap-4">
                                {['automatic', 'manual'].map(t => (
                                    <button key={t} onClick={() => setFilters({...filters, transmission: filters.transmission === t ? "" : t})} className={`px-4 py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${filters.transmission === t ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/30" : "bg-[#121212] border-gray-700 text-gray-500 hover:text-white"}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Fuel Type Filter */}
                        <div className="mb-12">
                            <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-6">Energy Source</label>
                            <div className="grid grid-cols-2 gap-4">
                                {['benzin', 'gaz', 'gibrid', 'elektro'].map(f => (
                                    <button key={f} onClick={() => setFilters({...filters, fuel_type: filters.fuel_type === f ? "" : f})} className={`px-4 py-4 rounded-2xl border transition-all text-center text-[10px] font-black uppercase tracking-widest ${filters.fuel_type === f ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/30" : "bg-[#121212] border-gray-700 text-gray-500 hover:text-white"}`}>
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <button onClick={() => {setSearchTerm(""); setSelectedDistrict(""); setFilters({transmission:"", fuel_type:"", minPrice:"", maxPrice:""});}} className="w-full py-4 text-[10px] font-black text-gray-600 hover:text-red-500 uppercase tracking-widest transition-all">Reset All Filters</button>
                    </div>

                    <div className="bg-red-600 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden group cursor-pointer">
                        <div className="absolute inset-0 bg-black/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                        <h5 className="text-2xl font-bold mb-4 relative z-10 bricolage-font leading-none uppercase tracking-tighter">Need a Custom <br />Package?</h5>
                        <p className="text-sm font-medium opacity-80 mb-8 relative z-10">Contact our concierge for long-term rentals and chauffeur services.</p>
                        <Link to="/contact" className="relative z-10 bg-white text-black px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest inline-block shadow-xl">Contact Us →</Link>
                    </div>
                </aside>

                {/* Listing Results */}
                <main className="flex-1">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                        <div className="flex items-center gap-4 bg-[#1e1f22] px-6 py-6 rounded-[30px] border border-gray-800 shadow-xl">
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Total Found:</p>
                            <p className="text-white font-black bricolage-font text-xl">{cars.length} Vehicles</p>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-[#1e1f22] px-6 py-3 rounded-[30px] border border-gray-800 shadow-xl">
                            <ArrowUpDown size={16} className="text-red-600" />
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-white text-[10px] font-black uppercase tracking-widest outline-none appearance-none pr-8 relative cursor-pointer">
                                <option value="-created_at">Latest Arrival</option>
                                <option value="daily_price">Price (Low-High)</option>
                                <option value="-daily_price">Price (High-Low)</option>
                                <option value="-rating">Top Rated</option>
                                <option value="year">Age (Old-New)</option>
                                <option value="-year">Age (New-Old)</option>
                            </select>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {loading && cars.length === 0 ? (
                            <motion.div key="skeleton-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {[1, 2, 3, 4].map(n => <CarCardSkeleton key={n} />)}
                            </motion.div>
                        ) : cars.length > 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {cars.map((car, idx) => (
                                    <motion.div key={car.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} className="bg-[#1e1f22] rounded-[40px] overflow-hidden border border-gray-800/80 hover:border-red-600 transition-all duration-500 shadow-2xl group flex flex-col">
                                        <div className="h-[280px] overflow-hidden relative">
                                            <img src={car.main_image || '/Image/car-1.jpg'} alt={car.model} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" />
                                            <div className="absolute top-6 right-6 bg-red-600 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-red-600/30">
                                                {Number(car.daily_price).toLocaleString()} so'm
                                            </div>
                                            <div className="absolute bottom-6 left-6 block md:hidden lg:block group-hover:translate-y-0 translate-y-12 transition-all duration-500">
                                                <div className="bg-white/10 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
                                                    <Star size={16} fill="#eab308" className="text-yellow-500" />
                                                    <span className="text-white font-black text-xs">{car.rating} <span className="opacity-40 font-bold">({car.review_count})</span></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-10 flex-1 flex flex-col">
                                            <div className="mb-8">
                                                <h4 className="text-3xl font-black text-white bricolage-font uppercase tracking-tighter group-hover:text-red-600 transition-all leading-none mb-4">{car.brand} {car.model}</h4>
                                                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest">
                                                    <MapPin size={14} className="text-red-500" /> {car.district_info?.name} District
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mb-10 pb-8 border-b border-gray-800">
                                                <div className="flex flex-col gap-1 items-center bg-[#121212] p-4 rounded-3xl border border-gray-800/50 group-hover:border-red-600/10 transition-all">
                                                    <Users size={16} className="text-red-600" />
                                                    <span className="text-white font-black text-[10px] uppercase tracking-tighter">{car.seats} Seats</span>
                                                </div>
                                                <div className="flex flex-col gap-1 items-center bg-[#121212] p-4 rounded-3xl border border-gray-800/50 group-hover:border-red-600/10 transition-all">
                                                    <Gauge size={16} className="text-red-600" />
                                                    <span className="text-white font-black text-[10px] uppercase tracking-tighter">{car.transmission}</span>
                                                </div>
                                                <div className="flex flex-col gap-1 items-center bg-[#121212] p-4 rounded-3xl border border-gray-800/50 group-hover:border-red-600/10 transition-all">
                                                    <Fuel size={16} className="text-red-600" />
                                                    <span className="text-white font-black text-[10px] uppercase tracking-tighter">{car.fuel_type}</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto">
                                                <Link to={`/car/${car.id}`}>
                                                    <button className="w-full bg-white text-black font-black py-5 rounded-3xl hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-white/5 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 active:scale-95">Discover More <ChevronRight size={14} /></button>
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-40 bg-[#1e1f22] rounded-[40px] border border-gray-800">
                                <Search size={64} className="text-gray-800 mb-8" />
                                <h3 className="text-2xl font-bold text-white bricolage-font">No Results Match Your Search</h3>
                                <p className="text-gray-500 mt-2 font-medium">Try adjusting your filters or search terms.</p>
                                <button onClick={() => {setSearchTerm(""); setFilters({transmission:"", fuel_type:"", minPrice:"", maxPrice:""}); setSelectedDistrict("");}} className="mt-10 bg-red-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-600/20">Reset Search</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default Cars;
