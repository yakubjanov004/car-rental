import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api/apiClient';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, Phone, MessageSquare, CheckCircle, ChevronRight, Info, ShieldCheck, MapPin, Gauge, Fuel, Users } from 'lucide-react';

const CarDetails = () => {
    const { id } = useParams();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [bookingData, setBookingData] = useState({
        start_date: '',
        end_date: '',
        full_name: '',
        phone_number: '',
        comment: ''
    });
    const [bookingStatus, setBookingStatus] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCar = async () => {
            try {
                const res = await apiClient.get(`/cars/${id}/`);
                setCar(res.data);
                if (user) {
                    setBookingData(prev => ({
                        ...prev,
                        full_name: `${user.first_name} ${user.last_name}`,
                        phone_number: user.phone_number || ''
                    }));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCar();
    }, [id, user]);

    const handleNextStep = () => {
        if (step === 1 && (!bookingData.start_date || !bookingData.end_date)) {
            alert("Sanani tanlang!");
            return;
        }
        if (step === 2 && (!bookingData.full_name || !bookingData.phone_number)) {
            alert("Ma'lumotlarni to'ldiring!");
            return;
        }
        setStep(step + 1);
    };

    const handleBooking = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            setBookingStatus('submitting');
            await apiClient.post('/bookings/', {
                car: car.id,
                ...bookingData
            });
            setBookingStatus('success');
        } catch (err) {
            setBookingStatus('error');
            console.error(err);
        }
    };

    const calculateDays = () => {
        if (!bookingData.start_date || !bookingData.end_date) return 1;
        const start = new Date(bookingData.start_date);
        const end = new Date(bookingData.end_date);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 1;
    };

    if (loading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white font-bold animate-pulse uppercase tracking-[10px]">Yuklanmoqda...</div>;
    if (!car) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white">Avtomobil topilmadi</div>;

    const totalPrice = car.daily_price * calculateDays();

    return (
        <div className="bg-[#121212] min-h-screen pt-24 pb-20 px-[5%] lg:px-[10%]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                
                {/* Left Side: Car Info */}
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                    <div className="rounded-[40px] overflow-hidden shadow-2xl mb-10 border border-gray-800 group relative">
                        <img src={car.main_image || '/Image/car-1.jpg'} alt={car.model} className="w-full h-auto object-cover group-hover:scale-105 transition-all duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-8 left-8">
                             <div className="bg-red-600 inline-block px-6 py-2 rounded-2xl text-white font-bold text-sm mb-4 shadow-xl shadow-red-600/30">PREMIUM RENTAL</div>
                             <h1 className="text-5xl lg:text-7xl font-bold text-white bricolage-font uppercase tracking-tighter">
                                {car.brand} <span className="text-red-500">{car.model}</span>
                             </h1>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                        {[
                            { label: 'Year', value: car.year, icon: <Calendar className="text-red-600" /> },
                            { label: 'Gearbox', value: car.transmission, icon: <Gauge className="text-red-600" /> },
                            { label: 'Fuel', value: car.fuel_type, icon: <Fuel className="text-red-600" /> },
                            { label: 'Seats', value: car.seats, icon: <Users className="text-red-600" /> }
                        ].map((item, i) => (
                            <div key={i} className="bg-[#1e1f22] p-6 rounded-[30px] border border-gray-800 flex flex-col items-center gap-2 hover:border-red-600/30 hover:bg-gray-800 transition-all shadow-xl">
                                {item.icon}
                                <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest">{item.label}</span>
                                <span className="text-white font-bold capitalize text-sm">{item.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-[#1e1f22] p-10 rounded-[40px] border border-gray-800 shadow-2xl mb-12">
                        <h3 className="text-2xl font-bold text-white mb-8 border-b border-gray-800 pb-4 bricolage-font">Afzalliklari</h3>
                        <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                            {car.features.map((f, i) => (
                                <div key={i} className="flex items-center gap-4 text-gray-300 group hover:translate-x-2 transition-all">
                                    <div className="bg-green-500/10 p-2 rounded-xl group-hover:bg-green-500 group-hover:text-white transition-all"><CheckCircle size={14} className="text-green-500 group-hover:text-white" /></div>
                                    <span className="font-bold text-sm tracking-tight">{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-gray-400 bg-gray-800/20 p-6 rounded-3xl border border-gray-800/50">
                        <MapPin size={24} className="text-red-600 flex-shrink-0" />
                        <p className="text-sm font-medium italic opacity-80 leading-relaxed italic">Locate: {car.address}</p>
                    </div>
                </motion.div>

                {/* Right Side: Step-by-Step Booking Form */}
                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="lg:sticky lg:top-24 h-fit">
                    <div className="bg-[#1e1f22] overflow-hidden rounded-[40px] border border-gray-800 shadow-2xl">
                        
                        {/* Summary Header */}
                        <div className="bg-red-600 p-8 flex justify-between items-center text-white">
                           <div>
                              <p className="text-[10px] uppercase font-black tracking-widest opacity-80 mb-1">Total Rental Bill</p>
                              <h2 className="text-4xl font-bold tracking-tighter">{Number(totalPrice).toLocaleString()} so'm</h2>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] uppercase font-black tracking-widest opacity-80 mb-1">Security Deposit</p>
                              <p className="text-xl font-bold decoration-white/30 underline underline-offset-4">{Number(car.deposit).toLocaleString()} sum</p>
                           </div>
                        </div>

                        {/* Steps UI */}
                        <div className="p-10">
                            <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar">
                                {[1, 2, 3].map(s => (
                                    <div key={s} className="flex items-center gap-3 flex-shrink-0">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-lg transition-all ${step >= s ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-600'}`}>
                                            {s}
                                        </div>
                                        <span className={`text-[10px] uppercase font-black tracking-widest ${step === s ? 'text-white' : 'text-gray-600'}`}>
                                            {s === 1 ? 'Schedule' : s === 2 ? 'Identity' : 'Finish'}
                                        </span>
                                        {s < 3 && <div className="w-8 h-px bg-gray-800 mx-2"></div>}
                                    </div>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {bookingStatus === 'success' ? (
                                    <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                                        <div className="bg-green-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                                            <ShieldCheck size={48} className="text-green-500" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-white mb-4 bricolage-font">Muvaffaqiyatli!</h3>
                                        <p className="text-gray-400 mb-10 text-sm leading-relaxed max-w-xs mx-auto">Sizning broningiz muvaffaqiyatli qabul qilindi. Administrator tez orada bog'lanadi.</p>
                                        <button onClick={() => navigate('/dashboard')} className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-xl uppercase tracking-widest text-xs">Mening Bronlarimga o'tish →</button>
                                    </motion.div>
                                ) : (
                                    <motion.div key={step} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.3 }}>
                                        {step === 1 && (
                                            <div className="space-y-6">
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">Pick-up Date</label>
                                                        <div className="relative group">
                                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 group-hover:scale-110 transition-all" size={18} />
                                                            <input type="date" className="w-full bg-[#121212] border border-gray-700 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-red-600 transition-all font-bold text-sm" value={bookingData.start_date} onChange={(e) => setBookingData({...bookingData, start_date: e.target.value})} required />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">Return Date</label>
                                                        <div className="relative group">
                                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 group-hover:scale-110 transition-all" size={18} />
                                                            <input type="date" className="w-full bg-[#121212] border border-gray-700 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-red-600 transition-all font-bold text-sm" value={bookingData.end_date} onChange={(e) => setBookingData({...bookingData, end_date: e.target.value})} required />
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={handleNextStep} className="w-full bg-red-600 hover:bg-white hover:text-black text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-red-600/20 text-xs uppercase tracking-widest mt-4">Next Step <ChevronRight size={14} className="inline ml-2" /></button>
                                            </div>
                                        )}

                                        {step === 2 && (
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">Full Identity</label>
                                                    <div className="relative group">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 group-hover:scale-110 transition-all" size={18} />
                                                        <input type="text" placeholder="Azizbek Karimov" className="w-full bg-[#121212] border border-gray-700 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-red-600 transition-all font-bold text-sm" value={bookingData.full_name} onChange={(e) => setBookingData({...bookingData, full_name: e.target.value})} required />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">Active Phone</label>
                                                    <div className="relative group">
                                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 group-hover:scale-110 transition-all" size={18} />
                                                        <input type="text" placeholder="+998 90 123 45 67" className="w-full bg-[#121212] border border-gray-700 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-red-600 transition-all font-bold text-sm" value={bookingData.phone_number} onChange={(e) => setBookingData({...bookingData, phone_number: e.target.value})} required />
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <button onClick={() => setStep(step - 1)} className="flex-1 bg-gray-800 text-gray-400 font-black py-4 rounded-2xl hover:text-white transition-all text-xs uppercase tracking-widest">Back</button>
                                                    <button onClick={handleNextStep} className="flex-[2] bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-white hover:text-black transition-all shadow-xl shadow-red-600/20 text-xs uppercase tracking-widest">Confirmation <ChevronRight size={14} className="inline ml-2" /></button>
                                                </div>
                                            </div>
                                        )}

                                        {step === 3 && (
                                            <div className="space-y-6">
                                                <div className="bg-gray-800/40 p-6 rounded-3xl border border-gray-800/80 space-y-4">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-500 font-bold uppercase">Car Model</span>
                                                        <span className="text-white font-black">{car.brand} {car.model}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-500 font-bold uppercase">Duration</span>
                                                        <span className="text-white font-black">{bookingData.start_date} → {bookingData.end_date} ({calculateDays()} Days)</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs pt-4 border-t border-gray-800">
                                                        <span className="text-gray-500 font-bold uppercase">Total Payable</span>
                                                        <span className="text-red-500 font-black text-lg">{Number(totalPrice).toLocaleString()} sum</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">Additional Instructions</label>
                                                    <div className="relative group">
                                                        <MessageSquare className="absolute left-4 top-4 text-red-600" size={18} />
                                                        <textarea rows="3" placeholder="Special requests or instructions..." className="w-full bg-[#121212] border border-gray-700 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-red-600 transition-all font-bold text-sm" value={bookingData.comment} onChange={(e) => setBookingData({...bookingData, comment: e.target.value})}></textarea>
                                                    </div>
                                                </div>
                                                
                                                {bookingStatus === 'error' && <p className="text-red-500 text-xs font-bold text-center animate-shake">Error! Please verify your inputs.</p>}

                                                <div className="flex gap-4">
                                                    <button onClick={() => setStep(step - 1)} className="flex-1 bg-gray-800 text-gray-400 font-black py-4 rounded-2xl hover:text-white transition-all text-xs uppercase tracking-widest">Modify</button>
                                                    <button onClick={handleBooking} disabled={bookingStatus === 'submitting'} className="flex-[2] bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-green-600 transition-all shadow-xl shadow-red-600/30 text-xs uppercase tracking-widest disabled:opacity-50">
                                                        {bookingStatus === 'submitting' ? 'Finalizing...' : 'Place Order Now'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>
                    <div className="mt-8 flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-all cursor-help"><Info size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">Data Privacy</span></div>
                        <div className="w-px h-4 bg-gray-800"></div>
                        <div className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-all cursor-help"><ShieldCheck size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">Secure Checkout</span></div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CarDetails;
