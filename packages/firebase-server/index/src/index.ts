import * as admin from "firebase-admin";
import { Throwable, isSSR } from "@ouellettec/utils";
import { App as FirebaseAdminApp, getApps } from "firebase-admin/app";

let firebaseAdmin: FirebaseAdminApp;
let firebaseAdminConfig: FirebaseAdminConfig;

type FirebaseAdminConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  databaseURL: string;
};

export function setFirebaseAdminConfig(config: FirebaseAdminConfig): void {
  firebaseAdminConfig = config;
}

export function getFirebaseAdminConfig(): FirebaseAdminConfig {
  return firebaseAdminConfig;
}

export function initializeFirebaseAdmin(): FirebaseAdminApp | void {
  const firebaseAdminConfig = getFirebaseAdminConfig();
  if (isSSR()) {
    if (!getApps().length) {
      if (!firebaseAdminConfig) {
        throw new Error(
          `The firebase admin config has not been set. Call "setFirebaseAdminConfig" before initializing the admin.`,
        );
      }
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseAdminConfig.projectId,
          clientEmail: firebaseAdminConfig.clientEmail,
          privateKey: firebaseAdminConfig.privateKey,
        }),
        databaseURL: firebaseAdminConfig.databaseURL,
      });
      return firebaseAdmin;
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
