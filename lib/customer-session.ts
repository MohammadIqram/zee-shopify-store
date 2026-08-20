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

interface CustomerResponse {
	data?: { customer: CustomerProfile | null };
}

export interface CustomerProfile {
	firstName: string | null;
	lastName: string | null;
	email: string;
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

export async function getCustomerName() {
	const customer = await getCustomerProfile();
	return customer ? [customer.firstName, customer.lastName].filter(Boolean).join(' ') || null : null;
}
