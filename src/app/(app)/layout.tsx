import { AppSidebar } from "@/components/app-sidebar";
import { AccountHeader } from "@/components/account-header";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AccountHeader />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
