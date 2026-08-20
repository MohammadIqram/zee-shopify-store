'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import {
  Heart,
  Truck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Share2,
  Star,
  ChevronRight
} from 'lucide-react';

export interface ProductDetailVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  selectedOptions: { name: string; value: string }[];
}

export interface ProductDetailData {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  compareAtPriceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  variants: { edges: { node: ProductDetailVariant }[] };
  images: { edges: { node: { url: string; altText?: string | null } }[] };
}

export interface RecommendationProduct {
  id: string;
  title: string;
  handle: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  compareAtPriceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  variants: { edges: { node: { id: string; price: { amount: string; currencyCode: string }; compareAtPrice: { amount: string; currencyCode: string } | null; availableForSale: boolean } }[] };
  images: { edges: { node: { url: string; altText?: string | null } }[] };
}

interface ProductDetailClientProps {
  product: ProductDetailData;
  recommendations: RecommendationProduct[];
}

const formatPrice = (amount: string, currencyCode: string) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(Number(amount));
};

export default function ProductDetailClient({ product, recommendations }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const images = product.images.edges.map(({ node }) => node);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const variants = product.variants.edges.map(({ node }) => node);

  // Variant options state
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    return Object.fromEntries(
      variants[0]?.selectedOptions.map((option) => [option.name, option.value]) || []
    );
  });

  const optionGroups = variants[0]?.selectedOptions.reduce<Record<string, string[]>>((groups, option) => {
    groups[option.name] = [
      ...new Set(
        variants
          .map((v) => v.selectedOptions.find((o) => o.name === option.name)?.value)
          .filter((val): val is string => Boolean(val))
      ),
    ];
    return groups;
  }, {}) || {};

  const selectedVariant = variants.find((v) =>
    v.selectedOptions.every((o) => selectedOptions[o.name] === o.value)
  ) || variants[0];

  const price = selectedVariant?.price || product.priceRange.minVariantPrice;
  const compareAt = selectedVariant?.compareAtPrice || product.compareAtPriceRange.minVariantPrice;
  const hasDiscount = Number(compareAt.amount) > Number(price.amount);
  const discount = hasDiscount ? Math.round((1 - Number(price.amount) / Number(compareAt.amount)) * 100) : 0;

  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [dimensionsOpen, setDimensionsOpen] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);

  const activeImage = images[activeImageIndex] || images[0];

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pincode)) {
      setPincodeStatus('success');
    } else {
      setPincodeStatus('error');
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      title: product.title,
      variantTitle: selectedVariant.title,
      price: price.amount,
      currencyCode: price.currencyCode,
      imageUrl: activeImage?.url,
      imageAlt: activeImage?.altText || product.title,
      compareAtPrice: compareAt.amount,
    }, quantity);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = '/cart';
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 max-md:px-4 max-md:py-5">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-gray-500" aria-label="Breadcrumb">
        <Link href="/" className="transition-colors hover:text-[#195f3d]">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-400" />
        <Link href="/collections/all" className="transition-colors hover:text-[#195f3d]">
          All products
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-400" />
        <span className="font-semibold text-gray-800" aria-current="page">
          {product.title}
        </span>
      </nav>

      {/* Main product area */}
      <div className="grid grid-cols-[1.1fr_0.9fr] gap-12 max-lg:grid-cols-1 max-lg:gap-8">
        {/* Left Column: Image Gallery & Accordions */}
        <div className="flex flex-col gap-6">
          <div className="flex gap-4 max-md:flex-col-reverse">
            {/* Vertical thumbnails */}
            <div className="flex w-[80px] flex-col gap-3 max-md:w-full max-md:flex-row max-md:overflow-x-auto max-md:pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`relative aspect-square w-[80px] flex-shrink-0 cursor-pointer overflow-hidden border bg-white p-1 transition-all ${idx === activeImageIndex ? 'border-2 border-[#195f3d]' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <Image
                    className="object-contain"
                    src={img.url}
                    alt={img.altText || `${product.title} thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                  />
                </button>
              ))}
            </div>

            {/* Main Image View */}
            <div className="relative aspect-square flex-1 overflow-hidden border border-gray-100 bg-[#fafafa]">
              {activeImage && (
                <div className="relative h-full w-full group">
                  <Image
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    src={activeImage.url}
                    alt={activeImage.altText || product.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
              {hasDiscount && (
                <span className="absolute left-4 top-4 bg-[#195f3d] px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                  Save {discount}%
                </span>
              )}
            </div>
          </div>
          <p className="text-center text-xs text-gray-500">⌕ Roll over image to zoom in</p>

          {/* Collapsible Accordions & Description */}
          <div className="mt-4 flex flex-col gap-4">
            {/* Dimensions */}
            <div className="border border-gray-200 bg-white">
              <button
                className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-gray-800 transition-colors hover:bg-gray-50"
                onClick={() => setDimensionsOpen(!dimensionsOpen)}
              >
                <span>Product Dimension(s)</span>
                {dimensionsOpen ? <Minus className="h-4 w-4 text-gray-500" /> : <Plus className="h-4 w-4 text-gray-500" />}
              </button>
              {dimensionsOpen && (
                <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-600 leading-relaxed">
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Overall Height:</strong> 6 inches to 8 inches</li>
                    <li><strong>Pot Diameter:</strong> 4 inches</li>
                    <li><strong>Pot Height:</strong> 3.5 inches</li>
                    <li><strong>Plant Spread:</strong> 5 to 7 inches</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="border border-gray-200 bg-white">
              <button
                className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-gray-800 transition-colors hover:bg-gray-50"
                onClick={() => setSpecsOpen(!specsOpen)}
              >
                <span>Product Specification(s)</span>
                {specsOpen ? <Minus className="h-4 w-4 text-gray-500" /> : <Plus className="h-4 w-4 text-gray-500" />}
              </button>
              {specsOpen && (
                <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-600 leading-relaxed">
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Plant Type:</strong> Foliage / Good Luck Plant</li>
                    <li><strong>Watering Needs:</strong> Change water weekly (keep roots submerged)</li>
                    <li><strong>Light Requirements:</strong> Bright indirect sunlight or indoor ambient light</li>
                    <li><strong>Ideal Placement:</strong> Living rooms, office desks, study tables</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-lg font-bold text-gray-800">Description</h3>
              <div
                className="prose prose-sm max-w-none text-sm text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="flex flex-col gap-6">
          <div>
            <a href="#guarantee" className="text-xs font-semibold text-gray-700 underline transition-colors hover:text-[#195f3d]">
              30-Day Money-Back Plant Guarantee
            </a>
            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              Plants may arrive stressed after long transit, but proper watering can help them recover. Live plants are non-refundable, but if they do not recover from transit stress despite proper care, eligible claims are refundable under our Money-Back Guarantee.
            </p>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 max-md:text-2xl">
              {product.title}
            </h1>
            {hasDiscount && (
              <span className="mt-2 inline-block bg-[#195f3d] px-2 py-0.5 text-xs font-bold text-white">
                Save {discount}%
              </span>
            )}
            <div className="mt-3 flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-1.5 text-sm text-amber-500">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-gray-500">(20 reviews)</span>
              </div>

              {/* Share Icons */}
              <div className="flex gap-2">
                <button aria-label="Share on Facebook" className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-400 hover:text-blue-600">
                  <span className="text-xs font-bold font-serif">f</span>
                </button>
                <button aria-label="Share on Pinterest" className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-400 hover:text-red-600">
                  <span className="text-xs font-bold">p</span>
                </button>
                <button aria-label="Share on Twitter" className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-400 hover:text-black">
                  <span className="text-xs font-bold">𝕏</span>
                </button>
                <button aria-label="Share via Email" className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-400 hover:text-[#195f3d]">
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Options Selectors */}
          {Object.entries(optionGroups).map(([name, values]) => (
            <div key={name} className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-700">
                {name}: <span className="font-normal text-gray-600">{selectedOptions[name]}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {values.map((val) => (
                  <button
                    key={val}
                    className={`min-h-[40px] border px-4 text-xs font-medium transition-all ${selectedOptions[name] === val
                        ? 'border-2 border-[#195f3d] bg-white text-[#195f3d]'
                        : 'border-gray-200 bg-transparent text-gray-700 hover:border-gray-400'
                      }`}
                    onClick={() => {
                      setSelectedOptions((prev) => ({ ...prev, [name]: val }));
                    }}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Pricing */}
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-3">
              <span className="text-sm font-medium text-gray-500">Price:</span>
              <span className="text-2xl font-bold text-[#195f3d]">
                {formatPrice(price.amount, price.currencyCode)}
              </span>
              {hasDiscount && (
                <del className="text-sm font-medium text-gray-400">
                  {formatPrice(compareAt.amount, compareAt.currencyCode)}
                </del>
              )}
            </div>
            <span className="text-xs text-gray-500">
              Tax included. <Link href="/shipping" className="text-[#195f3d] underline hover:text-[#124b30]">Shipping calculated</Link> at checkout.
            </span>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="flex flex-col gap-4 border-t border-b border-gray-100 py-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-200">
                <button
                  type="button"
                  className="flex h-[36px] w-[36px] items-center justify-center border-r border-gray-100 bg-transparent hover:bg-gray-50"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3 w-3 text-gray-600" />
                </button>
                <span className="flex h-[36px] w-[40px] items-center justify-center text-sm font-medium text-gray-800">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="flex h-[36px] w-[36px] items-center justify-center border-l border-gray-100 bg-transparent hover:bg-gray-50"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus className="h-3 w-3 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
              <button
                type="button"
                className="flex h-12 w-full items-center justify-center bg-[#195f3d] text-sm font-bold text-white transition-colors hover:bg-[#124b30] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!selectedVariant?.availableForSale}
                onClick={handleAddToCart}
              >
                {selectedVariant?.availableForSale === false ? 'Sold out' : 'Add to cart'}
              </button>
              <button
                type="button"
                className="flex h-12 w-full items-center justify-center bg-[#e05643] text-sm font-bold text-white transition-colors hover:bg-[#c93d2b] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleBuyNow}
              >
                ⚡ Buy Now
              </button>
            </div>
          </div>

          {/* Delivery Details Pincode Checker */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-gray-800">Delivery Details</span>
            <form onSubmit={handlePincodeCheck} className="flex h-10 w-full border border-gray-200">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter your pincode"
                className="flex-1 bg-transparent px-3 text-sm text-gray-700 outline-none"
              />
              <button
                type="submit"
                className="h-full bg-[#263b4d] px-5 text-xs font-bold text-white transition-colors hover:bg-[#1c2d3c]"
              >
                Check
              </button>
            </form>
            {pincodeStatus === 'success' && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <Check className="h-3.5 w-3.5 stroke-[3]" /> Delivering to {pincode} (Typically in 3-5 days)
              </span>
            )}
            {pincodeStatus === 'error' && (
              <span className="text-xs font-medium text-red-500">
                ✗ Please enter a valid 6-digit pincode.
              </span>
            )}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-6 text-center text-[10px] font-semibold text-gray-700">
            <div className="flex flex-col items-center gap-1.5 p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-[#195f3d]">
                <RotateCcw className="h-5 w-5" />
              </div>
              <span>Guaranteed Replacements if Damaged</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-[#195f3d]">
                <Truck className="h-5 w-5" />
              </div>
              <span>Free Shipping above ₹499</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-[#195f3d]">
                <Heart className="h-5 w-5" />
              </div>
              <span>Loved by 3 Lakh+ Happy Customers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations - You may also like */}
      {recommendations.length > 0 && (
        <section className="mt-16 border-t border-gray-100 pt-10">
          <h2 className="mb-8 text-xl font-bold text-[#263b4d]">You may also like</h2>
          <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
            {recommendations.map((rec) => {
              const recImg = rec.images.edges[0]?.node;
              const recVariant = rec.variants.edges[0]?.node;
              const recPrice = recVariant?.price || rec.priceRange.minVariantPrice;
              const recCompareAt = recVariant?.compareAtPrice || rec.compareAtPriceRange.minVariantPrice;
              const recDiscount = Number(recCompareAt.amount) > Number(recPrice.amount)
                ? Math.round((1 - Number(recPrice.amount) / Number(recCompareAt.amount)) * 100)
                : 0;

              return (
                <article key={rec.id} className="relative flex flex-col border border-gray-100 p-4 transition-all hover:shadow-md">
                  {recDiscount > 0 && (
                    <span className="absolute left-2 top-2 z-10 bg-[#195f3d] px-2 py-0.5 text-[10px] font-bold text-white">
                      Save {recDiscount}%
                    </span>
                  )}
                  <Link className="block" href={`/products/${rec.handle}`}>
                    <div className="relative aspect-square overflow-hidden bg-white mb-4">
                      {recImg && (
                        <Image
                          className="object-contain transition-transform duration-300 hover:scale-105"
                          src={recImg.url}
                          alt={recImg.altText || rec.title}
                          fill
                          sizes="(max-width: 768px) 90vw, 25vw"
                        />
                      )}
                    </div>
                    <h3 className="min-h-8 text-xs font-bold leading-normal text-[#263b4d] hover:text-[#195f3d]">
                      {rec.title}
                    </h3>
                  </Link>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-[#28714d]">
                      {formatPrice(recPrice.amount, recPrice.currencyCode)}
                    </span>
                    {recDiscount > 0 && (
                      <del className="text-xs text-gray-400">
                        {formatPrice(recCompareAt.amount, recCompareAt.currencyCode)}
                      </del>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Floating WhatsApp Widget */}
      <a
        href="https://wa.me/919999999999"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition-transform hover:scale-110"
        aria-label="Contact us on WhatsApp"
      >
        <svg className="h-8 w-8 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.022-.08-.085-.184-.208-.26l-1.3-1.04c-.16-.13-.376-.17-.573-.1l-.813.29c-.198.07-.42-.02-.516-.21-.497-.99-1.3-1.78-2.3-2.27-.19-.1-.28-.32-.21-.52l.29-.81c.07-.2.03-.41-.1-.57l-1.04-1.3c-.15-.19-.44-.24-.65-.11l-.83.52c-.41.26-.64.71-.62 1.2.06 1.48.69 2.87 1.76 3.94s2.46 1.7 3.94 1.76c.49.02.94-.21 1.2-.62l.52-.83c.13-.21.08-.5-.11-.65zM12 2C6.48 2 2 6.48 2 12c0 2.17.69 4.19 1.87 5.83L2.61 22l4.33-1.26C8.58 21.36 10.24 21.7 12 21.7c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.63 0-3.17-.46-4.51-1.27l-.32-.19-2.6.76.76-2.6-.19-.32C4.46 15.04 4 13.58 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" />
        </svg>
      </a>
    </div>
  );
}
