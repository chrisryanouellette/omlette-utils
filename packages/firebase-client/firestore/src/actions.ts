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
import { Throwable, getErrorMessage } from "@ouellettec/utils";
import { getFirestoreCollection } from "./collections";

export function getFirestoreDoc<T extends DocumentData>(
  name: string,
  id?: string,
): Throwable<DocumentReference<T>> {
  const client = getFirebaseClient();
  if (client.isError) return client;
  const db = getFirestore(client.value);
  const result = (
    id ? doc(db, name, id) : doc(db, name)
  ) as DocumentReference<T>;
  return { isError: false, value: result };
}

export async function createFirestoreDoc<T extends DocumentData>(
  name: string,
  data: T,
): Promise<Throwable<DocumentReference<T>>> {
  try {
    const collection = getFirestoreCollection<T>(name);
    if (collection.isError) return collection;
    const result = await addDoc(collection.value, data);
    return { isError: false, value: result };
  } catch (error) {
    return { isError: true, error: new Error(getErrorMessage(error)) };
  }
}

export async function setFirestoreDoc<T extends DocumentData>(
  name: string,
  id: string,
  data: T,
  option: SetOptions = {},
): Promise<Throwable<void>> {
  try {
    const collection = getFirestoreCollection<T>(name);
    if (collection.isError) return collection;
    await setDoc(doc(collection.value, id), data, option);
    return { isError: false };
  } catch (error) {
    return { isError: true, error: new Error(getErrorMessage(error)) };
  }
}

export async function updateFirestoreDoc<T extends DocumentData>(
  name: string,
  id: string,
  data: T,
  option: SetOptions = {},
): Promise<Throwable<void>> {
  try {
    const collection = getFirestoreCollection<T>(name);
    if (collection.isError) return collection;
    await setDoc(doc(collection.value, id), data, {
      ...option,
      merge: true,
    });
    return { isError: false };
  } catch (error) {
    return { isError: true, error: new Error(getErrorMessage(error)) };
  }
}

export async function deleteFirestoreDoc(
  name: string,
  id: string,
): Promise<Throwable<void>> {
  try {
    const collection = getFirestoreCollection(name);
    if (collection.isError) return collection;
    await deleteDoc(doc(collection.value, id));
    return { isError: false };
  } catch (error) {
    return { isError: true, error: new Error(getErrorMessage(error)) };
  }
}
