import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, setDoc, Timestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

// Manejar la creación de la serie
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
    // Agregar el documento de la serie
    await setDoc(doc(db, 'series', documentId), {
      name: name,
      tmdbid: tmdbid,
      category: category,
      addedDate: addedDate,
    });

    // Agregar temporadas y episodios
    const seasonsContainer = document.getElementById('seasons-container');
    for (let i = 0; i < seasonsContainer.children.length; i++) {
      const seasonNumber = (i + 1).toString(); // Convertir a string
      const episodesContainer = seasonsContainer.children[i].querySelector('.episodes-container');
      const seasonDocRef = doc(db, 'series', documentId, 'seasons', seasonNumber);

      // Agregar cada episodio dentro de la temporada
      for (let j = 0; j < episodesContainer.children.length; j++) {
        const episodeUrl = episodesContainer.children[j].value.trim();
        if (episodeUrl) {
          await setDoc(doc(seasonDocRef, 'episodes', (j + 1).toString()), {
            videoUrl: episodeUrl
          });
        }
      }
    }

    document.getElementById('message').innerText = "Serie agregada exitosamente";
  } catch (error) {
    document.getElementById('message').innerText = "Error al agregar la serie: " + error.message;
  }
});

// Función para agregar una nueva temporada
window.addSeason = function () {
  const seasonsContainer = document.getElementById('seasons-container');
  const newSeasonNumber = seasonsContainer.children.length + 1;

  const seasonDiv = document.createElement('div');
  seasonDiv.classList.add('season');
  seasonDiv.innerHTML = `
    <label>Temporada ${newSeasonNumber}</label>
    <div id="episodes-container-${newSeasonNumber}" class="episodes-container">
      <input type="text" placeholder="URL del episodio 1" class="episode-url">
    </div>
    <button type="button" onclick="addEpisode('${newSeasonNumber}')">Agregar Episodio</button>
  `;
  seasonsContainer.appendChild(seasonDiv);
};

// Función para agregar un nuevo episodio a una temporada
window.addEpisode = function (seasonNumber) {
  const episodesContainer = document.getElementById(`episodes-container-${seasonNumber}`);
  const newEpisodeNumber = episodesContainer.children.length + 1;

  const episodeInput = document.createElement('input');
  episodeInput.type = 'text';
  episodeInput.placeholder = `URL del episodio ${newEpisodeNumber}`;
  episodeInput.classList.add('episode-url');
  episodesContainer.appendChild(episodeInput);
};
