'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';

interface NewArrivalProduct {
  id: string;
  title: string;
  handle: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  compareAtPriceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  variants: { edges: { node: ProductVariant }[] };
  images: { edges: { node: { url: string; altText?: string | null } }[] };
}

interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
}

const formatPrice = (amount: string, currencyCode: string) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: currencyCode,
  maximumFractionDigits: 2,
}).format(Number(amount));

export default function NewArrivalProducts({ products }: { products: NewArrivalProduct[] }) {
  return <section className="bg-[#F5F2E9] px-6 py-14 max-md:px-4 max-md:py-10" aria-labelledby="new-arrivals-title">
    <div className="mx-auto max-w-7xl">
      <div className="mb-7 flex items-center justify-between gap-4">
        <h2 id="new-arrivals-title" className="m-0 text-[24px] font-bold text-[#183D2B]">New Arrivals</h2>
        <Link className="text-sm font-semibold text-[#3F6B45] no-underline hover:text-[#183D2B] hover:underline" href="/collections/new-arrivals">View all</Link>
      </div>
      <div className="grid grid-cols-4 border border-[#E7DFCF] max-lg:grid-cols-2 max-md:grid-cols-1 bg-white">
        {products.map((product) => <NewArrivalCard key={product.id} product={product} />)}
      </div>
      {products.length === 0 && <p className="border border-[#E7DFCF] p-10 text-center text-sm text-[#202722]">No new arrivals are available right now.</p>}
    </div>
  </section>;
}

function NewArrivalCard({ product }: { product: NewArrivalProduct }) {
  const { addItem } = useCart();
  const image = product.images.edges[0]?.node;
  const variants = product.variants.edges.map(({ node }) => node);
  const variant = variants[0];
  const price = variant?.price || product.priceRange.minVariantPrice;
  const compareAt = variant?.compareAtPrice || product.compareAtPriceRange.minVariantPrice;
  const discount = Number(compareAt.amount) > Number(price.amount)
    ? Math.round((1 - Number(price.amount) / Number(compareAt.amount)) * 100)
    : 0;
  const canAdd = Boolean(variant?.availableForSale && variants.length === 1);

  return <article className="relative flex min-w-0 flex-col border-r border-[#E7DFCF] p-5 last:border-r-0 max-lg:nth-[2n]:border-r-0 max-md:border-r-0 max-md:border-b max-md:last:border-b-0">
    {discount > 0 && <span className="absolute left-0 top-3 z-10 bg-[#183D2B] px-3 py-1 text-xs font-bold text-[#F5F2E9]">Save {discount}%</span>}
    <Link className="group block no-underline" href={`/products/${product.handle}`}>
      <div className="relative aspect-square overflow-hidden rounded-br-2xl rounded-tr-2xl bg-white">
        {image && <Image className="object-contain transition-transform duration-300 group-hover:scale-105" src={image.url} alt={image.altText || product.title} fill sizes="(max-width: 768px) 90vw, 25vw" />}
      </div>
      <h3 className="mt-6 min-h-10 text-sm font-bold leading-relaxed text-[#202722] group-hover:text-[#183D2B] transition-colors">{product.title}</h3>
    </Link>
    <div className="mt-3 flex items-baseline gap-3">
      <span className="text-xl font-semibold text-[#183D2B]">{variants.length > 1 ? 'From ' : ''}{formatPrice(price.amount, price.currencyCode)}</span>
      {discount > 0 && <del className="text-sm text-[#6B4A32]">{formatPrice(compareAt.amount, compareAt.currencyCode)}</del>}
    </div>
    <div className="mt-4 text-[#B59A5A]" aria-label="No reviews yet"><span className="tracking-wide">★★★★★</span> <small className="ml-2 text-xs text-gray-500">No reviews</small></div>
    <button
      className="mt-7 h-12 w-full cursor-pointer border-0 bg-[#183D2B] text-sm font-bold text-[#B59A5A] transition-colors hover:bg-[#3F6B45] disabled:cursor-not-allowed disabled:opacity-60"
      type="button"
      disabled={!variant?.availableForSale}
      onClick={() => {
        if (!variant) return;
        if (!canAdd) { window.location.href = `/products/${product.handle}`; return; }
        addItem({
          variantId: variant.id,
          productId: product.id,
          title: product.title,
          variantTitle: variant.title,
          price: price.amount,
          currencyCode: price.currencyCode,
          imageUrl: image?.url,
          imageAlt: image?.altText || product.title,
          compareAtPrice: compareAt.amount,
        });
      }}
    >
      {variant?.availableForSale === false ? 'Sold out' : canAdd ? 'Add to cart' : 'Choose options'}
    </button>
  </article>;
}