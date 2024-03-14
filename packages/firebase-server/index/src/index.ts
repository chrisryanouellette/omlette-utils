import admin from "firebase-admin";
import { Throwable, getErrorMessage, isSSR } from "@ouellettec/utils";
import { App as FirebaseAdminApp, getApp } from "firebase-admin/app";

export type FirebaseAdminConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  databaseURL: string;
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
        databaseURL: config.databaseURL,
      });
      return { isError: false };
    } catch (error) {
      if (error instanceof Error) {
        if (/already exists/u.test(error.message)) {
          firebaseAdmin = getApp();
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
