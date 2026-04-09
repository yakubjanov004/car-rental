import { useState } from 'react';
import { detectCardType, formatCardNumber } from '../utils/cardDetector';

const Step3_CardInput = ({
  cardData,
  onChange,
  savedMethods = [],
  useSavedMethod = false,
  onToggleSavedMethod,
  selectedMethodId,
  onSelectMethodId,
  onSubmit,
  isProcessing,
  error,
}) => {
  const [focused, setFocused] = useState(null);
  const cardType = detectCardType(cardData.number);

  const canSubmit =
    (useSavedMethod && selectedMethodId) ||
    (!useSavedMethod && cardData.number && cardData.expiry && cardData.cvv && cardData.holder);

  return (
    <div className="space-y-4">
      {savedMethods.length > 0 ? (
        <div className="flex gap-2 rounded-xl bg-white/5 p-1">
          <button
            type="button"
            onClick={() => onToggleSavedMethod(true)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              useSavedMethod ? 'bg-primary text-white' : 'text-white/60'
            }`}
          >
            Saqlangan karta
          </button>
          <button
            type="button"
            onClick={() => onToggleSavedMethod(false)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              !useSavedMethod ? 'bg-primary text-white' : 'text-white/60'
            }`}
          >
            Yangi karta
          </button>
        </div>
      ) : null}

      {useSavedMethod && savedMethods.length > 0 ? (
        <div className="space-y-2">
          {savedMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelectMethodId(method.id)}
              className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                selectedMethodId === method.id ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'
              }`}
            >
              <p className="text-sm font-semibold uppercase text-white">{method.card_type}</p>
              <p className="text-xs text-white/60">{method.masked_pan} | {method.expiry_month}/{method.expiry_year}</p>
            </button>
          ))}
        </div>
      ) : (
        <>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/80">
        <p className="text-xs uppercase tracking-wider">Karta turi</p>
        <p className="font-semibold uppercase">{cardType}</p>
      </div>

      <input
        type="text"
        placeholder="Karta raqami"
        value={cardData.number || ''}
        onChange={(e) => onChange({ ...cardData, number: formatCardNumber(e.target.value) })}
        onFocus={() => setFocused('number')}
        onBlur={() => setFocused(null)}
        className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-white outline-none ${
          focused === 'number' ? 'border-primary' : 'border-white/10'
        }`}
      />

      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="MM/YY"
          value={cardData.expiry || ''}
          onChange={(e) => onChange({ ...cardData, expiry: e.target.value })}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
        />
        <input
          type="password"
          placeholder="CVV"
          value={cardData.cvv || ''}
          onChange={(e) => onChange({ ...cardData, cvv: e.target.value.slice(0, 3) })}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
        />
      </div>

      <input
        type="text"
        placeholder="Karta egasi"
        value={cardData.holder || ''}
        onChange={(e) => onChange({ ...cardData, holder: e.target.value.toUpperCase() })}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
      />
        </>
      )}

      {error ? <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400">{error}</p> : null}

      <button
        onClick={onSubmit}
        disabled={isProcessing || !canSubmit}
        className="btn-primary w-full py-4 text-xs font-bold uppercase tracking-widest mt-4"
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ISHLANMOQDA...
          </div>
        ) : 'XAVFSIZ TO\'LOV'}
      </button>
    </div>
  );
};

export default Step3_CardInput;
