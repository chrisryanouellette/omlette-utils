import {
  CollectionReference,
  DocumentData,
  collection,
  getFirestore,
} from "firebase/firestore";
import { getFirebaseClient } from "@ouellettec/utils-firebase";

export function getFirestoreCollection<T extends DocumentData>(
  collectionName: string,
): CollectionReference<T> {
  const client = getFirebaseClient();
  const db = getFirestore(client);
  return collection(db, collectionName) as CollectionReference<T>;
}
