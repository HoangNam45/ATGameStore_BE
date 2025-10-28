// Firebase Admin SDK initialization with proper error handling
const admin = require("firebase-admin");

let db = null;
let auth = null;

// Try to initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      db = admin.firestore();
      auth = admin.auth();
      return { db, auth };
    }

    // Check for Firebase Admin credentials
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.warn("⚠️  Firebase Admin SDK credentials not found:");
      console.warn("   - PROJECT_ID:", !!projectId);
      console.warn("   - CLIENT_EMAIL:", !!clientEmail);
      console.warn("   - PRIVATE_KEY:", !!privateKey);
      throw new Error("Missing Firebase Admin credentials");
    }

    console.log("🔑 Initializing Firebase Admin SDK...");
    console.log("   - Project ID:", projectId);
    console.log("   - Client Email:", clientEmail);
    console.log("   - Private Key:", privateKey ? "Present" : "Missing");

    // Initialize with service account
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });

    db = admin.firestore();
    auth = admin.auth();

    console.log("✅ Firebase Admin SDK initialized successfully");
    return { db, auth };
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", error.message);
    throw error;
  }
}

// Alternative: Initialize with regular Firebase (client-side) for development
function initializeFirebaseClient() {
  const { initializeApp, getApps } = require("firebase/app");
  const {
    getFirestore,
    connectFirestoreEmulator,
  } = require("firebase/firestore");
  const { getAuth, connectAuthEmulator } = require("firebase/auth");

  if (getApps().length > 0) {
    // Already initialized
    const firebaseClient = require("firebase/app");
    return {
      db: require("firebase/firestore").getFirestore(),
      auth: require("firebase/auth").getAuth(),
    };
  }

  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  const clientDb = getFirestore(app);
  const clientAuth = getAuth(app);

  console.log("✅ Firebase Client SDK initialized for backend use");

  return {
    db: clientDb,
    auth: clientAuth,
    isClientMode: true,
  };
}

// Initialize Firebase (try Admin first, fallback to Client)
let firebase;
let usingClientMode = false;

try {
  firebase = initializeFirebaseAdmin();
  console.log("✅ Using Firebase Admin SDK");
} catch (adminError) {
  console.log("🔄 Falling back to Firebase Client SDK...");
  try {
    firebase = initializeFirebaseClient();
    usingClientMode = true;
    console.log("✅ Using Firebase Client SDK (fallback mode)");
  } catch (clientError) {
    console.error(
      "❌ Failed to initialize any Firebase SDK:",
      clientError.message
    );
    throw new Error("Cannot initialize Firebase SDK");
  }
}

module.exports = {
  db: firebase.db,
  auth: firebase.auth,
  isClientMode: usingClientMode,
  admin: admin.apps.length > 0 ? admin : null,
};
