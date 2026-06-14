import { Link } from 'react-router-dom';

/** ApnaCart logo — navy + orange cart mark + wordmark. */
export default function Logo({ to = '/', className = '', variant = 'light', size = 'md' }) {
  const text = variant === 'light' ? 'text-white' : 'text-navy';
  const accent = 'text-saffron';
  const dim = size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-11 w-11' : 'h-9 w-9';
  const font = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  const inner = (
    <span className={`flex items-center gap-2 font-extrabold tracking-tight ${text} ${className}`}>
      <span
        className={`${dim} inline-flex items-center justify-center rounded-lg bg-white shadow-sm`}
        aria-hidden="true"
      >
        <CartMark className="h-5 w-5" />
      </span>
      <span className={font}>
        Apna<span className={accent}>Cart</span>
      </span>
    </span>
  );
  if (!to) return inner;
  return <Link to={to} aria-label="ApnaCart home">{inner}</Link>;
}

function CartMark({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 5h2.2l1.6 11.2a2 2 0 0 0 2 1.8h8.4a2 2 0 0 0 2-1.6L21 8H7"
        stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="10" cy="20.5" r="1.5" fill="#F97316"/>
      <circle cx="17" cy="20.5" r="1.5" fill="#F97316"/>
    </svg>
  );
}
