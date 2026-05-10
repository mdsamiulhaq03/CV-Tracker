// Report page has its own sticky action bar — no extra navbar needed
export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex flex-col">{children}</div>;
}
