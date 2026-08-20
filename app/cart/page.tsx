import Navbar from '@/components/Navbar';
import CartPage from '@/components/CartPage';
import { getNavigationQuery } from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';

interface NavigationData {
  collections: { edges: { node: { id: string; title: string; handle: string } }[] };
}

export default async function CartRoute() {
  const { data } = await shopifyFetch<NavigationData>({ query: getNavigationQuery });
  const categories = data?.collections?.edges.map(({ node }) => node) || [];

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900">
      <Navbar categories={categories} />
      <CartPage />
    </div>
  );
}
