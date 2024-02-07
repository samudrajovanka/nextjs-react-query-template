import { ReactQueryProps } from './types';

const ReactQuery = <T,>({ queryResult, render, ...props }: ReactQueryProps<T>) => {
  const { data, isLoading, isFetching, isError, isSuccess } = queryResult;

  if (isLoading && isFetching) {
    return props.renderLoading ? props.renderLoading : <p>Loading...</p>;
  }

  if (isError) {
    return props.renderError ? props.renderError : <p>Error</p>;
  }

  if (isSuccess && data) {
    return render(data);
  }

  return 'Something when wrong';
};

export default ReactQuery;
