// Normalizes pricing and figures out discount % and savings
export function deal(b) {
  const mrp   = Number(b?.mrp) || 0;
  let   price = Number(b?.price) || 0;
  const pct   = Number(b?.discountPct) || 0;

  // If admin set a % and MRP, derive price from it
  if (pct > 0 && mrp > 0) {
    price = Math.max(0, Math.round((mrp * (100 - pct)) / 100));
  }

  // If no % given but MRP > price, derive % from the two
  const derivedPct = mrp > 0 && price > 0
    ? Math.max(0, Math.round(100 - (price * 100) / mrp))
    : 0;

  const off  = pct || derivedPct;
  const save = mrp > 0 && price > 0 ? Math.max(0, mrp - price) : 0;

  return { mrp, price, off, save };
}
