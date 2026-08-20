'use client';

import { useState, type ReactNode } from 'react';
import { Eye, History, IndianRupee, MapPin, Pencil, Power, ShoppingCart, UserRound } from 'lucide-react';
import { logoutCustomer } from '@/lib/customer-actions';
import type { CustomerProfile } from '@/lib/customer-session';

type AccountTab = 'profile' | 'orders' | 'addresses' | 'password' | 'recent' | 'top';

const tabs: { id: AccountTab; label: string; icon: typeof UserRound }[] = [
  { id: 'profile', label: 'My profile', icon: UserRound },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'password', label: 'Change password', icon: History },
  { id: 'recent', label: 'Recently viewed', icon: Eye },
  { id: 'top', label: 'Top ordered products', icon: History },
];

export default function AccountDashboard({ profile }: { profile: CustomerProfile | null }) {
  const [activeTab, setActiveTab] = useState<AccountTab>('profile');
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'My account';

  return <div className="grid w-full max-w-[1250px] grid-cols-[290px_minmax(0,1fr)] gap-11 max-lg:grid-cols-[240px_minmax(0,1fr)] max-md:grid-cols-1 max-md:gap-6">
    <aside className="h-fit border border-[#dedede] bg-white">
      <div className="border-b border-[#bcbcbc] px-6 py-8 max-md:px-5 max-md:py-6">
        <h1 className="m-0 text-[30px] font-normal leading-none text-black">{fullName}</h1>
        <p className="mt-5 break-words text-sm text-black">{profile?.email || 'Customer account'}</p>
      </div>
      <nav aria-label="Account sections">
        {tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`flex h-[75px] w-full items-center gap-5 border-0 border-b border-[#bcbcbc] px-6 text-left text-base transition-colors max-md:h-16 max-md:px-5 ${activeTab === id ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}>
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${activeTab === id ? 'border-white' : 'border-[#333]'}`}><Icon className="h-5 w-5" strokeWidth={1.5} /></span>
          <span>{label}</span>
          {id === 'addresses' && <span className={`ml-auto flex h-8 w-10 items-center justify-center rounded bg-white text-black shadow-md ${activeTab === id ? 'text-black' : ''}`}>0</span>}
        </button>)}
        <form action={logoutCustomer}><button type="submit" className="flex h-[75px] w-full items-center gap-5 border-0 bg-white px-6 text-left text-base text-black hover:bg-gray-50 max-md:h-16 max-md:px-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#333]"><Power className="h-5 w-5" strokeWidth={1.5} /></span>Logout</button></form>
      </nav>
    </aside>
    <section className="min-h-[520px] border border-[#dedede] bg-white px-12 py-14 max-md:px-6 max-md:py-8">
      {activeTab === 'profile' && <ProfilePanel profile={profile} />}
      {activeTab === 'orders' && <EmptyPanel title="Orders" message="You haven't placed any orders yet." detail="Explore our collections and find something you'll love." />}
      {activeTab === 'addresses' && <AddressPanel />}
      {activeTab === 'password' && <PasswordPanel />}
      {activeTab === 'recent' && <EmptyPanel title="Recently viewed products" message="No recently viewed products yet." />}
      {activeTab === 'top' && <EmptyPanel title="Top ordered products" message="Your most ordered products will appear here." />}
    </section>
  </div>;
}

function ProfilePanel({ profile }: { profile: CustomerProfile | null }) {
  const [editing, setEditing] = useState(false);

  if (editing) return <EditProfilePanel profile={profile} onCancel={() => setEditing(false)} onSubmit={() => setEditing(false)} />;

  return <div>
    <div className="grid grid-cols-3 gap-10 max-lg:gap-5 max-md:grid-cols-1">
      <SummaryCard icon={<IndianRupee className="h-6 w-6" strokeWidth={1.5} />} label="Total spent" value="₹0.00" />
      <SummaryCard icon={<ShoppingCart className="h-6 w-6" strokeWidth={1.5} />} label="All orders" value="0" />
      <SummaryCard icon={<MapPin className="h-6 w-6" strokeWidth={1.5} />} label="Addresses" value="0" />
    </div>
    <div className="mt-24 flex items-center justify-between max-md:mt-12"><h2 className="m-0 text-[46px] font-normal leading-tight text-black max-md:text-3xl">My profile</h2><button type="button" onClick={() => setEditing(true)} className="border-0 bg-transparent p-2 text-black hover:bg-gray-100" aria-label="Edit profile"><Pencil className="h-9 w-9" strokeWidth={1.5} /></button></div>
    <div className="mt-12 divide-y divide-[#999]">
      <ProfileRow label="First name" value={profile?.firstName || '-'} /><ProfileRow label="Last name" value={profile?.lastName || '-'} /><ProfileRow label="Email" value={profile?.email || '-'} /><ProfileRow label="Email subscription" value="Unsubscribed" />
    </div>
  </div>;
}

function SummaryCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="flex min-h-[120px] items-center gap-6 border border-[#a8a8a8] px-7 shadow-sm [border-top-left-radius:14px] [border-bottom-right-radius:14px] max-md:min-h-[100px]"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#555]">{icon}</span><div><p className="m-0 text-sm">{label}</p><strong className="mt-2 block text-lg">{value}</strong></div></div>; }

function ProfileRow({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[220px_1fr] gap-8 py-5 text-base max-md:grid-cols-[120px_1fr] max-md:gap-4"><strong>{label}</strong><span className="text-gray-500">{value}</span></div>; }

function EditProfilePanel({ profile, onCancel, onSubmit }: { profile: CustomerProfile | null; onCancel: () => void; onSubmit: () => void }) {
  return <div><h2 className="m-0 text-[46px] font-normal leading-tight text-black max-md:text-3xl">Edit profile</h2><form className="mt-14 max-w-[850px] space-y-6" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
    <label className="block text-base">First name<input className="mt-3 h-14 w-full border border-[#d1d1d1] bg-gray-50 px-4 text-gray-600 outline-none focus:border-black" name="firstName" defaultValue={profile?.firstName || ''} /></label>
    <label className="block text-base">Last name<input className="mt-3 h-14 w-full border border-[#d1d1d1] bg-gray-50 px-4 text-gray-600 outline-none focus:border-black" name="lastName" defaultValue={profile?.lastName || ''} /></label>
    <label className="block text-base">Email<input className="mt-3 h-14 w-full border border-[#d1d1d1] bg-gray-50 px-4 text-gray-600 outline-none focus:border-black" name="email" type="email" defaultValue={profile?.email || ''} /></label>
    <label className="flex items-center gap-3 text-base"><input className="h-4 w-4 accent-black" name="emailSubscription" type="checkbox" />Subscribe to email marketing</label>
    <div className="flex gap-2"><button type="submit" className="bg-black px-8 py-4 text-sm font-semibold text-white">Submit</button><button type="button" onClick={onCancel} className="border border-black bg-white px-8 py-4 text-sm font-semibold text-black">Cancel</button></div>
  </form></div>;
}

function EmptyPanel({ title, message, detail }: { title: string; message: string; detail?: string }) { return <div><h2 className="m-0 text-[46px] font-normal leading-tight text-black max-md:text-3xl">{title}</h2><div className="flex min-h-[300px] flex-col items-center justify-center text-center"><h3 className="m-0 text-lg font-bold">{message}</h3>{detail && <p className="mt-5 text-base text-gray-500">{detail}</p>}</div></div>; }

function AddressPanel() { return <div><h2 className="m-0 text-[46px] font-normal leading-tight text-black max-md:text-3xl">Addresses</h2><button type="button" className="mt-14 flex h-[315px] w-[300px] flex-col items-center justify-center border border-[#dedede] bg-white text-base shadow-md hover:border-black"><MapPin className="h-10 w-10" strokeWidth={1.5} /><span className="mt-8">Add new address</span><span className="mt-5 text-6xl font-extralight leading-none text-gray-100">+</span></button></div>; }

function PasswordPanel() { return <div><h2 className="m-0 text-[46px] font-normal leading-tight text-black max-md:text-3xl">Change password</h2><form className="mt-14 max-w-[850px] space-y-6"><label className="block text-base">New password<input className="mt-3 h-14 w-full border border-[#d1d1d1] bg-gray-50 px-4 outline-none focus:border-black" type="password" /></label><label className="block text-base">Confirm new password<input className="mt-3 h-14 w-full border border-[#d1d1d1] bg-gray-50 px-4 outline-none focus:border-black" type="password" /></label><button type="submit" className="bg-black px-8 py-4 text-sm font-semibold text-white">Submit</button></form></div>; }