import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, Timestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
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
    alert("Debe iniciar sesión para poder agregar o actualizar una película.");
    window.location.href = 'login.html'; // Cambia a la ruta de tu página de inicio de sesión
  }
});

// Verificar si la película ya existe en Firestore
document.getElementById('verify-movie-btn').addEventListener('click', async () => {
  const documentIdInput = document.getElementById('documentId').value.trim();
  if (!documentIdInput) {
    alert("Por favor, ingresa el ID del documento para verificar.");
    return;
  }

  const docRef = doc(db, 'movies', documentIdInput);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    document.getElementById('title').value = data.title;
    document.getElementById('tmdbId').value = data.tmdbId;
    document.getElementById('videoUrl').value = data.videoUrl;
    document.getElementById('addedDate').value = data.addedDate.toDate().toISOString().split('T')[0];

    const categoriesSelect = document.getElementById('categories');
    for (const option of categoriesSelect.options) {
      option.selected = data.categories.includes(option.value);
    }

    document.getElementById('message').innerText = "Película encontrada. Puedes actualizar la información.";
  } else {
    document.getElementById('message').innerText = "Película no encontrada. Puedes agregarla.";
  }
});

// Manejar la creación o actualización de la película
document.getElementById('movie-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!currentUser) {
    alert("Debe iniciar sesión para agregar o actualizar una película.");
    return;
  }

  // Obtener los valores del formulario
  const documentIdInput = document.getElementById('documentId').value.trim();
  const title = document.getElementById('title').value.trim();
  const tmdbId = document.getElementById('tmdbId').value.trim();
  const videoUrl = document.getElementById('videoUrl').value.trim();
  const addedDateValue = document.getElementById('addedDate').value;
  const addedDate = Timestamp.fromDate(new Date(addedDateValue));

  // Obtener las categorías seleccionadas
  const categoriesSelect = document.getElementById('categories');
  const selectedCategories = Array.from(categoriesSelect.selectedOptions).map(option => option.value);

  try {
    const documentId = documentIdInput || `${tmdbId}-${title.replace(/\s+/g, '-').toLowerCase()}`;

    // Agregar o actualizar el documento en Firestore
    await setDoc(doc(db, 'movies', documentId), {
      title: title,
      tmdbId: tmdbId,
      videoUrl: videoUrl,
      categories: selectedCategories,
      addedDate: addedDate
    }, { merge: true });

    document.getElementById('message').innerText = "Película agregada o actualizada exitosamente";
  } catch (error) {
    document.getElementById('message').innerText = "Error al agregar o actualizar la película: " + error.message;
  }
});
