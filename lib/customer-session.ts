import { cookies } from 'next/headers';

export const customerSessionCookie = 'urbanplant-customer-token';

const customerQuery = `
	query GetCustomer($customerAccessToken: String!) {
		customer(customerAccessToken: $customerAccessToken) {
			firstName
			lastName
			email
		}
	}
`;

const accountQuery = `
	query GetAccount($customerAccessToken: String!) {
		customer(customerAccessToken: $customerAccessToken) {
			firstName
			lastName
			email
			acceptsMarketing
			addresses(first: 20) {
				edges { node { id firstName lastName company address1 address2 city province country zip phone } }
			}
			orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
				edges {
				node {
					id
					name
					processedAt
					totalPrice { amount currencyCode }
					lineItems(first: 20) { edges { node { title quantity variant { id product { id title handle } } } } }
				}
			}
			}
		}
	}
`;

interface CustomerResponse {
	data?: { customer: CustomerProfile | null };
}

export interface CustomerProfile {
	firstName: string | null;
	lastName: string | null;
	email: string;
}

export interface CustomerAddress {
	id: string;
	firstName: string | null;
	lastName: string | null;
	company: string | null;
	address1: string | null;
	address2: string | null;
	city: string | null;
	province: string | null;
	country: string;
	zip: string | null;
	phone: string | null;
}

export interface CustomerOrder {
	id: string;
	name: string;
	processedAt: string;
	totalPrice: { amount: string; currencyCode: string };
	lineItems: { edges: { node: { title: string; quantity: number; variant: { id: string; product: { id: string; title: string; handle: string } | null } | null } }[] };
}

export interface CustomerAccount extends CustomerProfile {
	acceptsMarketing: boolean;
	addresses: { edges: { node: CustomerAddress }[] };
	orders: { edges: { node: CustomerOrder }[] };
}

interface AccountResponse {
	data?: { customer: CustomerAccount | null };
}

export async function getCustomerProfile(): Promise<CustomerProfile | null> {
	const token = (await cookies()).get(customerSessionCookie)?.value;
	const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
	const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
	if (!token || !domain || !storefrontAccessToken) return null;

	const response = await fetch(`https://${domain}/api/2026-04/graphql.json`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
			'Shopify-Customer-Access-Token': token,
		},
		body: JSON.stringify({ query: customerQuery, variables: { customerAccessToken: token } }),
		cache: 'no-store',
	});
	const result = await response.json() as CustomerResponse;
	const customer = result.data?.customer;
	if (!customer) return null;

	return customer;
}

export async function getCustomerAccount(): Promise<CustomerAccount | null> {
	const token = (await cookies()).get(customerSessionCookie)?.value;
	const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
	const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
	if (!token || !domain || !storefrontAccessToken) return null;

	const response = await fetch(`https://${domain}/api/2026-04/graphql.json`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': storefrontAccessToken },
		body: JSON.stringify({ query: accountQuery, variables: { customerAccessToken: token } }),
		cache: 'no-store',
	});
	const result = await response.json() as AccountResponse;
	return result.data?.customer || null;
}

export async function getCustomerName() {
	const customer = await getCustomerProfile();
	return customer ? [customer.firstName, customer.lastName].filter(Boolean).join(' ') || null : null;
}
