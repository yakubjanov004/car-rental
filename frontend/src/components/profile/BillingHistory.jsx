import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download } from 'lucide-react';
import { formatNarx } from '../../utils/formatPrice';

const BillingHistory = ({ invoices, downloadingInvoice, onDownload }) => {
   if (invoices.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center py-24 glass rounded-[48px] border-white/5 border-dashed border-2">
            <FileText className="w-16 h-16 text-white/5 mb-6" />
            <p className="text-white/20 font-bold uppercase tracking-widest text-xs">To'lovlar mavjud emas</p>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <h2 className="text-2xl font-bold tracking-tight mb-8">To'lovlar Tarixi</h2>
         <div className="space-y-4">
            {invoices.map((invoice) => (
               <div key={invoice.id} className="glass p-6 rounded-3xl border-white/10 flex items-center justify-between group">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors" />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest">{invoice.invoice_number}</h4>
                        <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">
                           {new Date(invoice.created_at).toLocaleDateString()} • {formatNarx(invoice.amount)}
                        </p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest">
                        {invoice.status}
                     </span>
                     <button
                        onClick={() => onDownload(invoice.id, invoice.invoice_number)}
                        disabled={downloadingInvoice === invoice.id}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                     >
                        {downloadingInvoice === invoice.id ? (
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                           <Download className="w-4 h-4" />
                        )}
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};

export default BillingHistory;
