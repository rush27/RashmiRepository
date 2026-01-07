
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp,
  Firestore
} from "firebase/firestore";
import { BrandContext, HistoryItem } from "./types";

/**
 * Robust Environment Variable Loader
 */
const getEnvVar = (key: string): string => {
  const prefixes = ['', 'VITE_', 'REACT_APP_', 'NEXT_PUBLIC_'];
  
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env) {
    for (const p of prefixes) {
      // @ts-ignore
      const val = process.env[p + key];
      if (val) return val;
    }
  }

  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    for (const p of prefixes) {
      // @ts-ignore
      const val = import.meta.env[p + key];
      if (val) return val;
    }
  }
  
  return "";
};

/**
 * Smart Parser for Firebase Config
 * Robustly handles raw JS copy-paste from Firebase Console
 */
const parseFirebaseConfig = (input: string) => {
  if (!input) return null;
  
  try {
    // 1. Try strict JSON parse first (fast path)
    return JSON.parse(input);
  } catch (e) {
    // 2. Fallback: Parse JS Object literal syntax
    try {
      // Extract the object literal part: start at first { and end at last }
      const firstBrace = input.indexOf('{');
      const lastBrace = input.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) return null;
      
      let snippet = input.substring(firstBrace, lastBrace + 1);
      
      // Step A: Remove comments (// ...) and (/* ... */)
      snippet = snippet
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '');

      // Step B: Quote the specific Firebase keys
      // This is safer than generic regex because it avoids replacing parts of URLs/values
      const keys = [
        'apiKey', 'authDomain', 'projectId', 'storageBucket', 
        'messagingSenderId', 'appId', 'measurementId'
      ];
      keys.forEach(key => {
        const regex = new RegExp(`\\b${key}\\s*:`, 'g');
        snippet = snippet.replace(regex, `"${key}":`);
      });

      // Step C: Convert single-quoted values to double-quoted
      // Look for: : 'value'
      snippet = snippet.replace(/:\s*'([^']*)'/g, ': "$1"');

      // Step D: Remove trailing commas before closing braces
      snippet = snippet.replace(/,(\s*})/g, '$1');

      return JSON.parse(snippet);
    } catch (e2) {
      console.error("Failed to parse Firebase config", e2);
      return null;
    }
  }
};

let db: Firestore | undefined;
let app: FirebaseApp | undefined;

const initFirebase = () => {
  try {
    // 1. Try Manual Config from LocalStorage
    const manualConfigStr = localStorage.getItem('mccia_firebase_config_manual');
    const manualConfig = parseFirebaseConfig(manualConfigStr || '');

    if (manualConfig && manualConfig.apiKey && manualConfig.projectId) {
      app = getApps().length === 0 ? initializeApp(manualConfig) : getApps()[0];
      db = getFirestore(app);
      console.log("Firebase initialized via manual config.");
      return;
    }

    // 2. Try Environment Variables
    const envConfig = {
      apiKey: getEnvVar("FIREBASE_API_KEY"),
      projectId: getEnvVar("FIREBASE_PROJECT_ID"),
      authDomain: getEnvVar("FIREBASE_AUTH_DOMAIN"),
      storageBucket: getEnvVar("FIREBASE_STORAGE_BUCKET"),
      messagingSenderId: getEnvVar("FIREBASE_MESSAGING_SENDER_ID"),
      appId: getEnvVar("FIREBASE_APP_ID")
    };

    if (envConfig.apiKey && envConfig.projectId) {
      app = getApps().length === 0 ? initializeApp(envConfig) : getApps()[0];
      db = getFirestore(app);
      console.log("Firebase initialized via environment variables.");
    } else {
      console.warn("Firebase credentials missing. App running in offline mode.");
    }
  } catch (error) {
    console.error("Firebase startup error:", error);
  }
};

// Initialize immediately
initFirebase();

export { db };

