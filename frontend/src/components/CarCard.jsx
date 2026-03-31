import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Users, Fuel, Settings2, Heart } from 'lucide-react';
import { formatNarx } from '../utils/formatPrice';

const CarCard = ({ car }) => {
  return (
    <div className="card-premium group">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={car.rasm || car.main_image || '/images/cars/placeholder.jpg'} 
          alt={car.model}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 right-4 z-10">
          <button className="p-3 bg-black/40 backdrop-blur-md rounded-2xl hover:bg-primary transition-colors duration-300">
            <Heart className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 z-10 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-bold">{car.reyting || 0}</span>
          <span className="text-xs text-white/50 text-nowrap">({car.sharhlar_soni || 0} sharh)</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1">{car.brend} {car.model}</h3>
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{car.tuman_nomi || 'Toshkent'}</span>
            </div>
          </div>
          <p className="text-primary font-heading font-black text-xl">
            {formatNarx(car.kunlik_narx)}
            <span className="text-xs text-white/50 font-normal block text-right mt-1">/kun</span>
          </p>
        </div>

        {/* Specs */}
        <div className="flex justify-between p-4 bg-white/5 rounded-2xl mb-6">
          <div className="flex flex-col items-center gap-1">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-[10px] text-white/50 uppercase">{car.orinlar} o'rin</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Settings2 className="w-4 h-4 text-primary" />
            <span className="text-[10px] text-white/50 uppercase">{car.uzatma === 'automatic' ? 'Avtomat' : 'Mexanika'}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Fuel className="w-4 h-4 text-primary" />
            <span className="text-[10px] text-white/50 uppercase">{car.yoqilgi}</span>
          </div>
        </div>

        <Link to={`/mashina/${car.id}`} className="btn-primary w-full py-4 rounded-3xl font-bold">
           Batafsil ma'lumot
        </Link>
      </div>
    </div>
  );
};

export default CarCard;
