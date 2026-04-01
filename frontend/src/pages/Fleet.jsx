import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, SlidersHorizontal, LayoutGrid, List, 
  X, ChevronDown, ArrowUpDown, Filter, RotateCcw, AlertCircle
} from 'lucide-react';
// import { DEMO_MASHINALAR } from '../data/cars';
import { TOSHKENT_TUMANLARI } from '../data/districts';
import CarCard from '../components/CarCard';
import ScrollReveal from '../components/ScrollReveal';
import { fetchCars } from '../utils/api';

const CATEGORIES = [
  { id: 'all', label: 'Barchasi' },
  { id: 'sedan', label: 'Sedan' },
  { id: 'crossover', label: 'Krossover' },
  { id: 'suv', label: 'SUV' },
  { id: 'premium', label: 'Premium' },
  { id: 'elektro', label: '⚡ Elektro' },
];

const Fleet = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    kategoriya: 'all',
    tuman: '',
    brend: '',
    yoqilgi: '',
    priceRange: [0, 5000000],
    sortBy: 'reyting', 
    viewMode: 'grid',
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch cars from backend
  useEffect(() => {
    const loadCars = async () => {
      setLoading(true);
      try {
        const data = await fetchCars();
        // If backend is empty, use DEMO
        if (data && data.length > 0) {
          setCars(data);
        } else {
          setCars([]);
          setError("Database is empty. Please run seed.py.");
        }
      } catch (err) {
        console.error("Backend fetch failed:", err);
        setError("Error connecting to the backend.");
        setCars([]);
      } finally {
        setLoading(false);
      }
    };
    loadCars();
  }, []);

  // Filterlash logikasi
  const filteredCars = useMemo(() => {
    let result = [...cars];

    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(c => 
        (c.brand || c.brend || "").toLowerCase().includes(s) || 
        (c.model || "").toLowerCase().includes(s)
      );
    }

    if (filters.kategoriya !== 'all') {
      if (filters.kategoriya === 'elektro') {
        result = result.filter(c => (c.fuel_type || c.yoqilgi) === 'elektro' || c.elektr);
      } else if (filters.kategoriya === 'premium') {
        result = result.filter(c => (c.daily_price || c.kunlik_narx) >= 600000 || c.category === 'premium' || c.kategoriya === 'premium');
      } else {
        result = result.filter(c => (c.category || c.kategoriya) === filters.kategoriya);
      }
    }

    if (filters.tuman) {
      result = result.filter(c => (c.district || c.tuman_id) === parseInt(filters.tuman));
    }

    if (filters.yoqilgi) {
      result = result.filter(c => (c.fuel_type || c.yoqilgi) === filters.yoqilgi);
    }

    result = result.filter(c => 
      (c.daily_price || c.kunlik_narx) >= filters.priceRange[0] && 
      (c.daily_price || c.kunlik_narx) <= filters.priceRange[1]
    );

    // Saralash
    if (filters.sortBy === 'reyting') {
      result.sort((a, b) => (b.rating || b.reyting || 0) - (a.rating || a.reyting || 0));
    } else if (filters.sortBy === 'narx_osh') {
      result.sort((a, b) => (a.daily_price || a.kunlik_narx) - (b.daily_price || b.kunlik_narx));
    } else if (filters.sortBy === 'narx_tush') {
      result.sort((a, b) => (b.daily_price || b.kunlik_narx) - (a.daily_price || a.kunlik_narx));
    }

    return result;
  }, [filters, cars]);

  const resetFilters = () => {
    setFilters({
      search: '',
      kategoriya: 'all',
      tuman: '',
      brend: '',
      yoqilgi: '',
      priceRange: [0, 5000000],
      sortBy: 'reyting',
      viewMode: 'grid',
    });
  };

  return (
    <div className="pt-32 pb-32 min-h-screen bg-[#0A0A0A] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 relative">
          {/* Ambient light */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
          
          <ScrollReveal direction="left">
            <div className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-4">— Katalog</div>
            <h1 className="font-display text-5xl md:text-8xl font-extrabold tracking-tighter leading-none mb-4">
              Premium <span className="text-white/40 italic">Avto</span> park
            </h1>
            <p className="text-white/40 text-sm font-light max-w-md">Barcha ehtiyojlaringiz uchun eng sara avtomobillar to'plami.</p>
          </ScrollReveal>
          
          <div className="flex items-center gap-4">
             <div className="glass flex p-1 rounded-2xl border-white/5">
               <button 
                 onClick={() => setFilters(f => ({...f, viewMode: 'grid'}))}
                 className={`p-3 rounded-xl transition-all ${filters.viewMode === 'grid' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/30 hover:text-white'}`}
               >
                 <LayoutGrid className="w-5 h-5" />
               </button>
               <button 
                 onClick={() => setFilters(f => ({...f, viewMode: 'list'}))}
                 className={`p-3 rounded-xl transition-all ${filters.viewMode === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/30 hover:text-white'}`}
               >
                 <List className="w-5 h-5" />
               </button>
             </div>
             <button 
               onClick={() => setIsFilterOpen(!isFilterOpen)}
               className="glass p-4 rounded-2xl md:hidden text-white/50 border-white/5"
             >
               <Filter className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex overflow-x-auto no-scrollbar gap-4 mb-16 pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilters(f => ({...f, kategoriya: cat.id}))}
              className={`px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${
                filters.kategoriya === cat.id 
                ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' 
                : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Sidebar Filters */}
          <aside className={`lg:w-80 shrink-0 space-y-10 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            
            {/* Search */}
            <div className="space-y-4">
              <label className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em] ml-1">Qidiruv</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={filters.search}
                  onChange={(e) => setFilters(f => ({...f, search: e.target.value}))}
                  placeholder="Brend yoki model..."
                  className="w-full bg-[#111] border border-white/5 rounded-2xl py-4.5 pl-12 pr-4 text-sm focus:border-primary/50 transition-all outline-none"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            {/* Tuman */}
            <div className="space-y-4">
              <label className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em] ml-1">Tumanlar</label>
              <select 
                className="w-full bg-[#111] border border-white/5 rounded-2xl py-4.5 px-6 text-sm outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                value={filters.tuman}
                onChange={(e) => setFilters(f => ({...f, tuman: e.target.value}))}
              >
                <option value="" className="bg-[#111]">Barcha tumanlar</option>
                {TOSHKENT_TUMANLARI.map(t => (
                  <option key={t.id} value={t.id} className="bg-[#111]">{t.nomi}</option>
                ))}
              </select>
            </div>

            {/* Price Sorting */}
            <div className="space-y-4">
              <label className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em] ml-1">Saralash</label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'reyting', label: '⭐ Eng yuqori reyting' },
                  { id: 'narx_osh', label: '📈 Narx: Arzonroq' },
                  { id: 'narx_tush', label: '📉 Narx: Qimmatroq' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setFilters(f => ({...f, sortBy: opt.id}))}
                    className={`text-left px-5 py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all border ${
                      filters.sortBy === opt.id 
                      ? 'bg-primary/10 border-primary/30 text-primary shadow-lg shadow-primary/5' 
                      : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/8'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Yoqilg'i */}
            <div className="space-y-4">
              <label className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em] ml-1">Yoqilg'i turi</label>
              <div className="flex flex-wrap gap-2">
                {['benzin', 'elektro', 'gibrid', 'gaz'].map(y => (
                  <button
                    key={y}
                    onClick={() => setFilters(f => ({...f, yoqilgi: f.yoqilgi === y ? '' : y}))}
                    className={`px-5 py-3 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all border ${
                      filters.yoqilgi === y 
                      ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' 
                      : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    {y === 'elektro' ? '⚡ Elektro' : y}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-2 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-colors border border-dashed border-white/10 rounded-2xl group"
            >
              <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
              Filtrlarni tozalash
            </button>
          </aside>

          {/* Catalog Grid */}
          <main className="flex-1">
             <div className="flex items-center justify-between mb-10">
              <div className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">
                Topildi: <span className="text-white">{filteredCars.length}</span> ta mashina
               </div>
             </div>

             {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {[...Array(4)].map((_, i) => (
                      <div key={i} className="aspect-[16/10] bg-white/[0.02] animate-pulse rounded-[40px] border border-white/5" />
                   ))}
                </div>
             ) : (
                <>
                  {filteredCars.length > 0 ? (
                    <div className={`grid gap-8 ${
                      filters.viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2' 
                      : 'grid-cols-1'
                    }`}>
                      <AnimatePresence mode="popLayout">
                        {filteredCars.map((car, index) => (
                          <motion.div
                            key={car.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.5 }}
                          >
                             <CarCard car={car} index={index} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="py-32 flex flex-col items-center justify-center glass rounded-[48px] text-center px-6 border-white/5">
                      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-10 border border-white/5">
                        <AlertCircle className="w-10 h-10 text-white/20" />
                      </div>
                      <h2 className="text-3xl font-bold mb-4 tracking-tighter">Mashinalar topilmadi</h2>
                      <p className="text-white/40 max-w-sm mb-12 text-sm font-light">
                        Qidiruvingiz bo'yicha hech qanday natija chiqmadi. Filtrlarni o'zgartirib ko'ring.
                      </p>
                      <button onClick={resetFilters} className="btn-primary px-12 h-14">Barcha mashinalarni ko'rish</button>
                    </div>
                  )}
                </>
             )}
          </main>

        </div>
      </div>
    </div>
  );
};

export default Fleet;
