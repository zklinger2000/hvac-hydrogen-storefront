import {NavLink, useLocation} from '@remix-run/react';
import {FiSearch} from 'react-icons/fi';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {useRootLoaderData} from '~/root';

export function Footer({
  menu,
  shop,
}: FooterQuery & {shop: HeaderQuery['shop']}) {
  const currentYear = new Date().getFullYear();
  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : '');
  const copyrightName = 'Prairie Group, LLC';

  return (
    <footer className="bg-neutral text-base-300">
      {menu && shop?.primaryDomain?.url && (
        <FooterMenu menu={menu} primaryDomainUrl={shop.primaryDomain.url} />
      )}
      <div className="border-t border-white py-6 text-sm">
        <Policies />
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-1 px-4 min-[1320px]:px-0">
          <p>
            &copy; {copyrightDate} {copyrightName}
            {copyrightName.length && !copyrightName.endsWith('.')
              ? '.'
              : ''}{' '}
            All rights reserved.
          </p>
          <p>Built in Nebraska</p>
          <p>
            <a href="https://prairiegroup.us/tech">
              Powered by Prairie Group Tech
            </a>
          </p>
          <p className="w-full text-right text-xs text-slate-500">0.1.7</p>
        </div>
      </div>
    </footer>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
}) {
  const {publicStoreDomain} = useRootLoaderData();

  const nonShopifyMenuItems = [
    {
      title: 'Circuit Breakers',
      url: '/collections/circuit-breakers',
    },
    {
      title: 'Motors',
      url: '/collections/motors',
    },
    {
      title: 'Actuators',
      url: '/collections/actuators',
    },
    {
      title: 'Control Boards',
      url: '/collections/control-boards',
    },
    {
      title: 'About Us',
      url: '/about',
    },
    {
      title: 'Contact',
      url: '/pages/contact',
    },
  ];

  return (
    <nav className="content-grid" role="navigation">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 sm:text-center gap-4 my-8">
        {nonShopifyMenuItems
          ? nonShopifyMenuItems.map((link) => (
              <NavLink
                className="font-squada text-2xl px-4 border-b sm:border-0 uppercase hover:underline hover:text-base-100"
                key={link.url}
                end
                prefetch="intent"
                to={link.url}
              >
                {link.title}
              </NavLink>
            ))
          : null}
        {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
          if (!item.url) return null;
          // if the url is internal, we strip the domain
          const url =
            item.url.includes('myshopify.com') ||
            item.url.includes(publicStoreDomain) ||
            item.url.includes(primaryDomainUrl)
              ? new URL(item.url).pathname
              : item.url;
          const isExternal = !url.startsWith('/');
          return isExternal ? (
            <a
              href={url}
              key={item.id}
              rel="noopener noreferrer"
              target="_blank"
            >
              {item.title}
            </a>
          ) : (
            <NavLink
              end
              key={item.id}
              prefetch="intent"
              to={url}
              className="font-squada text-2xl px-4 border-b sm:border-0 uppercase hover:underline hover:text-base-100"
            >
              {item.title}
            </NavLink>
          );
        })}
        <a href="#search-aside">
          <div className="flex items-center justify-center">
            <div className="font-squada text-2xl px-4 uppercase hover:underline hover:text-base-100">
              Search
            </div>
            <FiSearch className="h-5 w-5" />
          </div>
        </a>
      </div>
    </nav>
  );
}

function Policies() {
  return (
    <div className="content-grid">
      <div className="flex justify-center gap-8 mb-6">
        <NavLink className="hover:underline" to="/policies/privacy-policy">
          Privacy Policy
        </NavLink>
        <NavLink className="hover:underline" to="/policies/refund-policy">
          Refund Policy
        </NavLink>
        <NavLink className="hover:underline" to="/policies/shipping-policy">
          Shipping Policy
        </NavLink>
        <NavLink className="hover:underline" to="/policies/terms-of-service">
          Terms of Service
        </NavLink>
      </div>
    </div>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};
