import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="p-6">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <span className="text-teal-600 font-bold text-xl">Mesh</span>
          <span className="text-gray-900 font-bold text-xl">flow</span>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}

