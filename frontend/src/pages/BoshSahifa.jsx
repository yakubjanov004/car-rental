import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle2, ShieldCheck, Clock, Navigation, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient, { BASE_ORIGIN } from '../services/api/apiClient';
import CarCard from '../components/CarCard';
import StatsCounter from '../components/StatsCounter';
import CarSlider from '../components/CarSlider';
import BookingForm from '../components/BookingForm';
import ScrollReveal from '../components/ScrollReveal';
import ToshkentXarita from '../components/ToshkentXarita';

const BoshSahifa = () => {
  const [mashhurMashinalar, setMashhurMashinalar] = useState([]);

  useEffect(() => {
    apiClient.get('/cars/?ordering=-rating').then(res => {
      // Map backend data to frontend component structure
      const mapped = res.data.results.slice(0, 6).map(car => ({
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
        elektr: car.fuel_type === 'elektro'
      }));
      setMashhurMashinalar(mapped);
    });
  }, []);

  return (
    <div className="overflow-x-hidden pt-20">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-8 pb-32">
        {/* Animated Car Background Slider */}
        <CarSlider />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase select-none">
                RIDELUX <br />
                <span className="text-primary italic">PREMIUM</span> <br />
                KAR-RENTAL
              </h1>
              <p className="text-xl text-white/60 mb-12 max-w-xl leading-relaxed font-medium">
                Toshkentning eng zamonaviy avtoparki. Chevrolet modellaridan tortib BYD va Kia elektromobillarigacha — sifat va qulaylik uyg'unligi.
              </p>
              
              <div className="flex gap-4 mb-8">
                 <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> 24/7 Xizmat
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm font-bold">
                    <ShieldCheck className="w-4 h-4 text-primary" /> To'liq Sug'urta
                 </div>
              </div>
            </ScrollReveal>

            {/* Premium Booking Form */}
            <ScrollReveal direction="right" delay={0.2}>
               <BookingForm />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-primary/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              <StatsCounter count={350} suffix="+" label="Mashinalar soni" />
              <StatsCounter count={22000} suffix="+" label="Mijozlarimiz" />
              <StatsCounter count={12} label="Tumanlar bo'ylab" />
              <StatsCounter count={100} suffix="%" label="Mamnuniyat" />
           </div>
        </div>
      </section>

      {/* Featured Cars Grid */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <ScrollReveal direction="up" className="flex justify-between items-end mb-16 border-l-4 border-primary pl-8">
            <div>
              <p className="text-primary font-black uppercase tracking-widest text-sm mb-2">Eng ko'p tanlanganlar</p>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Mashhur Mashinalar</h2>
            </div>
            <Link to="/mashinalar" className="btn-secondary group px-8 py-4 rounded-2xl hidden md:flex">
              Barchasini ko'rish
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {mashhurMashinalar.map((car, index) => (
              <CarCard key={car.id} car={car} index={index} />
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link to="/mashinalar" className="btn-primary w-full py-5 rounded-2xl">
              Barcha mashinalarni ko'rish
            </Link>
          </div>
        </div>
      </section>

      {/* Services/Why Choose Us */}
      <section className="py-32 bg-card-dark rounded-t-[80px] md:rounded-t-[150px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[150px] rounded-full" />
        <div className="container mx-auto px-6 relative z-10">
          <ScrollReveal direction="up" className="text-center max-w-3xl mx-auto mb-24">
             <h2 className="text-5xl font-black uppercase mb-8 tracking-tighter">Nega aynan RIDELUX?</h2>
             <p className="text-white/50 text-xl font-medium leading-relaxed">
                Biz nafaqat transport taqdim etamiz, balki sizning har bir safaringiz xavfsiz, qulay va premium darajada o'tishini ta'minlaymiz.
             </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {[
               { icon: <ShieldCheck className="w-10 h-10" />, title: "To'liq sug'urta", desc: "Har bir ijara to'liq sug'urta ostida bo'ladi. Xotirjamligingiz biz uchun muhim." },
               { icon: <Navigation className="w-10 h-10" />, title: "Tez yetkazish", desc: "Aeroportga yoki uyingizga mashinani 30 daqiqa ichida yetkazamiz." },
               { icon: <Clock className="w-10 h-10" />, title: "24/7 Yordam", desc: "Yo'lda har qanday muammo yuzaga kelsa, mutaxassislarimiz har doim aloqada." },
               { icon: <CheckCircle2 className="w-10 h-10" />, title: "Yashirin to'lovsiz", desc: "Barcha narxlar shaffof. Hech qanday kutilmagan komissiyalar yo'q." },
             ].map((item, i) => (
               <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                <div className="p-10 h-full bg-white/5 border border-white/5 hover:border-primary/30 transition-all duration-500 rounded-[48px] group ring-1 ring-white/5 hover:ring-primary/20">
                    <div className="w-20 h-20 bg-primary/10 rounded-[28px] flex items-center justify-center mb-8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-700 transform group-hover:rotate-[15deg] shadow-lg shadow-primary/10">
                        {item.icon}
                    </div>
                    <h3 className="text-2xl font-black mb-4 tracking-tight">{item.title}</h3>
                    <p className="text-white/40 leading-relaxed font-medium">{item.desc}</p>
                </div>
               </ScrollReveal>
             ))}
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-32">
        <div className="container mx-auto px-6">
            <ScrollReveal direction="up" className="text-center mb-16">
                 <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6">Bizning <span className="text-primary italic">Manzillarimiz</span></h2>
                 <p className="text-white/50 text-lg font-medium max-w-2xl mx-auto">
                    Toshkent shahri bo'ylab xizmat ko'rsatish nuqtalarimiz va elektromobillar uchun zaryadlash stantsiyalarini xaritada ko'ring.
                 </p>
            </ScrollReveal>
            <ScrollReveal direction="scale">
                <ToshkentXarita />
            </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-32">
        <div className="container mx-auto px-6">
           <ScrollReveal direction="up">
            <div className="relative p-12 md:p-24 bg-primary rounded-[60px] md:rounded-[100px] overflow-hidden flex flex-col lg:flex-row items-center justify-between text-center lg:text-left gap-12 group">
                <div className="absolute top-0 right-0 w-full lg:w-2/3 h-full opacity-10 pointer-events-none transition-transform duration-1000 group-hover:scale-110">
                    <img src="/images/cars/malibu.jpg" className="w-full h-full object-cover -rotate-12 translate-x-24 translate-y-12" alt="" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-5xl md:text-8xl font-black uppercase mb-8 leading-[0.8] tracking-tighter">
                        Safaringizni <br />
                        <span className="text-black italic">Biz bilan</span> <br />
                        Boshlang
                    </h2>
                    <p className="text-white/80 text-xl font-bold flex items-center justify-center lg:justify-start gap-2">
                        <CheckCircle2 className="w-6 h-6" /> 10% chegirma birinchi ijaraga!
                    </p>
                </div>
                <div className="relative z-10 bg-white/10 p-2 rounded-[40px] backdrop-blur-md border border-white/20">
                    <Link to="/mashinalar" className="px-12 py-10 bg-white text-primary rounded-[34px] font-black text-2xl uppercase hover:bg-bg-dark hover:text-white transition-all shadow-2xl block">
                        Hoziroq band qilish
                    </Link>
                </div>
            </div>
           </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default BoshSahifa;
