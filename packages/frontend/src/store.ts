import { RefObject, useCallback, useMemo, useRef } from "react";
import {
  createStore as zustandCreateStore,
  useStore as zustandUseStore,
} from "zustand";
import { ReadonlyState, Reducer, SelectorFn, UseStoreReturn } from "types";
import { stringSelector } from "utils";

function fallbackStateSelector(args: unknown): unknown {
  return args;
}

export type UseComponentStore<State, Action = Partial<State>> = UseStoreReturn<
  RefObject<ReadonlyState<State>>,
  State,
  Action
>;

export function useComponentStore<State, Action = Partial<State>>(
  defaultProps: State,
  reducer?: Reducer<State, Action>,
): UseComponentStore<State, Action> {
  const ref = useRef(zustandCreateStore<State>()(() => defaultProps));

  const getState = useCallback(function getStateCallback() {
    return ref.current.getState();
  }, []);

  const useState = useCallback(function useStateCallback<Selection>(
    selector?: string | SelectorFn<State, Selection>,
  ): Selection {
    const selectorFn =
      typeof selector === "string" ? stringSelector(selector) : selector;
    return zustandUseStore(
      ref.current,
      selectorFn ?? fallbackStateSelector,
    ) as Selection;
  }, []);

  const setState = useCallback(
    function setStateCallback(
      args: Action,
      replace: boolean | undefined = undefined,
    ) {
      const update = reducer ? reducer(ref.current.getState(), args) : args;
      ref.current.setState(update as State, replace);
    },
    [reducer],
  );

  return useMemo(
    () => ({
      state: ref,
      useState,
      getState,
      setState,
      subscribe: ref.current.subscribe,
    }),
    [getState, setState, useState],
  );
}
