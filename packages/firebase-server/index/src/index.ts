import * as admin from "firebase-admin";
import { Throwable, isSSR } from "@ouellettec/utils";
import { App as FirebaseAdminApp, getApps } from "firebase-admin/app";

let firebaseAdmin: FirebaseAdminApp;

export type FirebaseAdminConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  databaseURL: string;
};

export function initializeFirebaseAdmin(config: FirebaseAdminConfig): void {
  if (isSSR()) {
    if (!getApps().length) {
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.projectId,
          clientEmail: config.clientEmail,
          privateKey: config.privateKey,
        }),
        databaseURL: config.databaseURL,
      });
    }
  }
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
