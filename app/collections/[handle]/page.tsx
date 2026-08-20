import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CategoryList from '@/components/CategoryList';
import CollectionBrowser, { type CollectionFilter, type CollectionProduct } from '@/components/CollectionBrowser';
import { getCollectionQuery, getNavigationQuery, getBestSellingProductsPageQuery, getNewArrivalsProductsPageQuery } from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';
import { getCustomerName } from '@/lib/customer-session';

interface CollectionData {
  collection: {
    id: string;
    title: string;
    description: string;
    products: { edges: { node: CollectionProduct }[]; filters: CollectionFilter[] };
  } | null;
}

interface NavigationData {
  categoriesMenu?: { id: string; title: string; items: any[] } | null;
  mainMenu?: { id: string; title: string; items: any[] } | null;
  collections: { edges: { node: { id: string; title: string; handle: string; image?: { url: string; altText?: string | null } | null } }[] };
}

export default async function CollectionPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const isBestSelling = handle === 'best-selling-products';
  const isNewArrivals = handle === 'new-arrivals';

  const [collectionRes, navigationRes, customerName] = await Promise.all([
    isBestSelling
      ? shopifyFetch<{ products: { edges: { node: CollectionProduct }[]; filters: CollectionFilter[] } }>({
          query: getBestSellingProductsPageQuery,
        })
      : isNewArrivals
      ? shopifyFetch<{ products: { edges: { node: CollectionProduct }[]; filters: CollectionFilter[] } }>({
          query: getNewArrivalsProductsPageQuery,
        })
      : shopifyFetch<CollectionData>({
          query: getCollectionQuery,
          variables: { handle },
        }),
    shopifyFetch<NavigationData>({ query: getNavigationQuery }),
    getCustomerName(),
  ]);

  let collection;
  if (isBestSelling || isNewArrivals) {
    const customData = collectionRes.data as { products?: { edges: { node: CollectionProduct }[]; filters: CollectionFilter[] } };
    collection = {
      id: handle,
      title: isBestSelling ? 'Best Selling Products' : 'New Arrivals',
      description: isBestSelling
        ? 'Browse our most popular and best-selling products.'
        : 'Check out our latest arrivals and new products.',
      products: {
        edges: customData?.products?.edges || [],
        filters: customData?.products?.filters || [],
      },
    };
  } else {
    const collectionData = collectionRes.data as CollectionData;
    if (!collectionData?.collection) notFound();
    collection = collectionData.collection;
  }

  const categories = navigationRes?.data?.collections?.edges.map(({ node }) => node) || [];
  const menuItems = navigationRes?.data?.categoriesMenu?.items || navigationRes?.data?.mainMenu?.items || [];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar categories={categories} menuItems={menuItems} customerName={customerName} />
      <CategoryList categories={categories} />

      <main className="mx-auto max-w-7xl px-6 py-8 max-md:px-4 max-md:py-5">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-[#183D2B]">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="font-semibold text-gray-800" aria-current="page">
            {collection.title}
          </span>
        </nav>

        {/* Collection Hero Header */}
        <header className="mb-8 border-b border-gray-100 pb-8 max-md:mb-6 max-md:pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 max-md:text-2xl">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 max-md:mt-2 max-md:text-xs">
              {collection.description}
            </p>
          )}
        </header>

        {/* Main Collection Browser Grid */}
        <CollectionBrowser
          products={collection.products.edges.map(({ node }) => node)}
          filters={collection.products.filters || []}
        />
      </main>
    </div>
  );
}