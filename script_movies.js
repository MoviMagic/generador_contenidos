import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, setDoc, Timestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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

// Verificar si el usuario está autenticado
let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log("Usuario autenticado:", user.email);
  } else {
    alert("Debe iniciar sesión para poder agregar una película.");
    // Redirigir a la página de inicio de sesión, si es necesario
    window.location.href = 'login.html'; // Cambia a la ruta de tu página de inicio de sesión
  }
});

// Manejar la creación de la película
document.getElementById('movie-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Verificar si el usuario está autenticado antes de continuar
  if (!currentUser) {
    alert("Debe iniciar sesión para agregar una película.");
    return;
  }

  // Obtener los valores del formulario
  const documentIdInput = document.getElementById('documentId').value.trim();
  const title = document.getElementById('title').value.trim();
  const tmdbId = document.getElementById('tmdbId').value.trim();
  const videoUrl = document.getElementById('videoUrl').value.trim();
  const addedDateValue = document.getElementById('addedDate').value;

  // Convertir la fecha de adición a un objeto Timestamp
  const addedDate = Timestamp.fromDate(new Date(addedDateValue));

  // Obtener las categorías seleccionadas
  const categoriesSelect = document.getElementById('categories');
  const selectedCategories = Array.from(categoriesSelect.selectedOptions).map(option => option.value);

  try {
    // Crear el ID del documento usando el valor proporcionado o generarlo automáticamente
    const documentId = documentIdInput || `${tmdbId}-${title.replace(/\s+/g, '-').toLowerCase()}`;

    // Agregar el documento a Firestore
    await setDoc(doc(db, 'movies', documentId), {
      title: title,
      tmdbId: tmdbId,
      videoUrl: videoUrl,
      categories: selectedCategories,
      addedDate: addedDate // Timestamp
    });

    // Mostrar mensaje de éxito
    document.getElementById('message').innerText = "Película agregada exitosamente";
  } catch (error) {
    document.getElementById('message').innerText = "Error al agregar la película: " + error.message;
  }
});
