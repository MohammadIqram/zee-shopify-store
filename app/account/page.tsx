import { cookies } from 'next/headers';
import Navbar from '@/components/Navbar';
import AccountAuth from '@/components/AccountAuth';
import AccountDashboard from '@/components/AccountDashboard';
import { getNavigationQuery } from '@/lib/queries';
import { customerSessionCookie, getCustomerProfile, getCustomerName } from '@/lib/customer-session';
import { shopifyFetch } from '@/lib/shopify';

interface NavigationData {
  collections: { edges: { node: { id: string; title: string; handle: string } }[] };
}

export default async function AccountPage() {
  const [{ data }, cookieStore, customerName, customerProfile] = await Promise.all([
    shopifyFetch<NavigationData>({ query: getNavigationQuery }),
    cookies(),
    getCustomerName(),
    getCustomerProfile(),
  ]);
  const categories = data?.collections?.edges.map(({ node }) => node) || [];
  const isLoggedIn = Boolean(cookieStore.get(customerSessionCookie)?.value);

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900">
      <Navbar categories={categories} customerName={customerName} />
      <main className="mx-auto flex w-full max-w-7xl justify-center px-6 py-16 max-md:px-4 max-md:py-10">
        {isLoggedIn ? <AccountDashboard profile={customerProfile} /> : <AccountAuth />}
      </main>
    </div>
  );
}
