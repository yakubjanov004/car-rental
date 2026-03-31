// 250000 → "250 000 so'm"
export const formatNarx = (narx) => {
  return Number(narx).toLocaleString("uz-UZ").replace(/,/g, ' ') + " so'm";
};

// 250000, 3 → "750 000 so'm (3 kun)"
export const formatJamiNarx = (kunlikNarx, kunlar) => {
  const jami = Number(kunlikNarx) * kunlar;
  return jami.toLocaleString("uz-UZ").replace(/,/g, ' ') + ` so'm (${kunlar} kun)`;
};
