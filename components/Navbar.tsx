'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Search, ShoppingBag, ChevronRight, ChevronDown } from 'lucide-react';
import { useCart } from '@/components/CartProvider';

export interface NavigationItem {
  title: string;
  url: string;
  items: NavigationItem[];
}

export interface ShopifyMenuItem {
  id: string;
  title: string;
  url: string;
  resourceId?: string | null;
  items?: ShopifyMenuItem[];
}

export interface CollectionCategory {
  id: string;
  title: string;
  handle: string;
  image?: { url: string; altText?: string | null } | null;
}

export interface NavbarProps {
  categories: CollectionCategory[];
  menuItems?: ShopifyMenuItem[];
  customerName?: string | null;
}

function getHandleFromUrl(url?: string | null, title?: string): string {
  if (url && url.includes('/collections/')) {
    const parts = url.split('/collections/');
    if (parts[1]) {
      const handlePart = parts[1].split('?')[0].split('#')[0].replace(/\/$/, '');
      if (handlePart) return handlePart;
    }
  }
  return title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : '';
}

function NavigationItems({ items }: { items: NavigationItem[] }) {
  return (
    <ul className="m-0 flex flex-col list-none py-1 max-md:p-0">
      {items.map((item) => (
        <li key={`${item.title}-${item.url}`} className="group/item relative max-md:border-b max-md:border-gray-100">
          <a
            href={item.url}
            className="flex items-center justify-between gap-4 px-4 py-2.5 text-xs font-medium text-[#202722] no-underline whitespace-nowrap transition-colors hover:bg-[#F5F2E9] hover:text-[#183D2B] focus-visible:bg-[#F5F2E9] focus-visible:text-[#183D2B] max-md:px-4 max-md:py-3"
          >
            <span>{item.title}</span>
            {item.items.length > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-[#183D2B]" />
            )}
          </a>
          {item.items.length > 0 && (
            <div className="invisible absolute left-full top-[-4px] min-w-[200px] -translate-x-1 bg-white opacity-0 shadow-md transition-all duration-150 ease-in-out pointer-events-none group-hover/item:visible group-hover/item:opacity-100 group-hover/item:translate-x-0 group-hover/item:pointer-events-auto max-md:static max-md:block max-md:min-w-0 max-md:translate-x-0 max-md:bg-gray-50 max-md:opacity-100 max-md:shadow-none max-md:pointer-events-auto max-md:visible">
              <NavigationItems items={item.items} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function Navbar({ categories, menuItems, customerName }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const { items, itemCount, updateQuantity, removeItem } = useCart();

  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [activeParentIdx, setActiveParentIdx] = useState(0);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const handleClose = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('click', handleClose);
    return () => document.removeEventListener('click', handleClose);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
        const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
        const endpoint = `https://${domain}/api/2026-04/graphql.json`;

        const searchQuery = `
          query SearchProducts($query: String!) {
            products(first: 6, query: $query) {
              edges {
                node {
                  id
                  title
                  handle
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
        `;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': storefrontAccessToken!,
          },
          body: JSON.stringify({
            query: searchQuery,
            variables: { query: `title:*${query}*` },
          }),
        });

        const body = await response.json();
        if (body.data?.products?.edges) {
          setSearchResults(body.data.products.edges.map((edge: any) => edge.node));
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error('Error searching products:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    if (!categoriesDropdownOpen) return;
    const handleClose = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.categories-dropdown-container')) {
        setCategoriesDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClose);
    return () => document.removeEventListener('click', handleClose);
  }, [categoriesDropdownOpen]);

  const hierarchy = useMemo(() => {
    const allShopifySubcategories = (categories || []).map((col) => ({
      title: col.title,
      handle: col.handle,
      url: `/collections/${col.handle}`,
    }));

    // 1. If menuItems from Shopify Menu exist and have items
    const collectionMenuItems = (menuItems || []).filter((item) => {
      const isNotGenericPage = !['home', 'search', 'contact', 'about'].includes(item.title.toLowerCase().trim());
      return isNotGenericPage;
    });

    if (collectionMenuItems.length > 0) {
      const mappedMenuItems = collectionMenuItems.map((item) => {
        const itemHandle = getHandleFromUrl(item.url, item.title);
        let subcategories = (item.items || []).map((sub) => ({
          title: sub.title,
          handle: getHandleFromUrl(sub.url, sub.title),
          url: sub.url?.startsWith('/') || sub.url?.startsWith('http') ? sub.url : `/collections/${getHandleFromUrl(sub.url, sub.title)}`,
        }));

        if (subcategories.length === 0) {
          const itemKey = item.title.toLowerCase();
          subcategories = categories
            .filter((c) => c.title.toLowerCase().includes(itemKey) || c.handle.toLowerCase().includes(itemHandle))
            .map((c) => ({
              title: c.title,
              handle: c.handle,
              url: `/collections/${c.handle}`,
            }));
        }

        return {
          title: item.title,
          handle: itemHandle,
          url: item.url?.startsWith('/') || item.url?.startsWith('http') ? item.url : `/collections/${itemHandle}`,
          subcategories,
        };
      });

      return [
        {
          title: 'All Collections',
          handle: 'all-collections',
          url: '/collections/all-collections',
          subcategories: allShopifySubcategories,
        },
        ...mappedMenuItems,
      ];
    }

    // 2. Dynamic grouping of Shopify collections
    const groups = [
      {
        title: 'All Collections',
        handle: 'all-collections',
        subcategories: allShopifySubcategories,
      },
      {
        title: 'Plants',
        handle: 'plants',
        keywords: ['plant', 'succulent', 'indoor', 'outdoor', 'flower', 'bonsai', 'fern', 'creeper', 'medicinal'],
      },
      {
        title: 'Seeds',
        handle: 'seeds',
        keywords: ['seed', 'vegetable', 'herb', 'fruit', 'microgreen'],
      },
      {
        title: 'Pots & Planters',
        handle: 'pots-planters',
        keywords: ['pot', 'planter', 'ceramic', 'plastic', 'clay', 'metal', 'hanging', 'grow-bag'],
      },
      {
        title: 'Gardening Supplies',
        handle: 'gardening-supplies',
        keywords: ['fertilizer', 'soil', 'manure', 'tool', 'pesticide', 'water', 'care', 'supply', 'supplies'],
      },
    ];

    const result = groups.map((group) => {
      if (group.subcategories) {
        return group;
      }
      const matched = categories.filter((col) => {
        const h = col.handle.toLowerCase();
        const t = col.title.toLowerCase();
        return group.keywords.some((k) => h.includes(k) || t.includes(k));
      });

      return {
        title: group.title,
        handle: group.handle,
        subcategories: matched.map((col) => ({
          title: col.title,
          handle: col.handle,
          url: `/collections/${col.handle}`,
        })),
      };
    });

    return result.filter((g) => g.subcategories.length > 0);
  }, [menuItems, categories]);
  const cartTotal = items.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
  const currencyCode = items[0]?.currencyCode || 'INR';

  return (
    <header className="relative bg-[#F5F2E9] text-[#202722] shadow-sm">
      {/* Top Banner */}
      <div className="bg-[#183D2B] px-4 py-3 text-center text-sm font-medium tracking-wide text-[#F5F2E9] max-md:text-[13px] max-md:py-2.5">
        Free Shipping Above ₹499 | Fast All India Delivery
      </div>

      {/* Main Bar */}
      <div className="mx-auto flex h-[80px] max-w-7xl items-center justify-between gap-6.5 px-6.5 max-lg:gap-4.5 max-md:h-auto max-md:flex-wrap max-md:p-4">

        <div className="flex items-center gap-5">
          {/* Menu Toggle Button */}
          <button
            className="flex h-12 items-center justify-center gap-2.5 rounded border border-[#E7DFCF] bg-white px-4.5 text-sm font-semibold text-[#183D2B] transition-colors hover:bg-[#E7DFCF]/40 cursor-pointer"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="main-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Menu className="h-5 w-5 text-[#183D2B]" />
            <span>Menu</span>
          </button>

          {/* Brand Logo */}
          <Link
            className="flex items-center gap-2 text-[#183D2B] no-underline"
            href="/"
            aria-label="Garden by Zee home"
          >
            <span className="relative block h-10 w-6 -rotate-3 rounded-b-xl rounded-t-xl border-2 border-[#6B4A32] before:absolute before:right-[-6px] before:top-[-6px] before:h-2.5 before:w-2.5 before:rounded-full before:border-2 before:border-[#6B4A32] after:absolute after:bottom-1 after:left-1 after:h-3.5 after:w-2 after:-rotate-12 after:rounded-full after:bg-[#3F6B45]" aria-hidden="true">
              <span className="absolute left-2 top-3 h-2.5 w-1.5 rotate-45 rounded-full bg-[#3F6B45]" />
            </span>
            <span className="text-[27px] font-bold tracking-tight text-[#183D2B] leading-none">
              garden<span className="text-[#3F6B45]">byzee</span>
              <sup className="ml-0.5 text-[10px] font-normal text-[#B59A5A]">®</sup>
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <form
          className="search-container relative flex h-12 max-w-xl flex-1 items-center rounded border border-[#E7DFCF] bg-white max-md:order-3 max-md:w-full max-md:max-w-none shadow-xs"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            type="search"
            placeholder="Search products..."
            aria-label="Search products"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchFocused(true);
            }}
            onFocus={() => setSearchFocused(true)}
            className="w-full border-0 bg-transparent px-4 text-sm text-[#202722] outline-none placeholder:text-gray-400 rounded-l"
          />
          <div className="categories-dropdown-container relative h-full flex items-center max-lg:hidden">
            <button
              className="flex h-full items-center gap-2 border-0 border-l border-[#E7DFCF] bg-transparent px-4 text-sm text-[#202722] hover:text-[#183D2B] whitespace-nowrap cursor-pointer"
              type="button"
              onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
            >
              All categories <ChevronDown className="h-4 w-4 text-[#6B4A32]" />
            </button>
            {categoriesDropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-[520px] bg-white border border-[#E7DFCF] shadow-2xl rounded-md flex overflow-hidden">
                {/* Left Sidebar - Parent Categories */}
                <div className="w-[190px] bg-[#F5F2E9] border-r border-[#E7DFCF] flex flex-col max-h-[400px] overflow-y-auto">
                  {hierarchy.map((parent, idx) => (
                    <button
                      key={`${parent.title}-${idx}`}
                      type="button"
                      className={`w-full text-left px-4.5 py-4 text-sm transition-colors border-l-4 cursor-pointer flex items-center justify-between ${idx === activeParentIdx
                          ? 'bg-white text-[#183D2B] font-bold border-l-[#B59A5A]'
                          : 'border-l-transparent text-[#202722] hover:bg-[#E7DFCF]/50'
                        }`}
                      onClick={() => setActiveParentIdx(idx)}
                    >
                      <span className="truncate">{parent.title}</span>
                      {parent.subcategories.length > 0 && (
                        <ChevronRight className="h-4 w-4 flex-none text-[#6B4A32]" />
                      )}
                    </button>
                  ))}
                </div>
                {/* Right Content - Sub Categories */}
                <div className="flex-1 p-6 min-h-[260px] max-h-[400px] overflow-y-auto flex flex-col justify-between bg-white">
                  <div>
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E7DFCF]">
                      <span className="text-[13px] font-bold uppercase tracking-wider text-[#183D2B]">
                        {hierarchy[activeParentIdx]?.title}
                      </span>
                      {hierarchy[activeParentIdx]?.handle && (
                        <Link
                          href={`/collections/${hierarchy[activeParentIdx].handle}`}
                          className="text-[13px] font-semibold text-[#3F6B45] hover:text-[#183D2B] hover:underline"
                          onClick={() => setCategoriesDropdownOpen(false)}
                        >
                          View all
                        </Link>
                      )}
                    </div>
                    {hierarchy[activeParentIdx]?.subcategories && hierarchy[activeParentIdx].subcategories.length > 0 ? (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {hierarchy[activeParentIdx].subcategories.map((sub) => (
                          <Link
                            key={sub.handle}
                            href={`/collections/${sub.handle}`}
                            className="text-sm text-[#202722] hover:text-[#183D2B] hover:font-semibold transition-colors flex items-center gap-2 py-1"
                            onClick={() => setCategoriesDropdownOpen(false)}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#3F6B45] flex-none" />
                            <span className="truncate">{sub.title}</span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 py-4 text-center">
                        Browse all items in{' '}
                        <Link
                          href={`/collections/${hierarchy[activeParentIdx]?.handle}`}
                          className="text-[#183D2B] underline font-medium"
                          onClick={() => setCategoriesDropdownOpen(false)}
                        >
                          {hierarchy[activeParentIdx]?.title}
                        </Link>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <button className="flex h-full w-12 flex-none items-center justify-center bg-[#183D2B] text-[#F5F2E9] transition-colors hover:bg-[#3F6B45] cursor-pointer rounded-r" type="submit" aria-label="Search">
            <Search className="h-5 w-5" />
          </button>

          {/* Search Results Dropdown */}
          {searchFocused && query.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full z-[60] mt-1 max-h-[340px] overflow-y-auto rounded-md border border-[#E7DFCF] bg-white shadow-2xl py-1">
              {searchLoading ? (
                <div className="px-4 py-3.5 text-sm text-gray-500 text-center">Loading search results...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((product) => {
                  const image = product.images?.edges?.[0]?.node;
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.handle}`}
                      className="flex items-center gap-3.5 px-4.5 py-3 hover:bg-[#F5F2E9] text-sm text-[#202722] hover:text-[#183D2B] no-underline transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        setSearchFocused(false);
                        setQuery('');
                      }}
                    >
                      <div className="relative h-9 w-9 flex-none overflow-hidden rounded-full border border-[#E7DFCF] bg-white">
                        {image ? (
                          <Image
                            className="object-cover"
                            src={image.url}
                            alt={image.altText || product.title}
                            fill
                            sizes="36px"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">?</div>
                        )}
                      </div>
                      <span className="font-medium truncate">{product.title}</span>
                    </Link>
                  );
                })
              ) : (
                <div className="px-4 py-3.5 text-sm text-gray-500 text-center">No products found.</div>
              )}
            </div>
          )}
        </form>

        <div className="flex items-center gap-6">
          {/* Account Link */}
          <a
            className="flex flex-col border-r border-[#E7DFCF] pr-6 text-right no-underline max-md:border-0 max-md:p-0"
            href="/account"
          >
            <span className="text-xs text-gray-500">{customerName || 'Login / Signup'}</span>
            <span className="text-sm font-semibold text-[#183D2B]">My Account</span>
          </a>

          {/* Cart Link */}
          <div className="relative">
            <button
              className="relative flex cursor-pointer items-center gap-2.5 border-0 bg-transparent text-sm font-bold text-[#183D2B] no-underline"
              type="button"
              aria-expanded={cartOpen}
              aria-controls="cart-popover"
              aria-label={`Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
              onClick={() => setCartOpen((open) => !open)}
            >
              <div className="relative">
                <ShoppingBag className="h-6 w-6 text-[#183D2B]" />
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#6B4A32] text-[11px] font-bold text-white">
                  {itemCount}
                </span>
              </div>
              <span className="max-md:hidden">Cart</span>
            </button>
            {cartOpen && (
              <div id="cart-popover" className="absolute right-0 top-full z-30 mt-3 w-[min(360px,calc(100vw-32px))] border border-[#E7DFCF] bg-white p-4 text-left shadow-xl rounded-md">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="m-0 text-sm font-bold text-[#202722]">Your cart</h2>
                  <span className="text-xs text-gray-500">{itemCount} item{itemCount === 1 ? '' : 's'}</span>
                </div>
                {items.length === 0 ? (
                  <p className="m-0 py-6 text-center text-sm text-gray-500">Your cart is empty.</p>
                ) : (
                  <>
                    <ul className="m-0 max-h-64 list-none divide-y divide-gray-100 overflow-y-auto p-0">
                      {items.map((item) => (
                        <li className="py-3" key={item.variantId}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="m-0 text-sm font-semibold text-[#202722]">{item.title}</p>
                              {item.variantTitle !== 'Default Title' && <p className="m-0 mt-1 text-xs text-gray-500">{item.variantTitle}</p>}
                              <p className="m-0 mt-1 text-xs font-semibold text-[#183D2B]">{item.price} {item.currencyCode}</p>
                            </div>
                            <button className="cursor-pointer border-0 bg-transparent p-0 text-xs text-gray-500 underline hover:text-[#183D2B]" type="button" onClick={() => removeItem(item.variantId)}>Remove</button>
                          </div>
                          <div className="mt-2 flex items-center gap-3">
                            <button className="flex h-6 w-6 cursor-pointer items-center justify-center border border-[#E7DFCF] bg-white" type="button" aria-label={`Decrease ${item.title} quantity`} onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>−</button>
                            <span className="min-w-4 text-center text-xs">{item.quantity}</span>
                            <button className="flex h-6 w-6 cursor-pointer items-center justify-center border border-[#E7DFCF] bg-white" type="button" aria-label={`Increase ${item.title} quantity`} onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>+</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm font-bold text-[#202722]">
                      <span>Total</span>
                      <span className="text-[#183D2B]">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: currencyCode }).format(cartTotal)}</span>
                    </div>
                    <Link className="mt-4 block w-full bg-[#183D2B] px-4 py-3 text-center text-sm font-bold text-[#B59A5A] no-underline transition-colors hover:bg-[#3F6B45]" href="/cart" onClick={() => setCartOpen(false)}>
                      Go to cart
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flyout Navigation Menu */}
      <nav
        id="main-menu"
        aria-hidden={!menuOpen}
        className={`absolute left-6 top-full z-20 min-w-[220px] rounded-b border border-t-0 border-[#E7DFCF] bg-white shadow-lg transition-all duration-200 ease-in-out ${menuOpen
            ? 'visible pointer-events-auto opacity-100 translate-y-0 max-md:max-h-[60vh] max-md:overflow-y-auto'
            : 'invisible pointer-events-none opacity-0 -translate-y-2 max-md:max-h-0'
          } max-md:left-0 max-md:right-0 max-md:w-full`}
      >
        {categories.length > 0 ? (
          <NavigationItems
            items={categories.map((category) => ({
              title: category.title,
              url: `/collections/${category.handle}`,
              items: [],
            }))}
          />
        ) : (
          <p className="m-0 p-3 text-xs text-gray-500">No collections found.</p>
        )}
      </nav>
    </header>
  );
}