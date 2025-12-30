import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Force light mode on auth pages with warm cream/violet theme
    <div
      className="min-h-screen flex flex-col light"
      style={{
        colorScheme: 'light',
        backgroundColor: 'hsl(48 50% 96%)',
        color: 'hsl(260 25% 18%)',
      }}
    >
      <nav className="p-6">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <span style={{ color: 'hsl(262 55% 55%)' }} className="font-bold text-xl">Mesh</span>
          <span style={{ color: 'hsl(260 25% 18%)' }} className="font-bold text-xl">flow</span>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          style={{
            '--background': '48 40% 99%',
            '--foreground': '260 25% 18%',
            '--card': '48 40% 99%',
            '--card-foreground': '260 25% 18%',
            '--primary': '262 55% 55%',
            '--primary-foreground': '0 0% 100%',
            '--muted': '48 20% 92%',
            '--muted-foreground': '260 10% 45%',
            '--border': '48 20% 90%',
            '--input': '48 20% 90%',
            '--accent': '262 45% 92%',
            '--accent-foreground': '262 55% 40%',
          } as React.CSSProperties}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

