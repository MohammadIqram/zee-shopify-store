'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, History, IndianRupee, MapPin, Pencil, Power, ShoppingCart, UserRound } from 'lucide-react';
import {
  createCustomerAddress,
  deleteCustomerAddress,
  logoutCustomer,
  updateCustomerPassword,
  updateCustomerProfile,
  type ActionResult,
} from '@/lib/customer-actions';
import type { CustomerAccount, CustomerAddress, CustomerOrder } from '@/lib/customer-session';

type AccountTab = 'profile' | 'orders' | 'addresses' | 'password' | 'recent' | 'top';
type RecentProduct = { id: string; title: string; handle: string };

const addressLocations = {
  IN: { name: 'India', provinces: [['AN', 'Andaman and Nicobar Islands'], ['AP', 'Andhra Pradesh'], ['AS', 'Assam'], ['BR', 'Bihar'], ['CH', 'Chandigarh'], ['DL', 'Delhi'], ['GA', 'Goa'], ['GJ', 'Gujarat'], ['HR', 'Haryana'], ['HP', 'Himachal Pradesh'], ['JK', 'Jammu and Kashmir'], ['JH', 'Jharkhand'], ['KA', 'Karnataka'], ['KL', 'Kerala'], ['MP', 'Madhya Pradesh'], ['MH', 'Maharashtra'], ['MN', 'Manipur'], ['ML', 'Meghalaya'], ['MZ', 'Mizoram'], ['NL', 'Nagaland'], ['OD', 'Odisha'], ['PB', 'Punjab'], ['RJ', 'Rajasthan'], ['SK', 'Sikkim'], ['TN', 'Tamil Nadu'], ['TS', 'Telangana'], ['TR', 'Tripura'], ['UP', 'Uttar Pradesh'], ['UK', 'Uttarakhand'], ['WB', 'West Bengal']] },
  US: { name: 'United States', provinces: [['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'], ['CO', 'Colorado'], ['FL', 'Florida'], ['GA', 'Georgia'], ['IL', 'Illinois'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['NJ', 'New Jersey'], ['NY', 'New York'], ['NC', 'North Carolina'], ['OH', 'Ohio'], ['PA', 'Pennsylvania'], ['TX', 'Texas'], ['VA', 'Virginia'], ['WA', 'Washington']] },
  CA: { name: 'Canada', provinces: [['AB', 'Alberta'], ['BC', 'British Columbia'], ['MB', 'Manitoba'], ['NB', 'New Brunswick'], ['NL', 'Newfoundland and Labrador'], ['NS', 'Nova Scotia'], ['ON', 'Ontario'], ['PE', 'Prince Edward Island'], ['QC', 'Quebec'], ['SK', 'Saskatchewan']] },
  GB: { name: 'United Kingdom', provinces: [['ENG', 'England'], ['SCT', 'Scotland'], ['WLS', 'Wales'], ['NIR', 'Northern Ireland']] },
  AE: { name: 'United Arab Emirates', provinces: [['AZ', 'Abu Dhabi'], ['AJ', 'Ajman'], ['DU', 'Dubai'], ['FU', 'Fujairah'], ['RK', 'Ras al-Khaimah'], ['SH', 'Sharjah'], ['UQ', 'Umm al-Quwain']] },
} as const;
type AddressCountryCode = keyof typeof addressLocations;

const tabs: { id: AccountTab; label: string; icon: typeof UserRound }[] = [
  { id: 'profile', label: 'My profile', icon: UserRound },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'password', label: 'Change password', icon: History },
  { id: 'recent', label: 'Recently viewed', icon: Eye },
  { id: 'top', label: 'Top ordered products', icon: History },
];

