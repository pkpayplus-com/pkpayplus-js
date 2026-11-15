import { createFormMessage, type FormMessageController } from './form-message';
import { createLabel } from './label';

export interface InputOptions {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  required?: boolean;
  onInput?: (value: string) => void;
  validate?: (value: string) => string | null;
}

export interface InputController {
  container: HTMLDivElement;
  input: HTMLInputElement;
  message: FormMessageController;
  getValue: () => string;
  setValue: (value: string) => void;
  validate: () => boolean;
  setError: (msg: string | null) => void;
}

export function createInput(options: InputOptions): InputController {
  const container = document.createElement('div');
  container.className = 'pkpay-form-group';

  const label = createLabel({
    text: options.label,
    htmlFor: options.id,
    required: options.required,
  });

  const input = document.createElement('input');
  input.id = options.id;
  input.name = options.name;
  input.type = options.type || 'text';
  input.className = 'pkpay-input';
  if (options.placeholder) input.placeholder = options.placeholder;
  if (options.value) input.value = options.value;
  if (options.required) input.required = true;

  const message = createFormMessage();

  const validateInput = (): boolean => {
    const val = input.value.trim();
    if (options.required && !val) {
      input.classList.add('pkpay-input-error');
      message.show(`${options.label} is required`);
      return false;
    }

    if (options.validate) {
      const error = options.validate(val);
      if (error) {
        input.classList.add('pkpay-input-error');
        message.show(error);
        return false;
      }
    }

    input.classList.remove('pkpay-input-error');
    message.hide();
    return true;
  };

  input.addEventListener('input', () => {
    if (input.classList.contains('pkpay-input-error')) {
      validateInput();
    }
    options.onInput?.(input.value);
  });

  input.addEventListener('blur', () => {
    validateInput();
  });

  container.appendChild(label);
  container.appendChild(input);
  container.appendChild(message.element);

  return {
    container,
    input,
    message,
    getValue: () => input.value.trim(),
    setValue: (val: string) => {
      input.value = val;
      options.onInput?.(val);
    },
    validate: validateInput,
    setError: (msg: string | null) => {
      if (msg) {
        input.classList.add('pkpay-input-error');
        message.show(msg);
      } else {
        input.classList.remove('pkpay-input-error');
        message.hide();
      }
    },
  };
}
