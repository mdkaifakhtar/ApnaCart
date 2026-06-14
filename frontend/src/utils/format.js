export const inr = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
export const discountPct = (mrp, price) => (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
