import { DecodedIdToken } from "firebase-admin/auth";
import { Throwable, getErrorMessage } from "@ouellettec/utils";
import admin, { getFirebaseAdmin } from "@ouellettec/utils-firebase-admin";

export function getFirebaseAuth(): Throwable<ReturnType<typeof admin.auth>> {
  const app = getFirebaseAdmin();
  if (app.isError) return app;
  const auth = admin.auth(app.value);
  return { isError: false, value: auth };
}

export async function firebaseValidateAuthToken(
  token: string,
): Promise<Throwable<DecodedIdToken>> {
  try {
    const auth = getFirebaseAuth();
    if (auth.isError) return auth;
    const result = await auth.value.verifyIdToken(token);
    return { isError: false, value: result };
  } catch (error) {
    return { isError: true, error: new Error(getErrorMessage(error)) };
  }
}

export async function firebaseCreateSessionCookie(
  token: string,
  expiration: number,
): Promise<Throwable<string>> {
  try {
    const auth = getFirebaseAuth();
    if (auth.isError) return auth;
    const cookie = await auth.value.createSessionCookie(token, {
      expiresIn: expiration,
    });
    return { isError: false, value: cookie };
  } catch (error) {
    return { isError: true, error: new Error(getErrorMessage(error)) };
  }
}
