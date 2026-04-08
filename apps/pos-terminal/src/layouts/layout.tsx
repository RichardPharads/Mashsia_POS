import { SidebarProvider } from "@mashsia/ui"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <main>
        {children}
      </main>
    </SidebarProvider>
  )
}