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
  collections: { edges: { node: { id: string; title: string; handle: string; image?: { url: string; altText?: string | null } | null } }[] };
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
      <Navbar categories={categories} customerName={customerName} />

      <main className="pb-16">
        <ProductDetailClient product={product} recommendations={recommendations} />
      </main>
    </div>
  );
}
