import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configurações do Firebase - preencha com os dados do seu projeto
// Recomenda-se usar variáveis de ambiente Vite (VITE_*)
const firebaseConfig = {
  apiKey: "AIzaSyDgDlJi_VpPNGvLSVaGdDl7rhrAQeuLWsY",
  authDomain: "engenharia-de-cortes-5d.firebaseapp.com",
  projectId: "engenharia-de-cortes-5d",
  storageBucket: "engenharia-de-cortes-5d.firebasestorage.app",
  messagingSenderId: "431702651144",
  appId: "1:431702651144:web:ea2a338dcc09b7e10b3cbd",
  measurementId: "G-0T5XDDM2XC",
};

// Evita inicializar mais de uma vez em hot-reload
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
