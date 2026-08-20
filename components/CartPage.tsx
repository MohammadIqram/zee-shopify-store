'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, LockKeyhole, Minus, Plus } from 'lucide-react';
import { useCart } from '@/components/CartProvider';

const formatPrice = (amount: number, currencyCode: string) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: currencyCode, maximumFractionDigits: 2 }).format(amount);

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const currencyCode = items[0]?.currencyCode || 'INR';
  const subtotal = items.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
  const savings = items.reduce((total, item) => total + Math.max(0, Number(item.compareAtPrice || item.price) - Number(item.price)) * item.quantity, 0);
  const qualifiesForFreeShipping = subtotal >= 499;

  return (
    <main className="mx-auto w-full max-w-[1440px] px-12 pb-20 pt-16 max-md:px-4 max-md:pt-10">
      <header className="mb-11">
        <h1 className="m-0 text-[32px] font-bold italic tracking-tight text-[#172b3d] max-md:text-[27px]">My cart</h1>
        <p className="mt-4 text-[15px] text-[#263b4d]">
          {qualifiesForFreeShipping ? 'You are eligible for free shipping!' : 'Add more items to qualify for free shipping.'}
        </p>
      </header>

      {items.length === 0 ? (
        <section className="border border-[#dedede] bg-white px-6 py-20 text-center">
          <h2 className="m-0 text-2xl font-bold text-[#172b3d]">Your cart is empty</h2>
          <p className="mt-3 text-sm text-gray-500">Add a plant or garden essential to get started.</p>
          <Link className="mt-7 inline-block bg-[#195f3d] px-8 py-3 text-sm font-bold text-[#f5c400] no-underline" href="/">Continue shopping</Link>
        </section>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_462px] items-start gap-9 max-lg:grid-cols-1">
          <section className="border border-[#dedede] bg-white">
            <div className="grid grid-cols-[minmax(0,1fr)_150px_150px] border-b border-[#dedede] px-8 py-5 text-sm text-[#263b4d] max-md:grid-cols-[minmax(0,1fr)_84px] max-md:px-4">
              <span>Product</span>
              <span className="text-center">Quantity</span>
              <span className="text-right max-md:hidden">Total</span>
            </div>

            <ul className="m-0 list-none divide-y divide-[#ededed] p-0">
              {items.map((item) => {
                const lineTotal = Number(item.price) * item.quantity;
                const compareAt = Number(item.compareAtPrice || item.price);
                return (
                  <li className="grid grid-cols-[minmax(0,1fr)_150px_150px] items-center gap-4 px-8 py-8 max-md:grid-cols-[minmax(0,1fr)_84px] max-md:px-4 max-md:py-6" key={item.variantId}>
                    <div className="flex min-w-0 items-center gap-5">
                      <div className="relative h-[88px] w-[105px] flex-none bg-[#f4f6f2] max-md:h-[72px] max-md:w-[76px]">
                        {item.imageUrl && <Image className="object-contain" src={item.imageUrl} alt={item.imageAlt || item.title} fill sizes="105px" />}
                      </div>
                      <div className="min-w-0">
                        <h2 className="m-0 text-[15px] font-bold leading-snug text-[#172b3d]">{item.title}</h2>
                        {item.variantTitle !== 'Default Title' && <p className="mt-1 text-xs text-gray-500">{item.variantTitle}</p>}
                        <div className="mt-3 flex flex-wrap items-baseline gap-4">
                          <span className="font-bold text-[#195f3d]">{formatPrice(Number(item.price), item.currencyCode)}</span>
                          {compareAt > Number(item.price) && <del className="text-sm text-[#263b4d]">{formatPrice(compareAt, item.currencyCode)}</del>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-[44px] items-center border border-[#dedede]">
                        <button className="flex h-full w-[40px] cursor-pointer items-center justify-center border-0 bg-transparent text-gray-500 hover:text-[#195f3d]" type="button" aria-label={`Decrease ${item.title} quantity`} onClick={() => updateQuantity(item.variantId, item.quantity - 1)}><Minus className="h-4 w-4" /></button>
                        <span className="w-9 text-center text-sm">{item.quantity}</span>
                        <button className="flex h-full w-[40px] cursor-pointer items-center justify-center border-0 bg-transparent text-gray-500 hover:text-[#195f3d]" type="button" aria-label={`Increase ${item.title} quantity`} onClick={() => updateQuantity(item.variantId, item.quantity + 1)}><Plus className="h-4 w-4" /></button>
                      </div>
                      <button className="cursor-pointer border-0 bg-transparent text-xs text-[#263b4d] underline" type="button" onClick={() => removeItem(item.variantId)}>Remove</button>
                    </div>
                    <span className="text-right text-sm text-[#263b4d] max-md:hidden">{formatPrice(lineTotal, item.currencyCode)}</span>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-[#ededed] px-8 py-7 max-md:px-4">
              <h2 className="m-0 text-[23px] font-bold text-[#172b3d]">Buy More Save More</h2>
              <p className="mt-1 text-[15px] text-gray-500">Shop 3 items, Flat 15% Off.</p>
            </div>
          </section>

          <aside className="border border-[#dedede] bg-white p-8 max-md:p-5">
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-[20px] font-bold text-[#172b3d]">Total</h2>
              <strong className="text-[20px] text-[#263b4d]">{formatPrice(subtotal, currencyCode)}</strong>
            </div>
            {savings > 0 && <p className="mt-4 font-bold text-[#28714d]">You saved {formatPrice(savings, currencyCode)}!</p>}
            <details className="mt-7 border-y border-[#dedede] py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] text-[#263b4d]">Order instructions <ChevronDown className="h-4 w-4" /></summary>
              <textarea className="mt-4 min-h-20 w-full resize-y border border-[#dedede] p-3 text-sm outline-none focus:border-[#195f3d]" placeholder="Add a note to your order" aria-label="Order instructions" />
            </details>
            <p className="mt-8 text-[15px] text-[#263b4d]">Tax included. <u>Shipping</u> calculated at checkout</p>
            <button className="mt-8 h-16 w-full cursor-pointer border-0 bg-[#195f3d] text-[17px] font-bold text-[#f5c400] transition-colors hover:bg-[#124b30]" type="button">Checkout</button>
            <div className="mt-10 flex items-center justify-center gap-3 border-t border-[#ededed] pt-10 text-sm font-bold text-[#263b4d]"><LockKeyhole className="h-4 w-4" /> 100% Secure Payments</div>
          </aside>
        </div>
      )}
    </main>
  );
}
