import React, { useState } from 'react';

interface ButuanEvLogoProps {
  className?: string;
  size?: number;
}

export const ButuanEvLogo: React.FC<ButuanEvLogoProps> = ({
  className = '',
  size = 40,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`relative rounded-xl overflow-hidden flex items-center justify-center shrink-0 bg-white shadow-xs ${className}`}
      style={{ width: size, height: size }}
    >
      {!imageError ? (
        <img
          src="/src/assets/images/butuanev_logo_1791430979682.jpg"
          alt="ButuanEV Logo"
          className="w-full h-full object-contain p-0.5"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      ) : (
        /* Pristine Vector SVG recreation of the uploaded ButuanEV gear emblem */
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Half of Gear - Deep Blue */}
          <path
            d="M50 8 L58 8 L60 16 C63.5 17.5 66.8 19.5 69.8 22 L77.5 18 L83 23.5 L79 31 C81.5 34 83.5 37.3 85 41 L93 43 L93 50 L7 50 L7 43 L15 41 C16.5 37.3 18.5 34 21 31 L17 23.5 L22.5 18 L30.2 22 C33.2 19.5 36.5 17.5 40 16 L42 8 Z"
            fill="url(#blueGearGrad)"
          />

          {/* Bottom Half of Gear - Rich Green */}
          <path
            d="M7 50 L93 50 L93 57 L85 59 C83.5 62.7 81.5 66 79 69 L83 76.5 L77.5 82 L69.8 78 C66.8 80.5 63.5 82.5 60 84 L58 92 L42 92 L40 84 C36.5 82.5 33.2 80.5 30.2 78 L22.5 82 L17 76.5 L21 69 C18.5 66 16.5 62.7 15 59 L7 57 Z"
            fill="url(#greenGearGrad)"
          />

          {/* Inner White Center Circle */}
          <circle cx="50" cy="50" r="28" fill="#FFFFFF" stroke="#0F2B6E" strokeWidth="1.5" />

          {/* Wrench Icon on Blue Left Side */}
          <g transform="translate(14, 42) rotate(-35) scale(0.65)">
            <path
              d="M3 6 A3 3 0 0 1 7 2 L8 5 L6 6 L7 8 L4 9 Z M7 8 L16 17 L14 19 L5 10 Z"
              fill="#FFFFFF"
            />
          </g>

          {/* Battery Icon on Right Side */}
          <g transform="translate(76, 44) scale(0.55)">
            <rect x="0" y="2" width="16" height="11" rx="1.5" fill="#FFFFFF" />
            <rect x="2" y="0" width="3" height="2" fill="#FFFFFF" />
            <rect x="11" y="0" width="3" height="2" fill="#FFFFFF" />
            {/* + and - signs */}
            <path d="M3 7.5 H5 M4 6.5 V8.5" stroke="#0B2B82" strokeWidth="0.8" />
            <path d="M11 7.5 H13" stroke="#0B2B82" strokeWidth="0.8" />
          </g>

          {/* "BUTUAN" Text */}
          <text
            x="50"
            y="43"
            textAnchor="middle"
            fill="#0284C7"
            stroke="#0369A1"
            strokeWidth="0.6"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="800"
            fontSize="10"
            letterSpacing="0.8"
          >
            BUTUAN
          </text>

          {/* "EV" Text in large bold green */}
          <text
            x="50"
            y="65"
            textAnchor="middle"
            fill="#48BB78"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="21"
            letterSpacing="-0.5"
          >
            EV
          </text>

          <defs>
            <linearGradient id="blueGearGrad" x1="10" y1="10" x2="90" y2="50" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0B2B82" />
              <stop offset="1" stopColor="#1E40AF" />
            </linearGradient>
            <linearGradient id="greenGearGrad" x1="10" y1="50" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#15803D" />
              <stop offset="1" stopColor="#48BB78" />
            </linearGradient>
          </defs>
        </svg>
      )}
    </div>
  );
};
