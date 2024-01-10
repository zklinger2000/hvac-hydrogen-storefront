import {Await, NavLink} from '@remix-run/react';
import {Suspense} from 'react';
import {FiMenu, FiSearch, FiShoppingCart, FiUser} from 'react-icons/fi';
import Logo from './Logo';
import type {HeaderQuery} from 'storefrontapi.generated';
import type {LayoutProps} from './Layout';
import {useRootLoaderData} from '~/root';
import clsx from 'clsx';

type HeaderProps = Pick<LayoutProps, 'header' | 'cart' | 'isLoggedIn'>;

type Viewport = 'desktop' | 'mobile';

export function Header({header, isLoggedIn, cart}: HeaderProps) {
  const {shop, menu} = header;
  return (
    <header className="navbar bg-primary text-base-300 h-[--header-height] sticky top-0 z-10">
      <div className="max-w-[900px] w-full mx-auto">
        <div className="navbar-start">
          <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
            <div className="flex items-center gap-2">
              <Logo size="sm" outline={true} />
              <strong>HVAC Parts</strong>
            </div>
          </NavLink>
        </div>
        <div className="navbar-center">
          <HeaderMenu
            menu={menu}
            viewport="desktop"
            primaryDomainUrl={header.shop.primaryDomain.url}
          />
        </div>
        <div className="navbar-end">
          <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
        </div>
      </div>
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
  viewport: Viewport;
}) {
  const {publicStoreDomain} = useRootLoaderData();
  const className = `header-menu-${viewport}`;

  function closeAside(event: React.MouseEvent<HTMLAnchorElement>) {
    if (viewport === 'mobile') {
      event.preventDefault();
      window.location.href = event.currentTarget.href;
    }
  }

  return (
    <nav className={clsx(className, 'text-base-300')} role="navigation">
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="cursor-pointer hover:text-base-100"
            end
            key={item.id}
            onClick={closeAside}
            prefetch="intent"
            // style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="flex justify-end gap-4 w-full" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account">
        <div className="text-2xl text-base-300 hover:text-base-100 justify-center flex items-center w-8 h-8">
          {isLoggedIn ? (
            <FiUser className="w-5 h-5" />
          ) : (
            <FiUser className="w-5 h-5" />
          )}
        </div>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  return (
    <a className="md:hidden mx-4 text-secondary" href="#mobile-menu-aside">
      <div className="text-2xl justify-center border border-base-300 flex items-center w-8 h-8 rounded-md">
        <FiMenu />
      </div>
    </a>
  );
}

function SearchToggle() {
  return (
    <a href="#search-aside">
      <div className="text-2xl justify-center flex items-center w-8 h-8 hover:text-base-100">
        <FiSearch className="h-5 w-5" />
      </div>
    </a>
  );
}

function CartBadge({count}: {count: number}) {
  return (
    <a className="mr-4" href="#cart-aside">
      <div className="indicator">
        {count ? (
          <span className="indicator-item badge badge-accent outline">
            {count}
          </span>
        ) : null}
        <div className="text-2xl justify-center flex items-center w-8 h-8 hover:text-base-100">
          <FiShoppingCart className="w-5 h-5" />
        </div>
      </div>
    </a>
  );
  <a href="#cart-aside">Cart {count}</a>;
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        {(cart) => {
          if (!cart) return <CartBadge count={0} />;
          return <CartBadge count={cart.totalQuantity || 0} />;
        }}
      </Await>
    </Suspense>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
