import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDhPRVu8n_pZQzJPVWNFlJonmj5KEYsF10",
  authDomain: "movimagic.firebaseapp.com",
  projectId: "movimagic",
  storageBucket: "movimagic.appspot.com",
  messagingSenderId: "518388279864",
  appId: "1:518388279864:web:a6f699391ec5bb627c14cd",
  measurementId: "G-GG65HJV2T6"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Manejar el inicio de sesión
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Guardar el UID del usuario en localStorage
    localStorage.setItem('userUID', user.uid);

    // Mostrar el panel principal
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('main-panel').style.display = 'block';
    document.getElementById('admin-email-display').innerText = `Administrador: ${user.email}`;
  } catch (error) {
    alert("Error en el inicio de sesión: " + error.message);
  }
});

// Manejar el cierre de sesión
document.getElementById('logout-btn').addEventListener('click', async () => {
  await signOut(auth);
  localStorage.removeItem('userUID'); // Eliminar el UID del usuario del localStorage
  location.reload();
});
