// lib/queries.ts

export const getProductsQuery = `
  query GetProducts {
    products(first: 10) {
      edges {
        node {
          id
          title
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

export const getNewArrivalProductsQuery = `
  query GetNewArrivalProducts {
    products(first: 4, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          handle
          priceRange { minVariantPrice { amount currencyCode } }
          compareAtPriceRange { minVariantPrice { amount currencyCode } }
          variants(first: 10) {
            edges {
              node {
                id
                title
                availableForSale
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
              }
            }
          }
          images(first: 1) { edges { node { url altText } } }
        }
      }
    }
  }
`;

export const getNavigationQuery = `
  query GetNavigation {
    collections(first: 50, sortKey: TITLE) {
      edges {
        node {
          id
          title
          handle
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

export const getCollectionQuery = `
  query GetCollection($handle: String!) {
    collection(handle: $handle) {
      id
      title
      description
      products(first: 50) {
        edges {
          node {
            id
            title
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                  selectedOptions { name value }
                }
              }
            }
            images(first: 6) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
          }
        }
        filters {
          id
          label
          type
          values { id label count input }
        }
      }
    }
  }
`;

export const getBestSellerProductsQuery = `
  query GetBestSellerProducts {
    products(first: 4, sortKey: BEST_SELLING) {
      edges {
        node {
          id
          title
          handle
          priceRange { minVariantPrice { amount currencyCode } }
          compareAtPriceRange { minVariantPrice { amount currencyCode } }
          variants(first: 10) {
            edges {
              node {
                id
                title
                availableForSale
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
              }
            }
          }
          images(first: 1) { edges { node { url altText } } }
        }
      }
    }
  }
`;