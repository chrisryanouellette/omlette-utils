import { useCallback, useMemo, useState } from "react";
import {
  StatusIdleResult,
  StatusSuccessResult,
  ThrowableStatus,
} from "@ouellettec/utils-types";
import {
  useComponentStore,
  UseComponentStore,
} from "@ouellettec/utils-react-state-zustand";

function isSuccessStatus<R = void, E = Error>(
  status: ThrowableStatus<R, E>,
): status is StatusSuccessResult<R> {
  return !status.isError && !status.isIdle && !status.isLoading;
}

function createDefaultStatus(): StatusIdleResult {
  return { isIdle: true };
}

type StatusReturn<R, E> = UseComponentStore<ThrowableStatus<R, E>> & {
  setIdle: () => void;
  setLoading: () => void;
  setError: (error: E) => void;
  setSuccess: (value: R) => void;
};

/** A hook for managing an actions lifecycle.
 * @example
 * type Example = {
 *  name: string
 * }
 *
 * function App(): JSX.Element {
 *    const store = useStatusStore()
 *    const status = store.useState(); // Use where you need reactivity
 *
 *    function handleClick(): Promise<void> {
 *      store.setLoading();
 *      const result = await requestData();
 *      if(result.isError) return store.setError(result.error);
 *      store.setSuccess(result.value);
 *    }
 *
 *    return status.isLoading
 *      ? "Loading"
 *      : status.isError
 *      ? status.error.message
 *      : status.isSuccessStatus(status)
 *      ? status.value.name
 *      : null
 * }
 */
function useStatusStore<R = void, E = Error>(): StatusReturn<R, E> {
  type StatusReturnWithGenerics = StatusReturn<R, E>;
  type UseStatusWithGenerics = ThrowableStatus<R, E>;
  const store = useComponentStore<UseStatusWithGenerics>(createDefaultStatus());

  const update = useCallback<(update: UseStatusWithGenerics) => void>(
    function onUpdate(update) {
      store.setState(update);
    },
    [store],
  );

  const setIdle = useCallback<StatusReturnWithGenerics["setIdle"]>(
    function onIdle() {
      update({ isIdle: true, isError: false, isLoading: false });
    },
    [update],
  );

  const setLoading = useCallback<StatusReturnWithGenerics["setLoading"]>(
    function onLoading() {
      update({ isIdle: false, isError: false, isLoading: true });
    },
    [update],
  );

  const setError = useCallback<StatusReturnWithGenerics["setError"]>(
    function onError(error) {
      update({ isLoading: false, isIdle: false, isError: true, error });
    },
    [update],
  );

  const setSuccess = useCallback<StatusReturnWithGenerics["setSuccess"]>(
    function onSuccess(value) {
      update({
        isIdle: false,
        isLoading: false,
        isError: false,
        value,
      });
    },
    [update],
  );

  return useMemo(
    () => ({
      ...store,
      setIdle,
      setError,
      setLoading,
      setSuccess,
    }),
    [setError, setIdle, setLoading, setSuccess, store],
  );
}

type UseStatusReturn<R, E> = {
  state: ThrowableStatus<R, E>;
  setIdle: () => void;
  setLoading: () => void;
  setError: (error: E) => void;
  setSuccess: (value: R) => void;
};

/** A hook for managing an actions lifecycle.
 * @example
 * type Example = {
 *  name: string
 * }
 *
 * function App(): JSX.Element {
 *    const status = useStatus(); // Use where you need reactivity
 *
 *    function handleClick(): Promise<void> {
 *      store.setLoading();
 *      const result = await requestData();
 *      if(result.isError) return store.setError(result.error);
 *      store.setSuccess(result.value);
 *    }
 *
 *    return status.isLoading
 *      ? "Loading"
 *      : status.state.isError
 *      ? status.state.error.message
 *      : isSuccessStatus(status)
 *      ? status.value.name
 *      : null
 * }
 */
function useStatus<R = void, E = Error>(): UseStatusReturn<R, E> {
  type StatusReturnWithGenerics = StatusReturn<R, E>;
  const [state, setState] = useState<ThrowableStatus<R, E>>(
    createDefaultStatus(),
  );

  const setIdle = useCallback<StatusReturnWithGenerics["setIdle"]>(
    function onIdle() {
      setState({ isIdle: true, isError: false, isLoading: false });
    },
    [],
  );

  const setLoading = useCallback<StatusReturnWithGenerics["setLoading"]>(
    function onLoading() {
      setState({ isIdle: false, isError: false, isLoading: true });
    },
    [],
  );

  const setError = useCallback<StatusReturnWithGenerics["setError"]>(
    function onError(error) {
      setState({ isLoading: false, isIdle: false, isError: true, error });
    },
    [],
  );

  const setSuccess = useCallback<StatusReturnWithGenerics["setSuccess"]>(
    function onSuccess(value) {
      setState({
        isIdle: false,
        isLoading: false,
        isError: false,
        value,
      });
    },
    [],
  );

  return {
    state,
    setIdle,
    setError,
    setLoading,
    setSuccess,
  };
}

export { useStatus, useStatusStore, isSuccessStatus };
