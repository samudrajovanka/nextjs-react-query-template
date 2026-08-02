import type { AnyFieldApi } from '@tanstack/react-form';

export const isInvalidField = (field: AnyFieldApi) => {
  return field.state.meta.isTouched && field.state.meta.errors.length > 0;
};
