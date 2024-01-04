import clsx from 'clsx';

export default function Logo({
  size,
  outline,
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl' | undefined;
  outline?: boolean;
}) {
  const source = {
    sm: '/pg-hvac-parts_logo_48x48.png',
    md: '/pg-hvac-parts_logo_256x256.png',
    lg: '/pg-hvac-parts_logo_512x512.png',
    xl: '/pg-hvac-parts_logo_512x512.png',
  };

  return (
    <div
      className={clsx('relative flex items-center justify-center', {
        'h-[30px] w-[30px]': size === 'sm',
        'h-32 w-32': size === 'xl',
        'border border-base-100 rounded-full': outline,
      })}
    >
      <img
        src={source[size || 'md']}
        alt="logo"
        sizes="(min-width: 200px) 50vw, 100vw"
        style={{
          objectFit: 'cover',
        }}
      />
    </div>
  );
}
