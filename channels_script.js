import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

// Asegurarse de que el usuario esté autenticado antes de proceder
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
  } else {
    alert("Debe iniciar sesión para agregar un canal.");
    return;
  }
});

// Manejar la creación del canal
document.getElementById('channel-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!currentUser) {
    alert("Debe iniciar sesión para agregar un canal.");
    return;
  }

  // Obtener los valores del formulario
  const name = document.getElementById('name').value.trim();
  const logoUrl = document.getElementById('logoUrl').value.trim();
  const streamUrl = document.getElementById('streamUrl').value.trim();
  const category = document.getElementById('category').value.trim();

  // Generar el id del documento a partir del nombre del canal
  const documentId = name.toLowerCase().replace(/\s+/g, '-');

  try {
    // Agregar o actualizar el documento del canal
    await setDoc(doc(db, 'channels', documentId), {
      name: name,
      logoUrl: logoUrl,
      streamUrl: streamUrl,
      category: category,
    }, { merge: true });

    document.getElementById('message').innerText = "Canal agregado o actualizado exitosamente";
  } catch (error) {
    document.getElementById('message').innerText = "Error al agregar el canal: " + error.message;
  }
});
