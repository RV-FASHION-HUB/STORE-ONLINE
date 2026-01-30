// set-admin-claim.js
// Usage: node set-admin-claim.js <USER_UID>
// Requires a service account JSON at ./serviceAccountKey.json

const admin = require('firebase-admin');
const path = require('path');

const keyPath = path.join(__dirname, 'serviceAccountKey.json');

try {
  const serviceAccount = require(keyPath);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
} catch (err) {
  console.error('Missing or invalid serviceAccountKey.json in scripts/. Place your Firebase service account JSON there.');
  process.exit(1);
}

async function setAdmin(uid) {
  if (!uid) {
    console.error('Usage: node set-admin-claim.js <USER_UID>');
    process.exit(1);
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { isAdmin: true });
    console.log('Custom claim set for', uid);
    console.log('Ask the user to sign out and sign back in to refresh their token.');
  } catch (err) {
    console.error('Error setting custom claim:', err);
  }
}

setAdmin(process.argv[2]);
