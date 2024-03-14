import admin from "firebase-admin";
import { Throwable, getErrorMessage, isSSR } from "@ouellettec/utils";
import { App as FirebaseAdminApp } from "firebase-admin/app";

export type FirebaseAdminConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  databaseURL?: string;
  databaseAuthVariableOverride?: { uid: string } | null;
  storageBucket?: string;
};

let firebaseAdmin: FirebaseAdminApp;

export function initializeFirebaseAdmin(
  config: FirebaseAdminConfig,
): Throwable<void> {
  if (isSSR()) {
    try {
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.projectId,
          clientEmail: config.clientEmail,
          privateKey: config.privateKey,
        }),
        serviceAccountId: config.clientEmail,
        databaseURL: config.databaseURL,
        databaseAuthVariableOverride: config.databaseAuthVariableOverride,
        storageBucket: config.storageBucket,
      });
      return { isError: false };
    } catch (error) {
      if (error instanceof Error) {
        if (/already exists/u.test(error.message)) {
          return { isError: false };
        }
      }
      return { isError: true, error: new Error(getErrorMessage(error)) };
    }
  }
  return {
    isError: true,
    error: new Error(
      "Function 'initializeFirebaseAdmin' can not be called on the client",
    ),
  };
}

export function getFirebaseAdmin(): Throwable<FirebaseAdminApp> {
  if (!firebaseAdmin) {
    return {
      isError: true,
      error: new Error("Firebase admin as not been initialized"),
    };
  }
  return { isError: false, value: firebaseAdmin };
}

export { admin };
