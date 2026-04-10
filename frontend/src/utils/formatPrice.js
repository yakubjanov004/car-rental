import i18n from '../i18n';

// 250000 → "250 000 so'm"
export const formatNarx = (narx) => {
  const currency = i18n.t('common.currency') || "so'm";
  return Number(narx).toLocaleString("uz-UZ").replace(/,/g, ' ') + " " + currency;
};

// 250000, 3 → "750 000 so'm (3 kun)"
export const formatJamiNarx = (kunlikNarx, kunlar) => {
  const jami = Number(kunlikNarx) * kunlar;
  const currency = i18n.t('common.currency') || "so'm";
  const days_label = kunlar === 1 ? i18n.t('common.day') : i18n.t('common.days');
  return jami.toLocaleString("uz-UZ").replace(/,/g, ' ') + " " + currency + ` (${kunlar} ${days_label})`;
};
