// lib/shopify.ts

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// Make sure 'export' is here:
export async function shopifyFetch<T>({
  query,
  variables = {},
}: {
  query: string;
  variables?: Record<string, any>;
}): Promise<{ data: T; errors?: any }> {
  const endpoint = `https://${domain}/api/2026-04/graphql.json`;

  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken!,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 60 },
    });

    const body = await result.json();

    if (body.errors) {
      console.error('Full Shopify Error Details:', JSON.stringify(body.errors, null, 2));
      throw new Error(body.errors[0].message);
    }

    return { data: body.data };
  } catch (error) {
    console.error('Error fetching from Shopify:', error);
    throw error;
  }
}