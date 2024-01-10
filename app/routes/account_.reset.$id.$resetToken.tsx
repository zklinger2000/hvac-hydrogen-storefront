import {type ActionFunctionArgs, json, redirect} from '@shopify/remix-oxygen';
import {Form, useActionData, type MetaFunction, Link} from '@remix-run/react';
import TextInput from '~/components/TextInput';
import Button from '~/components/Button';

type ActionResponse = {
  error: string | null;
};

export const meta: MetaFunction = () => {
  return [{title: 'Reset Password'}];
};

export async function action({request, context, params}: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }
  const {id, resetToken} = params;
  const {session, storefront} = context;

  try {
    if (!id || !resetToken) {
      throw new Error('customer token or id not found');
    }

    const form = await request.formData();
    const password = form.has('password') ? String(form.get('password')) : '';
    const passwordConfirm = form.has('passwordConfirm')
      ? String(form.get('passwordConfirm'))
      : '';
    const validInputs = Boolean(password && passwordConfirm);
    if (validInputs && password !== passwordConfirm) {
      throw new Error('Please provide matching passwords');
    }

    const {customerReset} = await storefront.mutate(CUSTOMER_RESET_MUTATION, {
      variables: {
        id: `gid://shopify/Customer/${id}`,
        input: {password, resetToken},
      },
    });

    if (customerReset?.customerUserErrors?.length) {
      throw new Error(customerReset?.customerUserErrors[0].message);
    }

    if (!customerReset?.customerAccessToken) {
      throw new Error('Access token not found. Please try again.');
    }
    session.set('customerAccessToken', customerReset.customerAccessToken);

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

export default function Reset() {
  const action = useActionData<ActionResponse>();

  return (
    <div className="content-grid mb-8 pb-16 bg-base-100">
      <h1 className="text-xl mt-8 mb-4 font-bold">Reset Password</h1>
      <p className="prose">Enter a new password for your account.</p>
      <Form method="POST">
        <fieldset>
          <TextInput
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={8}
            required
            ariaLabel="Password"
            label="Password"
          />
          <TextInput
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            autoComplete="current-password"
            minLength={8}
            required
            ariaLabel="Re-enter password"
            label="Re-enter password"
          />
        </fieldset>
        {action?.error ? (
          <p>
            <mark>
              <small>{action.error}</small>
            </mark>
          </p>
        ) : (
          <br />
        )}
        <Button className="btn-primary" type="submit">
          Reset
        </Button>
      </Form>
      <br />
      <p className="my-8">
        <Link
          className="text-md text-primary hover:underline"
          to="/account/login"
        >
          Back to login →
        </Link>
      </p>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/mutations/customerreset
const CUSTOMER_RESET_MUTATION = `#graphql
  mutation customerReset(
    $id: ID!,
    $input: CustomerResetInput!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customerReset(id: $id, input: $input) {
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