export default function AccountDashboardIntegrated({ account }: { account: CustomerAccount }) {
  const [activeTab, setActiveTab] = useState<AccountTab>('profile');
  const fullName = [account.firstName, account.lastName].filter(Boolean).join(' ') || 'My account';

  return <div className="grid w-full max-w-[1250px] grid-cols-[290px_minmax(0,1fr)] gap-11 max-lg:grid-cols-[240px_minmax(0,1fr)] max-md:grid-cols-1 max-md:gap-6">
    <aside className="h-fit border border-[#dedede] bg-white">
      <div className="border-b border-[#bcbcbc] px-6 py-8 max-md:px-5 max-md:py-6"><h1 className="m-0 text-[30px] font-normal leading-none text-black">{fullName}</h1><p className="mt-5 break-words text-sm text-black">{account.email}</p></div>
      <nav aria-label="Account sections">
        {tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`flex h-[75px] w-full items-center gap-5 border-0 border-b border-[#bcbcbc] px-6 text-left text-base transition-colors max-md:h-16 max-md:px-5 ${activeTab === id ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${activeTab === id ? 'border-white' : 'border-[#333]'}`}><Icon className="h-5 w-5" strokeWidth={1.5} /></span><span>{label}</span>{id === 'addresses' && <span className="ml-auto flex h-8 w-10 items-center justify-center rounded bg-white text-black shadow-md">{account.addresses.edges.length}</span>}</button>)}
        <form action={logoutCustomer}><button type="submit" className="flex h-[75px] w-full items-center gap-5 border-0 bg-white px-6 text-left text-base text-black hover:bg-gray-50 max-md:h-16 max-md:px-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#333]"><Power className="h-5 w-5" strokeWidth={1.5} /></span>Logout</button></form>
      </nav>
    </aside>
    <section className="min-h-[520px] border border-[#dedede] bg-white px-12 py-14 max-md:px-6 max-md:py-8">
      {activeTab === 'profile' && <ProfilePanel account={account} />}
      {activeTab === 'orders' && <OrdersPanel orders={account.orders.edges.map(({ node }) => node)} />}
      {activeTab === 'addresses' && <AddressesPanel addresses={account.addresses.edges.map(({ node }) => node)} />}
      {activeTab === 'password' && <PasswordPanel />}
      {activeTab === 'recent' && <RecentlyViewedPanel />}
      {activeTab === 'top' && <TopOrderedPanel orders={account.orders.edges.map(({ node }) => node)} />}
    </section>
  </div>;
}

