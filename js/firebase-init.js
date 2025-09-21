import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// 各サービスをエクスポートして他のファイルで使えるようにする
export const db = getFirestore(app);
export const auth = getAuth(app);

// ユーザーIDをPromiseで管理
export const userIdPromise = new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User signed in with UID:", user.uid);
            resolve(user.uid);
        } else {
            signInAnonymously(auth).catch((error) => {
                console.error("Anonymous sign-in failed:", error);
                resolve('anonymous-error'); // エラー時も解決
            });
        }
    });
});