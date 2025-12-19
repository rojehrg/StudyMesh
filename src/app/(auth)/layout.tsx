import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Force light mode on auth pages with explicit light colors
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] text-[#1a1a2e]">
      <nav className="p-6">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <span className="text-[#2563eb] font-bold text-xl">Mesh</span>
          <span className="text-[#1a1a2e] font-bold text-xl">flow</span>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="[&_*]:!text-inherit [&_.bg-background]:!bg-white [&_.bg-card]:!bg-white [&_.text-muted-foreground]:!text-gray-500 [&_.text-foreground]:!text-gray-900 [&_.border-border]:!border-gray-200 [&_.bg-muted]:!bg-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}

