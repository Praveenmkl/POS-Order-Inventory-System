import React from "react";

export const PosMachineSvg = ({ className = "h-5 w-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* POS Terminal Body */}
    <rect x="5" y="2" width="14" height="20" rx="3" />
    {/* Display Screen */}
    <rect x="8" y="5" width="8" height="4" rx="1" />
    {/* Keypad dots */}
    <circle cx="9.5" cy="12" r="0.75" fill="currentColor" />
    <circle cx="12" cy="12" r="0.75" fill="currentColor" />
    <circle cx="14.5" cy="12" r="0.75" fill="currentColor" />
    <circle cx="9.5" cy="15" r="0.75" fill="currentColor" />
    <circle cx="12" cy="15" r="0.75" fill="currentColor" />
    <circle cx="14.5" cy="15" r="0.75" fill="currentColor" />
    <circle cx="9.5" cy="18" r="0.75" fill="currentColor" />
    <circle cx="12" cy="18" r="0.75" fill="currentColor" />
    <circle cx="14.5" cy="18" r="0.75" fill="currentColor" />
  </svg>
);

export const LogoIcon = ({ className = "h-9 w-9", iconSize = "h-5 w-5" }) => (
  <div className={`relative flex items-center justify-center rounded-xl bg-black text-white shadow-md select-none ${className}`}>
    <PosMachineSvg className={iconSize} />
  </div>
);

export const Logo = ({ showText = true, size = "md" }) => {
  const sizeClasses = {
    sm: { icon: "h-7 w-7 rounded-lg", iconSize: "h-4 w-4", title: "text-sm font-bold", sub: "text-[10px]" },
    md: { icon: "h-9 w-9 rounded-xl", iconSize: "h-5 w-5", title: "text-base font-bold", sub: "text-xs" },
    lg: { icon: "h-12 w-12 rounded-2xl", iconSize: "h-6 w-6", title: "text-xl font-extrabold", sub: "text-sm" },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex items-center gap-2.5">
      <LogoIcon className={currentSize.icon} iconSize={currentSize.iconSize} />
      {showText && (
        <div>
          <h1 className={`${currentSize.title} leading-none tracking-tight`}>POS Manager</h1>
          <span className={`${currentSize.sub} text-muted-foreground font-medium`}>Inventory & Sales</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
