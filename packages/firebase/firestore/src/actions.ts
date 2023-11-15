import {
  DocumentData,
  DocumentReference,
  SetOptions,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  getFirestore,
} from "firebase/firestore";
import { getFirebaseClient } from "@ouellettec/utils-firebase";
import { getFirestoreCollection } from "./collections";

export function getFirestoreDoc<T extends DocumentData>(
  name: string,
  id?: string,
): DocumentReference<T> {
  const client = getFirebaseClient();
  const db = getFirestore(client);
  return (id ? doc(db, name, id) : doc(db, name)) as DocumentReference<T>;
}

export async function createFirestoreDoc<T extends DocumentData>(
  name: string,
  data: T,
): Promise<DocumentReference<T>> {
  const collection = getFirestoreCollection<T>(name);
  return await addDoc(collection, data);
}

export async function setFirestoreDoc<T extends DocumentData>(
  name: string,
  id: string,
  data: T,
  option: SetOptions = {},
): Promise<void> {
  const collection = getFirestoreCollection<T>(name);
  return await setDoc(doc(collection, id), data, option);
}

export async function updateFirestoreDoc<T extends DocumentData>(
  name: string,
  id: string,
  data: T,
  option: SetOptions = {},
): Promise<void> {
  const collection = getFirestoreCollection<T>(name);
  return await setDoc(doc(collection, id), data, {
    ...option,
    merge: true,
  });
}

export async function deleteFirestoreDoc(
  name: string,
  id: string,
): Promise<void> {
  const collection = getFirestoreCollection(name);
  return await deleteDoc(doc(collection, id));
}
