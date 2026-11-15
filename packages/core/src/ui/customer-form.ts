import type { CustomerInfo } from '../types';
import { createCountryCombobox, type ComboboxController } from './combobox';
import { createInput, type InputController } from './input';

export interface CustomerFormOptions {
  initialData?: CustomerInfo;
  onChange?: (data: CustomerInfo) => void;
}

export interface CustomerFormController {
  element: HTMLElement;
  getData: () => CustomerInfo;
  validate: () => boolean;
  setValues: (data: Partial<CustomerInfo>) => void;
}

export function createCustomerForm(options: CustomerFormOptions = {}): CustomerFormController {
  const container = document.createElement('div');
  container.className = 'pkpay-customer-pane';

  // Header
  const header = document.createElement('div');
  header.className = 'pkpay-pane-header';
  header.innerHTML = `
    <h3 class="pkpay-pane-title">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      Customer Information
    </h3>
    <p class="pkpay-pane-subtitle">Enter your billing & contact details for payment receipt.</p>
  `;
  container.appendChild(header);

  const form = document.createElement('div');
  form.className = 'pkpay-form';

  const initial = options.initialData || { email: '' };

  // Parse first and last name if provided in initial.name
  let initFirstName = '';
  let initLastName = '';
  if (initial.name) {
    const parts = initial.name.trim().split(' ');
    initFirstName = parts[0] || '';
    initLastName = parts.slice(1).join(' ') || '';
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const triggerChange = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      options.onChange?.(getCurrentData());
    }, 150);
  };

  // Row 1: First Name & Last Name
  const nameRow = document.createElement('div');
  nameRow.className = 'pkpay-form-row';

  const firstNameInput: InputController = createInput({
    id: 'pkpay-first-name',
    name: 'firstName',
    label: 'First Name',
    placeholder: 'Jane',
    required: true,
    value: initFirstName,
    onInput: triggerChange,
  });

  const lastNameInput: InputController = createInput({
    id: 'pkpay-last-name',
    name: 'lastName',
    label: 'Last Name',
    placeholder: 'Doe',
    required: true,
    value: initLastName,
    onInput: triggerChange,
  });

  nameRow.appendChild(firstNameInput.container);
  nameRow.appendChild(lastNameInput.container);
  form.appendChild(nameRow);

  // Row 2: Email
  const emailInput: InputController = createInput({
    id: 'pkpay-email',
    name: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'jane.doe@example.com',
    required: true,
    value: initial.email || '',
    validate: (val) => {
      if (!val) return 'Email is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) return 'Please enter a valid email address';
      return null;
    },
    onInput: triggerChange,
  });
  form.appendChild(emailInput.container);

  // Row 3: Phone (Required)
  const phoneInput: InputController = createInput({
    id: 'pkpay-phone',
    name: 'phone',
    label: 'Phone Number',
    type: 'tel',
    placeholder: '+1 (555) 000-0000',
    required: true,
    value: initial.phone || '',
    validate: (val) => {
      if (!val) return 'Phone number is required';
      if (val.replace(/\D/g, '').length < 7) return 'Please enter a valid phone number';
      return null;
    },
    onInput: triggerChange,
  });
  form.appendChild(phoneInput.container);

  // Row 4: Address (Required)
  const addressInput: InputController = createInput({
    id: 'pkpay-address',
    name: 'address',
    label: 'Street Address',
    placeholder: '123 Market St, Suite 400',
    required: true,
    value: initial.billing?.address_1 || '',
    validate: (val) => (!val ? 'Street address is required' : null),
    onInput: triggerChange,
  });
  form.appendChild(addressInput.container);

  // Row 5: Country Combobox (Required)
  const countryCombobox: ComboboxController = createCountryCombobox({
    id: 'pkpay-country',
    label: 'Country / Region',
    required: true,
    defaultValue: initial.billing?.country || 'US',
    onChange: () => {
      triggerChange();
    },
  });
  form.appendChild(countryCombobox.container);

  // Row 6: City & Postal Code (City Required)
  const cityRow = document.createElement('div');
  cityRow.className = 'pkpay-form-row';

  const cityInput: InputController = createInput({
    id: 'pkpay-city',
    name: 'city',
    label: 'City',
    placeholder: 'New York',
    required: true,
    value: initial.billing?.city || '',
    validate: (val) => (!val ? 'City is required' : null),
    onInput: triggerChange,
  });

  const zipInput: InputController = createInput({
    id: 'pkpay-zip',
    name: 'postalCode',
    label: 'Postal Code',
    placeholder: '10001',
    value: initial.billing?.postcode || '',
    onInput: triggerChange,
  });

  cityRow.appendChild(cityInput.container);
  cityRow.appendChild(zipInput.container);
  form.appendChild(cityRow);

  container.appendChild(form);

  // Security Badge
  const badge = document.createElement('div');
  badge.className = 'pkpay-footer-badge';
  badge.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
    <span>End-to-end 256-bit SSL encrypted</span>
  `;
  container.appendChild(badge);

  const getCurrentData = (): CustomerInfo => {
    const fName = firstNameInput.getValue();
    const lName = lastNameInput.getValue();
    const fullName = [fName, lName].filter(Boolean).join(' ');

    return {
      email: emailInput.getValue(),
      name: fullName,
      phone: phoneInput.getValue(),
      billing: {
        address_1: addressInput.getValue(),
        city: cityInput.getValue(),
        postcode: zipInput.getValue(),
        country: countryCombobox.getValue(),
      },
    };
  };

  const validateAll = (): boolean => {
    const emailValid = emailInput.validate();
    const firstValid = firstNameInput.validate();
    const lastValid = lastNameInput.validate();
    const phoneValid = phoneInput.validate();
    const addressValid = addressInput.validate();
    const cityValid = cityInput.validate();
    return emailValid && firstValid && lastValid && phoneValid && addressValid && cityValid;
  };

  const setValues = (data: Partial<CustomerInfo>) => {
    if (data.name) {
      const parts = data.name.trim().split(' ');
      firstNameInput.setValue(parts[0] || '');
      lastNameInput.setValue(parts.slice(1).join(' ') || '');
    }
    if (data.email !== undefined) emailInput.setValue(data.email);
    if (data.phone !== undefined) phoneInput.setValue(data.phone);
    if (data.billing?.address_1 !== undefined) addressInput.setValue(data.billing.address_1);
    if (data.billing?.city !== undefined) cityInput.setValue(data.billing.city);
    if (data.billing?.postcode !== undefined) zipInput.setValue(data.billing.postcode);
    if (data.billing?.country !== undefined) countryCombobox.setValue(data.billing.country);
  };

  return {
    element: container,
    getData: getCurrentData,
    validate: validateAll,
    setValues,
  };
}
