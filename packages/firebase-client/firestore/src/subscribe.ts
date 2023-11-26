// import { onSnapshot, FirestoreError } from "firebase/firestore";
// import { getFirestoreCollection } from "./collections";

// export function subscribeToCollection(
//   name: string,
//   onError?: (error: FirestoreError) => void,
// ): () => void {
//   return onSnapshot(
//     getFirestoreCollection(name),
//     function handleSnapshotUpdate(updates) {
//       updates.docChanges().forEach((update) => {
//         if (update.type === "added") {
//           collection.data[update.doc.id] = update.doc.data();
//         } else if (update.type === "modified") {
//           collection.data[update.doc.id] = update.doc.data();
//         } else {
//           delete collection.data[update.doc.id];
//         }
//       });
//       firestoreStore.set({ [name]: collection });
//     },
//     function handleSnapshotError(error) {
//       const collection = getStoredFirestoreCollection(name);
//       collection.status = "error";
//       firestoreStore.set({ [name]: collection });
//       onError?.(error);
//     },
//   );
// }
