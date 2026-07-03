import fs from "fs";
import path from "path";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc 
} from "firebase/firestore";

// Read Firebase config
let db: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const app = initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
    });
    db = firebaseConfig.firestoreDatabaseId 
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  }
} catch (err: any) {
  console.warn("Could not initialize Firebase client:", err.message);
}

// Local JSON path helpers
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getLocalFile(name: string, defaultVal: any) {
  const filePath = path.join(DATA_DIR, name);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (e) {
      return defaultVal;
    }
  }
  return defaultVal;
}

function saveLocalFile(name: string, data: any) {
  const filePath = path.join(DATA_DIR, name);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// 1. Products Helpers
export async function dbGetProducts() {
  if (db) {
    try {
      const colRef = collection(db, "products");
      const snapshot = await getDocs(colRef);
      const products: any[] = [];
      snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });
      return products;
    } catch (err: any) {
      console.warn("Firestore dbGetProducts failed, falling back to local JSON:", err.message || err);
    }
  }
  return getLocalFile("products.json", []);
}

export async function dbSaveProduct(id: string, productData: any) {
  if (db) {
    try {
      const docRef = doc(db, "products", id);
      await setDoc(docRef, productData, { merge: true });
    } catch (err: any) {
      console.warn(`Firestore dbSaveProduct failed for ${id}:`, err.message || err);
    }
  }
  // Always update local file as well to keep in sync and handle fallback
  const products = getLocalFile("products.json", []);
  const index = products.findIndex((p: any) => p.id === id);
  const updatedItem = { id, ...productData };
  if (index !== -1) {
    products[index] = updatedItem;
  } else {
    products.push(updatedItem);
  }
  saveLocalFile("products.json", products);
}

export async function dbDeleteProduct(id: string) {
  if (db) {
    try {
      const docRef = doc(db, "products", id);
      await deleteDoc(docRef);
    } catch (err: any) {
      console.warn(`Firestore dbDeleteProduct failed for ${id}:`, err.message || err);
    }
  }
  const products = getLocalFile("products.json", []);
  const filtered = products.filter((p: any) => p.id !== id);
  saveLocalFile("products.json", filtered);
}

// 2. Orders Helpers
export async function dbGetOrders() {
  if (db) {
    try {
      const colRef = collection(db, "orders");
      const snapshot = await getDocs(colRef);
      const orders: any[] = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      return orders;
    } catch (err: any) {
      console.warn("Firestore dbGetOrders failed, falling back to local JSON:", err.message || err);
    }
  }
  return getLocalFile("orders.json", []);
}

export async function dbSaveOrder(id: string, orderData: any) {
  if (db) {
    try {
      const docRef = doc(db, "orders", id);
      await setDoc(docRef, orderData, { merge: true });
    } catch (err: any) {
      console.warn(`Firestore dbSaveOrder failed for ${id}:`, err.message || err);
    }
  }
  const orders = getLocalFile("orders.json", []);
  const index = orders.findIndex((o: any) => o.id === id);
  const updatedItem = { id, ...orderData };
  if (index !== -1) {
    orders[index] = updatedItem;
  } else {
    orders.push(updatedItem);
  }
  saveLocalFile("orders.json", orders);
}

export async function dbDeleteOrder(id: string) {
  if (db) {
    try {
      const docRef = doc(db, "orders", id);
      await deleteDoc(docRef);
    } catch (err: any) {
      console.warn(`Firestore dbDeleteOrder failed for ${id}:`, err.message || err);
    }
  }
  const orders = getLocalFile("orders.json", []);
  const filtered = orders.filter((o: any) => o.id !== id);
  saveLocalFile("orders.json", filtered);
}

// 3. Config Helpers (settings, categories, slides, carriers, payments)
export async function dbGetConfig(docName: string, defaultValue: any) {
  if (db) {
    try {
      const docRef = doc(db, "config", docName);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().value;
      }
      // Save default value if not exists in Firestore
      await setDoc(docRef, { value: defaultValue });
      return defaultValue;
    } catch (err: any) {
      console.warn(`Firestore dbGetConfig failed for ${docName}, falling back to local JSON:`, err.message || err);
    }
  }
  return getLocalFile(`${docName}.json`, defaultValue);
}

export async function dbSaveConfig(docName: string, value: any) {
  if (db) {
    try {
      const docRef = doc(db, "config", docName);
      await setDoc(docRef, { value });
    } catch (err: any) {
      console.warn(`Firestore dbSaveConfig failed for ${docName}:`, err.message || err);
    }
  }
  saveLocalFile(`${docName}.json`, value);
}

// Seeding / Migration helper from local json files to Firestore
export async function seedFirebaseFromLocal(
  initialProducts: any[],
  defaultSettings: any,
  defaultCategories: any[],
  defaultSlides: any[],
  defaultCarriers: any[],
  defaultPayments: any[]
) {
  try {
    // 1. Local data directories prep
    const seedMap = [
      { file: "products.json", defaultVal: initialProducts },
      { file: "settings.json", defaultVal: defaultSettings },
      { file: "categories.json", defaultVal: defaultCategories },
      { file: "slides.json", defaultVal: defaultSlides },
      { file: "carriers.json", defaultVal: defaultCarriers },
      { file: "payments.json", defaultVal: defaultPayments },
    ];
    for (const item of seedMap) {
      const filePath = path.join(DATA_DIR, item.file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(item.defaultVal, null, 2));
      }
    }

    if (!db) {
      console.log("Firebase is not initialized. Running in local JSON fallback mode.");
      return;
    }

    // 2. Try seeding to Firestore (gracefully, without throwing errors to crash the app)
    console.log("Attempting to sync with Firestore...");
    
    // Seed Products
    try {
      const productsInDb = await dbGetProducts();
      if (Array.isArray(productsInDb) && productsInDb.length === 0) {
        console.log("Seeding products to Firestore...");
        const localProducts = getLocalFile("products.json", initialProducts);
        for (const prod of localProducts) {
          const { id, ...data } = prod;
          const docRef = doc(db, "products", id);
          await setDoc(docRef, data, { merge: true });
        }
      }
    } catch (e: any) {
      console.warn("Could not seed products to Firestore:", e.message || e);
    }

    // Seed Orders
    try {
      const ordersInDb = await dbGetOrders();
      if (Array.isArray(ordersInDb) && ordersInDb.length === 0) {
        console.log("Seeding orders to Firestore...");
        const localOrders = getLocalFile("orders.json", []);
        for (const order of localOrders) {
          const { id, ...data } = order;
          const docRef = doc(db, "orders", id);
          await setDoc(docRef, data, { merge: true });
        }
      }
    } catch (e: any) {
      console.warn("Could not seed orders to Firestore:", e.message || e);
    }

    // Seed Configs
    const configsToSeed = [
      { name: "settings", defaultVal: defaultSettings },
      { name: "categories", defaultVal: defaultCategories },
      { name: "slides", defaultVal: defaultSlides },
      { name: "carriers", defaultVal: defaultCarriers },
      { name: "payments", defaultVal: defaultPayments },
    ];

    for (const conf of configsToSeed) {
      try {
        const docRef = doc(db, "config", conf.name);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          console.log(`Seeding config '${conf.name}' to Firestore...`);
          const val = getLocalFile(`${conf.name}.json`, conf.defaultVal);
          await setDoc(docRef, { value: val });
        }
      } catch (e: any) {
        console.warn(`Could not seed config '${conf.name}' to Firestore:`, e.message || e);
      }
    }

    console.log("Firestore sync/migration pass finished!");
  } catch (error: any) {
    console.warn("Warning during Firebase seeding/migration:", error);
  }
}
