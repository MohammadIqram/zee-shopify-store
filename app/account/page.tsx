import { cookies } from 'next/headers';
import Navbar from '@/components/Navbar';
import AccountAuth from '@/components/AccountAuth';
import AccountDashboardIntegrated from '@/components/AccountDashboardIntegrated';
import { getNavigationQuery } from '@/lib/queries';
import { customerSessionCookie, getCustomerAccount } from '@/lib/customer-session';
import { shopifyFetch } from '@/lib/shopify';

interface NavigationData {
  categoriesMenu?: { id: string; title: string; items: any[] } | null;
  mainMenu?: { id: string; title: string; items: any[] } | null;
  collections: { edges: { node: { id: string; title: string; handle: string } }[] };
}

export default async function AccountPage() {
  const [{ data }, cookieStore, customerAccount] = await Promise.all([
    shopifyFetch<NavigationData>({ query: getNavigationQuery }),
    cookies(),
    getCustomerAccount(),
  ]);
  const categories = data?.collections?.edges.map(({ node }) => node) || [];
  const menuItems = data?.categoriesMenu?.items || data?.mainMenu?.items || [];
  const isLoggedIn = Boolean(cookieStore.get(customerSessionCookie)?.value);
  const customerName = customerAccount ? [customerAccount.firstName, customerAccount.lastName].filter(Boolean).join(' ') || null : null;

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900">
      <Navbar categories={categories} menuItems={menuItems} customerName={customerName} />
      <main className="mx-auto flex w-full max-w-7xl justify-center px-6 py-16 max-md:px-4 max-md:py-10">
        {isLoggedIn && customerAccount ? <AccountDashboardIntegrated account={customerAccount} /> : <AccountAuth />}
      </main>
    </div>
  );
}
