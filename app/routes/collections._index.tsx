import React, {useState} from 'react';
import {useLoaderData, Link, NavLink} from '@remix-run/react';
import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Pagination, getPaginationVariables, Image} from '@shopify/hydrogen';
import type {CollectionFragment} from 'storefrontapi.generated';
import Collapse from '~/components/Collapse';
import {FiFolder, FiHome} from 'react-icons/fi';

export async function loader({context, request}: LoaderFunctionArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 10,
  });

  const {collections} = await context.storefront.query(COLLECTIONS_QUERY, {
    variables: paginationVariables,
  });
  const filteredCollections = collections.nodes.filter(
    (c) => !c.handle.startsWith('ad-'),
  );

  return json({collections: {...collections, nodes: filteredCollections}});
}

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();
  const [selectedOption, setSelectedOption] = useState('option1');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('CLICK', event.target.value);
    setSelectedOption(event.target.value);
  };

  return (
    <>
      <div className="relative z-10">
        <div className="w-full fixed bg-base-100 drop-shadow-md">
          {/* Breadcrumbs */}
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
                  <FiFolder className="mr-2" />
                  Collections
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
      <div className="content-grid bg-base-100">
        <Pagination connection={collections}>
          {({nodes, isLoading, PreviousLink, NextLink}) => (
            <div className="mt-16">
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
        <div className="h-16" />
      </div>
    </>
  );
}

function CollectionsGrid({collections}: {collections: CollectionFragment[]}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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
    >
      <div className="card lg:card-side bg-base-100 shadow-xl">
        <figure className="lg:max-w-32">
          {collection?.image && (
            <Image
              alt={collection.image.altText || collection.title}
              aspectRatio="1/1"
              data={collection.image}
              loading={index < 3 ? 'eager' : undefined}
              className="drop-shadow-md"
            />
          )}
        </figure>
        <div className="card-body">
          <h2 className="card-title">{collection.title}</h2>
          <div className="grid w-full">
            <p className="h-8 truncate ...">
              {collection.description && collection.description.slice(0, 100)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    description
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
