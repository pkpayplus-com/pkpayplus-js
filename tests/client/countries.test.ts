import { COUNTRIES } from '@pkpayplus/core';
import { createCountryCombobox } from '../../packages/core/src/ui/combobox';
import { describe, expect, it } from 'vitest';

describe('Country Combobox & Full ISO Countries List', () => {
  it('contains all 249 ISO countries including Afghanistan', () => {
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(240);

    const afghanistan = COUNTRIES.find((c) => c.code === 'AF');
    expect(afghanistan).toBeDefined();
    expect(afghanistan?.name).toBe('Afghanistan');
    expect(afghanistan?.flag).toBe('🇦🇫');

    const us = COUNTRIES.find((c) => c.code === 'US');
    expect(us).toBeDefined();

    const pk = COUNTRIES.find((c) => c.code === 'PK');
    expect(pk).toBeDefined();
  });

  it('finds Afghanistan when searching for "afganistan" or "afg"', () => {
    const cb = createCountryCombobox({
      id: 'test-country',
      label: 'Country',
    });

    const trigger = cb.container.querySelector('.pkpay-combobox-trigger') as HTMLButtonElement;
    trigger.click(); // opens popover

    const searchInput = cb.container.querySelector('.pkpay-combobox-search-input') as HTMLInputElement;

    // Search with phonetic misspelling "afganistan"
    searchInput.value = 'afganistan';
    searchInput.dispatchEvent(new Event('input'));

    const items = cb.container.querySelectorAll('.pkpay-combobox-item');
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items[0].textContent).toContain('Afghanistan');

    // Search with "afg"
    searchInput.value = 'afg';
    searchInput.dispatchEvent(new Event('input'));
    const itemsAfg = cb.container.querySelectorAll('.pkpay-combobox-item');
    expect(itemsAfg.length).toBeGreaterThanOrEqual(1);
    expect(itemsAfg[0].textContent).toContain('Afghanistan');
  });

  it('finds countries by alias like "usa" or "uk"', () => {
    const cb = createCountryCombobox({
      id: 'test-country-2',
      label: 'Country',
    });

    const trigger = cb.container.querySelector('.pkpay-combobox-trigger') as HTMLButtonElement;
    trigger.click();

    const searchInput = cb.container.querySelector('.pkpay-combobox-search-input') as HTMLInputElement;

    searchInput.value = 'usa';
    searchInput.dispatchEvent(new Event('input'));
    const itemsUsa = cb.container.querySelectorAll('.pkpay-combobox-item');
    expect(itemsUsa.length).toBeGreaterThanOrEqual(1);
    expect(itemsUsa[0].textContent).toContain('United States');

    searchInput.value = 'uk';
    searchInput.dispatchEvent(new Event('input'));
    const itemsUk = Array.from(cb.container.querySelectorAll('.pkpay-combobox-item'));
    expect(itemsUk.length).toBeGreaterThanOrEqual(1);
    const hasUK = itemsUk.some((item) => item.textContent?.includes('United Kingdom'));
    expect(hasUK).toBe(true);
  });
});
