import { Throwable } from "@ouellettec/utils";
import { getFirebaseClient } from "@ouellettec/utils-firebase";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

export function enableFirebaseEmulator(
  host: string = "localhost",
  port = 8080,
): Throwable<void> {
  const client = getFirebaseClient();
  if (client.isError) return client;
  const db = getFirestore(client.value);
  connectFirestoreEmulator(db, host, port);
  return { isError: false };
}
