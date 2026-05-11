import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { SidebarNav } from '@/components/sidebar-nav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarNav user={session.user} />
      <main className="flex-1 md:ml-64 p-6">{children}</main>
    </div>
  )
}
