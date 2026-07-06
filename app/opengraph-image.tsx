import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'PlanILHA - Inteligência Estratégica'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif'
        }}
      >
        {/* Glows / Gradients de fundo */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(250,70,22,0.15) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            right: '-10%',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(255,165,0,0.1) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Logo SVG desenhada puramente via código */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
          <svg viewBox="0 0 1024.46 1024.46" width="200" height="200">
            <defs>
              <linearGradient id="brandGradient" x1="159.11" y1="860.69" x2="944.83" y2="74.97" gradientUnits="userSpaceOnUse">
                <stop offset="0.34" stopColor="#fa4616"/>
                <stop offset="0.42" stopColor="#f94d1c"/>
                <stop offset="0.55" stopColor="#f9632d"/>
                <stop offset="0.7" stopColor="#f98749"/>
                <stop offset="0.88" stopColor="#f8b86f"/>
                <stop offset="1" stopColor="#f8e08e"/>
              </linearGradient>
            </defs>
            <circle fill="#1a1a1a" cx="512.23" cy="512.23" r="512.1"/>
            <path fill="url(#brandGradient)" d="M940.26,70.4H96.61v163.54h536.1C137.05,323.12,58.24,549.17,90.49,720.25c32.25,171.08,198.99,273.77,397.1,219.02,198.11-54.75,204.38-245.06,204.38-245.06h42.67v238.12h205.63V70.4ZM459.54,792.86c-273.75-21.78-204.7-407.86,275.1-430.68v103.05c-.01,1.98-2.12,349.34-275.1,327.62Z"/>
          </svg>
        </div>

        {/* Textos */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'white',
              margin: 0,
              lineHeight: 1.1,
              textShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}
          >
            planILHA
          </h1>
          <p
            style={{
              fontSize: 32,
              fontWeight: 400,
              color: '#a1a1aa', // text-muted
              marginTop: '16px',
              letterSpacing: '0.05em'
            }}
          >
            Inteligência de Dados e Social Media
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
