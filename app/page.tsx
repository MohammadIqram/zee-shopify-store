import { shopifyFetch } from '@/lib/shopify';
import { getBestSellerProductsQuery, getNavigationQuery, getNewArrivalProductsQuery } from '@/lib/queries';
import Navbar from '@/components/Navbar';
import CategoryList from '@/components/CategoryList';
import { getCustomerName } from '@/lib/customer-session';
import Hero from '@/components/Hero';
import ShopByCategory from '@/components/ShopByCategory';
import BestSellerProducts from '@/components/BestSellerProducts';
import NewArrivalProducts from '@/components/NewArrivalProducts';

interface NavigationData {
  categoriesMenu?: { id: string; title: string; items: any[] } | null;
  mainMenu?: { id: string; title: string; items: any[] } | null;
  collections: { edges: { node: { id: string; title: string; handle: string; image?: { url: string; altText?: string | null } | null } }[] };
}

export default async function HomePage() {
  const [{ data: bestSellers }, { data: newArrivals }, { data: navigation }] = await Promise.all([
    shopifyFetch<{ products: { edges: { node: React.ComponentProps<typeof BestSellerProducts>['products'][number] }[] } }>({ query: getBestSellerProductsQuery }),
    shopifyFetch<{ products: { edges: { node: React.ComponentProps<typeof NewArrivalProducts>['products'][number] }[] } }>({ query: getNewArrivalProductsQuery }),
    shopifyFetch<NavigationData>({ query: getNavigationQuery }),
  ]);
  const customerName = await getCustomerName();

  const categories = navigation?.collections?.edges.map(({ node }) => node) || [];
  const menuItems = navigation?.categoriesMenu?.items || navigation?.mainMenu?.items || [];

  return (
    <>
      <Navbar categories={categories} menuItems={menuItems} customerName={customerName} />
      <CategoryList categories={categories} />
      <Hero />
      <ShopByCategory categories={categories} />
      <BestSellerProducts products={bestSellers?.products?.edges.map(({ node }) => node) || []} />
      <NewArrivalProducts products={newArrivals?.products?.edges.map(({ node }) => node) || []} />
    </>
  );
}