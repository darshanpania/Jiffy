/**
 * Firebase Admin SDK Configuration
 * Used ONLY for Firebase Cloud Messaging (FCM)
 */

const admin = require('firebase-admin');
const config = require('./config');
const logger = require('./logger');

if (!config.fcm.projectId || !config.fcm.privateKey || !config.fcm.clientEmail) {
  logger.warn('Firebase FCM not configured - push notifications will not work');
  module.exports = null;
} else {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.fcm.projectId,
        privateKeyId: config.fcm.privateKeyId,
        privateKey: config.fcm.privateKey,
        clientEmail: config.fcm.clientEmail,
        clientId: config.fcm.clientId,
      }),
    });
    
    logger.info('Firebase Admin SDK initialized (FCM only)');
    module.exports = admin;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error.message);
    module.exports = null;
  }
}
