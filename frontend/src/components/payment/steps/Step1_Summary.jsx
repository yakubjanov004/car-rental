const Step1_Summary = ({ booking, totalAmount, onNext }) => {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
        <p>Bron ID: #{booking?.id}</p>
        <p>Jami summa: {totalAmount?.toLocaleString?.() || totalAmount} UZS</p>
      </div>
      <button onClick={onNext} className="w-full rounded-xl bg-primary py-3 font-semibold text-white">
        Davom etish
      </button>
    </div>
  );
};

export default Step1_Summary;
