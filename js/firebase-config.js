import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const firebaseConfig = {

    apiKey: "AIzaSyDlcWK_LlBPCikZShKD_qvRxB49ihJ-Aj8",

    authDomain:
        "aep-2-gestao.firebaseapp.com",

    projectId:
        "aep-2-gestao",

    storageBucket:
        "aep-2-gestao.firebasestorage.app",

    messagingSenderId:
        "8046014965",

    appId:
        "1:8046014965:web:61905c78cd2fae7f2e30bc",

    measurementId:
        "G-R9YQC06RZZ"

};


const app =
    initializeApp(firebaseConfig);


const auth =
    getAuth(app);


const db =
    getFirestore(app);


export {
    app,
    auth,
    db
};