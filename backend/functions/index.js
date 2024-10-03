const functions = require("firebase-functions/v2");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require('cors')({ origin: true });
const crypto = require('crypto');
const serviceAccount = require("./serviceAccount.json");
const { error } = require("console");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://block-stash-default-rtdb.firebaseio.com"
});
const db = admin.firestore();

// AES encryption function
function encrypt(text, encryptionKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// AES decryption function
function decrypt(text, encryptionKey) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

async function getNextFileId() {
  const counterDocRef = db.collection('fileCounters').doc('fileIdCounter');
  return await db.runTransaction(async (transaction) => {
    const counterDoc = await transaction.get(counterDocRef);
    let newFileId = 1;

    if (counterDoc.exists) {
      newFileId = counterDoc.data().lastFileId + 1;
    }

    transaction.set(counterDocRef, { lastFileId: newFileId });
    return newFileId;
  });
}

// Store encryption key securely in Firestore
exports.storeKey = onRequest({ region: 'us-central1', memory: '256MiB', timeoutSeconds: 60 }, async (req, res) => {
  cors(req, res, async () => {
    const { fileName, walletAddress, ipfsHash } = req.body;

    if (!fileName || !walletAddress || !ipfsHash) {
      console.error("Missing required parameters:", { fileName, walletAddress, ipfsHash });
      return res.status(400).send({ error: 'Missing required parameters' });
    }

    try {
      const encryptionKey = crypto.randomBytes(32).toString('hex'); // Generate encryption key
      const encryptedHash = encrypt(ipfsHash, encryptionKey); // Encrypt the IPFS hash
      const fileId = await getNextFileId();

      // Store the encrypted key and hash in Firestore
      await db.collection('encryptionKeys').doc(fileId.toString()).set({
        fileName,
        walletAddress,
        encryptedKey: encryptionKey,
        encryptedHash,
        createdAt: admin.firestore.Timestamp.now(),
      });

      console.log("Key stored successfully for fileId:", fileId);
      res.status(200).send({ encryptedHash, fileId });
    } catch (error) {
      console.error('Error storing key:', error);
      res.status(500).send({ error: 'Failed to store the key' });
    }
  });
});
  
// Retrieve encryption key securely
exports.getKey = onRequest({ region: 'us-central1', memory: '256MiB', timeoutSeconds: 60 }, async (req, res) => {
  cors(req, res, async () => {
    console.log('Received request for getKey:', req.body);
    const { fileId, walletAddress } = req.body;

    if (!fileId || !walletAddress) {
      return res.status(400).send({ error: 'Missing required parameters' });
    }

    try {
      const keyDoc = await db.collection('encryptionKeys').doc(fileId.toString()).get();
      if (!keyDoc.exists) {
        return res.status(404).send({ error: 'Key not found' });
      }

      const data = keyDoc.data();
      const normalizedStoredWallet = data.walletAddress.toLowerCase();
      const normalizedRequestWallet = walletAddress.toLowerCase();
      if (normalizedStoredWallet !== normalizedRequestWallet) {
        return res.status(403).send({ error: 'Access denied' });
      }

      // Decrypt and return the AES key and IPFS hash
      const decryptedHash = decrypt(data.encryptedHash, data.encryptedKey);  // Decrypt the IPFS hash

      res.status(200).send({ encryptionKey: decryptedHash });
    } catch (error) {
      console.error('Error retrieving key:', error);
      res.status(500).send({ error: 'Failed to retrieve the key' });
    }
  });
});

exports.deleteFile = onRequest({ region: 'us-central1', memory: '256MiB', timeoutSeconds: 60 }, async (req, res) => {
  cors(req, res, async () => {
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).send({ error: 'Missing required parameters' });
    }
    if(typeof fileId !== 'string') {
      return res.status(400).send({ error: 'File ID is not string'});
    }

    try {
      // Delete the Firestore record
      await db.collection('encryptionKeys').doc(fileId).delete();

      console.log("File successfully deleted from Firestore.");
      res.status(200).send({ message: 'File deleted' });
    } catch (error) {
      console.error("Error deleting file from Firestore: ", error);
      res.status(500).send({ error: 'Failed to delete file' });
    }
  });
});
