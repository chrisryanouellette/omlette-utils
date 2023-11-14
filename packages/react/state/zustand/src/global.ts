import {
  createStore as zustandCreateStore,
  useStore as zustandUseStore,
} from "zustand";
import type {
  ReadonlyState,
  UseStore,
  Reducer,
  SelectorFn,
} from "@ouellettec/utils-types";
import { stringSelector } from "@ouellettec/utils";

function fallbackStateSelector(args: unknown): unknown {
  return args;
}

export type UseGlobalStore<State, Action = Partial<State>> = UseStore<
  ReadonlyState<State>,
  State,
  Action
>;

export function createGlobalStore<State, Action = Partial<State>>(
  defaultProps: State,
  reducer?: Reducer<State, Action>,
): UseGlobalStore<State, Action> {
  const state = zustandCreateStore<State>()(() => defaultProps);

  function getState(): State {
    return state.getState();
  }

  function useState<Selection>(
    selector?: string | SelectorFn<State, Selection>,
  ): Selection {
    const selectorFn =
      typeof selector === "string" ? stringSelector(selector) : selector;
    return zustandUseStore(
      state,
      selectorFn ?? fallbackStateSelector,
    ) as Selection;
  }

  function setState(
    args: Action,
    replace: boolean | undefined = undefined,
  ): void {
    const update = reducer ? reducer(state.getState(), args) : args;
    state.setState(update as State, replace);
  }

  return { state, useState, getState, setState, subscribe: state.subscribe };
}
