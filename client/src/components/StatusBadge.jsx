import React from 'react';

export function StatusBadge({ status, size = 'md' }) {
  let badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
  let dotStyle = 'bg-emerald-500';
  let text = 'Clean';

  if (status === 'Wash Soon') {
    badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200/80';
    dotStyle = 'bg-amber-500';
    text = 'Wash Soon';
  } else if (status === 'Wash Required') {
    badgeStyle = 'bg-rose-50 text-rose-800 border-rose-200/80';
    dotStyle = 'bg-rose-500 animate-pulse';
    text = 'Wash Required';
  }

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2.5 py-0.5 gap-1.5' 
    : 'text-xs font-semibold px-3 py-1 gap-2';

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs tracking-wide ${badgeStyle} ${sizeClasses}`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotStyle}`} />
      <span>{text}</span>
    </span>
  );
}

export default StatusBadge;
