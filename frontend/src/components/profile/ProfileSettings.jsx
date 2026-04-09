import React from 'react';

const ProfileSettings = ({ profileForm, onChange, onSave, uploading }) => {
   return (
      <div className="max-w-2xl">
         <h2 className="text-2xl font-bold tracking-tight mb-8">Profil Sozlamalari</h2>
         <form onSubmit={onSave} className="glass p-10 space-y-10 border-white/10">
            <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">Ism</label>
                  <input 
                     type="text" 
                     value={profileForm.first_name} 
                     onChange={e => onChange({...profileForm, first_name: e.target.value})}
                     className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 outline-none" 
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">Familiya</label>
                  <input 
                     type="text" 
                     value={profileForm.last_name} 
                     onChange={e => onChange({...profileForm, last_name: e.target.value})}
                     className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 outline-none" 
                  />
               </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">Haydovchilik guvohnomasi</label>
                  <input 
                     type="text" 
                     value={profileForm.driver_license} 
                     onChange={e => onChange({...profileForm, driver_license: e.target.value})}
                     placeholder="Masalan: AF 1234567" 
                     className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 outline-none" 
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">Pasport yoki ID Karta</label>
                  <input 
                     type="text" 
                     value={profileForm.passport_number} 
                     onChange={e => onChange({...profileForm, passport_number: e.target.value})}
                     placeholder="Masalan: AA 1234567" 
                     className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 outline-none" 
                  />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">Manzil</label>
               <input 
                  type="text" 
                  value={profileForm.address} 
                  onChange={e => onChange({...profileForm, address: e.target.value})}
                  placeholder="Toshkent sh., ..." 
                  className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 outline-none" 
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">Telefon Raqam</label>
               <input 
                  type="tel" 
                  value={profileForm.phone_number} 
                  onChange={e => onChange({...profileForm, phone_number: e.target.value})}
                  className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 outline-none" 
               />
            </div>
            <div className="pt-6 border-t border-white/5 flex gap-4">
               <button type="submit" disabled={uploading} className="btn-primary px-10 py-4 text-xs font-bold disabled:opacity-50">
                  {uploading ? 'SAQLANMOQDA...' : 'O\'ZGARISHLARNI SAQLASH'}
               </button>
            </div>
         </form>
      </div>
   );
};

export default ProfileSettings;
