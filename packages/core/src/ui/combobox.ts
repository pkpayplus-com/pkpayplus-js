import { COUNTRIES, type CountryItem } from './countries';
import { createLabel } from './label';

export interface ComboboxOptions {
  id: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  countries?: CountryItem[];
  onChange?: (country: CountryItem) => void;
}

export interface ComboboxController {
  container: HTMLDivElement;
  getValue: () => string;
  setValue: (code: string) => void;
}

export function createCountryCombobox(options: ComboboxOptions): ComboboxController {
  const container = document.createElement('div');
  container.className = 'pkpay-form-group';

  const label = createLabel({
    text: options.label,
    htmlFor: options.id,
    required: options.required,
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'pkpay-combobox-wrapper';

  const countryList = options.countries || COUNTRIES;
  let selected =
    countryList.find(
      (c) => c.code.toLowerCase() === (options.defaultValue || 'US').toLowerCase()
    ) || countryList[0];

  // Trigger button
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.id = options.id;
  trigger.className = 'pkpay-combobox-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');

  const triggerValue = document.createElement('span');
  triggerValue.className = 'pkpay-combobox-value';
  triggerValue.innerHTML = `<span>${selected.flag}</span> <span>${selected.name} (${selected.code})</span>`;

  const triggerIcon = document.createElement('span');
  triggerIcon.className = 'pkpay-combobox-icon';
  triggerIcon.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `;

  trigger.appendChild(triggerValue);
  trigger.appendChild(triggerIcon);

  // Popover container
  const popover = document.createElement('div');
  popover.className = 'pkpay-combobox-popover';

  // Search box inside popover
  const searchBox = document.createElement('div');
  searchBox.className = 'pkpay-combobox-search-box';
  searchBox.innerHTML = `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  `;

  const searchInput = document.createElement('input');
  searchInput.className = 'pkpay-combobox-search-input';
  searchInput.placeholder = 'Search country...';
  searchBox.appendChild(searchInput);

  // List of items
  const list = document.createElement('ul');
  list.className = 'pkpay-combobox-list';
  list.setAttribute('role', 'listbox');

  let filteredCountries = [...countryList];
  let highlightedIndex = 0;
  let isOpen = false;

  const renderItems = () => {
    list.innerHTML = '';
    if (filteredCountries.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'pkpay-combobox-empty';
      empty.textContent = 'No country found.';
      list.appendChild(empty);
      return;
    }

    filteredCountries.forEach((c, index) => {
      const item = document.createElement('li');
      item.className = 'pkpay-combobox-item';
      item.setAttribute('role', 'option');
      if (c.code === selected.code) {
        item.classList.add('pkpay-selected');
        item.setAttribute('aria-selected', 'true');
      }
      if (index === highlightedIndex) {
        item.classList.add('pkpay-highlighted');
      }

      item.innerHTML = `
        <span style="display: flex; align-items: center; gap: 8px;">
          <span>${c.flag}</span>
          <span>${c.name}</span>
        </span>
        <span style="color: #94a3b8; font-size: 11px;">${c.code}</span>
      `;

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        selectCountry(c);
      });

      item.addEventListener('mouseenter', () => {
        highlightedIndex = index;
        updateHighlight();
      });

      list.appendChild(item);
    });
  };

  const updateHighlight = () => {
    const items = list.querySelectorAll('.pkpay-combobox-item');
    items.forEach((item, idx) => {
      if (idx === highlightedIndex) {
        item.classList.add('pkpay-highlighted');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('pkpay-highlighted');
      }
    });
  };

  const selectCountry = (c: CountryItem) => {
    selected = c;
    triggerValue.innerHTML = `<span>${selected.flag}</span> <span>${selected.name} (${selected.code})</span>`;
    closePopover();
    options.onChange?.(c);
    trigger.focus();
  };

  const openPopover = () => {
    isOpen = true;
    popover.classList.add('pkpay-open');
    trigger.classList.add('pkpay-active');
    trigger.setAttribute('aria-expanded', 'true');
    searchInput.value = '';
    filteredCountries = [...countryList];
    highlightedIndex = Math.max(
      0,
      filteredCountries.findIndex((c) => c.code === selected.code)
    );
    renderItems();
    updateHighlight();
    setTimeout(() => searchInput.focus(), 50);
  };

  const closePopover = () => {
    if (!isOpen) return;
    isOpen = false;
    popover.classList.remove('pkpay-open');
    trigger.classList.remove('pkpay-active');
    trigger.setAttribute('aria-expanded', 'false');
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isOpen) {
      closePopover();
    } else {
      openPopover();
    }
  });

  searchInput.addEventListener('input', () => {
    const rawQ = searchInput.value.toLowerCase().trim();
    if (!rawQ) {
      filteredCountries = [...countryList];
    } else {
      const normQ = rawQ.replace(/gh/g, 'g').replace(/ph/g, 'f');
      filteredCountries = countryList.filter((c) => {
        const nameLower = c.name.toLowerCase();
        const normName = nameLower.replace(/gh/g, 'g').replace(/ph/g, 'f');
        return (
          nameLower.includes(rawQ) ||
          c.code.toLowerCase().includes(rawQ) ||
          normName.includes(normQ) ||
          Boolean(c.aliases && c.aliases.some((a) => a.toLowerCase().includes(rawQ)))
        );
      });
    }
    highlightedIndex = 0;
    renderItems();
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (highlightedIndex < filteredCountries.length - 1) {
        highlightedIndex++;
        updateHighlight();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (highlightedIndex > 0) {
        highlightedIndex--;
        updateHighlight();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCountries[highlightedIndex]) {
        selectCountry(filteredCountries[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closePopover();
      trigger.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (isOpen && !wrapper.contains(e.target as Node)) {
      closePopover();
    }
  });

  popover.appendChild(searchBox);
  popover.appendChild(list);

  wrapper.appendChild(trigger);
  wrapper.appendChild(popover);

  container.appendChild(label);
  container.appendChild(wrapper);

  return {
    container,
    getValue: () => selected.code,
    setValue: (code: string) => {
      const match = countryList.find(
        (c) => c.code.toLowerCase() === code.toLowerCase()
      );
      if (match) {
        selectCountry(match);
      }
    },
  };
}
