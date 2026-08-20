'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { customerSessionCookie } from '@/lib/customer-session';

export type ActionResult = { error?: string; success?: boolean; message?: string };

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

interface CustomerMutationData {
  customerUpdate: {
    customer: { id: string } | null;
    customerUserErrors: { message: string }[];
  };
}

interface AddressMutationData {
  customerAddressCreate?: { customerAddress: { id: string } | null; customerUserErrors: { message: string }[] };
  customerAddressDelete?: { deletedCustomerAddressId: string | null; customerUserErrors: { message: string }[] };
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

const customerUpdateMutation = `
  mutation CustomerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer { id }
      customerUserErrors { message }
    }
  }
`;

const customerAddressCreateMutation = `
  mutation CustomerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress { id }
      customerUserErrors { message }
    }
  }
`;

const customerAddressDeleteMutation = `
  mutation CustomerAddressDelete($customerAccessToken: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
      deletedCustomerAddressId
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

async function customerMutation<T>(query: string, variables: Record<string, unknown>) {
  const token = (await cookies()).get(customerSessionCookie)?.value;
  if (!token) return { error: 'Your customer session has expired. Please sign in again.' } as const;
  try {
    return { data: await shopifyMutation<T>(query, { ...variables, customerAccessToken: token }) } as const;
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Shopify request failed.' } as const;
  }
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

export async function logoutCustomer() {
  (await cookies()).delete(customerSessionCookie);
  redirect('/account');
}

export async function updateCustomerProfile(_previousState: ActionResult, formData: FormData): Promise<ActionResult> {
  const firstName = String(formData.get('firstName') || '').trim();
  const lastName = String(formData.get('lastName') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  if (!firstName || !lastName || !email) return { error: 'Complete your first name, last name, and email.' };

  const result = await customerMutation<CustomerMutationData>(customerUpdateMutation, {
    customer: { firstName, lastName, email, acceptsMarketing: formData.get('emailSubscription') === 'on' },
  });
  if (result.error) return { error: result.error };
  const payload = result.data?.customerUpdate;
  if (!payload?.customer) return { error: payload?.customerUserErrors[0]?.message || 'Unable to update your profile.' };
  return { success: true, message: 'Profile updated.' };
}

export async function updateCustomerPassword(_previousState: ActionResult, formData: FormData): Promise<ActionResult> {
  const password = String(formData.get('password') || '');
  const confirmation = String(formData.get('confirmation') || '');
  if (password.length < 5) return { error: 'Your password must be at least 5 characters.' };
  if (password !== confirmation) return { error: 'Passwords do not match.' };

  const result = await customerMutation<CustomerMutationData>(customerUpdateMutation, { customer: { password } });
  if (result.error) return { error: result.error };
  const payload = result.data?.customerUpdate;
  if (!payload?.customer) return { error: payload?.customerUserErrors[0]?.message || 'Unable to change your password.' };
  return { success: true, message: 'Password updated.' };
}

export async function createCustomerAddress(_previousState: ActionResult, formData: FormData): Promise<ActionResult> {
  const address = {
    firstName: String(formData.get('firstName') || '').trim(),
    lastName: String(formData.get('lastName') || '').trim(),
    company: String(formData.get('company') || '').trim(),
    address1: String(formData.get('address1') || '').trim(),
    address2: String(formData.get('address2') || '').trim(),
    city: String(formData.get('city') || '').trim(),
    province: String(formData.get('province') || '').trim(),
    country: String(formData.get('country') || '').trim(),
    zip: String(formData.get('zip') || '').trim(),
    phone: String(formData.get('phone') || '').trim(),
  };
  if (!address.firstName || !address.lastName || !address.address1 || !address.city || !address.country || !address.zip) return { error: 'Complete the required address fields.' };

  const result = await customerMutation<AddressMutationData>(customerAddressCreateMutation, { address });
  if (result.error) return { error: result.error };
  const payload = result.data?.customerAddressCreate;
  if (!payload?.customerAddress) return { error: payload?.customerUserErrors[0]?.message || 'Unable to add this address.' };
  return { success: true, message: 'Address added.' };
}

export async function deleteCustomerAddress(_previousState: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = String(formData.get('id') || '');
  if (!id) return { error: 'Address not found.' };
  const result = await customerMutation<AddressMutationData>(customerAddressDeleteMutation, { id });
  if (result.error) return { error: result.error };
  const payload = result.data?.customerAddressDelete;
  if (!payload?.deletedCustomerAddressId) return { error: payload?.customerUserErrors[0]?.message || 'Unable to delete this address.' };
  return { success: true, message: 'Address deleted.' };
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
