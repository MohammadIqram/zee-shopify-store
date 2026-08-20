'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, Search, ShoppingBag, ChevronRight, ChevronDown } from 'lucide-react';

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

export default function Navbar({ categories }: { categories: CollectionCategory[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

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
          className="flex h-10 max-w-xl flex-1 items-center rounded border border-gray-300 bg-white overflow-hidden max-md:order-3 max-md:w-full max-md:max-w-none" 
          role="search" 
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            type="search"
            placeholder="Search products..."
            aria-label="Search products"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full border-0 bg-transparent px-3 text-xs text-gray-800 outline-none placeholder:text-gray-400"
          />
          <button className="flex h-full items-center gap-1.5 border-0 border-l border-gray-200 bg-transparent px-3 text-xs text-gray-600 hover:text-gray-900 whitespace-nowrap max-lg:hidden cursor-pointer" type="button">
            All categories <ChevronDown className="h-3 w-3 text-gray-500" />
          </button>
          <button className="flex h-full w-10 flex-none items-center justify-center bg-[#195f3d] text-white transition-colors hover:bg-emerald-800 cursor-pointer" type="submit" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
        </form>

        <div className="flex items-center gap-5">
          {/* Account Link */}
          <a 
            className="flex flex-col border-r border-gray-300 pr-5 text-right no-underline max-md:border-0 max-md:p-0" 
            href="/account"
          >
            <span className="text-[10px] text-gray-500 max-md:hidden">Login / Signup</span>
            <span className="text-xs font-semibold text-[#195f3d]">My Account</span>
          </a>

          {/* Cart Link */}
          <a 
            className="relative flex items-center gap-2 text-xs font-bold text-[#195f3d] no-underline" 
            href="/cart" 
            aria-label="Cart"
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5 text-[#195f3d]" />
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#050505] text-[10px] font-medium text-white">
                1
              </span>
            </div>
            <span className="max-md:hidden">Cart</span>
          </a>
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