import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CategoryList from '@/components/CategoryList';
import CollectionBrowser, { type CollectionFilter, type CollectionProduct } from '@/components/CollectionBrowser';
import { getCollectionQuery, getNavigationQuery } from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';

interface CollectionData {
  collection: {
    id: string;
    title: string;
    description: string;
    products: { edges: { node: CollectionProduct }[]; filters: CollectionFilter[] };
  } | null;
}

interface NavigationData {
  collections: { edges: { node: { id: string; title: string; handle: string; image?: { url: string; altText?: string | null } | null } }[] };
}

export default async function CollectionPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const [{ data: collectionData }, { data: navigation }] = await Promise.all([
    shopifyFetch<CollectionData>({ query: getCollectionQuery, variables: { handle } }),
    shopifyFetch<NavigationData>({ query: getNavigationQuery }),
  ]);

  if (!collectionData?.collection) notFound();

  const collection = collectionData.collection;
  const categories = navigation?.collections?.edges.map(({ node }) => node) || [];

  return (
    <>
      <Navbar categories={categories} />
      <CategoryList categories={categories} />
      <main className="collection-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>›</span><span>{collection.title}</span></nav>
        <header className="collection-intro">
          <h1>{collection.title}</h1>
          {collection.description && <p>{collection.description}</p>}
        </header>
        <CollectionBrowser products={collection.products.edges.map(({ node }) => node)} filters={collection.products.filters || []} />
      </main>
    </>
  );
}