'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { customerSessionCookie } from '@/lib/customer-session';

type ActionResult = { error?: string; success?: boolean };

interface ShopifyResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

interface CustomerAccessTokenData {
  customerAccessTokenCreate: {
    customerAccessToken: { accessToken: string; expiresAt: string } | null;
    customerUserErrors: { message: string }[];
  };
}

interface CustomerCreateData {
  customerCreate: {
    customer: { id: string } | null;
    customerUserErrors: { message: string }[];
  };
}

const accessTokenMutation = `
  mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { message }
    }
  }
`;

const customerCreateMutation = `
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id }
      customerUserErrors { message }
    }
  }
`;

async function shopifyMutation<T>(query: string, variables: Record<string, unknown>) {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!domain || !storefrontAccessToken) throw new Error('Shopify credentials are not configured.');

  const response = await fetch(`https://${domain}/api/2026-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });
  const result = await response.json() as ShopifyResponse<T>;
  if (!response.ok || result.errors?.length || !result.data) throw new Error(result.errors?.[0]?.message || 'Shopify request failed.');
  return result.data;
}

async function signIn(email: string, password: string): Promise<ActionResult> {
  const result = await shopifyMutation<CustomerAccessTokenData>(accessTokenMutation, {
    input: { email, password },
  });
  const payload = result.customerAccessTokenCreate;
  if (!payload.customerAccessToken) return { error: payload.customerUserErrors[0]?.message || 'Email or password is incorrect.' };

  const expiresAt = new Date(payload.customerAccessToken.expiresAt);
  (await cookies()).set(customerSessionCookie, payload.customerAccessToken.accessToken, {
    httpOnly: true,
    expires: expiresAt,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return { success: true };
}

export async function loginCustomer(_previousState: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  if (!email || !password) return { error: 'Enter your email and password.' };

  let result: ActionResult;
  try {
    result = await signIn(email, password);
  } catch (error) {
    console.error('Shopify customer login failed:', error);
    return { error: error instanceof Error ? error.message : 'Unable to sign in right now.' };
  }
  if (result.success) redirect('/');
  return result;
}

export async function createCustomer(_previousState: ActionResult, formData: FormData): Promise<ActionResult> {
  const firstName = String(formData.get('firstName') || '').trim();
  const lastName = String(formData.get('lastName') || '').trim();
  const countryCode = String(formData.get('countryCode') || '').trim();
  const phoneNumber = String(formData.get('phone') || '').replace(/\D/g, '');
  const phone = `${countryCode}${phoneNumber}`;
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  if (!firstName || !lastName || !countryCode || phoneNumber.length < 7 || !email || !password) return { error: 'Enter a valid phone number and complete all fields to create your account.' };
  if (password.length < 5) return { error: 'Your password must be at least 5 characters.' };

  try {
    const result = await shopifyMutation<CustomerCreateData>(customerCreateMutation, {
      input: { firstName, lastName, phone, email, password },
    });
    const payload = result.customerCreate;
    if (!payload.customer) return { error: payload.customerUserErrors[0]?.message || 'Unable to create your Shopify account.' };
  } catch (error) {
    console.error('Shopify customer signup failed:', error);
    return { error: error instanceof Error ? error.message : 'Unable to create your account right now.' };
  }

  let signInResult: ActionResult;
  try {
    signInResult = await signIn(email, password);
  } catch (error) {
    console.error('Shopify customer signup sign-in failed:', error);
    return { error: error instanceof Error ? error.message : 'Unable to sign in after creating your account.' };
  }
  if (signInResult.success) redirect('/');
  return signInResult;
}
