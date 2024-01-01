import React, {useState} from 'react';
import {useLoaderData, Link, NavLink} from '@remix-run/react';
import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Pagination, getPaginationVariables, Image} from '@shopify/hydrogen';
import type {CollectionFragment} from 'storefrontapi.generated';
import Collapse from '~/components/Collapse';
import {FiFolder, FiHome} from 'react-icons/fi';

export async function loader({context, request}: LoaderFunctionArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 4,
  });

  const {collections} = await context.storefront.query(COLLECTIONS_QUERY, {
    variables: paginationVariables,
  });

  return json({collections});
}

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();
  const [selectedOption, setSelectedOption] = useState('option1');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('CLICK', event.target.value);
    setSelectedOption(event.target.value);
  };

  return (
    <div className="content-grid">
      {/* Breadcrumbs */}
      <div className="text-sm breadcrumbs">
        <ul>
          <li>
            <NavLink to="/">
              <FiHome className="mr-2" />
              Home
            </NavLink>
          </li>
          <li>
            <FiFolder className="mr-2" />
            Collections
          </li>
        </ul>
      </div>

      {/* <div className="bg-warning full-width content-grid">
        <h1 className="bg-secondary breakout">Collections</h1>
      </div> */}

      <Pagination connection={collections}>
        {({nodes, isLoading, PreviousLink, NextLink}) => (
          <div>
            <PreviousLink>
              {isLoading ? (
                'Loading...'
              ) : (
                <button className="btn btn-success my-4">
                  ↑ Load previous
                </button>
              )}
            </PreviousLink>
            <CollectionsGrid collections={nodes} />
            <NextLink>
              {isLoading ? (
                'Loading...'
              ) : (
                <button className="btn btn-success my-4">Load more ↓</button>
              )}
            </NextLink>
          </div>
        )}
      </Pagination>
    </div>
  );
}

function CollectionsGrid({collections}: {collections: CollectionFragment[]}) {
  return (
    <div className="flex flex-col gap-8">
      {collections.map((collection, index) => (
        <CollectionItem
          key={collection.id}
          collection={collection}
          index={index}
        />
      ))}
    </div>
  );
}

function CollectionItem({
  collection,
  index,
}: {
  collection: CollectionFragment;
  index: number;
}) {
  return (
    <Link
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
      className="drop-shadow-md hover:underline"
    >
      <h5 className="text-lg font-bold uppercase my-4">{collection.title}</h5>
      {collection?.image && (
        <Image
          alt={collection.image.altText || collection.title}
          aspectRatio="1/1"
          data={collection.image}
          loading={index < 3 ? 'eager' : undefined}
        />
      )}
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;
