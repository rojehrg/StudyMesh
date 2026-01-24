import { ImageResponse } from 'next/og'

// Image metadata
export const runtime = 'edge'
export const alt = 'Attunly - Ask for help in Slack without overthinking'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Coffee color palette
const colors = {
  paper: '#fffcf9',
  espresso: '#1a1614',
  oat: '#7a6d62',
}

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.paper,
          padding: '60px',
        }}
      >
        {/* Main content container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            maxWidth: '900px',
          }}
        >
          {/* Logo text */}
          <div
            style={{
              fontSize: 96,
              fontWeight: 600,
              color: colors.espresso,
              fontFamily: 'Georgia, serif',
              letterSpacing: '-2px',
              marginBottom: '24px',
            }}
          >
            Attunly
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 36,
              color: colors.oat,
              fontFamily: 'Georgia, serif',
              lineHeight: 1.4,
              maxWidth: '800px',
            }}
          >
            Ask for help in Slack without overthinking
          </div>

          {/* Divider */}
          <div
            style={{
              width: '120px',
              height: '3px',
              backgroundColor: colors.oat,
              marginTop: '48px',
              marginBottom: '48px',
              borderRadius: '2px',
            }}
          />

          {/* Sub-tagline */}
          <div
            style={{
              fontSize: 24,
              color: colors.oat,
              fontFamily: 'Georgia, serif',
              opacity: 0.8,
            }}
          >
            Type /attunly in Slack. Get a calm draft. Move the work forward.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
