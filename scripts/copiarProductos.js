import { initializeApp } from "firebase/app";
import {
    getFirestore,
    collection,
    getDocs
} from "firebase/firestore";

import {
    initializeApp as initializeAdminApp,
    getApp
} from "firebase-admin/app";

import {
    getFirestore as getAdminFirestore
} from "firebase-admin/firestore";

import dotenv from "dotenv";

dotenv.config();


// ======================================
// FIREBASE REAL (solo lectura)
// ======================================

const firebaseConfig = {

    apiKey: process.env.VITE_FIREBASE_API_KEY,

    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,

    projectId: process.env.VITE_FIREBASE_PROJECT_ID,

    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,

    messagingSenderId:
        process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,

    appId: process.env.VITE_FIREBASE_APP_ID,

};


const appReal = initializeApp(
    firebaseConfig,
    "firebase-real"
);


const dbReal = getFirestore(appReal);



// ======================================
// FIRESTORE EMULATOR (administrador)
// ======================================

initializeAdminApp({
    projectId:
        process.env.VITE_FIREBASE_PROJECT_ID
});


const dbEmulator = getAdminFirestore(
    getApp()
);


dbEmulator.settings({
    host: "127.0.0.1:8080",
    ssl: false
});



// ======================================
// COPIAR PRODUCTOS
// ======================================

async function copiarProductos() {


    console.log(
        "Leyendo productos reales..."
    );


    const snapshot = await getDocs(
        collection(dbReal, "productos")
    );


    console.log(
        `Encontrados ${snapshot.size} productos`
    );


    for (const documento of snapshot.docs) {


        await dbEmulator
            .collection("productos")
            .doc(documento.id)
            .set(documento.data());


        console.log(
            "Copiado:",
            documento.id
        );

    }


    console.log(
        "Copia terminada correctamente"
    );


    process.exit(0);

}



copiarProductos();