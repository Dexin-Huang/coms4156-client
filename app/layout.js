export const metadata = {
  title: 'RobinTrade',
  description: 'Trading Platform',
}

const s = {
  body: { fontFamily: 'monospace', margin: 0, padding: '20px', background: '#fff' },
  nav: { border: '2px solid #000', padding: '20px', marginBottom: '20px', display: 'flex', gap: '20px' },
  link: { color: '#000', textDecoration: 'none', fontWeight: 'bold', fontSize: '18px' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={s.body}>
        <nav style={s.nav}>
          <a href="/" style={s.link}>TRADE</a>
          <a href="/portfolio" style={s.link}>PORTFOLIO</a>
          <a href="/logs" style={s.link}>LOGS</a>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
