interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-14 w-14 rounded-2xl',
  md: 'h-20 w-20 rounded-[1.6rem]',
  lg: 'h-24 w-24 rounded-[1.8rem]',
  xl: 'h-28 w-28 rounded-[2rem]',
};

export function AppLogo({ size = 'md', className = '' }: AppLogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden border border-white/35 bg-[linear-gradient(135deg,#4f93cf_0%,#79b4e6_45%,#3a6ea5_100%)] shadow-[0_18px_40px_rgba(32,78,124,0.35)] ${sizeClasses[size]} ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.38),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.16),transparent_70%)]" />
      <div className="absolute inset-x-[20%] bottom-[-16%] h-[38%] rounded-full bg-[#1f4f7d]/35 blur-xl" />
      <svg
        viewBox="0 0 64 64"
        className="relative z-10 h-[54%] w-[54%] drop-shadow-[0_4px_12px_rgba(255,255,255,0.35)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M15 29.5L32 16L49 29.5"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 27.5V47C20 48.6569 21.3431 50 23 50H41C42.6569 50 44 48.6569 44 47V27.5"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M28 50V37C28 35.8954 28.8954 35 30 35H34C35.1046 35 36 35.8954 36 37V50"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
