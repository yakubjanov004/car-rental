import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Grid, List as ListIcon, X, Sliders } from 'lucide-react';
import { DEMO_MASHINALAR } from '../data/mashinalar';
import { TOSHKENT_TUMANLARI } from '../data/tumanlar';
import { YOQILGI_TURLARI, UZATMA_TURLARI } from '../data/constants';
import CarCard from '../components/CarCard';
import Skeleton from '../components/Skeleton';
import { formatNarx } from '../utils/formatPrice';

const Mashinalar = () => {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedTuman, setSelectedTuman] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedFuel, setSelectedFuel] = useState([]);
  const [selectedTrans, setSelectedTrans] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const filteredCars = DEMO_MASHINALAR.filter(car => {
    const matchesSearch = car.model.toLowerCase().includes(search.toLowerCase()) || 
                          car.brend.toLowerCase().includes(search.toLowerCase());
    const matchesTuman = selectedTuman === '' || car.tuman_id === parseInt(selectedTuman);
    const matchesMinPrice = minPrice === '' || car.kunlik_narx >= parseInt(minPrice);
    const matchesMaxPrice = maxPrice === '' || car.kunlik_narx <= parseInt(maxPrice);
    const matchesFuel = selectedFuel.length === 0 || selectedFuel.includes(car.yoqilgi);
    const matchesTrans = selectedTrans.length === 0 || selectedTrans.includes(car.uzatma);
    const matchesSeats = selectedSeats.length === 0 || selectedSeats.includes(car.orinlar);

    return matchesSearch && matchesTuman && matchesMinPrice && matchesMaxPrice && matchesFuel && matchesTrans && matchesSeats;
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
    setMinPrice('');
    setMaxPrice('');
    setSelectedFuel([]);
    setSelectedTrans([]);
    setSelectedSeats([]);
  };

  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-80 shrink-0 sticky top-32 h-fit space-y-10">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-black uppercase tracking-tighter">Filtrlar</h2>
               <button 
                 onClick={clearFilters}
                 className="text-xs text-primary font-bold uppercase hover:underline"
               >
                 Tozalash
               </button>
            </div>

            {/* Search */}
            <div className="space-y-4">
               <label className="text-xs text-white/40 uppercase font-black tracking-widest">Qidiruv</label>
               <div className="relative">
                 <input 
                   type="text" 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder="Mashina modeli..."
                   className="input-premium pl-12 py-4"
                 />
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
               </div>
            </div>

            {/* Tuman */}
            <div className="space-y-4">
               <label className="text-xs text-white/40 uppercase font-black tracking-widest">Tuman bo'yicha</label>
               <select 
                 className="input-premium py-4"
                 value={selectedTuman}
                 onChange={(e) => setSelectedTuman(e.target.value)}
               >
                 <option value="">Barcha tumanlar</option>
                 {TOSHKENT_TUMANLARI.map(t => (
                   <option key={t.id} value={t.id}>{t.nomi}</option>
                 ))}
               </select>
            </div>

            {/* Price */}
            <div className="space-y-4">
               <label className="text-xs text-white/40 uppercase font-black tracking-widest">Narx diapazoni</label>
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

            {/* Transmission */}
            <div className="space-y-4">
               <label className="text-xs text-white/40 uppercase font-black tracking-widest">Uzatma turi</label>
               <div className="flex flex-wrap gap-2">
                 {UZATMA_TURLARI.map(t => (
                   <button 
                     key={t.qiymat}
                     onClick={() => toggleFilter(selectedTrans, setSelectedTrans, t.qiymat)}
                     className={`px-4 py-3 rounded-2xl text-sm font-bold border transition-all ${
                       selectedTrans.includes(t.qiymat) ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/5 text-white/50'
                     }`}
                   >
                     {t.nomi}
                   </button>
                 ))}
               </div>
            </div>

            {/* Fuel */}
            <div className="space-y-4">
               <label className="text-xs text-white/40 uppercase font-black tracking-widest">Yoqilg'i turi</label>
               <div className="flex flex-wrap gap-2">
                 {YOQILGI_TURLARI.map(t => (
                   <button 
                     key={t.qiymat}
                     onClick={() => toggleFilter(selectedFuel, setSelectedFuel, t.qiymat)}
                     className={`px-4 py-3 rounded-2xl text-sm font-bold border transition-all ${
                       selectedFuel.includes(t.qiymat) ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/5 text-white/50'
                     }`}
                   >
                     {t.nomi}
                   </button>
                 ))}
               </div>
            </div>

            {/* Seats */}
            <div className="space-y-4">
               <label className="text-xs text-white/40 uppercase font-black tracking-widest">O'rindiqlar</label>
               <div className="flex flex-wrap gap-2">
                 {[4, 5, 7].map(s => (
                   <button 
                     key={s}
                     onClick={() => toggleFilter(selectedSeats, setSelectedSeats, s)}
                     className={`w-12 h-12 rounded-2xl text-sm font-bold border transition-all ${
                       selectedSeats.includes(s) ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/5 text-white/50'
                     }`}
                   >
                     {s}
                   </button>
                 ))}
               </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
               <div>
                  <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Barcha Mashinalar</h1>
                  <p className="text-white/40 font-medium">{filteredCars.length} ta mashina topildi</p>
               </div>

               <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="flex p-1 bg-white/5 rounded-2xl">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
                    >
                      <ListIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden btn-secondary p-3"
                  >
                    <Sliders className="w-6 h-6" />
                  </button>
               </div>
            </div>

            {/* Grid */}
            {loading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {[...Array(6)].map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />)}
               </div>
            ) : filteredCars.length > 0 ? (
               <div className={`grid gap-10 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  {filteredCars.map(car => (
                    <CarCard key={car.id} car={car} />
                  ))}
               </div>
            ) : (
               <div className="py-32 flex flex-col items-center text-center">
                  <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10">
                    <X className="w-16 h-16 text-white/20" />
                  </div>
                  <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">Mashinalar topilmadi</h2>
                  <p className="text-white/40 mb-10 max-w-sm">Afsuski, qidiruv shartlariga mos keladigan biron bir avtomobil topilmadi. Boshqa shartlarni sinab ko'ring.</p>
                  <button onClick={clearFilters} className="btn-primary">Filtrlarni tozalash</button>
               </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
};

export default Mashinalar;
