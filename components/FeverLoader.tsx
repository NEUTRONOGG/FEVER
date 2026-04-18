export default function FeverLoader() {
  return (
    <div className="fever-loader-container">
      <div className="fever-loader">
        <svg width={100} height={100} viewBox="0 0 100 100">
          <defs>
            <mask id="clipping">
              <polygon points="0,0 100,0 100,100 0,100" fill="black" />
              <polygon points="25,25 75,25 50,75" fill="white" />
              <polygon points="50,25 75,75 25,75" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
            </mask>
          </defs>
        </svg>
        <div className="box" />
      </div>

      <style jsx>{`
        .fever-loader-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          flex-shrink: 0;
        }

        .fever-loader {
          --color-one: #EAB308;
          --color-two: #D97706;
          --color-three: #EAB30880;
          --color-four: #D9770680;
          --color-five: #EAB30840;
          --time-animation: 2s;
          position: relative;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          box-shadow:
            0 0 25px 0 var(--color-three),
            0 20px 50px 0 var(--color-four);
          animation: colorize calc(var(--time-animation) * 3) ease-in-out infinite;
        }

        .fever-loader::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border-top: solid 1px var(--color-one);
          border-bottom: solid 1px var(--color-two);
          background: linear-gradient(180deg, var(--color-five), var(--color-four));
          box-shadow:
            inset 0 6px 6px 0 var(--color-three),
            inset 0 -6px 6px 0 var(--color-four);
        }

        .fever-loader .box {
          width: 60px;
          height: 60px;
          background: linear-gradient(
            180deg,
            var(--color-one) 30%,
            var(--color-two) 70%
          );
          mask: url(#clipping);
          -webkit-mask: url(#clipping);
        }

        .fever-loader svg {
          position: absolute;
          width: 60px;
          height: 60px;
        }

        .fever-loader svg #clipping {
          filter: contrast(15);
          animation: roundness calc(var(--time-animation) / 2) linear infinite;
        }

        .fever-loader svg #clipping polygon {
          filter: blur(7px);
        }

        .fever-loader svg #clipping polygon:nth-child(1) {
          transform-origin: 75% 25%;
          transform: rotate(90deg);
        }

        .fever-loader svg #clipping polygon:nth-child(2) {
          transform-origin: 50% 50%;
          animation: rotation var(--time-animation) linear infinite reverse;
        }

        .fever-loader svg #clipping polygon:nth-child(3) {
          transform-origin: 50% 60%;
          animation: rotation var(--time-animation) linear infinite;
          animation-delay: calc(var(--time-animation) / -3);
        }

        .fever-loader svg #clipping polygon:nth-child(4) {
          transform-origin: 40% 40%;
          animation: rotation var(--time-animation) linear infinite reverse;
        }

        .fever-loader svg #clipping polygon:nth-child(5) {
          transform-origin: 40% 40%;
          animation: rotation var(--time-animation) linear infinite reverse;
          animation-delay: calc(var(--time-animation) / -2);
        }

        .fever-loader svg #clipping polygon:nth-child(6) {
          transform-origin: 60% 40%;
          animation: rotation var(--time-animation) linear infinite;
        }

        .fever-loader svg #clipping polygon:nth-child(7) {
          transform-origin: 60% 40%;
          animation: rotation var(--time-animation) linear infinite;
          animation-delay: calc(var(--time-animation) / -1.5);
        }

        @keyframes rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes roundness {
          0% { filter: contrast(15); }
          20% { filter: contrast(3); }
          40% { filter: contrast(3); }
          60% { filter: contrast(15); }
          100% { filter: contrast(15); }
        }

        @keyframes colorize {
          0% { filter: hue-rotate(0deg); }
          20% { filter: hue-rotate(-30deg); }
          40% { filter: hue-rotate(-60deg); }
          60% { filter: hue-rotate(-90deg); }
          80% { filter: hue-rotate(-45deg); }
          100% { filter: hue-rotate(0deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .fever-loader-container {
            width: 50px;
            height: 50px;
          }

          .fever-loader {
            width: 50px;
            height: 50px;
          }

          .fever-loader::before {
            width: 50px;
            height: 50px;
          }

          .fever-loader .box {
            width: 50px;
            height: 50px;
          }

          .fever-loader svg {
            width: 50px;
            height: 50px;
          }
        }

        @media (max-width: 480px) {
          .fever-loader-container {
            width: 40px;
            height: 40px;
          }

          .fever-loader {
            width: 40px;
            height: 40px;
          }

          .fever-loader::before {
            width: 40px;
            height: 40px;
          }

          .fever-loader .box {
            width: 40px;
            height: 40px;
          }

          .fever-loader svg {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </div>
  )
}
