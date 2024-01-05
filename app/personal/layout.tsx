import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function PersonalLayout({ children }: { children: any }) {
  const session = await getServerSession()

  if (!session?.user) return redirect('/api/auth/signin')

  return children
}
