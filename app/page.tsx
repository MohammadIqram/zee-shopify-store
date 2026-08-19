import { shopifyFetch } from '@/lib/shopify';
import { getNavigationQuery, getProductsQuery } from '@/lib/queries';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import CategoryList from '@/components/CategoryList';

interface ProductNode {
  id: string;
  title: string;
  handle: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: {
      node: {
        url: string;
        altText: string;
      };
    }[];
  };
}

interface NavigationData {
  collections: { edges: { node: { id: string; title: string; handle: string; image?: { url: string; altText?: string | null } | null } }[] };
}

export default async function HomePage() {
  const [{ data }, { data: navigation }] = await Promise.all([
    shopifyFetch<{ products: { edges: { node: ProductNode }[] } }>({ query: getProductsQuery }),
    shopifyFetch<NavigationData>({ query: getNavigationQuery }),
  ]);

  const products = data?.products?.edges || [];
  const categories = navigation?.collections?.edges.map(({ node }) => node) || [];

  return (
    <>
      <Navbar categories={categories} />
      <CategoryList categories={categories} />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Products from Shopify</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map(({ node }: { node: ProductNode }) => {
          const image = node.images.edges[0]?.node;
          const price = node.priceRange.minVariantPrice;

          return (
            <div key={node.id} className="border rounded-lg p-4 shadow-sm flex flex-col">
              {image && (
                <div className="relative w-full h-64 mb-4 bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={image.url}
                    alt={image.altText || node.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <h2 className="font-semibold text-lg mb-2">{node.title}</h2>
              <p className="text-gray-600 mt-auto">
                {price.amount} {price.currencyCode}
              </p>
            </div>
          );
        })}
      </div>
      </main>
    </>
  );
}