import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, setDoc, Timestamp, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

// Verificar si el usuario está autenticado
const userUID = localStorage.getItem('userUID');

if (!userUID) {
  alert("Debe iniciar sesión para agregar o actualizar una serie.");
  // Redirigir al usuario a la pantalla principal para iniciar sesión
  window.location.href = 'index.html';
} else {
  // Continuar con la lógica del generador de series
  document.getElementById('series-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener los valores del formulario
    const documentId = document.getElementById('documentId').value.trim();
    const name = document.getElementById('name').value.trim();
    const tmdbid = document.getElementById('tmdbid').value.trim();
    const category = document.getElementById('category').value.trim();
    const addedDateValue = document.getElementById('addedDate').value;
    const addedDate = Timestamp.fromDate(new Date(addedDateValue));

    try {
      // Agregar o actualizar el documento de la serie
      await setDoc(doc(db, 'series', documentId), {
        name: name,
        tmdbid: tmdbid,
        category: category,
        addedDate: addedDate,
      }, { merge: true });

      // Agregar temporadas y episodios
      const seasonsContainer = document.getElementById('seasons-container');
      for (let i = 0; i < seasonsContainer.children.length; i++) {
        const seasonNumber = (i + 1).toString();
        const episodesContainer = seasonsContainer.children[i].querySelector('.episodes-container');
        const seasonDocRef = doc(db, 'series', documentId, 'seasons', seasonNumber);

        // Crear un documento de temporada vacío para que Firestore lo registre correctamente
        await setDoc(seasonDocRef, {}, { merge: true });

        // Agregar cada episodio dentro de la temporada
        for (let j = 0; j < episodesContainer.children.length; j++) {
          const episodeUrl = episodesContainer.children[j].value.trim();
          if (episodeUrl) {
            const episodeNumber = (j + 1).toString();
            await setDoc(doc(seasonDocRef, 'episodes', episodeNumber), {
              videoUrl: episodeUrl
            }, { merge: true });
          }
        }
      }

      document.getElementById('message').innerText = "Serie agregada o actualizada exitosamente";
    } catch (error) {
      document.getElementById('message').innerText = "Error al agregar la serie: " + error.message;
    }
  });
}
