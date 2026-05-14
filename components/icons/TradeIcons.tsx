import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

// Image-based trade icons (used for prominent display)
export const TRADE_IMAGES: Record<string, string> = {
  barber: "/icons/razor.png",
  cosmetologist: "/icons/shears.png",
  tattoo_artist: "/icons/tattoo-machine.png",
  piercer: "/icons/piercing.png",
};

// Trade image component
export function TradeImage({ trade, size = 26, className = "" }: { trade: string; size?: number; className?: string }) {
  const src = TRADE_IMAGES[trade];
  if (!src) return null;
  return (
    <img
      src={src}
      alt={trade}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}

// SVG fallbacks (for very small inline contexts)
export function StraightRazorIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M3 16l6-5 2 2-5 6z" />
      <path d="M9 11l2-2" />
      <path d="M11 13l9-6" />
      <path d="M12.5 14.5l8-5" />
      <path d="M20 7l1 1" />
    </svg>
  );
}

export function ShearsIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M7 8.5a2 2 0 1 0-4 0a2 2 0 0 0 4 0z" />
      <path d="M21 8.5a2 2 0 1 0-4 0a2 2 0 0 0 4 0z" />
      <path d="M12 12l-3-2.2" />
      <path d="M12 12l3-2.2" />
      <path d="M12 12L5 21" />
      <path d="M12 12L19 21" />
    </svg>
  );
}

export function TattooMachineIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M8 7l9 9" />
      <path d="M7 8l-2 2 9 9 2-2z" />
      <path d="M15.5 5.5l3 3" />
      <path d="M17 4l3 3" />
      <path d="M14 19l-2 2" />
      <path d="M12 21l-1 1" />
    </svg>
  );
}

export function PiercingNeedleIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 20L18 6" />
      <path d="M18 6l2 0" />
      <path d="M16.5 7.5l1.5-1.5" />
      <path d="M18.5 16.5a3 3 0 1 0 0-6" />
      <circle cx="21" cy="13.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Map specialty enum values to SVG icons (for small inline use)
export const TRADE_ICONS: Record<string, React.ComponentType<IconProps>> = {
  barber: StraightRazorIcon,
  cosmetologist: ShearsIcon,
  tattoo_artist: TattooMachineIcon,
  piercer: PiercingNeedleIcon,
};
