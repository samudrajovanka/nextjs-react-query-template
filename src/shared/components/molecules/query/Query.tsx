import type { QueryProps } from './types';

const Query = <T,>({ queryResult, render, ...props }: QueryProps<T>) => {
  const { data, isLoading, isPending, isError, isSuccess, error } = queryResult;

  if (isLoading || isPending) {
    return props.renderLoading !== undefined ? props.renderLoading : <p>Loading...</p>;
  }

  if (isError) {
    const message = (error as { data?: { message?: string } })?.data?.message;

    if (props.renderError) {
      return props.renderError;
    }

    return <p className="text-destructive">{message ?? 'Something went wrong'}</p>;
  }

  if (isSuccess && data) {
    if (props.checkEmpty?.(data) && props.renderEmpty) {
      return props.renderEmpty;
    }

    return render(data);
  }

  return 'Something when wrong';
};

export default Query;
