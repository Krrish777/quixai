import { initializeApp, getApps, cert } from 'firebase-admin/app';



if (!process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error('FIREBASE_PRIVATE_KEY environment variable is not set.');
}

const firebaseAdminConfig = {
    credential: cert({
        projectId:"quixai-dev",
        clientEmail: "firebase-adminsdk-ykjza@quixai-dev.iam.gserviceaccount.com",
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
}

export function customInitApp() {
    if (getApps().length <= 0) {
        initializeApp(firebaseAdminConfig);
    }
}
