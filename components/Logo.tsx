import { clsx } from "clsx";

// The Listify mark: a map pin with list rows inside, on a rounded tile.
// Geometry lives here and in app/icon.svg (favicon) and app/apple-icon.png
// (iOS home screen); keep the three in step if the mark changes.

const PIN = "M60 105C60 105 27 74 27 49A33 33 0 1 1 93 49C93 74 60 105 60 105Z";
// Three rows read down to about 24px; below that two bolder rows hold up better.
const ROWS_FULL = "M44 37H76M44 49.5H76M44 62H61";
const ROWS_SMALL = "M43 43H77M43 58H63";

interface LogoProps {
  /** Rendered width and height in px. Can be overridden with size classes. */
  size?: number;
  className?: string;
  /** Accessible name. Leave unset when the word "Listify" sits next to the mark. */
  title?: string;
}

export default function Logo({ size = 28, className, title }: LogoProps) {
  const small = size < 24;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      // The tile and the rows take the brand colour through currentColor.
      className={clsx("text-primary shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect width="120" height="120" rx="27" fill="currentColor" />
      <path
        d={PIN}
        fill="#fff"
        stroke="#fff"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d={small ? ROWS_SMALL : ROWS_FULL}
        fill="none"
        stroke="currentColor"
        strokeWidth={small ? 10 : 8}
        strokeLinecap="round"
      />
    </svg>
  );
}
