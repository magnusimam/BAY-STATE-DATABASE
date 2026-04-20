import type { SVGProps } from 'react'

interface Props extends SVGProps<SVGSVGElement> {
  size?: number
  variant?: 'mark' | 'badge'
}

// The HUMAID mark — an "H" with a data-pulse line connecting its two
// verticals, plus three loading dots below. Matches the mobile app's
// BrandSplash and icon.png so both platforms share the same identity.
//
// variant="mark"  : H only, inherits currentColor (for use in text contexts)
// variant="badge" : H on amber rounded-square (for header / avatar contexts)
export function HumaidLogo({ size = 32, variant = 'badge', ...rest }: Props) {
  if (variant === 'mark') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 150 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...rest}
      >
        <rect x="28" y="22" width="20" height="106" rx="5" fill="currentColor" />
        <rect x="102" y="22" width="20" height="106" rx="5" fill="currentColor" />
        <path
          d="M 48 78 L 60 78 L 66 62 L 72 94 L 78 56 L 84 78 L 102 78"
          stroke="currentColor"
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 150 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <rect width="150" height="150" rx="28" fill="#f4b942" />
      <rect x="28" y="22" width="20" height="96" rx="5" fill="#ffffff" />
      <rect x="102" y="22" width="20" height="96" rx="5" fill="#ffffff" />
      <path
        d="M 48 70 L 60 70 L 66 54 L 72 86 L 78 48 L 84 70 L 102 70"
        stroke="#ffffff"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Loading dots */}
      <circle cx="64" cy="128" r="3.5" fill="#ffffff" opacity="0.55" />
      <circle cx="75" cy="128" r="3.5" fill="#ffffff" opacity="0.85" />
      <circle cx="86" cy="128" r="3.5" fill="#ffffff" opacity="0.55" />
    </svg>
  )
}
