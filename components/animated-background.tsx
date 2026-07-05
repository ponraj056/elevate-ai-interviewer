'use client'

export function AnimatedBackground() {
  return (
    <>
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(30px, -50px) rotate(90deg); }
          50% { transform: translate(-20px, -80px) rotate(180deg); }
          75% { transform: translate(50px, -40px) rotate(270deg); }
        }

        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-40px, 30px) rotate(-90deg); }
          50% { transform: translate(60px, 50px) rotate(-180deg); }
          75% { transform: translate(-30px, 70px) rotate(-270deg); }
        }

        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(50px, 40px) rotate(45deg); }
          50% { transform: translate(-60px, 20px) rotate(135deg); }
          75% { transform: translate(30px, -60px) rotate(225deg); }
        }

        .blob-1 {
          animation: float1 20s ease-in-out infinite;
        }

        .blob-2 {
          animation: float2 25s ease-in-out infinite;
        }

        .blob-3 {
          animation: float3 30s ease-in-out infinite;
        }
      `}</style>

      {/* Blob 1 - Top Left */}
      <div
        className="blob-1 absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgb(46, 125, 50) 0%, rgb(165, 214, 167) 100%)',
        }}
      />

      {/* Blob 2 - Top Right */}
      <div
        className="blob-2 absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-8 pointer-events-none"
        style={{
          background:
            'linear-gradient(45deg, rgb(76, 175, 80) 0%, rgb(197, 225, 165) 100%)',
        }}
      />

      {/* Blob 3 - Bottom Center */}
      <div
        className="blob-3 absolute -bottom-40 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full opacity-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(225deg, rgb(56, 142, 60) 0%, rgb(178, 210, 180) 100%)',
        }}
      />
    </>
  )
}
