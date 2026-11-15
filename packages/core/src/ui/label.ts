export interface LabelOptions {
  text: string;
  htmlFor?: string;
  required?: boolean;
}

export function createLabel(options: LabelOptions): HTMLLabelElement {
  const label = document.createElement('label');
  label.className = 'pkpay-label';
  if (options.htmlFor) {
    label.htmlFor = options.htmlFor;
  }

  label.textContent = options.text;

  if (options.required) {
    const asterisk = document.createElement('span');
    asterisk.className = 'pkpay-label-required';
    asterisk.textContent = ' *';
    label.appendChild(asterisk);
  }

  return label;
}
