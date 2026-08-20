import Navbar from '@/components/Navbar';
import CartPage from '@/components/CartPage';
import { getNavigationQuery } from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';
import { getCustomerName } from '@/lib/customer-session';

interface NavigationData {
  collections: { edges: { node: { id: string; title: string; handle: string } }[] };
}

export default async function CartRoute() {
  const [{ data }, customerName] = await Promise.all([
    shopifyFetch<NavigationData>({ query: getNavigationQuery }),
    getCustomerName(),
  ]);
  const categories = data?.collections?.edges.map(({ node }) => node) || [];

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900">
      <Navbar categories={categories} customerName={customerName} />
      <CartPage />
    </div>
  );
}
