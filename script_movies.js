import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, Timestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "API_KEY",
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

// Eliminar la verificación de autenticación ya que el usuario ya está autenticado en la página principal

// Manejar la verificación de la película
document.getElementById('verify-movie-btn').addEventListener('click', async () => {
  const documentId = document.getElementById('documentId').value.trim();
  
  if (!documentId) {
    alert("Por favor ingresa el ID del documento.");
    return;
  }

  try {
    const movieDoc = await getDoc(doc(db, 'movies', documentId));

    if (movieDoc.exists()) {
      const movieData = movieDoc.data();
      document.getElementById('title').value = movieData.title;
      document.getElementById('tmdbId').value = movieData.tmdbId;
      document.getElementById('videoUrl').value = movieData.videoUrl;

      // Rellenar categorías seleccionadas
      const categoriesSelect = document.getElementById('categories');
      Array.from(categoriesSelect.options).forEach(option => {
        option.selected = movieData.categories.includes(option.value);
      });

      // Rellenar la fecha
      const addedDate = movieData.addedDate.toDate();
      document.getElementById('addedDate').value = addedDate.toISOString().split('T')[0];

      document.getElementById('message').innerText = "Película encontrada. Puedes actualizar la información.";
    } else {
      document.getElementById('message').innerText = "Película no encontrada en Firestore.";
    }
  } catch (error) {
    console.log("Error al verificar la película:", error);
    document.getElementById('message').innerText = "Error al verificar la película: " + error.message;
  }
});

// Manejar la creación o actualización de la película
document.getElementById('movie-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Obtener los valores del formulario
  const documentIdInput = document.getElementById('documentId').value.trim();
  const title = document.getElementById('title').value.trim();
  const tmdbId = document.getElementById('tmdbId').value.trim();
  const videoUrl = document.getElementById('videoUrl').value.trim();
  const addedDateValue = document.getElementById('addedDate').value;

  const addedDate = Timestamp.fromDate(new Date(addedDateValue));
  const categoriesSelect = document.getElementById('categories');
  const selectedCategories = Array.from(categoriesSelect.selectedOptions).map(option => option.value);

  try {
    const documentId = documentIdInput || `${tmdbId}-${title.replace(/\s+/g, '-').toLowerCase()}`;

    await setDoc(doc(db, 'movies', documentId), {
      title: title,
      tmdbId: tmdbId,
      videoUrl: videoUrl,
      categories: selectedCategories,
      addedDate: addedDate
    }, { merge: true });

    document.getElementById('message').innerText = "Película agregada o actualizada exitosamente.";
  } catch (error) {
    document.getElementById('message').innerText = "Error al agregar o actualizar la película: " + error.message;
  }
});

// Botón para actualizar la página
document.getElementById('refresh-page-btn').addEventListener('click', () => {
  location.reload();
});
