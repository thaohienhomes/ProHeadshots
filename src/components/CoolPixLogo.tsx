import { SVGProps } from 'react'

interface CoolPixLogoProps extends SVGProps<SVGSVGElement> {
  variant?: 'horizontal' | 'stacked' | 'icon-only'
  theme?: 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  effects?: 'none' | 'shimmer' | 'neon' | 'pulse'
  animated?: boolean
}

const sizeMap = {
  sm: { horizontal: { width: 120, height: 36 }, stacked: { width: 80, height: 60 }, icon: { width: 24, height: 24 } },
  md: { horizontal: { width: 160, height: 48 }, stacked: { width: 100, height: 80 }, icon: { width: 32, height: 32 } },
  lg: { horizontal: { width: 200, height: 60 }, stacked: { width: 120, height: 100 }, icon: { width: 40, height: 40 } },
  xl: { horizontal: { width: 240, height: 72 }, stacked: { width: 140, height: 120 }, icon: { width: 48, height: 48 } },
}

export default function CoolPixLogo({
  variant = 'horizontal',
  theme = 'dark',
  size = 'md',
  effects = 'none',
  animated = true,
  className,
  ...props
}: CoolPixLogoProps) {
  const dimensions = sizeMap[size][variant === 'icon-only' ? 'icon' : variant]
  const uniqueId = `coolpix-${Math.random().toString(36).substr(2, 9)}`
  
  // Color schemes based on theme
  const colors = {
    dark: {
      textGradient: ['#22d3ee', '#0ea5e9', '#3b82f6'],
      iconGradient: ['#06b6d4', '#0284c7'],
      accentGradient: ['#f59e0b', '#d97706'],
      highlight: '#ffffff'
    },
    light: {
      textGradient: ['#0891b2', '#0369a1', '#1e40af'],
      iconGradient: ['#0891b2', '#0369a1'],
      accentGradient: ['#ea580c', '#c2410c'],
      highlight: '#ffffff'
    }
  }

  const currentColors = colors[theme]

  // Generate CSS class name for effects
  const getEffectClassName = () => {
    if (!animated || effects === 'none') return className || ''
    return `${className || ''} coolpix-logo-${uniqueId}`.trim()
  }

  // Generate CSS animations as a style element
  const getAnimationCSS = () => {
    if (!animated || effects === 'none') return null

    const animationId = `coolpix-animations-${uniqueId}`

    return (
      <style key={animationId}>
        {`
          @keyframes coolpix-shimmer-${uniqueId} {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }

          @keyframes coolpix-neon-pulse-${uniqueId} {
            0% {
              filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.4));
            }
            100% {
              filter: drop-shadow(0 0 16px rgba(34, 211, 238, 0.8)) drop-shadow(0 0 24px rgba(14, 165, 233, 0.4));
            }
          }

          @keyframes coolpix-pulse-${uniqueId} {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          .coolpix-logo-${uniqueId} {
            ${effects === 'shimmer' ? `animation: coolpix-shimmer-${uniqueId} 3s ease-in-out infinite;` : ''}
            ${effects === 'neon' ? `
              filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.4));
              animation: coolpix-neon-pulse-${uniqueId} 2s ease-in-out infinite alternate;
            ` : ''}
            ${effects === 'pulse' ? `animation: coolpix-pulse-${uniqueId} 2s ease-in-out infinite;` : ''}
          }

          @media (prefers-reduced-motion: reduce) {
            .coolpix-logo-${uniqueId} {
              animation: none !important;
              transition: none !important;
            }
          }
        `}
      </style>
    )
  }

  // Generate enhanced gradients for effects
  const getEnhancedGradients = () => {
    if (effects === 'shimmer') {
      return {
        textGradient: (
          <linearGradient id={`textGradient-${theme}-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor: currentColors.textGradient[0], stopOpacity: 1}}>
              <animate attributeName="stop-opacity" values="1;0.7;1" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" style={{stopColor: currentColors.textGradient[1], stopOpacity: 1}}>
              <animate attributeName="stop-opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" style={{stopColor: currentColors.textGradient[2], stopOpacity: 1}}>
              <animate attributeName="stop-opacity" values="1;0.7;1" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        ),
        iconGradient: (
          <linearGradient id={`iconGradient-${theme}-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: currentColors.iconGradient[0], stopOpacity: 1}}>
              <animate attributeName="stop-opacity" values="1;0.8;1" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" style={{stopColor: currentColors.iconGradient[1], stopOpacity: 1}}>
              <animate attributeName="stop-opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        )
      }
    }

    // Standard gradients for other effects or no effects
    return {
      textGradient: (
        <linearGradient id={`textGradient-${theme}-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{stopColor: currentColors.textGradient[0], stopOpacity: 1}} />
          <stop offset="50%" style={{stopColor: currentColors.textGradient[1], stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: currentColors.textGradient[2], stopOpacity: 1}} />
        </linearGradient>
      ),
      iconGradient: (
        <linearGradient id={`iconGradient-${theme}-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: currentColors.iconGradient[0], stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: currentColors.iconGradient[1], stopOpacity: 1}} />
        </linearGradient>
      )
    }
  }

  const enhancedGradients = getEnhancedGradients()
  const effectClassName = getEffectClassName()

  if (variant === 'icon-only') {
    return (
      <>
        {getAnimationCSS()}
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={effectClassName}
          {...props}
        >
          <defs>
            {enhancedGradients.iconGradient}
            <linearGradient id={`accentGradient-${theme}-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor: currentColors.accentGradient[0], stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: currentColors.accentGradient[1], stopOpacity: 1}} />
            </linearGradient>
          </defs>

          <g transform="translate(6, 6)">
            <rect x="2" y="8" width="32" height="24" rx="4" fill={`url(#iconGradient-${theme}-${uniqueId})`} stroke="none"/>
            <circle cx="18" cy="20" r="8" fill="none" stroke={currentColors.highlight} strokeWidth="2"/>
            <circle cx="18" cy="20" r="5" fill="none" stroke={currentColors.highlight} strokeWidth="1.5"/>
            <rect x="26" y="4" width="6" height="4" rx="1" fill={`url(#accentGradient-${theme}-${uniqueId})`}/>
            <circle cx="15" cy="17" r="2" fill={currentColors.highlight} opacity="0.6"/>
          </g>
        </svg>
      </>
    )
  }

  if (variant === 'stacked') {
    return (
      <>
        {getAnimationCSS()}
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="0 0 120 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={effectClassName}
          {...props}
        >
          <defs>
            {enhancedGradients.textGradient}
            {enhancedGradients.iconGradient}
            <linearGradient id={`accentGradient-${theme}-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor: currentColors.accentGradient[0], stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: currentColors.accentGradient[1], stopOpacity: 1}} />
            </linearGradient>
          </defs>

          <g transform="translate(36, 8)">
            <rect x="2" y="8" width="32" height="24" rx="4" fill={`url(#iconGradient-${theme}-${uniqueId})`} stroke="none"/>
            <circle cx="18" cy="20" r="8" fill="none" stroke={currentColors.highlight} strokeWidth="2"/>
            <circle cx="18" cy="20" r="5" fill="none" stroke={currentColors.highlight} strokeWidth="1.5"/>
            <rect x="26" y="4" width="6" height="4" rx="1" fill={`url(#accentGradient-${theme}-${uniqueId})`}/>
            <circle cx="15" cy="17" r="2" fill={currentColors.highlight} opacity="0.6"/>
          </g>

          <text
            x="60"
            y="75"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="20"
            fontWeight="700"
            fill={`url(#textGradient-${theme}-${uniqueId})`}
            letterSpacing="-0.02em"
            textAnchor="middle"
          >
            coolpix
          </text>
        </svg>
      </>
    )
  }

  // Default horizontal variant
  return (
    <>
      {getAnimationCSS()}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 200 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={effectClassName}
        {...props}
      >
        <defs>
          {enhancedGradients.textGradient}
          {enhancedGradients.iconGradient}
          <linearGradient id={`accentGradient-${theme}-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor: currentColors.accentGradient[0], stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: currentColors.accentGradient[1], stopOpacity: 1}} />
          </linearGradient>
        </defs>

        <g transform="translate(8, 12)">
          <rect x="2" y="8" width="32" height="24" rx="4" fill={`url(#iconGradient-${theme}-${uniqueId})`} stroke="none"/>
          <circle cx="18" cy="20" r="8" fill="none" stroke={currentColors.highlight} strokeWidth="2"/>
          <circle cx="18" cy="20" r="5" fill="none" stroke={currentColors.highlight} strokeWidth="1.5"/>
          <rect x="26" y="4" width="6" height="4" rx="1" fill={`url(#accentGradient-${theme}-${uniqueId})`}/>
          <circle cx="15" cy="17" r="2" fill={currentColors.highlight} opacity="0.6"/>
        </g>

        <text
          x="50"
          y="38"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="28"
          fontWeight="700"
          fill={`url(#textGradient-${theme}-${uniqueId})`}
          letterSpacing="-0.02em"
        >
          coolpix
        </text>
      </svg>
    </>
  )
}
