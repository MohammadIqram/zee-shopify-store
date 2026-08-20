import Link from 'next/link';
import { cookies } from 'next/headers';
import Navbar from '@/components/Navbar';
import AccountAuth from '@/components/AccountAuth';
import { getNavigationQuery } from '@/lib/queries';
import { customerSessionCookie } from '@/lib/customer-session';
import { shopifyFetch } from '@/lib/shopify';

interface NavigationData {
  collections: { edges: { node: { id: string; title: string; handle: string } }[] };
}

export default async function AccountPage() {
  const [{ data }, cookieStore] = await Promise.all([
    shopifyFetch<NavigationData>({ query: getNavigationQuery }),
    cookies(),
  ]);
  const categories = data?.collections?.edges.map(({ node }) => node) || [];
  const isLoggedIn = Boolean(cookieStore.get(customerSessionCookie)?.value);

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900">
      <Navbar categories={categories} />
      <main className="mx-auto flex w-full max-w-7xl justify-center px-6 py-16 max-md:px-4 max-md:py-10">
        {isLoggedIn ? (
          <section className="w-full max-w-[520px] border border-[#dedede] bg-white px-8 py-10 text-center max-md:px-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#195f3d]">My account</p>
            <h1 className="m-0 text-[30px] font-bold italic text-[#172b3d]">You are signed in</h1>
            <p className="mt-3 text-sm text-gray-600">Your Shopify customer account is connected.</p>
            <Link className="mt-7 inline-block bg-[#195f3d] px-8 py-3 text-sm font-bold text-[#f5c400] no-underline" href="/">Continue shopping</Link>
          </section>
        ) : <AccountAuth />}
      </main>
    </div>
  );
}
