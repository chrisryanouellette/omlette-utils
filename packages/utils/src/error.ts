export type ErrorResult<E> = { isError: true; error: E };
export type SuccessResult<R> = R extends void
  ? { isError?: false }
  : { isError?: false; value: R };
/**
 * Used for a function that could result in an error.
 *
 * A function should not throw but instead return a object of type `ErrorResult`.
 *
 * This keeps the control flow of the application linear.
 *
 * For third party code that does use `throw`, wrap the function in a try catch and
 * use `getErrorMessage` on the unknown error in the `catch` block.
 *
 * @example
 * const result = myThrowableFn<Data>();
 * if(result.isError) {
 *  // Log to analytics service
 *  return console.error(result.error.message);
 * }
 *  // Do something with result.value
 */
export type Throwable<R = void, E = Error> = SuccessResult<R> | ErrorResult<E>;

/* Pulled from a [Kent C Dobbs](https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript) article */

type ErrorWithMessage = {
  message: string;
};

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
}

/**
 * Used inside of a catch block to get the message from an unknown error.
 * This will handle custom errors as long as the use the `message` property.
 * @example
 * try {
 *  someThrowableFn();
 * } catch(error) {
 *  const message = getErrorMessage(error);
 *  // Log message to analytics service
 * }
 */
export function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message;
}

type ErrorWithCode = {
  code: string;
};

function isErrorWithCode(error: unknown): error is ErrorWithCode {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as Record<string, unknown>).code === "string"
  );
}

/**
 * Used inside of a catch block to get the code from an unknown error.
 * This will handle custom errors as long as the use the `code` property.
 * @example
 * try {
 *  someThrowableFn();
 * } catch(error) {
 *  const code = getErrorCode(error);
 *  // Log message to analytics service
 * }
 */
export function getErrorCode(error: unknown): string | null {
  if (isErrorWithCode(error)) return error.code;

  return null;
}

/**
 * Used to extract a property from an unknown error.
 *
 * This is most commonly used with `getErrorMessage` or `getErrorCode`.
 *
 * @example
 * const result = selectError(myFn, selectErrorMessage);
 */
export async function selectError<R, E>(
  fn: () => R | Promise<R>,
  selector: (error: E) => string,
): Promise<Throwable<R>> {
  try {
    const res = await fn();
    return { isError: false, value: res } as Throwable<R>;
  } catch (error) {
    return { isError: true, error: new Error(selector(error as E)) };
  }
}

/** Used to convert a function that throws an error to one that  */
export async function handleError<R>(
  fn: () => R | Promise<R>,
): Promise<Throwable<R>> {
  try {
    const res = await fn();
    return { isError: false, value: res } as Throwable<R>;
  } catch (error) {
    if (error instanceof Error) {
      return { isError: true, error };
    }
    return { isError: true, error: new Error(getErrorMessage(error)) };
  }
}
