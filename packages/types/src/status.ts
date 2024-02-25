export type StatusIdleResult = {
  isIdle: true;
  isLoading?: false;
  isError?: false;
  error?: never;
};
export type StatusLoadingResult = {
  isIdle?: false;
  error?: never;
  isLoading: true;
  isError?: false;
};
export type StatusErrorResult<E> = {
  isIdle?: false;
  isLoading?: false;
  isError: true;
  error: E;
};
export type StatusSuccessResult<R> = {
  isError?: false;
  isLoading?: false;
  isIdle?: false;
  value: R;
};

export type ThrowableStatus<R = void, E = Error> =
  | StatusIdleResult
  | StatusLoadingResult
  | StatusErrorResult<E>
  | StatusSuccessResult<R>;
