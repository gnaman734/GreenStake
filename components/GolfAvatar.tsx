"use client";

interface GolfAvatarProps {
  size?: number;
  className?: string;
}

export function GolfAvatar({ size = 280, className = "" }: GolfAvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 280 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer glow ring */}
      <circle cx="140" cy="140" r="130" stroke="url(#glow-ring)" strokeWidth="2" opacity="0.3">
        <animate attributeName="r" values="126;132;126" dur="4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="4s" repeatCount="indefinite" />
      </circle>

      {/* Background circle */}
      <circle cx="140" cy="140" r="110" fill="url(#bg-grad)" opacity="0.15" />

      {/* Golf ball (stylized) */}
      <circle cx="140" cy="120" r="46" fill="url(#ball-grad)">
        <animate attributeName="cy" values="120;114;120" dur="3s" repeatCount="indefinite" />
      </circle>

      {/* Dimple pattern on ball */}
      <g opacity="0.25" fill="none" stroke="#0a0f1c" strokeWidth="0.8">
        <circle cx="128" cy="108" r="4">
          <animate attributeName="cy" values="108;102;108" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="140" cy="105" r="4">
          <animate attributeName="cy" values="105;99;105" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="152" cy="108" r="4">
          <animate attributeName="cy" values="108;102;108" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="122" cy="120" r="4">
          <animate attributeName="cy" values="120;114;120" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="134" cy="118" r="4">
          <animate attributeName="cy" values="118;112;118" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="146" cy="118" r="4">
          <animate attributeName="cy" values="118;112;118" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="158" cy="120" r="4">
          <animate attributeName="cy" values="120;114;120" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="128" cy="132" r="4">
          <animate attributeName="cy" values="132;126;132" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="140" cy="130" r="4">
          <animate attributeName="cy" values="130;124;130" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="152" cy="132" r="4">
          <animate attributeName="cy" values="132;126;132" dur="3s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Ball shine */}
      <ellipse cx="132" cy="108" rx="14" ry="10" fill="white" opacity="0.18">
        <animate attributeName="cy" values="108;102;108" dur="3s" repeatCount="indefinite" />
      </ellipse>

      {/* Tee */}
      <g>
        <rect x="137" y="166" width="6" height="28" rx="3" fill="url(#tee-grad)" opacity="0.7">
          <animate attributeName="y" values="166;160;166" dur="3s" repeatCount="indefinite" />
        </rect>
        <rect x="131" y="190" width="18" height="5" rx="2.5" fill="#8b7355" opacity="0.5">
          <animate attributeName="y" values="190;184;190" dur="3s" repeatCount="indefinite" />
        </rect>
      </g>

      {/* Flag */}
      <g opacity="0.6">
        <line x1="195" y1="85" x2="195" y2="185" stroke="#64748b" strokeWidth="2">
          <animate attributeName="opacity" values="0.5;0.7;0.5" dur="5s" repeatCount="indefinite" />
        </line>
        <path d="M195 85 L225 98 L195 112 Z" fill="url(#flag-grad)" opacity="0.8">
          <animate attributeName="d" values="M195 85 L225 98 L195 112 Z;M195 83 L228 97 L195 110 Z;M195 85 L225 98 L195 112 Z" dur="2.5s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Stars / sparkles */}
      <g fill="#fbbf24" opacity="0.6">
        <circle cx="80" cy="90" r="2.5">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
          <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="210" cy="70" r="2">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
          <animate attributeName="r" values="1.5;2.5;1.5" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <circle cx="90" cy="200" r="1.5">
          <animate attributeName="opacity" values="0.2;0.7;0.2" dur="3s" repeatCount="indefinite" begin="1s" />
        </circle>
        <circle cx="200" cy="200" r="2">
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.8s" repeatCount="indefinite" begin="0.3s" />
        </circle>
      </g>

      {/* Gradient definitions */}
      <defs>
        <radialGradient id="bg-grad" cx="0.5" cy="0.4" r="0.5">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#0a0f1c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ball-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0f4f8" />
          <stop offset="50%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="tee-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4a574" />
          <stop offset="100%" stopColor="#8b7355" />
        </linearGradient>
        <linearGradient id="flag-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="glow-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
    </svg>
  );
}
