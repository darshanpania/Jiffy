import admin from 'firebase-admin';
import logger from '../utils/logger';

/**
 * Initialize Firebase Admin SDK for FCM ONLY
 * We DON'T use Firebase Auth, Firestore, or Storage
 */

if (!process.env.FCM_PROJECT_ID || !process.env.FCM_PRIVATE_KEY || !process.env.FCM_CLIENT_EMAIL) {
  logger.warn('⚠️  Firebase FCM credentials not configured. Push notifications will not work.');
} else {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FCM_PROJECT_ID,
        privateKey: process.env.FCM_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FCM_CLIENT_EMAIL,
      }),
    });
    
    logger.info('✅ Firebase Admin SDK initialized (FCM ONLY)');
  } catch (error) {
    logger.error('❌ Failed to initialize Firebase Admin SDK:', error);
  }
}

export const fcm = admin.messaging();
export default admin;