import { FirebaseApp, initializeApp, FirebaseOptions } from "firebase/app";
import { Throwable, isSSR } from "@ouellettec/utils";

const subs = new Set<(firebaseClient: FirebaseApp) => void>();

let firebaseClient: FirebaseApp | undefined;

/** Allows the developer to create a new firebase instance */
export function initializeFirebaseClient(
  args: FirebaseOptions,
): Throwable<FirebaseApp> {
  if (isSSR()) {
    return {
      isError: true,
      error: new Error(
        "The Firebase client SDK can not be initialized on the server.",
      ),
    };
  }
  if (firebaseClient) {
    return { isError: false, value: firebaseClient };
  }
  firebaseClient = initializeApp(args);
  subs.forEach((sub) => sub(firebaseClient!));
  subs.clear();
  return { isError: false, value: firebaseClient };
}

export function getFirebaseClient(): Throwable<FirebaseApp> {
  if (!firebaseClient) {
    return {
      isError: true,
      error: new Error("Firebase client has not been initialized."),
    };
  }
  return { isError: false, value: firebaseClient };
}

/**
 * Allows us to pause the execution of modular functions that depend on the
 * firebase client SDK to be initialized before running
 */
export function subscribeToFirebaseClientInit(
  sub: (firebaseClient: FirebaseApp) => void,
): (() => void) | void {
  if (firebaseClient) {
    sub(firebaseClient);
  } else {
    subs.add(sub);
    return () => subs.delete(sub);
  }
}
