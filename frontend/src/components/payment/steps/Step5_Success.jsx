import { useState } from 'react';
import { Link } from 'react-router-dom';
import { downloadReceiptFile } from '../../../services/api/payments';

const Step5_Success = ({ status, booking, totalAmount, paymentResult, onClose }) => {
  const ok = status === 'success';
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!paymentResult?.receipt_id) return;
    setDownloading(true);
    try {
      const blob = await downloadReceiptFile(paymentResult.receipt_id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${paymentResult.receipt_number || 'receipt'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4 text-center">
      <h3 className="text-2xl font-bold text-white">{ok ? "To'lov muvaffaqiyatli" : "To'lov amalga oshmadi"}</h3>
      <p className="text-sm text-white/60">{ok ? `${totalAmount} UZS to'landi` : 'Qayta urinib ko\'ring'}</p>

      {ok ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm text-white/80">
          <p>Bron ID: #{booking?.id}</p>
          <p>Receipt: {paymentResult?.receipt_number || '-'}</p>
          <p>Invoice: {paymentResult?.invoice_number || '-'}</p>
          <p>Ball: +{paymentResult?.loyalty_points_earned || 0}</p>
          <p>Status: To'langan</p>
        </div>
      ) : null}

      {ok ? (
        <Link to="/profile" onClick={onClose} className="block w-full rounded-xl bg-primary py-3 font-semibold text-white">
          Bronlarimga o'tish
        </Link>
      ) : (
        <button onClick={onClose} className="w-full rounded-xl bg-primary py-3 font-semibold text-white">
          Yopish
        </button>
      )}

      {ok ? (
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading || !paymentResult?.receipt_id}
          className="w-full rounded-xl border border-white/10 py-3 font-semibold text-white disabled:opacity-60"
        >
          {downloading ? 'Yuklanmoqda...' : 'Chekni yuklab olish'}
        </button>
      ) : null}
    </div>
  );
};

export default Step5_Success;
