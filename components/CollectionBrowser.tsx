'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

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

const formatPrice = (amount: string, currencyCode: string) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: currencyCode, maximumFractionDigits: 2 }).format(Number(amount));

function QuickViewModal({ product, onClose }: { product: CollectionProduct; onClose: () => void }) {
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
    <div className="quick-view-modal" role="dialog" aria-modal="true" aria-label={`Quick view: ${product.title}`}>
      <button className="quick-view-backdrop" type="button" aria-label="Close quick view" onClick={onClose} />
      <div className="quick-view-panel">
        <button className="quick-view-close" type="button" aria-label="Close quick view" onClick={onClose}>×</button>
        <div className="quick-view-gallery">
          <div className="quick-view-thumbnails">
            {product.images.edges.map(({ node }, index) => <button className={`quick-view-thumb${index === activeImageIndex ? ' is-active' : ''}`} type="button" key={node.url} aria-label={`View image ${index + 1}`} onClick={() => setActiveImageIndex(index)}><Image src={node.url} alt={node.altText || `${product.title} image ${index + 1}`} fill sizes="70px" /></button>)}
          </div>
          <div className="quick-view-image">{image && <Image src={image.url} alt={image.altText || product.title} fill sizes="50vw" />}</div>
          <span className="zoom-hint">⌕ &nbsp; Roll over image to zoom in</span>
        </div>
        <div className="quick-view-details">
          <a className="guarantee-link" href="#guarantee">30-Day Money-Back Plant Guarantee</a>
          <p className="guarantee-copy">Plants may arrive stressed after long transit, but proper watering can help them recover. Live plants are non-refundable, but if they do not recover from transit stress despite proper care, eligible claims are refundable under our Money-Back Guarantee.</p>
          <h2>{product.title}</h2>
          {hasDiscount && <span className="modal-discount">Save {discount}%</span>}
          <div className="modal-rating"><span>★★★★★</span> <small>20 reviews</small></div>
          <hr />
          {Object.entries(optionGroups).map(([name, values]) => <div className="option-group" key={name}><strong>{name}: &nbsp;{selectedOptions[name]}</strong><div>{values.map((value) => <button className={`option-button${selectedOptions[name] === value ? ' is-selected' : ''}`} type="button" key={value} onClick={() => setSelectedOptions((current) => ({ ...current, [name]: value }))}>{value}</button>)}</div></div>)}
          <div className="modal-price"><strong>Price:</strong><span>{formatPrice(price.amount, price.currencyCode)}</span>{hasDiscount && <del>{formatPrice(compareAt.amount, compareAt.currencyCode)}</del>}</div>
          <small className="tax-note">Tax included <span>Shipping calculated at checkout</span></small>
          <div className="quantity-control"><strong>Quantity:</strong><div><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button><span>{quantity}</span><button type="button" onClick={() => setQuantity((value) => value + 1)}>+</button></div></div>
          <button className="modal-add-button" type="button">Add to cart</button>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onQuickView }: { product: CollectionProduct; onQuickView: (product: CollectionProduct) => void }) {
  const image = product.images.edges[0]?.node;
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange.minVariantPrice;
  const hasDiscount = Number(compareAt.amount) > Number(price.amount);
  const discount = hasDiscount ? Math.round((1 - Number(price.amount) / Number(compareAt.amount)) * 100) : 0;

  return (
    <article className="collection-product-card">
      {hasDiscount && <span className="product-discount">Save {discount}%</span>}
      <a className="product-image-link" href={`/products/${product.handle}`}>
        <div className="collection-product-image">
          {image ? <Image src={image.url} alt={image.altText || product.title} fill sizes="(max-width: 760px) 90vw, 30vw" /> : <span />}
        </div>
      </a>
      <h2><a href={`/products/${product.handle}`}>{product.title}</a></h2>
      <div className="product-price">
        <span>{formatPrice(price.amount, price.currencyCode)}</span>
        {hasDiscount && <del>{formatPrice(compareAt.amount, compareAt.currencyCode)}</del>}
      </div>
      <div className="product-rating" aria-label="No reviews yet"><span>★★★★★</span> <small>No reviews</small></div>
      <button className="product-action" type="button">Add to cart</button>
      <button className="quick-view" type="button" onClick={() => onQuickView(product)}>Quick view</button>
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
    <div className="collection-layout">
      <aside className="collection-filters">
        <h2>Filters</h2>
        {filters.map((filter) => {
          const isOpen = openFilters.includes(filter.id);
          return <div key={filter.id}><button className="filter-heading" type="button" onClick={() => toggleFilter(filter.id)}>{filter.label} <span>{isOpen ? '⌃' : '⌄'}</span></button>{isOpen && <div className="backend-filter-values">{filter.values.map((value) => <label key={value.id}><input type="checkbox" /> <span>{value.label}</span> <small>({value.count})</small></label>)}</div>}</div>;
        })}
      </aside>

      <section className="collection-results">
        <div className="collection-toolbar">
          <span>Showing 1 - {visibleProducts.length} of {products.length} products</span>
          <label>Display: <select defaultValue="24"><option value="24">24 per page</option><option value="48">48 per page</option></select></label>
          <label>Sort by: <select value={sort} onChange={(event) => setSort(event.target.value)}><option>Featured</option><option>Price: low to high</option><option>Price: high to low</option></select></label>
          <span className="view-toggle">View&nbsp; <b>▦</b> <b>☷</b></span>
        </div>
        <div className="collection-product-grid">
          {visibleProducts.map((product) => <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />)}
        </div>
      </section>
      {quickViewProduct && <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
    </div>
  );
}