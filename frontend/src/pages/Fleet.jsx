import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, SlidersHorizontal, LayoutGrid, List, 
  X, ChevronDown, ArrowUpDown, Filter, RotateCcw, AlertCircle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { TOSHKENT_TUMANLARI } from '../data/districts';
import CarCard from '../components/CarCard';
import ScrollReveal from '../components/ScrollReveal';
import { fetchCarModels } from '../utils/api';
import { BASE_ORIGIN as MEDIA_BASE_URL } from '../services/api/apiClient';

const CATEGORIES = [
  { id: 'all', label: 'Barchasi' },
  { id: 'sedan', label: 'Sedan' },
  { id: 'crossover', label: 'Krossover' },
  { id: 'suv', label: 'SUV' },
  { id: 'premium', label: 'Premium' },
  { id: 'elektro', label: '⚡ Elektro' },
];

const Fleet = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    kategoriya: searchParams.get('kategoriya') || 'all',
    tuman: searchParams.get('tuman') || '',
    brend: '',
    yoqilgi: '',
    priceRange: [0, 30000000],
    sortBy: 'reyting', 
    viewMode: 'grid',
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch car models from backend with pagination
  const loadCars = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      // Build backend query params
      const params = { page };
      
      // Search filter - sent to backend
      if (filters.search) {
        params.search = filters.search;
      }
      
      // Ordering
      if (filters.sortBy === 'narx_osh') {
        params.ordering = 'base_daily_price';
      } else if (filters.sortBy === 'narx_tush') {
        params.ordering = '-base_daily_price';
      } else {
        params.ordering = '-id';
      }

      const data = await fetchCarModels(params);
      if (data && data.results && data.results.length > 0) {
        setCars(data.results);
        setTotalPages(data.total_pages || 1);
        setTotalCount(data.count || 0);
        setCurrentPage(data.current_page || page);
        setError(null);
      } else {
        setCars([]);
        setTotalPages(1);
        setTotalCount(0);
        setError("Database is empty. Please check admin panel car models.");
      }
    } catch (err) {
      console.error("Backend fetch failed:", err);
      setError("Error connecting to the backend.");
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.sortBy]);

  // Load cars when page or relevant filters change
  useEffect(() => {
    loadCars(currentPage);
  }, [currentPage, loadCars]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.sortBy]);

  // Client-side filtering (for filters not supported by backend)
  const filteredCars = useMemo(() => {
    let result = [...cars];

    // 1. Kategoriya (Category) - client side
    if (filters.kategoriya !== 'all') {
      if (filters.kategoriya === 'elektro') {
        result = result.filter(c => c.fuel_type === 'elektro');
      } else if (filters.kategoriya === 'premium') {
        result = result.filter(c => (c.daily_price || c.base_daily_price || 0) >= 1000000 || c.category === 'premium');
      } else {
        result = result.filter(c => c.category === filters.kategoriya);
      }
    }

    // 2. Tuman (District) - Models that have units in this district
    if (filters.tuman) {
      const tId = parseInt(filters.tuman);
      result = result.filter(c => 
        c.available_districts && c.available_districts.includes(tId)
      );
    }

    // 3. Yoqilgi (Fuel Type) - client side
    if (filters.yoqilgi) {
      result = result.filter(c => c.fuel_type === filters.yoqilgi);
    }

    // 4. Narx oralig'i (Price Range) - client side
    result = result.filter(c => {
      const price = c.daily_price || c.base_daily_price || 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    return result;
  }, [filters, cars]);

  const resetFilters = () => {
    setFilters({
      search: '',
      kategoriya: 'all',
      tuman: '',
      brend: '',
      yoqilgi: '',
      priceRange: [0, 30000000],
      sortBy: 'reyting',
      viewMode: 'grid',
    });
    setCurrentPage(1);
  };

  // Page navigation
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 2);
      let end = Math.min(totalPages - 1, currentPage + 2);
      
      if (currentPage <= 3) {
        end = Math.min(5, totalPages - 1);
      }
      if (currentPage >= totalPages - 2) {
        start = Math.max(totalPages - 4, 2);
      }
      
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="pt-32 pb-48 min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      {/* Immersive Atmospheric Glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[200px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/3 blur-[180px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,217,126,0.02)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section with Hero Background */}
        <div className="relative mb-24 rounded-[48px] overflow-hidden group">
          {/* Hero Image Background */}
          <div className="absolute inset-0 z-0">
             <img 
               src={`${MEDIA_BASE_URL}/media/hero_fleet.png`}
               alt="Fleet Hero" 
               className="w-full h-full object-cover opacity-50 scale-105 group-hover:scale-100 transition-transform duration-[3s] ease-out"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
             <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
          </div>

          <div className="relative z-10 p-12 md:p-20 flex flex-col md:flex-row md:items-end justify-between gap-12">
            <ScrollReveal direction="left">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-px bg-primary" />
                <div className="text-[11px] text-primary font-black uppercase tracking-[0.4em]">RideLux Fleet 2026</div>
              </div>
              <h1 className="font-display text-7xl md:text-[120px] font-extrabold tracking-tighter leading-[0.8] mb-8">
                Tanlov <br />
                <span className="text-white/20 italic">Erkinligi</span>
              </h1>
              <p className="text-white/40 text-[14px] font-medium max-w-sm leading-relaxed border-l-2 border-primary/30 pl-8">
                O'zbekistondagi eng sara premium va elektro avtomobillar to'plami. Har bir safar — yangi hissiyot va to'liq erkinlik.
              </p>
            </ScrollReveal>
            
            <div className="flex items-center gap-4 relative z-20">
               <div className="bg-white/5 backdrop-blur-3xl flex p-2 rounded-[24px] border border-white/10 shadow-2xl">
                 <button 
                   onClick={() => setFilters(f => ({...f, viewMode: 'grid'}))}
                   className={`p-4 rounded-[18px] transition-all duration-500 ${filters.viewMode === 'grid' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-white/20 hover:text-white/50 hover:bg-white/5'}`}
                 >
                   <LayoutGrid className="w-5 h-5" />
                 </button>
                 <button 
                   onClick={() => setFilters(f => ({...f, viewMode: 'list'}))}
                   className={`p-4 rounded-[18px] transition-all duration-500 ${filters.viewMode === 'list' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-white/20 hover:text-white/50 hover:bg-white/5'}`}
                 >
                   <List className="w-5 h-5" />
                 </button>
               </div>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center overflow-x-auto no-scrollbar gap-3 mb-20 pb-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilters(f => ({...f, kategoriya: cat.id}))}
              className={`px-10 py-5 rounded-[24px] text-[11px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all duration-500 border ${
                filters.kategoriya === cat.id 
                ? 'bg-primary border-primary text-white shadow-[0_15px_35px_rgba(0,217,126,0.25)] scale-105' 
                : 'bg-white/[0.03] border-white/5 text-white/40 hover:border-white/20 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-20">
          
          {/* Sidebar Filters */}
          <aside className={`lg:w-80 shrink-0 space-y-12 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-32 space-y-12">
            
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

            {/* Narx Oralig'i */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em] ml-1">Narx (kunlik)</label>
                <span className="text-[10px] text-primary font-bold">{filters.priceRange[1].toLocaleString()} so'm</span>
              </div>
              <div className="px-2">
                <input 
                  type="range" 
                  min="0" 
                  max="10000000" 
                  step="100000"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters(f => ({...f, priceRange: [0, parseInt(e.target.value)]}))}
                  className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between mt-2 text-[8px] text-white/20 font-bold uppercase">
                  <span>0</span>
                  <span>10M+</span>
                </div>
              </div>
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
          </div>
          </aside>

          {/* Catalog Grid */}
          <main className="flex-1">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
               <div className="text-[11px] text-white/30 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                 Topildi: <span className="text-white">{totalCount}</span> ta premium model
                 {totalPages > 1 && (
                   <span className="text-white/20 ml-2">
                     (Sahifa {currentPage}/{totalPages})
                   </span>
                 )}
               </div>

               {/* Active Filter Chips */}
               <div className="flex flex-wrap items-center gap-2">
                 {filters.kategoriya !== 'all' && (
                   <button 
                     onClick={() => setFilters(f => ({...f, kategoriya: 'all'}))}
                     className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 hover:text-white flex items-center gap-2 transition-all hover:bg-white/10"
                   >
                     <span>Kategoriya: {filters.kategoriya}</span>
                     <X className="w-3 h-3" />
                   </button>
                 )}
                 {filters.tuman && (
                   <button 
                     onClick={() => setFilters(f => ({...f, tuman: ''}))}
                     className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 hover:text-white flex items-center gap-2 transition-all hover:bg-white/10"
                   >
                     <span>Tuman: {TOSHKENT_TUMANLARI.find(t => t.id == filters.tuman)?.nomi}</span>
                     <X className="w-3 h-3" />
                   </button>
                 )}
                 {filters.yoqilgi && (
                   <button 
                     onClick={() => setFilters(f => ({...f, yoqilgi: ''}))}
                     className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 hover:text-white flex items-center gap-2 transition-all hover:bg-white/10"
                   >
                     <span>Yoqilg'i: {filters.yoqilgi}</span>
                     <X className="w-3 h-3" />
                   </button>
                 )}
                 {filters.search && (
                   <button 
                     onClick={() => setFilters(f => ({...f, search: ''}))}
                     className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 hover:text-white flex items-center gap-2 transition-all hover:bg-white/10"
                   >
                     <span>"{filters.search}"</span>
                     <X className="w-3 h-3" />
                   </button>
                 )}
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
                    <>
                      <div className={`grid gap-8 ${
                        filters.viewMode === 'grid' 
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2' 
                        : 'grid-cols-1'
                      }`}>
                        <AnimatePresence mode="popLayout">
                          {filteredCars.map((car, index) => (
                            <motion.div
                              key={car.id ?? car.slug ?? `car-${index}`}
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

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="mt-16 flex flex-col items-center gap-6">
                          <div className="flex items-center gap-2">
                            {/* First page */}
                            <button
                              onClick={() => goToPage(1)}
                              disabled={currentPage === 1}
                              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                                currentPage === 1
                                  ? 'bg-white/[0.02] border-white/5 text-white/10 cursor-not-allowed'
                                  : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white hover:border-white/20'
                              }`}
                            >
                              <ChevronsLeft className="w-4 h-4" />
                            </button>

                            {/* Previous page */}
                            <button
                              onClick={() => goToPage(currentPage - 1)}
                              disabled={currentPage === 1}
                              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                                currentPage === 1
                                  ? 'bg-white/[0.02] border-white/5 text-white/10 cursor-not-allowed'
                                  : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white hover:border-white/20'
                              }`}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>

                            {/* Page numbers */}
                            {getPageNumbers().map((page, idx) => (
                              <React.Fragment key={idx}>
                                {page === '...' ? (
                                  <span className="w-11 h-11 flex items-center justify-center text-white/20 text-xs font-bold">
                                    •••
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => goToPage(page)}
                                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-[12px] font-bold transition-all duration-300 border ${
                                      page === currentPage
                                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-110'
                                        : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white hover:border-white/20'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                )}
                              </React.Fragment>
                            ))}

                            {/* Next page */}
                            <button
                              onClick={() => goToPage(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                                currentPage === totalPages
                                  ? 'bg-white/[0.02] border-white/5 text-white/10 cursor-not-allowed'
                                  : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white hover:border-white/20'
                              }`}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>

                            {/* Last page */}
                            <button
                              onClick={() => goToPage(totalPages)}
                              disabled={currentPage === totalPages}
                              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                                currentPage === totalPages
                                  ? 'bg-white/[0.02] border-white/5 text-white/10 cursor-not-allowed'
                                  : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white hover:border-white/20'
                              }`}
                            >
                              <ChevronsRight className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Page info text */}
                          <div className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">
                            {((currentPage - 1) * 40) + 1} — {Math.min(currentPage * 40, totalCount)} / {totalCount} ta model
                          </div>
                        </div>
                      )}
                    </>
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
