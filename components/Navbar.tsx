'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Menu, Search, ShoppingBag, ChevronRight, ChevronDown } from 'lucide-react';
import { useCart } from '@/components/CartProvider';

export interface NavigationItem {
  title: string;
  url: string;
  items: NavigationItem[];
}

export interface CollectionCategory {
  id: string;
  title: string;
  handle: string;
}

function NavigationItems({ items }: { items: NavigationItem[] }) {
  return (
    <ul className="m-0 flex flex-col list-none py-1 max-md:p-0">
      {items.map((item) => (
        <li key={`${item.title}-${item.url}`} className="group/item relative max-md:border-b max-md:border-gray-100">
          <a
            href={item.url}
            className="flex items-center justify-between gap-4 px-4 py-2.5 text-xs font-medium text-gray-700 no-underline whitespace-nowrap transition-colors hover:bg-emerald-50 hover:text-[#195f3d] focus-visible:bg-emerald-50 focus-visible:text-[#195f3d] max-md:px-4 max-md:py-3"
          >
            <span>{item.title}</span>
            {item.items.length > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-[#195f3d]" />
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

export default function Navbar({ categories, customerName }: { categories: CollectionCategory[]; customerName?: string | null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const { items, itemCount, updateQuantity, removeItem } = useCart();

  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [activeParentIdx, setActiveParentIdx] = useState(0);

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
    const mapping = [
      {
        title: 'Plants',
        matches: ['indoor-plants', 'outdoor-plants', 'flowering-plants', 'succulents', 'bonsai', 'ferns', 'creepers', 'medicinal-plants'],
        defaultSubs: [
          { title: 'Indoor Plants', handle: 'indoor-plants' },
          { title: 'Outdoor Plants', handle: 'outdoor-plants' },
          { title: 'Flowering Plants', handle: 'flowering-plants' },
          { title: 'Succulents', handle: 'succulents' },
        ]
      },
      {
        title: 'Seeds',
        matches: ['vegetable-seeds', 'flower-seeds', 'herb-seeds', 'fruit-seeds', 'microgreen-seeds'],
        defaultSubs: [
          { title: 'Vegetable Seeds', handle: 'vegetable-seeds' },
          { title: 'Flower Seeds', handle: 'flower-seeds' },
          { title: 'Herb Seeds', handle: 'herb-seeds' },
        ]
      },
      {
        title: 'Pots & Planters',
        matches: ['ceramic-pots', 'plastic-pots', 'clay-pots', 'metal-pots', 'hanging-planters', 'grow-bags'],
        defaultSubs: [
          { title: 'Ceramic Pots', handle: 'ceramic-pots' },
          { title: 'Plastic Pots', handle: 'plastic-pots' },
          { title: 'Grow Bags', handle: 'grow-bags' },
        ]
      },
      {
        title: 'Gardening Supplies',
        matches: ['fertilizers', 'soil-manure', 'gardening-tools', 'pesticides', 'watering-cans'],
        defaultSubs: [
          { title: 'Fertilizers', handle: 'fertilizers' },
          { title: 'Gardening Tools', handle: 'gardening-tools' },
        ]
      },
    ];

    const groupedHandles = new Set(mapping.flatMap(m => m.matches));

    const result = mapping.map(parent => {
      let subcategories = categories
        .filter(col => parent.matches.includes(col.handle))
        .map(col => ({ title: col.title, handle: col.handle }));
      
      if (subcategories.length === 0) {
        subcategories = parent.defaultSubs;
      }
      
      const parentCol = categories.find(col => col.handle === parent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      
      return {
        title: parent.title,
        handle: parentCol?.handle || parent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        subcategories,
      };
    });

    const ungrouped = categories.filter(col => !groupedHandles.has(col.handle));
    ungrouped.forEach(col => {
      const isAlreadyParent = result.some(r => r.title.toLowerCase() === col.title.toLowerCase());
      if (!isAlreadyParent) {
        result.push({
          title: col.title,
          handle: col.handle,
          subcategories: [],
        });
      }
    });

    return result;
  }, [categories]);
  const cartTotal = items.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
  const currencyCode = items[0]?.currencyCode || 'INR';

  return (
    <header className="relative bg-[#fafafa] text-gray-800 shadow-sm">
      {/* Top Banner */}
      <div className="bg-[#195f3d] px-4 py-2 text-center text-xs font-medium tracking-wide text-white max-md:text-[11px] max-md:py-1.5">
        Free Shipping Above ₹499 | Fast All India Delivery
      </div>

      {/* Main Bar */}
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-6 max-lg:gap-4 max-md:h-auto max-md:flex-wrap max-md:p-3">
        
        <div className="flex items-center gap-4">
          {/* Menu Toggle Button */}
          <button
            className="flex h-10 items-center justify-center gap-2 rounded border border-gray-300 bg-white px-3.5 text-xs font-semibold text-[#195f3d] transition-colors hover:bg-gray-50 cursor-pointer"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="main-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Menu className="h-4 w-4 text-[#195f3d]" />
            <span>Menu</span>
          </button>

          {/* Brand Logo */}
          <Link 
            className="flex items-center gap-2 text-[#852128] no-underline" 
            href="/" 
            aria-label="Urban Plant home"
          >
            <span className="relative block h-9 w-5 -rotate-3 rounded-b-xl rounded-t-xl border-2 border-[#852128] before:absolute before:right-[-6px] before:top-[-6px] before:h-2.5 before:w-2.5 before:rounded-full before:border-2 before:border-[#852128] after:absolute after:bottom-1 after:left-1 after:h-3.5 after:w-2 after:-rotate-12 after:rounded-full after:bg-[#195f3d]" aria-hidden="true">
              <span className="absolute left-2 top-3 h-2.5 w-1.5 rotate-45 rounded-full bg-[#195f3d]" />
            </span>
            <span className="text-2xl font-bold tracking-tight text-[#852128] leading-none">
              urban<span className="text-[#195f3d]">plant</span>
              <sup className="ml-0.5 text-[9px] font-normal">®</sup>
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <form 
          className="relative flex h-10 max-w-xl flex-1 items-center rounded border border-gray-300 bg-white max-md:order-3 max-md:w-full max-md:max-w-none" 
          role="search" 
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            type="search"
            placeholder="Search products..."
            aria-label="Search products"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full border-0 bg-transparent px-3 text-xs text-gray-800 outline-none placeholder:text-gray-400 rounded-l"
          />
          <div className="categories-dropdown-container relative h-full flex items-center max-lg:hidden">
            <button 
              className="flex h-full items-center gap-1.5 border-0 border-l border-gray-200 bg-transparent px-3 text-xs text-gray-600 hover:text-gray-900 whitespace-nowrap cursor-pointer" 
              type="button"
              onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
            >
              All categories <ChevronDown className="h-3 w-3 text-gray-500" />
            </button>
            {categoriesDropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-[450px] bg-white border border-gray-200 shadow-2xl rounded-md flex overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-[160px] bg-gray-50 border-r border-gray-100 flex flex-col">
                  {hierarchy.map((parent, idx) => (
                    <button
                      key={parent.title}
                      type="button"
                      className={`w-full text-left px-4 py-3 text-xs transition-colors border-l-4 cursor-pointer ${
                        idx === activeParentIdx 
                          ? 'bg-white text-[#195f3d] font-bold border-l-[#195f3d]' 
                          : 'border-l-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      onClick={() => setActiveParentIdx(idx)}
                    >
                      {parent.title}
                    </button>
                  ))}
                </div>
                {/* Right Content */}
                <div className="flex-1 p-5 min-h-[220px]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {hierarchy[activeParentIdx]?.title}
                    </span>
                    {hierarchy[activeParentIdx]?.handle && (
                      <Link 
                        href={`/collections/${hierarchy[activeParentIdx].handle}`}
                        className="text-[11px] font-semibold text-[#195f3d] hover:underline"
                        onClick={() => setCategoriesDropdownOpen(false)}
                      >
                        View all
                      </Link>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {hierarchy[activeParentIdx]?.subcategories.map((sub) => (
                      <Link
                        key={sub.handle}
                        href={`/collections/${sub.handle}`}
                        className="text-xs text-gray-600 hover:text-[#195f3d] hover:font-semibold transition-colors"
                        onClick={() => setCategoriesDropdownOpen(false)}
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <button className="flex h-full w-10 flex-none items-center justify-center bg-[#195f3d] text-white transition-colors hover:bg-emerald-800 cursor-pointer rounded-r" type="submit" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
        </form>

        <div className="flex items-center gap-5">
          {/* Account Link */}
          <a 
            className="flex flex-col border-r border-gray-300 pr-5 text-right no-underline max-md:border-0 max-md:p-0" 
            href="/account"
          >
            <span className="text-[10px] text-gray-500">{customerName || 'Login / Signup'}</span>
            <span className="text-xs font-semibold text-[#195f3d]">My Account</span>
          </a>

          {/* Cart Link */}
          <div className="relative">
            <button
              className="relative flex cursor-pointer items-center gap-2 border-0 bg-transparent text-xs font-bold text-[#195f3d] no-underline"
              type="button"
              aria-expanded={cartOpen}
              aria-controls="cart-popover"
              aria-label={`Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
              onClick={() => setCartOpen((open) => !open)}
            >
            <div className="relative">
              <ShoppingBag className="h-5 w-5 text-[#195f3d]" />
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#050505] text-[10px] font-medium text-white">
                {itemCount}
              </span>
            </div>
            <span className="max-md:hidden">Cart</span>
            </button>
            {cartOpen && (
              <div id="cart-popover" className="absolute right-0 top-full z-30 mt-3 w-[min(360px,calc(100vw-32px))] border border-gray-200 bg-white p-4 text-left shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="m-0 text-sm font-bold text-gray-900">Your cart</h2>
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
                              <p className="m-0 text-sm font-semibold text-gray-800">{item.title}</p>
                              {item.variantTitle !== 'Default Title' && <p className="m-0 mt-1 text-xs text-gray-500">{item.variantTitle}</p>}
                              <p className="m-0 mt-1 text-xs text-[#195f3d]">{item.price} {item.currencyCode}</p>
                            </div>
                            <button className="cursor-pointer border-0 bg-transparent p-0 text-xs text-gray-500 underline" type="button" onClick={() => removeItem(item.variantId)}>Remove</button>
                          </div>
                          <div className="mt-2 flex items-center gap-3">
                            <button className="flex h-6 w-6 cursor-pointer items-center justify-center border border-gray-200 bg-white" type="button" aria-label={`Decrease ${item.title} quantity`} onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>−</button>
                            <span className="min-w-4 text-center text-xs">{item.quantity}</span>
                            <button className="flex h-6 w-6 cursor-pointer items-center justify-center border border-gray-200 bg-white" type="button" aria-label={`Increase ${item.title} quantity`} onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>+</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm font-bold text-gray-900">
                      <span>Total</span>
                      <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: currencyCode }).format(cartTotal)}</span>
                    </div>
                    <Link className="mt-4 block w-full bg-[#195f3d] px-4 py-3 text-center text-sm font-bold text-[#f5c400] no-underline transition-colors hover:bg-[#124b30]" href="/cart" onClick={() => setCartOpen(false)}>
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
        className={`absolute left-6 top-full z-20 min-w-[220px] rounded-b border border-t-0 border-gray-200 bg-white shadow-lg transition-all duration-200 ease-in-out ${
          menuOpen
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