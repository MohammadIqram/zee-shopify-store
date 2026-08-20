'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/components/CartProvider';

export interface CollectionProduct {
  id: string;
  title: string;
  handle: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  compareAtPriceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  variants: { edges: { node: ProductVariant }[] };
  images: { edges: { node: { url: string; altText?: string | null } }[] };
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  selectedOptions: { name: string; value: string }[];
}

export interface CollectionFilter {
  id: string;
  label: string;
  type: string;
  values: { id: string; label: string; count: number; input: string }[];
}

interface CollectionBrowserProps {
  products: CollectionProduct[];
  filters: CollectionFilter[];
}

function rememberRecentlyViewed(product: CollectionProduct) {
  const key = 'urbanplant-recently-viewed';
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]') as { id: string; title: string; handle: string }[];
    const next = [{ id: product.id, title: product.title, handle: product.handle }, ...saved.filter((item) => item.id !== product.id)].slice(0, 12);
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    localStorage.removeItem(key);
  }
}

const formatPrice = (amount: string, currencyCode: string) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: currencyCode, maximumFractionDigits: 2 }).format(Number(amount));

function QuickViewModal({ product, onClose }: { product: CollectionProduct; onClose: () => void }) {
  const { addItem } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const image = product.images.edges[activeImageIndex]?.node;
  const variants = product.variants.edges.map(({ node }) => node);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => Object.fromEntries(variants[0]?.selectedOptions.map((option) => [option.name, option.value]) || []));
  const optionGroups = variants[0]?.selectedOptions.reduce<Record<string, string[]>>((groups, option) => {
    groups[option.name] = [...new Set(variants.map((variant) => variant.selectedOptions.find((selected) => selected.name === option.name)?.value).filter((value): value is string => Boolean(value)))];
    return groups;
  }, {}) || {};
  const selectedVariant = variants.find((variant) => variant.selectedOptions.every((option) => selectedOptions[option.name] === option.value)) || variants[0];
  const price = selectedVariant?.price || product.priceRange.minVariantPrice;
  const compareAt = selectedVariant?.compareAtPrice || product.compareAtPriceRange.minVariantPrice;
  const hasDiscount = Number(compareAt.amount) > Number(price.amount);
  const discount = hasDiscount ? Math.round((1 - Number(price.amount) / Number(compareAt.amount)) * 100) : 0;
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-[30px] max-md:p-[10px]" role="dialog" aria-modal="true" aria-label={`Quick view: ${product.title}`}>
      <button className="absolute inset-0 border-0 bg-[rgba(24,61,43,0.65)]" type="button" aria-label="Close quick view" onClick={onClose} />
      <div className="relative z-[1] grid max-h-[calc(100vh-60px)] w-full max-w-[1365px] grid-cols-[minmax(0,1.04fr)_minmax(380px,0.96fr)] overflow-auto border border-[#E7DFCF] bg-[#F5F2E9] max-md:block max-md:max-h-[calc(100vh-20px)]">
        <button className="absolute right-[14px] top-[14px] z-[2] h-[36px] w-[36px] rounded-full border border-[#E7DFCF] bg-white text-center text-[28px] leading-[28px] text-[#202722] cursor-pointer" type="button" aria-label="Close quick view" onClick={onClose}>×</button>
        
        {/* Gallery */}
        <div className="relative min-h-[600px] border-r border-[#E7DFCF] p-[30px_29px_25px_28px] bg-white max-md:min-h-[330px] max-md:border-b max-md:border-r-0 max-md:p-[16px]">
          <div className="absolute left-[28px] top-[30px] flex w-[70px] flex-col gap-[12px] max-md:left-[16px] max-md:top-[16px] max-md:w-[calc(100%-60px)] max-md:flex-row max-md:gap-[7px] max-md:overflow-x-auto">
            {product.images.edges.map(({ node }, index) => (
              <button className={`relative h-[70px] w-[70px] cursor-pointer border bg-white p-[3px] max-md:h-[45px] max-md:w-[45px] max-md:flex-[0_0_45px] ${index === activeImageIndex ? 'border-2 border-[#183D2B]' : 'border-transparent'}`} type="button" key={node.url} aria-label={`View image ${index + 1}`} onClick={() => setActiveImageIndex(index)}>
                <Image className="object-cover" src={node.url} alt={node.altText || `${product.title} image ${index + 1}`} fill sizes="70px" />
              </button>
            ))}
          </div>
          <div className="relative ml-[128px] h-[548px] max-md:mx-[20px] max-md:mb-0 max-md:mt-[55px] max-md:h-[270px]">
            {image && <Image className="object-contain" src={image.url} alt={image.altText || product.title} fill sizes="(max-width: 760px) 90vw, 50vw" />}
          </div>
          <span className="absolute bottom-[22px] left-0 w-full text-center text-[12px] text-[#6B4A32] max-md:bottom-[8px]">⌕ &nbsp; Roll over image to zoom in</span>
        </div>

        {/* Details */}
        <div className="p-[29px_30px_34px] max-md:p-[24px_20px_26px] bg-[#F5F2E9]">
          <a className="text-[14px] text-[#183D2B] underline font-semibold" href="#guarantee">30-Day Money-Back Plant Guarantee</a>
          <p className="my-[30px] mb-[20px] max-w-[560px] text-[14px] leading-[1.8] text-[#202722] max-md:my-[18px]">Plants may arrive stressed after long transit, but proper watering can help them recover. Live plants are non-refundable, but if they do not recover from transit stress despite proper care, eligible claims are refundable under our Money-Back Guarantee.</p>
          <h2 className="mb-[15px] mt-0 text-[26px] font-bold text-[#183D2B] max-md:text-[22px]">{product.title}</h2>
          {hasDiscount && <span className="inline-block bg-[#183D2B] px-[11px] py-[5px] text-[12px] font-bold text-[#F5F2E9]">Save {discount}%</span>}
          <div className="my-[16px] mb-[23px] text-[19px] text-[#B59A5A]"><span>★★★★★</span> <small className="ml-[8px] text-[13px] text-[#202722]">20 reviews</small></div>
          <hr className="mb-[26px] mt-0 border-0 border-t border-[#E7DFCF]" />
          {Object.entries(optionGroups).map(([name, values]) => (
            <div className="mb-[24px] text-[14px] text-[#202722]" key={name}>
              <strong>{name}: &nbsp;{selectedOptions[name]}</strong>
              <div className="mt-[12px] flex gap-[8px]">
                {values.map((value) => (
                  <button className={`min-h-[41px] cursor-pointer border px-[16px] text-[13px] bg-white ${selectedOptions[name] === value ? 'border-2 border-[#183D2B] text-[#183D2B] font-bold' : 'border-[#E7DFCF] text-[#202722]'}`} type="button" key={value} onClick={() => setSelectedOptions((current) => ({ ...current, [name]: value }))}>{value}</button>
                ))}
              </div>
            </div>
          ))}
          <div className="mt-[28px] flex items-baseline gap-[18px]">
            <strong className="text-[#202722]">Price:</strong>
            <span className="text-[22px] font-bold text-[#183D2B]">{formatPrice(price.amount, price.currencyCode)}</span>
            {hasDiscount && <del className="text-[13px] text-[#6B4A32]">{formatPrice(compareAt.amount, compareAt.currencyCode)}</del>}
          </div>
          <small className="ml-[70px] mt-[6px] mb-[24px] block text-[13px] text-[#202722] max-md:ml-0">Tax included <span className="ml-[4px] text-[#183D2B] font-medium">Shipping calculated at checkout</span></small>
          <div className="mt-[22px] flex items-center gap-[33px] max-md:justify-between">
            <strong className="text-[#202722]">Quantity:</strong>
            <div className="flex border border-[#E7DFCF] bg-white">
              <button className="flex h-[40px] min-w-[41px] cursor-pointer items-center justify-center border-0 border-r border-[#E7DFCF] bg-transparent text-[20px] text-[#202722]" type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
              <span className="flex h-[40px] min-w-[41px] items-center justify-center border-0 border-r border-[#E7DFCF] text-[14px] text-[#202722]">{quantity}</span>
              <button className="flex h-[40px] min-w-[41px] cursor-pointer items-center justify-center border-0 bg-transparent text-[20px] text-[#202722]" type="button" onClick={() => setQuantity((value) => value + 1)}>+</button>
            </div>
          </div>
          <button
            className="mt-[26px] h-[48px] w-full cursor-pointer border-0 bg-[#183D2B] text-[14px] font-bold text-[#B59A5A] transition-colors hover:bg-[#3F6B45]"
            type="button"
            disabled={!selectedVariant?.availableForSale}
            onClick={() => {
              if (!selectedVariant) return;
              addItem({ variantId: selectedVariant.id, productId: product.id, title: product.title, variantTitle: selectedVariant.title, price: price.amount, currencyCode: price.currencyCode, imageUrl: image?.url, imageAlt: image?.altText || product.title, compareAtPrice: compareAt.amount }, quantity);
              onClose();
            }}
          >
            {selectedVariant?.availableForSale === false ? 'Sold out' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onQuickView }: { product: CollectionProduct; onQuickView: (product: CollectionProduct) => void }) {
  const { addItem } = useCart();
  const image = product.images.edges[0]?.node;
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange.minVariantPrice;
  const hasDiscount = Number(compareAt.amount) > Number(price.amount);
  const discount = hasDiscount ? Math.round((1 - Number(price.amount) / Number(compareAt.amount)) * 100) : 0;

  return (
    <article className="relative flex min-w-0 flex-col border-r border-[#E7DFCF] p-[20px] bg-white max-md:border-b max-md:border-r-0 [&:nth-child(3n)]:border-r-0 max-md:[&:nth-child(3n)]:border-r-0">
      {hasDiscount && <span className="absolute left-0 top-[20px] z-[1] bg-[#183D2B] px-[11px] py-[5px] text-[12px] font-bold text-[#F5F2E9]">Save {discount}%</span>}
      <a className="group block" href={`/products/${product.handle}`} onClick={() => rememberRecentlyViewed(product)}>
        <div className="relative h-[330px] overflow-hidden rounded-br-[15px] rounded-tr-[15px] bg-[#F5F2E9] max-md:h-[min(330px,78vw)]">
          {image ? <Image className="object-cover transition-transform duration-250 ease-in-out group-hover:scale-[1.03]" src={image.url} alt={image.altText || product.title} fill sizes="(max-width: 760px) 90vw, 30vw" /> : <span />}
        </div>
      </a>
      <h2 className="mb-[11px] mt-[21px] text-[14px] leading-[1.4] font-normal">
        <a className="text-[#202722] hover:text-[#183D2B] no-underline transition-colors" href={`/products/${product.handle}`} onClick={() => rememberRecentlyViewed(product)}>{product.title}</a>
      </h2>
      <div className="flex items-baseline gap-[16px]">
        <span className="text-[20px] font-bold text-[#183D2B]">{formatPrice(price.amount, price.currencyCode)}</span>
        {hasDiscount && <del className="text-[12px] text-[#6B4A32]">{formatPrice(compareAt.amount, compareAt.currencyCode)}</del>}
      </div>
      <div className="my-[12px] mb-[24px] text-[17px] text-[#B59A5A]" aria-label="No reviews yet">
        <span className="tracking-[1px]">★★★★★</span> <small className="ml-[7px] text-[12px] tracking-normal text-gray-500">No reviews</small>
      </div>
      <button
        className="mt-auto h-[45px] cursor-pointer border-0 bg-[#183D2B] text-[13px] font-bold text-[#B59A5A] transition-colors hover:bg-[#3F6B45] disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        disabled={!product.variants.edges[0]?.node.availableForSale}
        onClick={() => {
          const variant = product.variants.edges[0]?.node;
          if (!variant) return;
          addItem({ variantId: variant.id, productId: product.id, title: product.title, variantTitle: variant.title, price: variant.price.amount, currencyCode: variant.price.currencyCode, imageUrl: image?.url, imageAlt: image?.altText || product.title, compareAtPrice: compareAt.amount });
        }}
      >
        {product.variants.edges[0]?.node.availableForSale === false ? 'Sold out' : 'Add to cart'}
      </button>
      <button className="mt-[10px] h-[45px] cursor-pointer border border-[#E7DFCF] bg-white text-[13px] font-bold text-[#183D2B] transition-colors hover:border-[#183D2B]" type="button" onClick={() => onQuickView(product)}>Quick view</button>
    </article>
  );
}

