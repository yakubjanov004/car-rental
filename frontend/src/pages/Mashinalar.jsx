import React, { useState, useEffect } from 'react';
import { Search, Grid, List as ListIcon, X, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient, { BASE_ORIGIN } from '../services/api/apiClient';
import { YOQILGI_TURLARI, UZATMA_TURLARI } from '../data/constants';
import CarCard from '../components/CarCard';
import CategoryFilter from '../components/CategoryFilter';
import ScrollReveal from '../components/ScrollReveal';

const Mashinalar = () => {
  const [cars, setCars] = useState([]);
  const [tumanlar, setTumanlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedTuman, setSelectedTuman] = useState('');
  const [activeCategory, setActiveCategory] = useState('barchasi');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedFuel, setSelectedFuel] = useState([]);
  const [selectedTrans, setSelectedTrans] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    // API data fetch
    Promise.all([
      apiClient.get('/cars/'),
      apiClient.get('/districts/')
    ]).then(([carsRes, districtsRes]) => {
      const mappedCars = carsRes.data.results.map(car => ({
        id: car.id,
        brend: car.brand,
        model: car.model,
        yil: car.year,
        uzatma: car.transmission,
        yoqilgi: car.fuel_type,
        orinlar: car.seats,
        kunlik_narx: parseInt(car.daily_price),
        rasm: car.main_image 
          ? (car.main_image.startsWith('http') ? car.main_image : `${BASE_ORIGIN}${car.main_image}`)
          : "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
        reyting: car.rating,
        sharhlar_soni: car.review_count,
        tuman_id: car.district,
        elektr: car.fuel_type === 'elektro',
        kategoriya: car.category
      }));
      setCars(mappedCars);
      setTumanlar(districtsRes.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.model.toLowerCase().includes(search.toLowerCase()) || 
                          car.brend.toLowerCase().includes(search.toLowerCase());
    const matchesTuman = selectedTuman === '' || car.tuman_id === parseInt(selectedTuman);
    const matchesMinPrice = minPrice === '' || car.kunlik_narx >= parseInt(minPrice);
    const matchesMaxPrice = maxPrice === '' || car.kunlik_narx <= parseInt(maxPrice);
    const matchesFuel = selectedFuel.length === 0 || selectedFuel.includes(car.yoqilgi);
    const matchesTrans = selectedTrans.length === 0 || selectedTrans.includes(car.uzatma);
    const matchesSeats = selectedSeats.length === 0 || selectedSeats.includes(car.orinlar);
    
    // Category mapping
    let matchesCategory = true;
    if (activeCategory === 'elektr') {
        matchesCategory = car.yoqilgi === 'elektro' || car.yoqilgi === 'gibrid' || car.elektr;
    } else if (activeCategory === 'crossover') {
        matchesCategory = car.kategoriya === 'crossover';
    } else if (activeCategory === 'suv') {
        matchesCategory = car.kategoriya === 'suv';
    } else if (activeCategory === 'sedan') {
        matchesCategory = car.kategoriya === 'sedan';
    } else if (activeCategory === 'premium') {
        matchesCategory = car.kunlik_narx >= 600000;
    } else if (activeCategory === 'arzon') {
        matchesCategory = car.kunlik_narx <= 300000;
    } else if (activeCategory === 'oilaviy') {
        matchesCategory = car.orinlar >= 7;
    }

    return matchesSearch && matchesTuman && matchesMinPrice && matchesMaxPrice && matchesFuel && matchesTrans && matchesSeats && matchesCategory;
  });

  const toggleFilter = (list, setList, value) => {
    if (list.includes(value)) {
      setList(list.filter(item => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedTuman('');
    setActiveCategory('barchasi');
    setMinPrice('');
    setMaxPrice('');
    setSelectedFuel([]);
    setSelectedTrans([]);
    setSelectedSeats([]);
  };

  return (
    <div className="pt-32 pb-20 bg-bg-dark">
      <div className="container mx-auto px-6">
        {/* Header & Category Tabs */}
        <div className="mb-12">
            <ScrollReveal direction="up" className="mb-10">
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
                   AVTO<span className="text-primary italic">MOBILLAR</span>
                </h1>
                <p className="text-white/40 font-medium text-lg max-w-2xl">
                    Sizning ehtiyojlaringizga mos keladigan eng yaxshi avtomobilni tanlang. 
                    {filteredCars.length} ta variant mavjud.
                </p>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={0.1}>
                <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
            </ScrollReveal>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-80 shrink-0 sticky top-32 h-fit space-y-10">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
               <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                  Filtrlar
               </h2>
               <button 
                 onClick={clearFilters}
                 className="text-[10px] text-white/30 font-black uppercase tracking-widest hover:text-primary transition-colors bg-white/5 px-3 py-1.5 rounded-full"
               >
                 Tozalash
               </button>
            </div>

            {/* Search */}
            <div className="space-y-4">
               <label className="text-[11px] text-white/40 uppercase font-black tracking-widest ml-1">Qidiruv</label>
               <div className="relative group">
                 <input 
                   type="text" 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder="Model yoki brend..."
                   className="input-premium pl-12 py-4 group-hover:border-white/20 transition-all shadow-lg"
                 />
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
               </div>
            </div>

            {/* Tuman */}
            <div className="space-y-4">
               <label className="text-[11px] text-white/40 uppercase font-black tracking-widest ml-1">Tuman</label>
               <select 
                className="input-premium py-3 pl-4 pr-10 appearance-none cursor-pointer"
                value={selectedTuman}
                onChange={(e) => setSelectedTuman(e.target.value)}
              >
                <option value="">Barcha tumanlar</option>
                {tumanlar.map(tuman => (
                  <option key={tuman.id} value={tuman.id}>{tuman.name}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="space-y-4">
               <label className="text-[11px] text-white/40 uppercase font-black tracking-widest ml-1">Narx (kuniga)</label>
               <div className="grid grid-cols-2 gap-4">
                 <input 
                   type="number" 
                   value={minPrice}
                   onChange={(e) => setMinPrice(e.target.value)}
                   placeholder="Min" 
                   className="input-premium py-4" 
                 />
                 <input 
                   type="number" 
                   value={maxPrice}
                   onChange={(e) => setMaxPrice(e.target.value)}
                   placeholder="Max" 
                   className="input-premium py-4" 
                 />
               </div>
            </div>

            {/* Fuel */}
            <div className="space-y-4">
               <label className="text-[11px] text-white/40 uppercase font-black tracking-widest ml-1">Yoqilg'i</label>
               <div className="grid grid-cols-2 gap-2">
                 {YOQILGI_TURLARI.map(t => (
                   <button 
                     key={t.qiymat}
                     onClick={() => toggleFilter(selectedFuel, setSelectedFuel, t.qiymat)}
                     className={`px-3 py-3 rounded-xl text-[11px] font-black uppercase tracking-tight border transition-all ${
                       selectedFuel.includes(t.qiymat) 
                       ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                       : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10'
                     }`}
                   >
                     {t.nomi}
                   </button>
                 ))}
               </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 pb-6 border-b border-white/5">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                      <LayoutGrid className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Saralangan natijalar</h2>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{filteredCars.length} ta mashina mavjud</p>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <div className="flex p-1.5 bg-white/5 border border-white/5 rounded-[20px] backdrop-blur-md">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-2.5 rounded-[14px] transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/30 hover:text-white'}`}
                    >
                      <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-2.5 rounded-[14px] transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/30 hover:text-white'}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden p-4 bg-white/5 border border-white/10 rounded-2xl text-white/50"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                  </button>
               </div>
            </div>

            {/* Results Grid */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-[3/4] bg-white/5 rounded-[32px] animate-pulse" />
                    ))}
                </motion.div>
              ) : filteredCars.length > 0 ? (
                <motion.div 
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
                >
                    {filteredCars.map((car, index) => (
                        <CarCard key={car.id} car={car} index={index} />
                    ))}
                </motion.div>
              ) : (
                <motion.div 
                    key="empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-32 flex flex-col items-center text-center bg-white/5 rounded-[40px] border border-white/5"
                >
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                        <X className="w-10 h-10 text-white/20" />
                    </div>
                    <h2 className="text-3xl font-black uppercase mb-3 tracking-tighter">Mashinalar topilmadi</h2>
                    <p className="text-white/40 mb-10 max-w-sm font-medium">Qidiruv natijasida hech nima topilmadi. Iltimos filtrlarni o'zgartirib ko'ring.</p>
                    <button onClick={clearFilters} className="btn-primary px-10 rounded-2xl">Filtrlarni tozalash</button>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

        </div>
      </div>
    </div>
  );
};

export default Mashinalar;
