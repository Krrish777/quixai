import { initializeApp, getApps, cert } from 'firebase-admin/app';
import firebaseConfig from './firebaseConfig.json';


const firebaseAdminConfig = {
    credential: cert({
        projectId: firebaseConfig.projectId,
        clientEmail: firebaseConfig.clientEmail,
        privateKey: firebaseConfig.privateKey.replace(/\\n/g, '\n')
    })
}

export function customInitApp() {
    if (getApps().length <= 0) {
        initializeApp(firebaseAdminConfig);
    }
}
