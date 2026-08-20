'use client';

import { useActionState, useState } from 'react';
import { createCustomer, loginCustomer } from '@/lib/customer-actions';

interface ActionState {
  error?: string;
  success?: boolean;
}

const initialState: ActionState = {};

export default function AccountAuth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loginState, loginAction, loginPending] = useActionState(loginCustomer, initialState);
  const [signupState, signupAction, signupPending] = useActionState(createCustomer, initialState);
  const state = mode === 'login' ? loginState : signupState;

  return (
    <section className="w-full max-w-[520px] border border-[#dedede] bg-white px-8 py-10 max-md:px-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#195f3d]">My account</p>
      <h1 className="m-0 text-[30px] font-bold italic text-[#172b3d]">{mode === 'login' ? 'Log in' : 'Create an account'}</h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">Use your Shopify customer account email and password.</p>
      <div className="mt-7 grid grid-cols-2 border-b border-[#dedede]">
        {(['login', 'signup'] as const).map((tab) => <button className={`border-0 border-b-2 bg-transparent py-3 text-sm font-bold ${mode === tab ? 'border-[#195f3d] text-[#195f3d]' : 'border-transparent text-gray-500'}`} type="button" key={tab} onClick={() => setMode(tab)}>{tab === 'login' ? 'Log in' : 'Sign up'}</button>)}
      </div>
      {state.error && <p className="mt-5 border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700" role="alert">{state.error}</p>}
      {state.success && <p className="mt-5 border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-700" role="status">You are signed in.</p>}
      {mode === 'login' ? <LoginForm action={loginAction} pending={loginPending} /> : <SignupForm action={signupAction} pending={signupPending} />}
    </section>
  );
}

function LoginForm({ action, pending }: { action: (formData: FormData) => void; pending: boolean }) {
  return <form className="mt-6 space-y-4" action={action}>
    <Field id="login-email" name="email" label="Email address" type="email" autoComplete="email" />
    <Field id="login-password" name="password" label="Password" type="password" autoComplete="current-password" />
    <SubmitButton pending={pending} label="Log in" />
  </form>;
}

function SignupForm({ action, pending }: { action: (formData: FormData) => void; pending: boolean }) {
  return <form className="mt-6 space-y-4" action={action}>
    <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1"><Field id="first-name" name="firstName" label="First name" autoComplete="given-name" /><Field id="last-name" name="lastName" label="Last name" autoComplete="family-name" /></div>
    <Field id="signup-phone" name="phone" label="Phone number" type="tel" autoComplete="tel" />
    <Field id="signup-email" name="email" label="Email address" type="email" autoComplete="email" />
    <Field id="signup-password" name="password" label="Password" type="password" autoComplete="new-password" />
    <SubmitButton pending={pending} label="Create account" />
  </form>;
}

function Field({ id, name, label, type = 'text', autoComplete }: { id: string; name: string; label: string; type?: string; autoComplete?: string }) {
  return <label className="block text-sm font-semibold text-[#263b4d]" htmlFor={id}>{label}<input className="mt-2 h-12 w-full border border-[#cfd5d8] px-3 text-sm font-normal outline-none focus:border-[#195f3d]" id={id} name={name} type={type} autoComplete={autoComplete} required /></label>;
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return <button className="h-12 w-full cursor-pointer border-0 bg-[#195f3d] text-sm font-bold text-[#f5c400] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={pending}>{pending ? 'Please wait...' : label}</button>;
}
