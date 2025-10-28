class CryptoService {
  constructor() {
    this.ENCRYPTION_KEY_ID = "v1";
  }

  decryptGameCredential(encryptedData, keyId) {
    try {
      console.log("🔐 Attempting to decrypt:", { encryptedData, keyId });

      if (!encryptedData || encryptedData.trim() === "") {
        return "";
      }

      if (typeof encryptedData !== "string") {
        throw new Error(`Invalid encrypted data type: ${typeof encryptedData}`);
      }

      const key = process.env.ENCRYPTION_KEY;
      if (!key) throw new Error("Encryption key not found");

      if (keyId !== this.ENCRYPTION_KEY_ID) {
        throw new Error("Invalid encryption key version");
      }

      const CryptoJS = require("crypto-js");
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
      const plainText = decrypted.toString(CryptoJS.enc.Utf8);

      if (!plainText) {
        throw new Error("Failed to decrypt data");
      }

      return plainText;
    } catch (error) {
      console.error("❌ Decryption error:", error);
      throw new Error("Failed to decrypt game credentials");
    }
  }

  decryptGameAccount(gameAccount) {
    if (!gameAccount) {
      throw new Error("Game account data not found");
    }

    return {
      username: this.decryptGameCredential(
        gameAccount.username,
        gameAccount.encryptionKeyId
      ),
      password: this.decryptGameCredential(
        gameAccount.password,
        gameAccount.encryptionKeyId
      ),
    };
  }
}

module.exports = CryptoService;
