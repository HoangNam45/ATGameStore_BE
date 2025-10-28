const jwt = require("jsonwebtoken");
const { db, auth, admin, isClientMode } = require("../config/firebase");

// Middleware to verify Firebase ID token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    const idToken = authHeader.split("Bearer ")[1];

    let decodedToken;

    if (admin && !isClientMode) {
      // Use Firebase Admin SDK to verify token
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } else {
      try {
        // Decode token without verification (development only)
        const tokenParts = idToken.split(".");
        if (tokenParts.length !== 3) {
          throw new Error("Invalid JWT format - expected 3 parts");
        }

        const payload = JSON.parse(
          Buffer.from(tokenParts[1], "base64").toString()
        );

        decodedToken = {
          uid: payload.user_id || payload.sub,
          email: payload.email,
        };
      } catch (decodeError) {
        console.error("❌ Token decode error:", decodeError.message);
        throw new Error("Invalid token format: " + decodeError.message);
      }
    }

    // Get user info from Firestore

    let userDoc, userData;

    if (isClientMode) {
      // Use Firebase Client SDK
      const { doc, getDoc } = require("firebase/firestore");
      const userRef = doc(db, "users", decodedToken.uid);
      userDoc = await getDoc(userRef);
      userData = userDoc.exists() ? userDoc.data() : null;
    } else {
      // Use Firebase Admin SDK
      userDoc = await db.collection("users").doc(decodedToken.uid).get();
      userData = userDoc.exists ? userDoc.data() : null;
    }

    if (!userData) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Add user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData.role || "user",
      emailVerified: userData.emailVerified || false,
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
    });
  }
};

const requireOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
  }

  if (req.user.role !== "owner") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Owner access required",
    });
  }

  next();
};

const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Email verification required",
    });
  }

  next();
};

module.exports = {
  verifyFirebaseToken,
  requireOwner,
  requireVerified,
  db,
};