function ActionMessage({ state }: { state: ActionResult }) { return state.error || state.message ? <p className={`mb-6 border px-4 py-3 text-sm ${state.error ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>{state.error || state.message}</p> : null; }

function ProfilePanel({ account }: { account: CustomerAccount }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(updateCustomerProfile, {});
  useEffect(() => { if (state.success) { setEditing(false); router.refresh(); } }, [router, state.success]);
  if (editing) return <div><h2 className="m-0 text-[46px] font-normal leading-tight text-black max-md:text-3xl">Edit profile</h2><form className="mt-14 max-w-[850px] space-y-6" action={action}><ActionMessage state={state} /><label className="block text-base">First name<input className="mt-3 h-14 w-full border border-[#d1d1d1] bg-gray-50 px-4 text-gray-600 outline-none focus:border-black" name="firstName" defaultValue={account.firstName || ''} required /></label><label className="block text-base">Last name<input className="mt-3 h-14 w-full border border-[#d1d1d1] bg-gray-50 px-4 text-gray-600 outline-none focus:border-black" name="lastName" defaultValue={account.lastName || ''} required /></label><label className="block text-base">Email<input className="mt-3 h-14 w-full border border-[#d1d1d1] bg-gray-50 px-4 text-gray-600 outline-none focus:border-black" name="email" type="email" defaultValue={account.email} required /></label><label className="flex items-center gap-3 text-base"><input className="h-4 w-4 accent-black" name="emailSubscription" type="checkbox" defaultChecked={account.acceptsMarketing} />Subscribe to email marketing</label><div className="flex gap-2"><button type="submit" disabled={pending} className="bg-black px-8 py-4 text-sm font-semibold text-white disabled:opacity-50">{pending ? 'Saving...' : 'Submit'}</button><button type="button" onClick={() => setEditing(false)} className="border border-black bg-white px-8 py-4 text-sm font-semibold text-black">Cancel</button></div></form></div>;
  return <div><div className="grid grid-cols-3 gap-10 max-lg:gap-5 max-md:grid-cols-1"><SummaryCard icon={<IndianRupee className="h-6 w-6" strokeWidth={1.5} />} label="Total spent" value={formatTotal(account.orders.edges.map(({ node }) => node))} /><SummaryCard icon={<ShoppingCart className="h-6 w-6" strokeWidth={1.5} />} label="All orders" value={String(account.orders.edges.length)} /><SummaryCard icon={<MapPin className="h-6 w-6" strokeWidth={1.5} />} label="Addresses" value={String(account.addresses.edges.length)} /></div><div className="mt-24 flex items-center justify-between max-md:mt-12"><h2 className="m-0 text-[46px] font-normal leading-tight text-black max-md:text-3xl">My profile</h2><button type="button" onClick={() => setEditing(true)} className="border-0 bg-transparent p-2 text-black hover:bg-gray-100" aria-label="Edit profile"><Pencil className="h-9 w-9" strokeWidth={1.5} /></button></div><div className="mt-12 divide-y divide-[#999]"><ProfileRow label="First name" value={account.firstName || '-'} /><ProfileRow label="Last name" value={account.lastName || '-'} /><ProfileRow label="Email" value={account.email} /><ProfileRow label="Email subscription" value={account.acceptsMarketing ? 'Subscribed' : 'Unsubscribed'} /></div></div>;
}

function SummaryCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="flex min-h-[120px] items-center gap-6 border border-[#a8a8a8] px-7 shadow-sm [border-top-left-radius:14px] [border-bottom-right-radius:14px] max-md:min-h-[100px]"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#555]">{icon}</span><div><p className="m-0 text-sm">{label}</p><strong className="mt-2 block text-lg">{value}</strong></div></div>; }
function ProfileRow({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[220px_1fr] gap-8 py-5 text-base max-md:grid-cols-[120px_1fr] max-md:gap-4"><strong>{label}</strong><span className="text-gray-500">{value}</span></div>; }

function OrdersPanel({ orders }: { orders: CustomerOrder[] }) { return <div><h2 className="m-0 text-[46px] font-normal leading-tight text-black max-md:text-3xl">Orders</h2>{orders.length === 0 ? <EmptyState message="You haven't placed any orders yet." detail="Explore our collections and find something you'll love." /> : <div className="mt-12 divide-y divide-[#ddd]">{orders.map((order) => <div className="flex items-center justify-between gap-5 py-5 max-md:items-start max-md:flex-col" key={order.id}><div><strong>{order.name}</strong><p className="m-0 mt-2 text-sm text-gray-500">{new Date(order.processedAt).toLocaleDateString()}</p></div><span className="text-sm font-semibold">{formatMoney(order.totalPrice.amount, order.totalPrice.currencyCode)}</span></div>)}</div>}</div>; }

function AddressesPanel({ addresses }: { addresses: CustomerAddress[] }) { const router = useRouter(); const [adding, setAdding] = useState(false); const [state, action, pending] = useActionState(createCustomerAddress, {}); const [deleteState, deleteAction] = useActionState(deleteCustomerAddress, {}); useEffect(() => { if (state.success || deleteState.success) { setAdding(false); router.refresh(); } }, [deleteState.success, router, state.success]); return <div><h2 className="m-0 text-[46px] font-normal leading-tight text-black max-md:text-3xl">Addresses</h2><ActionMessage state={state.error ? state : deleteState} />{adding ? <form className="mt-12 max-w-[850px] space-y-5" action={action}><label className="block text-sm">First name<input className="mt-2 h-12 w-full border border-gray-300 bg-gray-50 px-3" name="firstName" required /></label><label className="block text-sm">Last name<input className="mt-2 h-12 w-full border border-gray-300 bg-gray-50 px-3" name="lastName" required /></label><label className="block text-sm">Address<input className="mt-2 h-12 w-full border border-gray-300 bg-gray-50 px-3" name="address1" required /></label><div className="grid grid-cols-2 gap-4 max-md:grid-cols-1"><label className="block text-sm">City<input className="mt-2 h-12 w-full border border-gray-300 bg-gray-50 px-3" name="city" required /></label><AddressLocationFields /></div><label className="block text-sm">Postal code<input className="mt-2 h-12 w-full border border-gray-300 bg-gray-50 px-3" name="zip" required /></label><label className="block text-sm">Phone<input className="mt-2 h-12 w-full border border-gray-300 bg-gray-50 px-3" name="phone" type="tel" /></label><div className="flex gap-2"><button type="submit" disabled={pending} className="bg-black px-7 py-3 text-sm font-semibold text-white">{pending ? 'Saving...' : 'Save address'}</button><button type="button" onClick={() => setAdding(false)} className="border border-black bg-white px-7 py-3 text-sm">Cancel</button></div></form> : <><button type="button" onClick={() => setAdding(true)} className="mt-12 flex h-[190px] w-[280px] flex-col items-center justify-center border border-[#dedede] bg-white text-base shadow-md hover:border-black"><MapPin className="h-10 w-10" strokeWidth={1.5} /><span className="mt-5">Add new address</span><span className="text-5xl font-extralight text-gray-200">+</span></button>{addresses.length > 0 && <div className="mt-10 grid gap-4">{addresses.map((address) => <div className="border border-gray-200 p-5" key={address.id}><p className="m-0 text-sm leading-6">{[address.firstName, address.lastName].filter(Boolean).join('')}<br />{address.address1}{address.address2 && <><br />{address.address2}</>}<br />{[address.city, address.province, address.zip].filter(Boolean).join(', ')}<br />{address.country}</p><form className="mt-4" action={deleteAction}><input type="hidden" name="id" value={address.id} /><button type="submit" className="text-sm text-red-700 underline">Delete</button></form></div>)}</div>}</>}</div>; }

function AddressLocationFields() {
  const [countryCode, setCountryCode] = useState<AddressCountryCode>('IN');
  const location = addressLocations[countryCode];
  return <>
    <label className="block text-sm">Country<select className="mt-2 h-12 w-full border border-gray-300 bg-gray-50 px-3" name="country" value={countryCode} onChange={(event) => setCountryCode(event.target.value as AddressCountryCode)} required>{Object.entries(addressLocations).map(([code, value]) => <option key={code} value={code}>{value.name}</option>)}</select></label>
    <label className="block text-sm">Province/state<select className="mt-2 h-12 w-full border border-gray-300 bg-gray-50 px-3" name="province" required><option value="">Select province/state</option>{location.provinces.map(([code, name]) => <option key={code} value={code}>{name} ({code})</option>)}</select></label>
  </>;
}

function PasswordPanel() { const [state, action, pending] = useActionState(updateCustomerPassword, {}); return <div><h2 className="m-0 text-[46px] font-normal leading-tight text-black max-md:text-3xl">Change password</h2><form className="mt-14 max-w-[850px] space-y-6" action={action}><ActionMessage state={state} /><label className="block text-base">New password<input className="mt-3 h-14 w-full border border-[#d1d1d1] bg-gray-50 px-4 outline-none" name="password" type="password" required /></label><label className="block text-base">Confirm new password<input className="mt-3 h-14 w-full border border-[#d1d1d1] bg-gray-50 px-4 outline-none" name="confirmation" type="password" required /></label><button type="submit" disabled={pending} className="bg-black px-8 py-4 text-sm font-semibold text-white disabled:opacity-50">{pending ? 'Saving...' : 'Submit'}</button></form></div>; }

function RecentlyViewedPanel() { const [products, setProducts] = useState<RecentProduct[]>([]); useEffect(() => { try { const saved = JSON.parse(localStorage.getItem('urbanplant-recently-viewed') || '[]') as RecentProduct[]; setProducts(Array.isArray(saved) ? saved : []); } catch { setProducts([]); } }, []); return <div><h2 className="m-0 text-[46px] font-normal leading-tight text-black max-md:text-3xl">Recently viewed products</h2>{products.length === 0 ? <EmptyState message="No recently viewed products yet." /> : <div className="mt-12 grid gap-4 sm:grid-cols-2">{products.map((product) => <a className="border border-gray-200 p-5 text-sm no-underline hover:border-black" href={`/products/${product.handle}`} key={product.id}><strong>{product.title}</strong></a>)}</div>}</div>; }

function TopOrderedPanel({ orders }: { orders: CustomerOrder[] }) { const products = new Map<string, { title: string; quantity: number }>(); orders.forEach((order) => order.lineItems.edges.forEach(({ node }) => { const id = node.variant?.product?.id || node.title; const existing = products.get(id); products.set(id, { title: node.variant?.product?.title || node.title, quantity: (existing?.quantity || 0) + node.quantity }); })); const sorted = [...products.values()].sort((a, b) => b.quantity - a.quantity); return <div><h2 className="m-0 text-[46px] font-normal leading-tight text-black max-md:text-3xl">Top ordered products</h2>{sorted.length === 0 ? <EmptyState message="Your most ordered products will appear here." /> : <div className="mt-12 divide-y divide-gray-200">{sorted.map((product) => <div className="flex justify-between py-5 text-sm" key={product.title}><span>{product.title}</span><strong>{product.quantity} ordered</strong></div>)}</div>}</div>; }

function EmptyState({ message, detail }: { message: string; detail?: string }) { return <div className="flex min-h-[300px] flex-col items-center justify-center text-center"><h3 className="m-0 text-lg font-bold">{message}</h3>{detail && <p className="mt-5 text-base text-gray-500">{detail}</p>}</div>; }
function formatMoney(amount: string, currencyCode: string) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currencyCode }).format(Number(amount)); }
function formatTotal(orders: CustomerOrder[]) { if (!orders.length) return '₹0.00'; const total = orders.reduce((sum, order) => sum + Number(order.totalPrice.amount), 0); return formatMoney(String(total), orders[0].totalPrice.currencyCode); }
