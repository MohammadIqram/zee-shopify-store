'use client';

import { useState } from 'react';
import Link from 'next/link';

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
    <ul className="m-0 flex flex-col list-none py-[7px] max-md:p-0">
      {items.map((item) => (
        <li key={`${item.title}-${item.url}`} className="group/item relative max-md:border-b max-md:border-gray-200">
          <a
            href={item.url}
            className="flex items-center justify-between gap-[20px] px-[18px] py-[12px] text-[#333] no-underline whitespace-nowrap hover:bg-[#f0f5f1] hover:text-[#195f3d] focus-visible:bg-[#f0f5f1] focus-visible:text-[#195f3d] max-md:px-[20px] max-md:py-[14px] max-md:text-[#195f3d]"
          >
            <span>{item.title}</span>
            {item.items.length > 0 && (
              <span className="text-[23px] leading-[14px] text-[#195f3d]" aria-hidden="true">
                ›
              </span>
            )}
          </a>
          {item.items.length > 0 && (
            <div className="invisible absolute left-full top-[-7px] min-w-[220px] -translate-x-[6px] bg-white opacity-0 shadow-[8px_8px_18px_rgba(0,0,0,0.08)] transition-[opacity,transform,visibility] duration-180 ease-in-out pointer-events-none group-hover/item:visible group-hover/item:opacity-100 group-hover/item:translate-x-0 group-hover/item:pointer-events-auto group-focus-within/item:visible group-focus-within/item:opacity-100 group-focus-within/item:translate-x-0 group-focus-within/item:pointer-events-auto max-md:static max-md:left-auto max-md:top-auto max-md:block max-md:min-w-0 max-md:translate-x-0 max-md:bg-[#f7faf8] max-md:opacity-100 max-md:shadow-none max-md:pointer-events-auto max-md:visible max-md:transition-none">
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
    <header className="bg-[#fafafa] text-[#171717]">
      {/* Top Banner */}
      <div className="bg-[#195f3d] px-[20px] py-[17px] text-center text-[19px] tracking-[0.1px] text-white max-md:px-[10px] max-md:py-[12px] max-md:text-[14px]">
        Free Shipping Above ₹499 | Fast All India Delivery
      </div>

      {/* Main Bar */}
      <div className="flex min-h-[125px] items-center gap-[38px] px-[max(28px,calc((100vw-1920px)/2))] max-lg:gap-[18px] max-md:min-h-0 max-md:flex-wrap max-md:gap-[14px] max-md:p-[18px_16px]">
        
        {/* Menu Toggle Button */}
        <button
          className="flex h-[61px] flex-none items-center justify-center gap-[21px] border border-[#aaa] bg-transparent text-[18px] font-bold text-[#195f3d] w-[146px] max-md:h-[48px] max-md:gap-[10px] max-md:flex-basis-[112px]"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="main-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="grid w-[28px] gap-[5px]" aria-hidden="true">
            <i className="block h-[3px] w-[28px] bg-[#195f3d]" />
            <i className="block h-[3px] w-[28px] bg-[#195f3d]" />
            <i className="block h-[3px] w-[28px] bg-[#195f3d]" />
          </span>
          <span>Menu</span>
        </button>

        {/* Brand Logo */}
        <Link 
          className="flex min-w-[225px] items-center gap-[7px] text-[#852128] no-underline max-lg:min-w-[185px] max-md:min-w-0" 
          href="/" 
          aria-label="Urban Plant home"
        >
          <span className="relative block h-[79px] w-[42px] -rotate-3 rounded-b-[45%] rounded-t-[48%] border-[3px] border-[#852128] before:absolute before:left-[25px] before:top-[-15px] before:h-[19px] before:w-[19px] before:rounded-full before:border-[3px] before:border-[#852128] before:content-[''] after:absolute after:bottom-[12px] after:left-[7px] after:h-[25px] after:w-[14px] after:-rotate-[24deg] after:rounded-[100%_0_100%_0] after:bg-[#195f3d] after:content-[''] max-md:h-[52px] max-md:w-[30px] max-md:before:left-[17px]" aria-hidden="true">
            <span className="absolute left-[21px] top-[28px] h-[20px] w-[13px] rotate-[38deg] rounded-[100%_0_100%_0] bg-[#195f3d]" />
          </span>
          <span className="w-[155px] text-[45px] tracking-[-2px] leading-[0.84] max-lg:text-[36px] max-md:w-[120px] max-md:text-[29px]">
            urban<span className="block ml-[41px] max-md:ml-[25px]">plant</span>
            <sup className="ml-[2px] text-[11px] tracking-normal vertical-top">®</sup>
          </span>
        </Link>

        {/* Search Bar */}
        <form 
          className="flex h-[61px] min-w-[260px] flex-1 border border-[#aaa] max-md:order-5 max-md:h-[48px] max-md:flex-basis-full" 
          role="search" 
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            type="search"
            placeholder="Search..."
            aria-label="Search products"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-[70px] flex-1 border-0 bg-transparent px-[21px] text-[17px] outline-none"
          />
          <button className="min-w-[222px] border-0 border-l border-[#aaa] bg-transparent px-[24px] text-left text-[16px] text-[#333] max-lg:min-w-[150px] max-md:hidden" type="button">
            All categories <span className="float-right text-[25px] font-bold leading-[15px]" aria-hidden="true">⌄</span>
          </button>
          <button className="flex flex-none items-center justify-center border-0 bg-[#050505] w-[68px] max-md:flex-basis-[52px]" type="submit" aria-label="Search">
            <span className="relative inline-block h-[22px] w-[22px] rounded-full border-[3px] border-white after:absolute after:bottom-[-7px] after:right-[-6px] after:h-[3px] after:w-[10px] after:rotate-45 after:bg-white after:content-['']" aria-hidden="true" />
          </button>
        </form>

        {/* Account Link */}
        <a 
          className="flex min-w-[165px] flex-col gap-[6px] border-r border-[#aaa] pr-[29px] text-[16px] text-[#171717] no-underline max-lg:min-w-[130px] max-md:ml-auto max-md:min-w-0 max-md:border-0 max-md:p-0 max-md:text-[13px]" 
          href="/account"
        >
          <span>Login&nbsp; / &nbsp;Signup</span>
          <strong className="text-[18px] text-[#195f3d] max-md:text-[15px]">My account</strong>
        </a>

        {/* Cart Link */}
        <a 
          className="relative flex min-w-[117px] items-center gap-[15px] text-[18px] font-bold text-[#195f3d] no-underline max-md:min-w-0" 
          href="/cart" 
          aria-label="Cart"
        >
          <span className="relative block h-[23px] w-[30px] -skew-x-10 border-[3px] border-t-0 border-[#195f3d] before:absolute before:left-[-10px] before:top-[-7px] before:h-[3px] before:w-[15px] before:rotate-[10deg] before:bg-[#195f3d] before:content-['']" aria-hidden="true">
            <i className="absolute bottom-[-11px] left-[3px] h-[6px] w-[6px] rounded-full bg-[#195f3d]" />
            <b className="absolute bottom-[-11px] right-[3px] h-[6px] w-[6px] rounded-full bg-[#195f3d]" />
          </span>
          <span className="absolute left-[22px] top-[-20px] h-[29px] w-[29px] rounded-full bg-[#050505] text-center text-[14px] leading-[29px] text-white">
            1
          </span>
          <strong className="text-[18px] text-[#195f3d] max-md:hidden">Cart</strong>
        </a>
      </div>

      {/* Flyout Navigation Menu */}
      <nav
        id="main-menu"
        aria-hidden={!menuOpen}
        className={`absolute left-[28px] top-[201px] z-20 block min-w-[245px] border-t border-[#ddd] bg-white shadow-[0_10px_18px_rgba(0,0,0,0.08)] transition-[opacity,transform,visibility] duration-200 ease-in-out ${
          menuOpen
            ? 'visible pointer-events-auto opacity-100 translate-y-0 max-md:max-h-[70vh] max-md:overflow-y-auto'
            : 'invisible pointer-events-none opacity-0 -translate-y-[10px] max-md:max-h-0 max-md:overflow-hidden'
        } max-md:absolute max-md:left-0 max-md:top-auto max-md:min-w-full max-md:translate-y-0`}
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
          <p className="m-0 p-[16px_18px] text-[14px] text-[#666]">No collections found in Shopify.</p>
        )}
      </nav>
    </header>
  );
}