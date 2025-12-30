import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Force light mode on auth pages with clean white theme
    <div
      className="min-h-screen flex flex-col light"
      style={{
        colorScheme: 'light',
        backgroundColor: 'hsl(0 0% 98%)',
        color: 'hsl(240 10% 15%)',
      }}
    >
      <nav className="p-6">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <span style={{ color: 'hsl(262 60% 50%)' }} className="font-bold text-xl">Mesh</span>
          <span style={{ color: 'hsl(240 10% 15%)' }} className="font-bold text-xl">flow</span>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          style={{
            '--background': '0 0% 100%',
            '--foreground': '240 10% 15%',
            '--card': '0 0% 100%',
            '--card-foreground': '240 10% 15%',
            '--primary': '262 60% 50%',
            '--primary-foreground': '0 0% 100%',
            '--muted': '240 5% 94%',
            '--muted-foreground': '240 5% 45%',
            '--border': '240 5% 90%',
            '--input': '240 5% 90%',
            '--accent': '262 50% 95%',
            '--accent-foreground': '262 60% 45%',
          } as React.CSSProperties}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

