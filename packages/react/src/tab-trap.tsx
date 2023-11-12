/* Handles tab management for a container */

import { RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import { isInstanceOf } from "@ouellettec/utils-frontend";

/**
 * All elements that can only be checked by the focus out event.
 *
 * The elements have internal focus states that will fire the tab event even
 * thought focus will not leave the elements.
 */
const specialFocusElements = ["VIDEO", "IFRAME"];

const treeWalkerFilter = (node: Node, root: HTMLElement): number => {
  /* Skip all non Elements */
  if (!isInstanceOf(node, [HTMLElement])) {
    return NodeFilter.FILTER_SKIP;
  }

  const { display, visibility } = getComputedStyle(node);

  /* Skip all elements that are hidden from tab presses */
  if (display === "hidden" || visibility === "hidden") {
    return NodeFilter.FILTER_SKIP;
  }

  /* Skip all hidden and disabled inputs */
  if (
    isInstanceOf(node, [
      HTMLInputElement,
      HTMLTextAreaElement,
      HTMLSelectElement,
    ])
  ) {
    if (node.disabled || node.hidden || node.type === "hidden") {
      return NodeFilter.FILTER_SKIP;
    }
  }

  /* Videos w/ controls have a negative tab index so we will include them */
  if (isInstanceOf(node, [HTMLVideoElement])) {
    if (node.controls) {
      return NodeFilter.FILTER_ACCEPT;
    }
  }

  /* Make sure the element is not nested withing a hidden parent */
  let parent = node.parentElement;
  while (parent !== root) {
    if (!isInstanceOf(parent, [HTMLElement])) {
      return NodeFilter.FILTER_SKIP;
    }
    const { display, visibility } = getComputedStyle(parent);
    if (display === "none" || visibility === "hidden") {
      return NodeFilter.FILTER_SKIP;
    }
    parent = parent.parentElement;
  }

  return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
};

export type SubscriptionFn = (
  event: "initialize" | "beginTrap" | "releaseTrap",
) => void;

type UseTabTrap = {
  initialize: (originalTarget?: Element | null) => void;
  beginTrap: (originalTarget?: Element | null) => () => void;
  focusNext: () => void;
  focusPrevious: () => void;
  releaseTrap: () => void;
  resetFocus: () => void;
  subscribe: (cb: SubscriptionFn) => () => void;
};

/**
 * This hooks allows you to trap focus within some content
 * It will move focus between the first and last elements.
 * @example
 * const [isOpen, setIsOpen] = useState<boolean>(false)
 * const ref = useRef<HTMLDivElement>(null);
 * const { beginTrap, releaseTrap } = useTabTrap({ contentRef: ref });
 *
 * useEffect(() => {
 *  if (isOpen) {
 *    beginTrap();
 *  } else {
 *    releaseTrap();
 *  }
 * }, [isOpen, beginTrap, releaseTrap])
 */

const useTabTrap = (contentRef: RefObject<HTMLElement>): UseTabTrap => {
  const firstFocusableElement = useRef<HTMLElement>();
  const lastFocusableElement = useRef<HTMLElement>();
  const focusableNodes = useRef<HTMLElement[]>([]);
  const originalFocus = useRef<HTMLElement>();
  const isFocusWithin = useRef<boolean>(false);
  const isTrapping = useRef<boolean>(false);
  const subscriptions = useRef<Set<SubscriptionFn>>(new Set());

  const setFirstAndLastFocusableElements = useCallback<
    (root: HTMLElement) => void
  >((root) => {
    const nodes: HTMLElement[] = [];
    /** @see {@link [MDN](https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker)} */
    const treeWalker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT,
      (node) => treeWalkerFilter(node, root),
    );

    while (treeWalker.nextNode()) {
      const node = treeWalker.currentNode;
      if (node instanceof HTMLElement) {
        nodes.push(node);
      }
    }

    focusableNodes.current = [...nodes];
    firstFocusableElement.current = nodes.shift();
    lastFocusableElement.current = nodes.pop() || firstFocusableElement.current;
  }, []);

  /**
   * Handles moving focus back into the content via focus out event
   * Some elements, like <fieldset>, act as a single control which manages its own focus but
   * the children all are considered focusable.
   * When we query for the last focusable element, the last child of the control is returned.
   * However, focus will leave the control after one tab press, regardless if the last child is focused.
   * This event checks if the focus has left the container and will reset it accordingly.
   */
  const handleFocusOut = useCallback<(e: FocusEvent) => void>(
    (e) => {
      const content = contentRef.current;
      const nextFocus = e.relatedTarget;

      if (!content) {
        throw new Error(
          'Required arg "contentRef" is not defined for useTabTrap hook.',
        );
      }

      if (isInstanceOf(nextFocus, [HTMLElement])) {
        if (!content.contains(nextFocus)) {
          /* Determines if the next focus is before or after the container */
          const index = content.compareDocumentPosition(nextFocus);
          if (index === Node.DOCUMENT_POSITION_PRECEDING) {
            lastFocusableElement.current?.focus();
          } else {
            firstFocusableElement.current?.focus();
          }
        }
      }
    },
    [contentRef],
  );

  const handleTab = useCallback<(e: KeyboardEvent) => void>((e) => {
    const active = document.activeElement;

    if (!active) {
      return;
    }

    if (e.key !== "Tab") {
      return;
    }

    /* The handle focus out event will manage focus for the special elements */
    if (specialFocusElements.includes(active.nodeName)) {
      return;
    }

    const firstElement = firstFocusableElement.current;
    const lastElement = lastFocusableElement.current;

    if (!firstElement || !lastElement) {
      return;
    }

    if (e.shiftKey) {
      if (active === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (active === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }, []);

  /**
   * Watches when the focus leaves an element to see if it is still within the content
   * If the focus has moved outside of the content ( due to calling initTrap instead of beginTrap )
   * then we do not want to reset focus if the trap is released.
   * An example is if you open a popover, tab to another popover, and then open the second popover.
   * The first popover will close but should not return focus to the trigger element.
   */
  const handleWatchTab = useCallback<(e: FocusEvent) => void>(
    (e) => {
      const target = e.relatedTarget;
      if (contentRef.current && isInstanceOf(target, [HTMLElement])) {
        isFocusWithin.current = contentRef.current.contains(target);
      }
    },
    [contentRef],
  );

  const handleEscape = useCallback<(e: KeyboardEvent) => void>(
    (e) => {
      if (e.key === "Escape") {
        document.removeEventListener("keydown", handleTab);
        document.removeEventListener("keydown", handleEscape);
        document.removeEventListener("focusout", handleWatchTab);
        document.removeEventListener("focusout", handleFocusOut);
        isTrapping.current = false;
        if (isFocusWithin.current) {
          originalFocus.current?.focus();
          isFocusWithin.current = false;
        }
        subscriptions.current.forEach((sub) => sub("releaseTrap"));
      }
    },
    [handleFocusOut, handleTab, handleWatchTab],
  );

  const initialize = useCallback<UseTabTrap["initialize"]>(
    (originalElement) => {
      if (isInstanceOf(originalElement, [HTMLElement])) {
        originalFocus.current = originalElement;
        document.addEventListener("focusout", handleWatchTab);
        subscriptions.current.forEach((sub) => sub("initialize"));
      } else if (isInstanceOf(document.activeElement, [HTMLElement])) {
        originalFocus.current = document.activeElement;
        document.addEventListener("focusout", handleWatchTab);
        subscriptions.current.forEach((sub) => sub("initialize"));
      } else {
        throw new Error(
          "useTabTrap was initialized with an active element that is not a HTMLElement",
        );
      }
    },
    [handleWatchTab],
  );

  /** Returns the focus to the ordinal element and removes event listener */
  const releaseTrap = useCallback<UseTabTrap["releaseTrap"]>(() => {
    document.removeEventListener("keydown", handleTab);
    document.removeEventListener("keydown", handleEscape);
    document.removeEventListener("focusout", handleWatchTab);
    document.removeEventListener("focusout", handleFocusOut);
    isTrapping.current = false;
    if (isFocusWithin.current) {
      originalFocus.current?.focus();
      isFocusWithin.current = false;
    }
    subscriptions.current.forEach((sub) => sub("releaseTrap"));
  }, [handleEscape, handleFocusOut, handleTab, handleWatchTab]);

  /** Starts locking the user's tab to the focusable elements in the content */
  const beginTrap = useCallback<UseTabTrap["beginTrap"]>(
    (originalElement) => {
      if (isInstanceOf(originalElement, [HTMLElement])) {
        originalFocus.current = originalElement;
      } else if (isInstanceOf(document.activeElement, [HTMLElement])) {
        if (!originalFocus.current) {
          originalFocus.current = document.activeElement;
        }
      } else {
        throw new Error(
          "useTabTrap was started with an active element that is not a HTMLElement",
        );
      }
      if (contentRef.current) {
        setFirstAndLastFocusableElements(contentRef.current);
        firstFocusableElement.current?.focus();
        document.addEventListener("keydown", handleTab);
        document.addEventListener("keydown", handleEscape);
        document.addEventListener("focusout", handleWatchTab);
        document.addEventListener("focusout", handleFocusOut);
        isTrapping.current = true;

        if (firstFocusableElement.current) {
          isFocusWithin.current = true;
        }
        subscriptions.current.forEach((sub) => sub("beginTrap"));
        return releaseTrap;
      } else {
        throw new Error(`contentRef has not been set for the useTabTrap hook`);
      }
    },
    [
      contentRef,
      handleEscape,
      handleFocusOut,
      handleTab,
      handleWatchTab,
      releaseTrap,
      setFirstAndLastFocusableElements,
    ],
  );

  const focusNext = useCallback(() => {
    if (!document.activeElement) {
      return firstFocusableElement.current?.focus();
    }
    if (!isInstanceOf(document.activeElement, [HTMLElement])) {
      return firstFocusableElement.current?.focus();
    }
    const length = focusableNodes.current.length - 1;
    const index = focusableNodes.current.indexOf(document.activeElement);

    if (index === -1 || index === length) {
      return firstFocusableElement.current?.focus();
    }
    return focusableNodes.current[index + 1]?.focus();
  }, []);

  const focusPrevious = useCallback(() => {
    if (!document.activeElement) {
      return firstFocusableElement.current?.focus();
    }
    if (!isInstanceOf(document.activeElement, [HTMLElement])) {
      return firstFocusableElement.current?.focus();
    }
    const index = focusableNodes.current.indexOf(document.activeElement);

    if (index === -1 || index === 0) {
      return lastFocusableElement.current?.focus();
    }
    return focusableNodes.current[index - 1]?.focus();
  }, []);

  const resetFocus = useCallback<UseTabTrap["resetFocus"]>(() => {
    document.removeEventListener("focusout", handleWatchTab);
    if (originalFocus.current) {
      originalFocus.current.focus();
      isFocusWithin.current = false;
    }
  }, [handleWatchTab]);

  const subscribe = useCallback<UseTabTrap["subscribe"]>((cb) => {
    subscriptions.current.add(cb);
    return () => {
      subscriptions.current.delete(cb);
    };
  }, []);

  useEffect(() => {
    /**
     * We observe any changes to the container then re-determine which
     * elements are the first / last focusable elements.
     * This is more performant than checking on each tab key.
     * @see {@link [MDN](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)}
     */
    const observer: MutationObserver = new MutationObserver(() => {
      /**
       * We only want to re-evaluate the focusable elements
       * when a mutation occurs and the trap is active
       */
      if (contentRef.current && isTrapping.current) {
        setFirstAndLastFocusableElements(contentRef.current);
      }
    });

    if (contentRef.current) {
      observer.observe(contentRef.current, {
        subtree: true,
        childList: true,
      });
    }

    /**
     * We still remove the event listener when the component unmounts.
     * In case the component is removed without calling release trap.
     */
    return function useTabTrapCleanup(): void {
      document.removeEventListener("keydown", handleTab);
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("focusout", handleFocusOut);
      observer.disconnect();
    };
  }, [
    contentRef,
    handleEscape,
    handleFocusOut,
    handleTab,
    setFirstAndLastFocusableElements,
  ]);

  return useMemo(
    () => ({
      initialize,
      beginTrap,
      focusNext,
      focusPrevious,
      releaseTrap,
      resetFocus,
      subscribe,
    }),
    [
      beginTrap,
      focusNext,
      focusPrevious,
      initialize,
      releaseTrap,
      resetFocus,
      subscribe,
    ],
  );
};

export { useTabTrap };
