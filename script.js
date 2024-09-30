import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Manejar Login del Administrador
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const currentAdminEmail = userCredential.user.email;

    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('main-panel').style.display = 'block';
    document.getElementById('admin-email-display').innerText = `Administrador: ${currentAdminEmail}`;
  } catch (error) {
    alert("Error en el inicio de sesión: " + error.message);
  }
});

// Cerrar sesión del administrador
document.getElementById('logout-btn').addEventListener('click', async () => {
  await signOut(auth);
  location.reload();
});
