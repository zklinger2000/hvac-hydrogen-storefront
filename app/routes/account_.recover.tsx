import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from '@shopify/remix-oxygen';
import {Form, Link, useActionData} from '@remix-run/react';
import TextInput from '~/components/TextInput';
import Button from '~/components/Button';

type ActionResponse = {
  error?: string;
  resetRequested?: boolean;
};

export async function loader({context}: LoaderFunctionArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');
  if (customerAccessToken) {
    return redirect('/account');
  }

  return json({});
}

export async function action({request, context}: ActionFunctionArgs) {
  const {storefront} = context;
  const form = await request.formData();
  const email = form.has('email') ? String(form.get('email')) : null;

  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  try {
    if (!email) {
      throw new Error('Please provide an email.');
    }
    await storefront.mutate(CUSTOMER_RECOVER_MUTATION, {
      variables: {email},
    });

    return json({resetRequested: true});
  } catch (error: unknown) {
    const resetRequested = false;
    if (error instanceof Error) {
      return json({error: error.message, resetRequested}, {status: 400});
    }
    return json({error, resetRequested}, {status: 400});
  }
}

export default function Recover() {
  const action = useActionData<ActionResponse>();

  return (
    <div className="content-grid mb-8 pb-16 bg-base-100">
      <div>
        {action?.resetRequested ? (
          <>
            <h1 className="text-xl mt-8 mb-4 font-bold">Request Sent</h1>
            <p className="prose">
              If that email address is in our system, you will receive an email
              with instructions about how to reset your password in a few
              minutes.
            </p>
            <br />
            <Link
              className="text-md text-primary my-8 hover:underline"
              to="/account/login"
            >
              Return to Login
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-xl mt-8 mb-4 font-bold">Forgot Password</h1>
            <p className="prose">
              Enter the email address associated with your account to receive a
              link to reset your password.
            </p>
            <br />
            <Form method="POST">
              <fieldset>
                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  label="Email address"
                  ariaLabel="Email address"
                  autoFocus
                  required
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
                Request Reset Link
              </Button>
            </Form>
            <div>
              <br />
              <p>
                <Link
                  className="text-md text-primary my-8 hover:underline"
                  to="/account/login"
                >
                  Login →
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/mutations/customerrecover
const CUSTOMER_RECOVER_MUTATION = `#graphql
  mutation customerRecover(
    $email: String!,
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;
