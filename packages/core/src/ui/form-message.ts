export interface FormMessageController {
  element: HTMLDivElement;
  show: (message: string) => void;
  hide: () => void;
}

export function createFormMessage(): FormMessageController {
  const element = document.createElement('div');
  element.className = 'pkpay-form-message';
  element.setAttribute('role', 'alert');

  return {
    element,
    show: (message: string) => {
      element.textContent = message;
      element.classList.add('pkpay-visible');
    },
    hide: () => {
      element.textContent = '';
      element.classList.remove('pkpay-visible');
    },
  };
}