export default function CollectionBrowser({ products, filters }: CollectionBrowserProps) {
  const [sort, setSort] = useState('Featured');
  const [openFilters, setOpenFilters] = useState<string[]>(filters.slice(0, 1).map((filter) => filter.id));
  const [quickViewProduct, setQuickViewProduct] = useState<CollectionProduct | null>(null);

  const visibleProducts = useMemo(() => {
    const sorted = [...products];
    if (sort === 'Price: low to high') sorted.sort((a, b) => Number(a.priceRange.minVariantPrice.amount) - Number(b.priceRange.minVariantPrice.amount));
    if (sort === 'Price: high to low') sorted.sort((a, b) => Number(b.priceRange.minVariantPrice.amount) - Number(a.priceRange.minVariantPrice.amount));
    return sorted;
  }, [products, sort]);

  const toggleFilter = (filterId: string) => setOpenFilters((current) => current.includes(filterId) ? current.filter((id) => id !== filterId) : [...current, filterId]);

  return (
    <div className="mt-0 grid grid-cols-[300px_minmax(0,1fr)] gap-[30px] max-md:block">
      {/* Sidebar Filters */}
      <aside className="self-start border border-[#ddd] p-[25px_27px] max-md:mt-[16px]">
        <h2 className="mb-[23px] mt-0 text-[20px] font-bold">Filters</h2>
        {filters.map((filter) => {
          const isOpen = openFilters.includes(filter.id);
          return (
            <div key={filter.id}>
              <button className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent py-[14px] text-left text-[14px] font-bold capitalize text-[#333]" type="button" onClick={() => toggleFilter(filter.id)}>
                {filter.label} <span className="text-[20px]">{isOpen ? '⌃' : '⌄'}</span>
              </button>
              {isOpen && (
                <div className="grid gap-[10px] py-[2px_0_14px]">
                  {filter.values.map((value) => (
                    <label className="flex items-center gap-[7px] text-[13px]" key={value.id}>
                      <input className="h-[15px] w-[15px] accent-[#183D2B]" type="checkbox" /> 
                      <span>{value.label}</span> 
                      <small className="text-[#6B4A32]">({value.count})</small>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </aside>

      {/* Product Results */}
      <section className="min-w-0 border border-[#E7DFCF] bg-white max-md:mt-[16px]">
        <div className="flex min-h-[67px] items-center justify-between gap-[34px] border-b border-[#E7DFCF] px-[30px] text-[13px] text-[#202722] max-md:flex-wrap max-md:items-start max-md:gap-[12px_18px] max-md:p-[16px]">
          <span>Showing 1 - {visibleProducts.length} of {products.length} products</span>
          <label className="whitespace-nowrap max-md:order-3">
            Display: <select className="border-0 bg-transparent text-[13px] text-[#333] outline-none" defaultValue="24"><option value="24">24 per page</option><option value="48">48 per page</option></select>
          </label>
          <label className="whitespace-nowrap">
            Sort by: <select className="border-0 bg-transparent text-[13px] text-[#333] outline-none" value={sort} onChange={(event) => setSort(event.target.value)}><option>Featured</option><option>Price: low to high</option><option>Price: high to low</option></select>
          </label>
          <span className="whitespace-nowrap max-md:ml-auto">
            View&nbsp; <b className="ml-[8px] text-[22px] font-bold text-[#555]">▦</b> <b className="ml-[8px] text-[22px] font-bold text-[#555]">☷</b>
          </span>
        </div>
        <div className="grid grid-cols-3 max-md:grid-cols-1">
          {visibleProducts.map((product) => <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />)}
        </div>
      </section>

      {quickViewProduct && <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
    </div>
  );
}