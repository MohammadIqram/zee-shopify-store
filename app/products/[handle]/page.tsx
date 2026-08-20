import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CategoryList from '@/components/CategoryList';
import ProductDetailClient, {
  type ProductDetailData,
  type RecommendationProduct
} from '@/components/ProductDetailClient';
import {
  getProductQuery,
  getNavigationQuery,
  getProductRecommendationsQuery,
  getBestSellerProductsQuery
} from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';
import { getCustomerName } from '@/lib/customer-session';

interface NavigationData {
  categoriesMenu?: { id: string; title: string; items: any[] } | null;
  mainMenu?: { id: string; title: string; items: any[] } | null;
  collections: { edges: { node: { id: string; title: string; handle: string; image?: { url: string; altText?: string | null } | null } }[] };
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const res = await shopifyFetch<{ product: ProductDetailData | null }>({
    query: getProductQuery,
    variables: { handle },
  });
  const product = res.data?.product;
  if (!product) return {};

  const image = product.images.edges[0]?.node?.url || 'https://garden-by-zee.vercel.app/images/hero_img_1.png';
  const title = `${product.title} | Garden by Zee`;
  const description = product.description ? product.description.slice(0, 160) : `Buy ${product.title} online at Garden by Zee. Fast delivery across India.`;

  return {
    title: product.title,
    description,
    openGraph: {
      title,
      description,
      url: `https://garden-by-zee.vercel.app/products/${handle}`,
      siteName: 'Garden by Zee',
      images: [{ url: image, alt: product.title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;

  // Fetch product data and navigation in parallel
  const [productRes, navigationRes, customerName] = await Promise.all([
    shopifyFetch<{ product: ProductDetailData | null }>({
      query: getProductQuery,
      variables: { handle },
    }),
    shopifyFetch<NavigationData>({ query: getNavigationQuery }),
    getCustomerName(),
  ]);

  const product = productRes.data?.product;
  if (!product) {
    notFound();
  }

  const categories = navigationRes?.data?.collections?.edges.map(({ node }) => node) || [];
  const menuItems = navigationRes?.data?.categoriesMenu?.items || navigationRes?.data?.mainMenu?.items || [];

  // Fetch recommendations or fallback to general products
  let recommendations: RecommendationProduct[] = [];
  try {
    const recsRes = await shopifyFetch<{ productRecommendations?: RecommendationProduct[] }>({
      query: getProductRecommendationsQuery,
      variables: { productId: product.id },
    });
    recommendations = recsRes.data?.productRecommendations || [];
  } catch (error) {
    console.error('Error fetching product recommendations:', error);
  }

  // If recommendations are empty, use best sellers as a fallback list
  if (!recommendations || recommendations.length === 0) {
    try {
      const fallbackRes = await shopifyFetch<{ products: { edges: { node: RecommendationProduct }[] } }>({
        query: getBestSellerProductsQuery,
      });
      recommendations = fallbackRes.data?.products?.edges.map(({ node }) => node) || [];
    } catch (fallbackError) {
      console.error('Error fetching fallback recommendations:', fallbackError);
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar categories={categories} menuItems={menuItems} customerName={customerName} />

      <main className="pb-16">
        <ProductDetailClient product={product} recommendations={recommendations} />
      </main>
    </div>
  );
}
