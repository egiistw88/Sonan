
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  updateDoc, 
  doc, 
  query, 
  onSnapshot,
  setDoc,
  enableIndexedDbPersistence,
  orderBy,
  QuerySnapshot,
  DocumentSnapshot
} from "firebase/firestore";
import { Transaction, DailyTargets } from "../types";

// --- KONFIGURASI FIREBASE ---
// PENTING: Ganti nilai-nilai ini dengan config dari Firebase Console Anda
// Pastikan variabel environment sudah di-set di Vercel jika menggunakan process.env
// Atau hardcode untuk testing sementara (namun amankan key Anda)
const firebaseConfig = {
  apiKey: "ISI_API_KEY_ANDA_DISINI",
  authDomain: "ISI_PROJECT_ID.firebaseapp.com",
  projectId: "ISI_PROJECT_ID",
  storageBucket: "ISI_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "ISI_SENDER_ID",
  appId: "ISI_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Enable Offline Persistence (Agar data aman saat sinyal hilang)
try {
    enableIndexedDbPersistence(db).catch((err: any) => {
        if (err.code == 'failed-precondition') {
            console.log('Persistence failed: Multiple tabs open');
        } else if (err.code == 'unimplemented') {
            console.log('Persistence not supported by browser');
        }
    });
} catch (e) {
    console.log("Persistence init error", e);
}

// --- AUTH SERVICE ---
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed", error);
  }
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// --- DATA SERVICE ---
export const saveUserProfile = async (uid: string, targets: DailyTargets) => {
    try {
        await setDoc(doc(db, "users", uid), { targets }, { merge: true });
    } catch (e) {
        console.error("Error saving profile", e);
    }
};

export const subscribeToTransactions = (uid: string, callback: (txs: Transaction[]) => void) => {
    const q = query(collection(db, "users", uid, "transactions"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot: QuerySnapshot) => {
        const txs: Transaction[] = [];
        snapshot.forEach((doc) => {
            txs.push({ ...doc.data(), id: doc.id } as Transaction);
        });
        callback(txs);
    });
};

export const subscribeToTargets = (uid: string, callback: (targets: DailyTargets) => void) => {
    return onSnapshot(doc(db, "users", uid), (docSnap: DocumentSnapshot) => {
        if (docSnap.exists() && docSnap.data()?.targets) {
            callback(docSnap.data()?.targets as DailyTargets);
        }
    });
};

export const addTransactionToCloud = async (uid: string, tx: Transaction) => {
    // Gunakan setDoc dengan ID yang kita generate sendiri (timestamp based) agar konsisten
    await setDoc(doc(db, "users", uid, "transactions", tx.id), tx);
};

export const updateTransactionInCloud = async (uid: string, txId: string, data: Partial<Transaction>) => {
    await updateDoc(doc(db, "users", uid, "transactions", txId), data);
};

export { auth, db };
