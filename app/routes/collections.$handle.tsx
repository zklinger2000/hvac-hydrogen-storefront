import {json, redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {
  useLoaderData,
  Link,
  type MetaFunction,
  NavLink,
} from '@remix-run/react';
import {
  Pagination,
  getPaginationVariables,
  Image,
  Money,
} from '@shopify/hydrogen';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {useVariantUrl} from '~/utils';
import {FiFolder, FiHome, FiList} from 'react-icons/fi';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {title: `PG HVAC Parts | ${data?.collection.title ?? ''} Collection`},
  ];
};

export async function loader({request, params, context}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  if (!handle) {
    return redirect('/collections');
  }

  const {collection} = await storefront.query(COLLECTION_QUERY, {
    variables: {handle, ...paginationVariables},
  });

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }
  return json({collection});
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();

  return (
    <div className="content-grid mb-8 bg-base-100">
      {/* Breadcrumbs */}
      <div className="w-full fixed bg-base-100 drop-shadow-md">
        <nav className="content-grid">
          <div className="text-sm breadcrumbs">
            <ul>
              <li>
                <NavLink to="/">
                  <FiHome className="mr-2" />
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/collections">
                  <FiFolder className="mr-2" />
                  Collections
                </NavLink>
              </li>
              <li>{collection.title}</li>
            </ul>
          </div>
        </nav>
      </div>
      <h1 className="text-4xl mt-16 mb-6 font-bold uppercase">
        {collection.title}
      </h1>
      <div className="badge badge-neutral p-3 mb-4">
        Number of products: {collection.products.nodes.length}
      </div>
      <p className="prose mb-8">{collection.description}</p>
      <Pagination connection={collection.products}>
        {({nodes, isLoading, PreviousLink, NextLink}) => (
          <>
            <PreviousLink>
              {isLoading ? (
                'Loading...'
              ) : (
                <button className="btn btn-success my-4">
                  ↑ Load previous
                </button>
              )}
            </PreviousLink>
            <ProductsGrid products={nodes} />
            <br />
            <NextLink>
              {isLoading ? (
                'Loading...'
              ) : (
                <button className="btn btn-success my-4">Load more ↓</button>
              )}
            </NextLink>
          </>
        )}
      </Pagination>
      <div className="h-8" />
    </div>
  );
}

function ProductsGrid({products}: {products: ProductItemFragment[]}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
      {products.map((product, index) => {
        return (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : undefined}
          />
        );
      })}
    </div>
  );
}

function ProductItem({
  product,
  loading,
}: {
  product: ProductItemFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variant = product.variants.nodes[0];
  const variantUrl = useVariantUrl(product.handle, variant.selectedOptions);
  return (
    <Link className="" key={product.id} prefetch="intent" to={variantUrl}>
      <div className="card lg:card-side bg-base-100 shadow-xl">
        <figure className="lg:max-w-32">
          {product.featuredImage && (
            <Image
              alt={product.featuredImage.altText || product.title}
              aspectRatio="1/1"
              data={product.featuredImage}
              loading={loading}
              sizes="(min-width: 45em) 400px, 100vw"
              className="drop-shadow-md"
            />
          )}
        </figure>
        <div className="card-body">
          <h2 className="card-title">{product.title}</h2>
          <div className="grid w-full">
            <p className="h-8 truncate ...">
              {product.description && product.description.slice(0, 100)}
            </p>
          </div>
          <div className="card-actions justify-end">
            <div className="text-2xl font-bold">
              <Money data={product.priceRange.minVariantPrice} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    description
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    variants(first: 1) {
      nodes {
        selectedOptions {
          name
          value
        }
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