// Helper to save manual config and reload
export const saveManualFirebaseConfig = (rawConfig: string) => {
  // Validate it parses before saving
  const parsed = parseFirebaseConfig(rawConfig);
  if (parsed && parsed.apiKey && parsed.projectId) {
    localStorage.setItem('mccia_firebase_config_manual', rawConfig);
    window.location.reload(); 
  } else {
    alert("Invalid Firebase Configuration.\nPlease paste the full 'const firebaseConfig = { ... }' block.");
  }
};

export const getClientId = () => {
  let id = localStorage.getItem('mccia_client_id');
  if (!id) {
    id = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('mccia_client_id', id);
  }
  return id;
};

export const saveUserProfile = async (brand: BrandContext) => {
  const clientId = getClientId();
  localStorage.setItem('mccia_brand_profile', JSON.stringify(brand));
  
  if (!db) return;
  try {
    await setDoc(doc(db, "users", clientId), {
      ...brand,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Cloud sync failed:", error);
  }
};

export const getUserProfile = async (): Promise<BrandContext | null> => {
  // 1. Load Local
  let localData: BrandContext | null = null;
  try {
    const local = localStorage.getItem('mccia_brand_profile');
    if (local) localData = JSON.parse(local);
  } catch (e) {}

  if (!db) return localData;

  // 2. Try Cloud Sync
  const clientId = getClientId();
  try {
    const docRef = doc(db, "users", clientId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Case A: Cloud has data. Cloud is truth. Sync Down.
      const cloudData = docSnap.data() as BrandContext;
      console.log("Synced profile from cloud.");
      localStorage.setItem('mccia_brand_profile', JSON.stringify(cloudData));
      return cloudData;
    } else if (localData) {
      // Case B: Cloud is empty, but Local has data. Sync Up (Initial Sync).
      console.log("Cloud profile missing. Syncing local to cloud...");
      await setDoc(docRef, {
        ...localData,
        updatedAt: Timestamp.now()
      });
      return localData;
    }
  } catch (error) {
    console.error("Cloud fetch failed:", error);
  }
  
  return localData;
};

export const addHistoryToCloud = async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
  const localHistory = JSON.parse(localStorage.getItem('mccia_history') || '[]');
  const tempId = 'item_' + Date.now();
  const newItem = { ...item, id: tempId, timestamp: Date.now() };
  localStorage.setItem('mccia_history', JSON.stringify([newItem, ...localHistory].slice(0, 50)));

  if (!db) return tempId;

  const clientId = getClientId();
  try {
    const docRef = await addDoc(collection(db, "users", clientId, "history"), {
      ...item,
      timestamp: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    return tempId;
  }
};

export const getHistoryFromCloud = async (): Promise<HistoryItem[]> => {
  const localHistory: HistoryItem[] = JSON.parse(localStorage.getItem('mccia_history') || '[]');
  
  if (!db) return localHistory;

  const clientId = getClientId();
  const historyCollection = collection(db, "users", clientId, "history");

  try {
    // 1. Sync Up: Find offline items (ids starting with 'item_') and upload them
    const offlineItems = localHistory.filter(h => h.id.startsWith('item_'));
    if (offlineItems.length > 0) {
      console.log(`Uploading ${offlineItems.length} offline history items...`);
      await Promise.all(offlineItems.map(async (item) => {
        // Remove the temporary ID and timestamp (let Firestore generate ID and handle time)
        const { id, ...data } = item; 
        await addDoc(historyCollection, {
          ...data,
          timestamp: Timestamp.fromMillis(item.timestamp)
        });
      }));
    }

    // 2. Sync Down: Get latest 50 items from Cloud
    const q = query(
      historyCollection, 
      orderBy("timestamp", "desc"), 
      limit(50)
    );
    const querySnapshot = await getDocs(q);
      
    const cloudHistory = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toMillis() || Date.now()
      } as HistoryItem;
    });

    if (cloudHistory.length > 0) {
      localStorage.setItem('mccia_history', JSON.stringify(cloudHistory));
      return cloudHistory;
    }
  } catch (error) {
    console.error("History sync error:", error);
  }
  
  return localHistory;
};
