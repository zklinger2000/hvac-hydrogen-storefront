import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {Form, useActionData, type MetaFunction} from '@remix-run/react';
import Button from '~/components/Button';

type ActionResponse = {
  error: string | null;
};

export const meta: MetaFunction = () => {
  return [{title: 'Activate Account'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  if (await context.session.get('customerAccessToken')) {
    return redirect('/account');
  }
  return json({});
}

export async function action({request, context, params}: ActionFunctionArgs) {
  const {session, storefront} = context;
  const {id, activationToken} = params;

  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  try {
    if (!id || !activationToken) {
      throw new Error('Missing token. The link you followed might be wrong.');
    }

    const form = await request.formData();
    const password = form.has('password') ? String(form.get('password')) : null;
    const passwordConfirm = form.has('passwordConfirm')
      ? String(form.get('passwordConfirm'))
      : null;

    const validPasswords =
      password && passwordConfirm && password === passwordConfirm;

    if (!validPasswords) {
      throw new Error('Passwords do not match');
    }

    const {customerActivate} = await storefront.mutate(
      CUSTOMER_ACTIVATE_MUTATION,
      {
        variables: {
          id: `gid://shopify/Customer/${id}`,
          input: {
            password,
            activationToken,
          },
        },
      },
    );

    if (customerActivate?.customerUserErrors?.length) {
      throw new Error(customerActivate.customerUserErrors[0].message);
    }

    const {customerAccessToken} = customerActivate ?? {};
    if (!customerAccessToken) {
      throw new Error('Could not activate account.');
    }
    session.set('customerAccessToken', customerAccessToken);

    return redirect('/account', {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return json({error: error.message}, {status: 400});
    }
    return json({error}, {status: 400});
  }
}

export default function Activate() {
  const action = useActionData<ActionResponse>();
  const error = action?.error ?? null;

  return (
    <div className="content-grid mb-8 pb-16 bg-base-100">
      <h1 className="text-xl mt-8 mb-4 font-bold">Activate Account</h1>
      <p className="prose">Create your password to activate your account.</p>
      <Form method="POST">
        <fieldset>
          <label className="form-control w-full max-w-xs" htmlFor="password">
            <div className="label">
              <span className="label-text">Password</span>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              aria-label="Password"
              autoComplete="current-password"
              minLength={8}
              required
            />
          </label>
          <label
            className="form-control w-full max-w-xs"
            htmlFor="passwordConfirm"
          >
            <div className="label">
              <span className="label-text">Re-enter password</span>
            </div>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              aria-label="Re-enter password"
              autoComplete="current-password"
              minLength={8}
              required
            />
          </label>
        </fieldset>
        {error ? (
          <p>
            <mark>
              <small>{error}</small>
            </mark>
          </p>
        ) : (
          <br />
        )}
        <Button className="btn-primary" type="submit">
          Save
        </Button>
      </Form>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/mutations/customeractivate
const CUSTOMER_ACTIVATE_MUTATION = `#graphql
  mutation customerActivate(
    $id: ID!,
    $input: CustomerActivateInput!,
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customerActivate(id: $id, input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;
