import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ChevronLeft } from 'lucide-react';

const Sahifa404 = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 pb-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[150px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-primary/5 blur-[150px] -z-10"></div>

      <div className="text-center space-y-12 relative z-10 px-6">
         <div className="relative inline-block">
            <h1 className="text-[12rem] md:text-[20rem] font-black uppercase tracking-tighter leading-none opacity-5 flex justify-center">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
               <Car className="w-32 h-32 text-primary" />
            </div>
         </div>

         <div className="max-w-xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Sahifa Topilmadi</h2>
            <p className="text-white/40 text-lg">Afsuski, siz qidirayotgan sahifa mavjud emas yoki boshqa manzilga ko'chirilgan.</p>
            <Link to="/" className="btn-primary py-5 px-10 rounded-3xl font-black uppercase tracking-widest text-sm mx-auto shadow-2xl shadow-primary/20">
               <ChevronLeft className="w-5 h-5" /> Bosh sahifaga qaytish
            </Link>
         </div>
      </div>
    </div>
  );
};

export default Sahifa404;
