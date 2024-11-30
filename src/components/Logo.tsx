import { SVGProps } from 'react'

export default function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="#CEFF66"
        strokeWidth="1.5"
      />
      <circle
        cx="12"
        cy="12"
        r="4.5"
        stroke="#f6f5ec"
        strokeWidth="1.5"
      />
      <path d="M15 3.5V6.5H13L14.5 3.5H15Z" fill="#CEFF66" />
      <path
        d="M14.2 4L13.4 5.5L12.6 4L13.4 2.5L14.2 4Z"
        fill="#CEFF66"
      />
    </svg>
  )
} 