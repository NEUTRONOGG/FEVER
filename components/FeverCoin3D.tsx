"use client"

export default function FeverCoin3D() {
  return (
    <div className="fixed top-20 right-8 z-10 pointer-events-none">
      <style jsx>{`
        .coin-3d {
          font-size: 120px;
          width: 0.1em;
          height: 1em;
          background: linear-gradient(#faa504, #f97316);
          margin: auto;
          animation: rotate3d 7s infinite linear;
          transform-style: preserve-3d;
        }

        .coin-3d .side,
        .coin-3d:before,
        .coin-3d:after {
          content: "";
          position: absolute;
          width: 1em;
          height: 1em;
          overflow: hidden;
          border-radius: 50%;
          right: -0.4em;
          text-align: center;
          line-height: 1;
          transform: rotateY(-90deg);
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #f97316 100%);
          box-shadow: 0 0 30px rgba(251, 191, 36, 0.5);
        }

        .coin-3d .tails,
        .coin-3d:after {
          left: -0.4em;
          transform: rotateY(90deg);
        }

        .coin-3d:before,
        .coin-3d:after {
          background: linear-gradient(#faa504, #f97316);
          backface-visibility: hidden;
          transform: rotateY(90deg);
        }

        .coin-3d:after {
          transform: rotateY(-90deg);
        }

        @keyframes rotate3d {
          100% {
            transform: rotateY(360deg);
          }
        }

        .coin-text {
          font-family: 'Arial Black', sans-serif;
          font-size: 0.5em;
          font-weight: 900;
          fill: #1e293b;
          text-anchor: middle;
        }
      `}</style>

      <div className="coin-3d">
        <div className="side heads">
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <circle cx="50" cy="50" r="48" fill="url(#goldGradient)" stroke="#f97316" strokeWidth="2"/>
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24"/>
                <stop offset="50%" stopColor="#f59e0b"/>
                <stop offset="100%" stopColor="#f97316"/>
              </linearGradient>
            </defs>
            <text x="50" y="45" textAnchor="middle" dominantBaseline="middle" fill="#1e293b" fontSize="18" fontWeight="900" fontFamily="Arial Black, sans-serif">FEVER</text>
            <text x="50" y="65" textAnchor="middle" dominantBaseline="middle" fill="#1e293b" fontSize="18" fontWeight="900" fontFamily="Arial Black, sans-serif">COINS</text>
            <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.3"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="#fbbf24" strokeWidth="0.5" opacity="0.5"/>
          </svg>
        </div>
        <div className="side tails">
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <circle cx="50" cy="50" r="48" fill="url(#goldGradient2)" stroke="#f97316" strokeWidth="2"/>
            <defs>
              <linearGradient id="goldGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24"/>
                <stop offset="50%" stopColor="#f59e0b"/>
                <stop offset="100%" stopColor="#f97316"/>
              </linearGradient>
            </defs>
            <text x="50" y="55" textAnchor="middle" dominantBaseline="middle" fill="#1e293b" fontSize="16" fontWeight="900" fontFamily="Arial Black, sans-serif">FEVER</text>
            <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.3"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="#fbbf24" strokeWidth="0.5" opacity="0.5"/>
          </svg>
        </div>
      </div>
    </div>
  )
}
