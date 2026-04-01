import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Users, Fuel, Settings2, Calendar, CheckCircle2, ChevronRight, Phone, User, Info, ShieldCheck } from 'lucide-react';
import { DEMO_MASHINALAR } from '../data/mashinalar';
import { formatNarx, formatJamiNarx } from '../utils/formatPrice';
import { kunlarFarqi } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';

const MashinaTafsilot = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Booking state
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    fullName: user?.first_name ? `${user.first_name} ${user.last_name || ''}` : '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    // Simulate API fetch
    const foundCar = DEMO_MASHINALAR.find(c => c.id === parseInt(id));
    if (foundCar) {
      setCar(foundCar);
    }
    setLoading(false);
  }, [id]);

  if (loading) return <div className="pt-40 text-center uppercase tracking-tighter font-black text-4xl">Yuklanmoqda...</div>;
  if (!car) return <div className="pt-40 text-center uppercase tracking-tighter font-black text-4xl">Mashina topilmadi</div>;

  const totalDays = bookingData.startDate && bookingData.endDate ? kunlarFarqi(bookingData.startDate, bookingData.endDate) : 0;
  const totalPrice = totalDays * car.kunlik_narx;

  const handleBooking = () => {
    // In real app, call API
    alert('Bron muvaffaqiyatli amalga oshirildi!');
    navigate('/kabinet');
  };

  return (
    <div className="pt-32 pb-32">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
           <div className="space-y-4">
              <Link to="/mashinalar" className="text-white/40 hover:text-primary transition-colors flex items-center gap-2 text-sm uppercase font-bold tracking-widest">
                <ChevronRight className="rotate-180 w-4 h-4" /> Barcha mashinalar
              </Link>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                {car.brend} <span className="text-primary">{car.model}</span>
              </h1>
              <div className="flex flex-wrap gap-6 items-center">
                 <div className="flex items-center gap-2 text-white/50 bg-white/5 px-4 py-2 rounded-xl">
                   <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                   <span className="font-bold text-white">{car.reyting}</span>
                   <span>({car.sharhlar_soni} sharh)</span>
                 </div>
                 <div className="flex items-center gap-2 text-white/50 bg-white/5 px-4 py-2 rounded-xl">
                   <MapPin className="w-5 h-5 text-primary" />
                   <span className="text-white">{car.manzil}</span>
                 </div>
              </div>
           </div>
           <div className="p-8 bg-primary rounded-[32px] shadow-2xl shadow-primary/20 shrink-0">
              <p className="text-xs text-white/60 uppercase font-black mb-1">Kunlik narx</p>
              <p className="text-4xl font-black">{formatNarx(car.kunlik_narx)}</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* Left Column: Media & Details */}
          <div className="lg:col-span-2 space-y-16">
             {/* Main Image */}
             <div className="aspect-[21/9] rounded-[48px] overflow-hidden border border-white/5 shadow-2xl">
               <img src={car.rasm} alt={car.model} className="w-full h-full object-cover" />
             </div>

             {/* Specs Grid */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: <Calendar />, label: "Yili", value: car.yil },
                  { icon: <Settings2 />, label: "Uzatma", value: car.uzatma === 'automatic' ? 'Avtomat' : 'Mexanika' },
                  { icon: <Fuel />, label: "Yoqilg'i", value: car.yoqilgi },
                  { icon: <Users />, label: "O'rindiqlar", value: car.orinlar + " kishilik" },
                ].map((spec, i) => (
                  <div key={i} className="p-8 bg-card-dark rounded-3xl border border-white/5 hover:border-primary/30 transition-all group">
                     <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-12">
                        {spec.icon}
                     </div>
                     <p className="text-xs text-white/30 uppercase font-black mb-1 tracking-widest">{spec.label}</p>
                     <p className="text-xl font-bold">{spec.value}</p>
                  </div>
                ))}
             </div>

             {/* Features & Description */}
             <div className="space-y-12">
                <div>
                   <h2 className="text-3xl font-black uppercase mb-8 tracking-tighter flex items-center gap-4">
                     <Info className="text-primary w-8 h-8" /> Qo'shimcha imkoniyatlar
                   </h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {car.xususiyatlar.map((feat, i) => (
                        <div key={i} className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5">
                           <CheckCircle2 className="w-6 h-6 text-primary" />
                           <span className="text-lg font-medium">{feat}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="p-10 bg-primary/5 border border-primary/10 rounded-[48px] flex flex-col md:flex-row gap-10 items-center">
                   <div className="w-24 h-24 bg-primary text-white rounded-[32px] flex items-center justify-center shrink-0 shadow-xl shadow-primary/20">
                      <ShieldCheck className="w-12 h-12" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black uppercase mb-3 tracking-tighter">Kafolatli Xavfsizlik</h3>
                      <p className="text-white/50 leading-relaxed">Ushbu avtomobil to'liq texnik ko'rikdan o'tgan va KASKO sug'urtasiga ega. Ijara davomida 24/7 texnik yordam bilan ta'minlanasiz.</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Right Column: Booking Card */}
          <div className="lg:col-span-1">
             <div className="sticky top-32 space-y-8">
                <div className="bg-card-dark rounded-[48px] border border-white/10 p-10 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none"></div>
                   
                   {/* Steps indicator */}
                   <div className="flex justify-between mb-10 relative">
                      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2"></div>
                      <div className={`absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500`} style={{ width: `${(step-1)*50}%` }}></div>
                      {[1, 2, 3].map(s => (
                        <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 font-bold transition-all duration-500 ${
                          step >= s ? 'bg-primary text-white' : 'bg-white/10 text-white/30'
                        }`}>
                          {s}
                        </div>
                      ))}
                   </div>

                   <h3 className="text-2xl font-black uppercase mb-8 tracking-tighter text-center">
                      {step === 1 && "Sanani Tanlang"}
                      {step === 2 && "Shaxsiy Ma'lumotlar"}
                      {step === 3 && "Tasdiqlash"}
                   </h3>

                   <div className="space-y-6 min-h-[300px]">
                      {step === 1 && (
                         <div className="space-y-6 animate-fade-in">
                            <div className="space-y-2">
                               <label className="text-xs text-white/40 uppercase font-bold tracking-widest pl-2">Boshlanish sanasi</label>
                               <div className="relative">
                                  <input 
                                    type="date" 
                                    className="input-premium py-4"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={bookingData.startDate}
                                    onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
                                  />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <label className="text-xs text-white/40 uppercase font-bold tracking-widest pl-2">Tugash sanasi</label>
                               <div className="relative">
                                  <input 
                                    type="date" 
                                    className="input-premium py-4"
                                    min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                                    value={bookingData.endDate}
                                    onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
                                  />
                               </div>
                            </div>
                         </div>
                      )}

                      {step === 2 && (
                         <div className="space-y-6 animate-fade-in">
                            <div className="space-y-2">
                               <label className="text-xs text-white/40 uppercase font-bold tracking-widest pl-2">Ism-Familiya</label>
                               <div className="relative">
                                  <input 
                                    type="text" 
                                    className="input-premium py-4 pl-12"
                                    placeholder="Ismingizni kiriting"
                                    value={bookingData.fullName}
                                    onChange={(e) => setBookingData({...bookingData, fullName: e.target.value})}
                                  />
                                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <label className="text-xs text-white/40 uppercase font-bold tracking-widest pl-2">Telefon raqam</label>
                               <div className="relative">
                                  <input 
                                    type="tel" 
                                    className="input-premium py-4 pl-12"
                                    placeholder="+998"
                                    value={bookingData.phone}
                                    onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                                  />
                                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                               </div>
                            </div>
                         </div>
                      )}

                      {step === 3 && (
                         <div className="space-y-6 animate-fade-in divide-y divide-white/5">
                            <div className="bg-white/5 p-6 rounded-3xl space-y-4">
                               <div className="flex justify-between">
                                  <span className="text-white/40">Muddat:</span>
                                  <span className="font-bold underline text-primary">{totalDays} kun</span>
                               </div>
                               <div className="flex justify-between border-t border-white/5 pt-4">
                                  <span className="text-white/40">Kunlik:</span>
                                  <span className="font-bold">{formatNarx(car.kunlik_narx)}</span>
                               </div>
                               <div className="flex justify-between border-t border-white/10 pt-4">
                                  <span className="text-xl font-bold uppercase tracking-widest">Jami:</span>
                                  <span className="text-2xl font-black text-primary">{formatNarx(totalPrice)}</span>
                               </div>
                               <div className="text-center pt-2">
                                  <span className="text-[10px] text-white/20 uppercase tracking-widest">Depozit: {formatNarx(car.depozit)}</span>
                               </div>
                            </div>
                            <div className="py-6 space-y-2">
                               <p className="text-xs text-white/40">Sizning ma'lumotlaringiz:</p>
                               <p className="font-bold">{bookingData.fullName}</p>
                               <p className="font-bold">{bookingData.phone}</p>
                            </div>
                         </div>
                      )}
                   </div>

                   <div className="mt-12 flex gap-4">
                      {step > 1 && (
                         <button 
                            onClick={() => setStep(step - 1)}
                            className="btn-secondary w-full py-4 text-xs font-black uppercase"
                         >
                            Orqaga
                         </button>
                      )}
                      
                      {step < 3 ? (
                         <button 
                            onClick={() => setStep(step + 1)}
                            disabled={step === 1 && (!bookingData.startDate || !bookingData.endDate)}
                            className="btn-primary w-full py-4 text-xs font-black uppercase"
                         >
                            Davom etish
                         </button>
                      ) : (
                         <button 
                            onClick={handleBooking}
                            className="btn-primary w-full py-4 text-xs font-black uppercase"
                         >
                            Tasdiqlash
                         </button>
                      )}
                   </div>
                   
                   {!user && (
                      <p className="mt-6 text-center text-xs text-white/30 italic">Band qilish uchun hisobingizga kirgan bo'lishingiz tavsiya etiladi.</p>
                   )}
                </div>

                {/* Help Panel */}
                <div className="glass-panel p-8 text-center">
                   <p className="text-sm text-white/50 mb-4">Savollaringiz bormi?</p>
                   <p className="text-2xl font-black">+998 90 123 45 67</p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MashinaTafsilot;
