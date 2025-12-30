import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-gray-900">
      {/* Nav matching landing page exactly */}
      <nav className="h-16 px-6 flex items-center border-b border-gray-200/50">
        <Link href="/" className="flex items-center gap-0.5 hover:opacity-90 transition-opacity">
          <span className="font-bold text-xl text-violet-600">Mesh</span>
          <span className="font-bold text-xl text-gray-900">flow</span>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}
