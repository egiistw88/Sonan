
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  getRedirectResult,
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
const firebaseConfig = {
  apiKey: "AIzaSyBlqJFn0fxhOqSI3-56EdkcgRv76VTazpo",
  authDomain: "sonan-sobat-jalanan.firebaseapp.com",
  projectId: "sonan-sobat-jalanan",
  storageBucket: "sonan-sobat-jalanan.firebasestorage.app",
  messagingSenderId: "696194743528",
  appId: "1:696194743528:web:a5cbf6a92432f0b7229d5d",
  measurementId: "G-HLKM9FSTTX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const db = getFirestore(app);

// Configure Provider
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account'
});

// Enable Offline Persistence (Silent Fail)
try {
    enableIndexedDbPersistence(db).catch(() => {});
} catch (e) {
    // Ignore persistence errors
}

// --- AUTH SERVICE ---

// Fungsi ini harus dipanggil saat App mount untuk mengecek apakah user baru kembali dari Google
export const checkRedirectAuth = async () => {
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            console.log("Redirect Login Success:", result.user.email);
            return result.user;
        }
    } catch (error) {
        console.error("Redirect Error:", error);
    }
    return null;
};

export const loginWithGoogle = async () => {
  try {
    console.log("Starting Redirect...");
    await signInWithRedirect(auth, provider);
  } catch (error: any) {
    console.error("Login Trigger Failed:", error);
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
    }, (error) => {
        console.log("Offline mode or permission error", error);
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
    await setDoc(doc(db, "users", uid, "transactions", tx.id), tx);
};

export const updateTransactionInCloud = async (uid: string, txId: string, data: Partial<Transaction>) => {
    await updateDoc(doc(db, "users", uid, "transactions", txId), data);
};

export { auth, db };
