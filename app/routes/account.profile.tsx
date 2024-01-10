import type {CustomerFragment} from 'storefrontapi.generated';
import type {CustomerUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  type MetaFunction,
} from '@remix-run/react';
import Checkbox from '~/components/Checkbox';
import TextInput from '~/components/TextInput';
import Button from '~/components/Button';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

export const meta: MetaFunction = () => {
  return [{title: 'Profile'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');
  if (!customerAccessToken) {
    return redirect('/account/login');
  }
  return json({});
}

export async function action({request, context}: ActionFunctionArgs) {
  const {session, storefront} = context;

  if (request.method !== 'PUT') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();
  const customerAccessToken = await session.get('customerAccessToken');
  if (!customerAccessToken) {
    return json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const password = getPassword(form);
    const customer: CustomerUpdateInput = {};
    const validInputKeys = [
      'firstName',
      'lastName',
      'email',
      'password',
      'phone',
    ] as const;
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as any)) {
        continue;
      }
      if (key === 'acceptsMarketing') {
        customer.acceptsMarketing = value === 'on';
      }
      if (typeof value === 'string' && value.length) {
        customer[key as (typeof validInputKeys)[number]] = value;
      }
    }

    if (password) {
      customer.password = password;
    }

    // update customer and possibly password
    const updated = await storefront.mutate(CUSTOMER_UPDATE_MUTATION, {
      variables: {
        customerAccessToken: customerAccessToken.accessToken,
        customer,
      },
    });

    // check for mutation errors
    if (updated.customerUpdate?.customerUserErrors?.length) {
      return json(
        {error: updated.customerUpdate?.customerUserErrors[0]},
        {status: 400},
      );
    }

    // update session with the updated access token
    if (updated.customerUpdate?.customerAccessToken?.accessToken) {
      session.set(
        'customerAccessToken',
        updated.customerUpdate?.customerAccessToken,
      );
    }

    return json(
      {error: null, customer: updated.customerUpdate?.customer},
      {
        headers: {
          'Set-Cookie': await session.commit(),
        },
      },
    );
  } catch (error: any) {
    return json({error: error.message, customer: null}, {status: 400});
  }
}

export default function AccountProfile() {
  const account = useOutletContext<{customer: CustomerFragment}>();
  const {state} = useNavigation();
  const action = useActionData<ActionResponse>();
  const customer = action?.customer ?? account?.customer;

  return (
    <div>
      <h2 className="text-lg my-4 font-bold">My profile</h2>
      <br />
      <Form method="PUT">
        <legend className="text-md font-semibold mb-4">
          Personal information
        </legend>
        <fieldset>
          <TextInput
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            ariaLabel="First name"
            label="First name"
            defaultValue={customer.firstName ?? ''}
            minLength={2}
          />
          <TextInput
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Last name"
            ariaLabel="Last name"
            label="Last name"
            defaultValue={customer.lastName ?? ''}
            minLength={2}
          />
          <TextInput
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(###) ###-####"
            ariaLabel="Mobile"
            label="Mobile"
            defaultValue={customer.phone ?? ''}
          />
          <TextInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email address"
            ariaLabel="Email address"
            label="Email address"
            defaultValue={customer.email ?? ''}
          />
          <Checkbox
            label="Subscribed to marketing communications"
            id="acceptsMarketing"
            name="acceptsMarketing"
            placeholder="Accept marketing"
            ariaLabel="Accept marketing"
            defaultChecked={customer.acceptsMarketing}
          />
        </fieldset>
        <br />
        <legend className="text-md font-semibold my-4">
          Change password (optional)
        </legend>
        <fieldset>
          <TextInput
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            placeholder="Current password"
            ariaLabel="Current password"
            label="Current password"
            minLength={8}
          />
          <TextInput
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder="New password"
            ariaLabel="New password"
            label="New password"
            minLength={8}
          />
          <label
            className="form-control w-full max-w-xs"
            htmlFor="newPasswordConfirm"
          >
            <div className="label">
              <span className="label-text">New password (confirm)</span>
            </div>
            <input
              id="newPasswordConfirm"
              name="newPasswordConfirm"
              type="password"
              placeholder="New password (confirm)"
              aria-label="New password confirm"
              minLength={8}
            />
            <small className="m-1">
              Passwords must be at least 8 characters.
            </small>
          </label>
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
        <Button
          className="btn-primary"
          type="submit"
          disabled={state !== 'idle'}
        >
          {state !== 'idle' ? 'Updating' : 'Update'}
        </Button>
      </Form>
    </div>
  );
}

function getPassword(form: FormData): string | undefined {
  let password;
  const currentPassword = form.get('currentPassword');
  const newPassword = form.get('newPassword');
  const newPasswordConfirm = form.get('newPasswordConfirm');

  let passwordError;
  if (newPassword && !currentPassword) {
    passwordError = new Error('Current password is required.');
  }

  if (newPassword && newPassword !== newPasswordConfirm) {
    passwordError = new Error('New passwords must match.');
  }

  if (newPassword && currentPassword && newPassword === currentPassword) {
    passwordError = new Error(
      'New password must be different than current password.',
    );
  }

  if (passwordError) {
    throw passwordError;
  }

  if (currentPassword && newPassword) {
    password = newPassword;
  } else {
    password = currentPassword;
  }

  return String(password);
}

const CUSTOMER_UPDATE_MUTATION = `#graphql
  # https://shopify.dev/docs/api/storefront/latest/mutations/customerUpdate
  mutation customerUpdate(
    $customerAccessToken: String!,
    $customer: CustomerUpdateInput!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        acceptsMarketing
        email
        firstName
        id
        lastName
        phone
      }
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
