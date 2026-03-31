// 2026-03-31 → "31.03.2026"
export const formatSana = (sana) => {
  const d = new Date(sana);
  return d.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Ikki sana orasidagi kunlar sonini hisoblash
export const kunlarFarqi = (boshlanish, tugash) => {
  const start = new Date(boshlanish);
  const end = new Date(tugash);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
};
