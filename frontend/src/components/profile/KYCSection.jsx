import React from 'react';
import { ShieldCheck, CheckCircle, Upload, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const KYCSection = ({ kycData, uploading, onFileUpload, getImageUrl, onSubmit }) => {
   const canSubmit = kycData?.passport_front_image && kycData?.license_image && (kycData?.status === 'draft' || kycData?.status === 'rejected');

   return (
      <div className="space-y-8">
         <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Hujjatlarni Tasdiqlash</h2>
            {kycData && (
               <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  kycData.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                  kycData.status === 'under_review' ? 'bg-orange-500/10 text-orange-500' :
                  kycData.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-white/40'
               }`}>
                  Status: {kycData.status?.replace('_', ' ') || 'YUKLANMOQDA...'}
               </div>
            )}
         </div>

         {kycData?.status === 'rejected' && kycData?.rejection_reason && (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[32px] mb-8">
               <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-2 font-black">Rad etish sababi:</p>
               <p className="text-sm text-white/70 italic">"{kycData.rejection_reason}"</p>
            </div>
         )}

         <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Passport */}
            <div className="glass p-10 space-y-6 border-white/10 relative overflow-hidden group">
               <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                     <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  {kycData?.passport_front_image && <CheckCircle className="text-green-500 w-6 h-6" />}
               </div>
               <div className="h-40 bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                  {kycData?.passport_front_image ? (
                     <img src={getImageUrl(kycData.passport_front_image)} className="w-full h-full object-cover" alt="Passport" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-white/10 italic text-[10px] uppercase font-bold">Rasm yo'q</div>
                  )}
               </div>
               <div>
                  <h3 className="text-xl font-black italic tracking-tighter uppercase mb-2">Passport (Oldi)</h3>
                  <p className="text-xs text-white/30 leading-relaxed font-medium">Passportingizning asosiy sahifasini yuklang.</p>
               </div>
               <div className="relative pt-4">
                  <input
                     type="file"
                     id="passport-upload"
                     className="hidden"
                     disabled={kycData?.status === 'approved' || kycData?.status === 'under_review'}
                     accept="image/*"
                     onChange={(e) => onFileUpload('passport', e.target.files[0])}
                  />
                  <label
                     htmlFor="passport-upload"
                     className={`flex items-center justify-center gap-3 w-full py-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${uploading.passport ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-primary/30 hover:bg-white/5'} ${(kycData?.status === 'approved' || kycData?.status === 'under_review') ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                     {uploading.passport ? (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                     ) : (
                        <><Upload className="w-5 h-5 text-white/20" /> <span className="text-[10px] font-black uppercase tracking-widest">Almashtirish</span></>
                     )}
                  </label>
               </div>
            </div>

            {/* License */}
            <div className="glass p-10 space-y-6 border-white/10 relative overflow-hidden group">
               <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                     <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  {kycData?.license_image && <CheckCircle className="text-green-500 w-6 h-6" />}
               </div>
               <div className="h-40 bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                  {kycData?.license_image ? (
                     <img src={getImageUrl(kycData.license_image)} className="w-full h-full object-cover" alt="License" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-white/10 italic text-[10px] uppercase font-bold">Rasm yo'q</div>
                  )}
               </div>
               <div>
                  <h3 className="text-xl font-black italic tracking-tighter uppercase mb-2">Haydovchilik Guvohnomasi</h3>
                  <p className="text-xs text-white/30 leading-relaxed font-medium">Guvohnomangizning rasmini yuklang.</p>
               </div>
               <div className="relative pt-4">
                  <input
                     type="file"
                     id="license-upload"
                     className="hidden"
                     disabled={kycData?.status === 'approved' || kycData?.status === 'under_review'}
                     accept="image/*"
                     onChange={(e) => onFileUpload('license', e.target.files[0])}
                  />
                  <label
                     htmlFor="license-upload"
                     className={`flex items-center justify-center gap-3 w-full py-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${uploading.license ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-primary/30 hover:bg-white/5'} ${(kycData?.status === 'approved' || kycData?.status === 'under_review') ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                     {uploading.license ? (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                     ) : (
                        <><Upload className="w-5 h-5 text-white/20" /> <span className="text-[10px] font-black uppercase tracking-widest">Almashtirish</span></>
                     )}
                  </label>
               </div>
            </div>
         </div>

         {canSubmit && (
            <motion.button
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               onClick={onSubmit}
               className="w-full py-6 bg-primary text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_20px_40px_-15px_rgba(255,107,0,0.3)] hover:scale-[1.02] transition-all"
            >
               TASDIQLASHGA YUBORISH
            </motion.button>
         )}
      </div>
   );
};

export default KYCSection;
