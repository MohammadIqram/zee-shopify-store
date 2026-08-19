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
    <ul className="menu-items">
      {items.map((item) => (
        <li className="menu-item" key={`${item.title}-${item.url}`}>
          <a href={item.url} className="menu-item-link">
            <span>{item.title}</span>
            {item.items.length > 0 && <span className="submenu-indicator" aria-hidden="true">›</span>}
          </a>
          {item.items.length > 0 && (
            <NavigationItems items={item.items} />
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
    <header className="site-header">
      <div className="shipping-bar">Free Shipping Above ₹499 | Fast All India Delivery</div>

      <div className="navbar">
        <button
          className="menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="main-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="menu-icon" aria-hidden="true"><i /><i /><i /></span>
          <span>Menu</span>
        </button>

        <Link className="brand" href="/" aria-label="Urban Plant home">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span className="brand-name">urban<span>plant</span><sup>®</sup></span>
        </Link>

        <form className="search-form" role="search" onSubmit={(event) => event.preventDefault()}>
          <input
            type="search"
            placeholder="Search..."
            aria-label="Search products"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="category-select" type="button">All categories <span aria-hidden="true">⌄</span></button>
          <button className="search-button" type="submit" aria-label="Search">
            <span className="search-icon" aria-hidden="true" />
          </button>
        </form>

        <a className="account-link" href="/account">
          <span>Login&nbsp; / &nbsp;Signup</span>
          <strong>My account</strong>
        </a>

        <a className="cart-link" href="/cart" aria-label="Cart">
          <span className="cart-icon" aria-hidden="true"><i /><b /></span>
          <span className="cart-count">1</span>
          <strong>Cart</strong>
        </a>
      </div>

      <nav id="main-menu" className={`mobile-menu${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
        {categories.length > 0 ? (
          <NavigationItems items={categories.map((category) => ({
            title: category.title,
            url: `/collections/${category.handle}`,
            items: [],
          }))} />
        ) : (
          <p className="menu-empty">No collections found in Shopify.</p>
        )}
      </nav>
    </header>
  );
}