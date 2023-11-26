import { Throwable, getErrorMessage } from "@ouellettec/utils";
import { getFirebaseClient } from "@ouellettec/utils-firebase";
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  OAuthCredential,
  UserCredential,
  getRedirectResult,
  signOut,
} from "firebase/auth";

export function getFirebaseAuth(): Throwable<ReturnType<typeof getAuth>> {
  const app = getFirebaseClient();
  if (app.isError) return app;
  const auth = getAuth(app.value);
  return { isError: false, value: auth };
}

export type SignInResult = {
  result: UserCredential;
  credentials: OAuthCredential;
};

export async function firebaseSignInWithPopup(
  provider: GoogleAuthProvider,
): Promise<Throwable<SignInResult>> {
  try {
    const auth = getFirebaseAuth();
    if (auth.isError) return auth;
    const result = await signInWithPopup(auth.value, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential) {
      return {
        isError: true,
        error: new Error("No credentials where returned from login result."),
      };
    }
    return { isError: false, value: { credentials: credential, result } };
  } catch (error) {
    return { isError: true, error: new Error(getErrorMessage(error)) };
  }
}

export function firebaseSignInWithRedirect(
  provider: GoogleAuthProvider,
): Throwable<void> {
  try {
    const auth = getFirebaseAuth();
    if (auth.isError) return auth;
    signInWithRedirect(auth.value, provider);
    return { isError: false };
  } catch (error) {
    return { isError: true, error: new Error(getErrorMessage(error)) };
  }
}

export async function firebaseSignInFromRedirect(): Promise<
  Throwable<SignInResult | null>
> {
  try {
    const auth = getFirebaseAuth();
    if (auth.isError) return auth;
    const result = await getRedirectResult(auth.value);
    if (!result) {
      return { isError: false, value: null };
    }
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential) {
      return {
        isError: true,
        error: new Error("No credentials where returned from login result."),
      };
    }
    return { isError: false, value: { credentials: credential, result } };
  } catch (error) {
    return { isError: true, error: new Error(getErrorMessage(error)) };
  }
}

export async function firebaseSignOut(): Promise<Throwable<void>> {
  try {
    const auth = getFirebaseAuth();
    if (auth.isError) return auth;
    await signOut(auth.value);
    return { isError: false };
  } catch (error) {
    return { isError: true, error: new Error(getErrorMessage(error)) };
  }
}
