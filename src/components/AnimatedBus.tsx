import { motion } from 'framer-motion';

export function AnimatedBus() {
  return (
    <div className="absolute bottom-20 left-0 w-full overflow-hidden pointer-events-none">
      <motion.div
        className="animate-bus"
        initial={{ x: '-100%' }}
        animate={{ x: 'calc(100vw + 100%)' }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <svg
          width="120"
          height="60"
          viewBox="0 0 120 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_15px_rgba(0,224,255,0.5)]"
        >
          {/* Bus body */}
          <rect x="5" y="15" width="110" height="35" rx="5" fill="url(#busGradient)" />
          
          {/* Windows */}
          <rect x="12" y="20" width="15" height="15" rx="2" fill="rgba(0, 224, 255, 0.3)" />
          <rect x="32" y="20" width="15" height="15" rx="2" fill="rgba(0, 224, 255, 0.3)" />
          <rect x="52" y="20" width="15" height="15" rx="2" fill="rgba(0, 224, 255, 0.3)" />
          <rect x="72" y="20" width="15" height="15" rx="2" fill="rgba(0, 224, 255, 0.3)" />
          <rect x="92" y="20" width="15" height="15" rx="2" fill="rgba(0, 224, 255, 0.3)" />
          
          {/* Door */}
          <rect x="30" y="35" width="12" height="15" rx="1" fill="rgba(0, 224, 255, 0.2)" />
          
          {/* Wheels */}
          <circle cx="25" cy="50" r="8" fill="#1a1a2e" stroke="hsl(187, 100%, 50%)" strokeWidth="2" />
          <circle cx="95" cy="50" r="8" fill="#1a1a2e" stroke="hsl(187, 100%, 50%)" strokeWidth="2" />
          
          {/* Wheel details */}
          <circle cx="25" cy="50" r="3" fill="hsl(187, 100%, 50%)" />
          <circle cx="95" cy="50" r="3" fill="hsl(187, 100%, 50%)" />
          
          {/* Headlights */}
          <rect x="108" y="30" width="6" height="8" rx="1" fill="hsl(187, 100%, 50%)" />
          
          {/* Chennai Transport branding */}
          <text x="60" y="45" textAnchor="middle" fill="hsl(187, 100%, 50%)" fontSize="8" fontWeight="bold">
            MTC
          </text>
          
          <defs>
            <linearGradient id="busGradient" x1="5" y1="15" x2="5" y2="50" gradientUnits="userSpaceOnUse">
              <stop stopColor="hsl(217, 50%, 20%)" />
              <stop offset="1" stopColor="hsl(222, 47%, 10%)" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}
