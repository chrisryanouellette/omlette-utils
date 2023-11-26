import {
  CollectionReference,
  DocumentData,
  collection,
  getFirestore,
} from "firebase/firestore";
import { getFirebaseClient } from "@ouellettec/utils-firebase";
import { Throwable } from "@ouellettec/utils";

export function getFirestoreCollection<T extends DocumentData>(
  collectionName: string,
): Throwable<CollectionReference<T>> {
  const client = getFirebaseClient();
  if (client.isError) return client;
  const db = getFirestore(client.value);
  const result = collection(db, collectionName) as CollectionReference<T>;
  return { isError: false, value: result };
}
