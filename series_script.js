import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, updateDoc, Timestamp, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
    alert("Debe iniciar sesión para agregar o actualizar una serie.");
    return;
  }
});

// Manejar la creación de la serie
document.getElementById('series-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!currentUser) {
    alert("Debe iniciar sesión para agregar una serie.");
    return;
  }

  // Obtener los valores del formulario
  const documentId = document.getElementById('documentId').value.trim();
  const name = document.getElementById('name').value.trim();
  const tmdbid = document.getElementById('tmdbid').value.trim();
  const category = document.getElementById('category').value.trim();
  const addedDateValue = document.getElementById('addedDate').value;
  const addedDate = Timestamp.fromDate(new Date(addedDateValue));

  try {
    // Verificar si la serie ya existe
    const seriesDocRef = doc(db, 'series', documentId);
    const seriesDoc = await getDoc(seriesDocRef);

    if (seriesDoc.exists()) {
      alert("La serie ya existe. Puede agregar nuevas temporadas o episodios usando los botones correspondientes.");
      return;
    }

    // Agregar el documento de la serie
    await setDoc(seriesDocRef, {
      name: name,
      tmdbid: tmdbid,
      category: category,
      addedDate: addedDate,
    });

    // Agregar temporadas y episodios
    const seasonsContainer = document.getElementById('seasons-container');
    for (let i = 0; i < seasonsContainer.children.length; i++) {
      const seasonNumber = (i + 1).toString(); // Asegurarse de que el número de temporada sea una cadena simple
      const episodesContainer = seasonsContainer.children[i].querySelector('.episodes-container');
      const seasonDocRef = doc(db, 'series', documentId, 'seasons', seasonNumber);

      // Crear un documento de temporada vacío para que Firestore lo registre correctamente
      await setDoc(seasonDocRef, {});

      // Agregar cada episodio dentro de la temporada
      for (let j = 0; j < episodesContainer.children.length; j++) {
        const episodeUrl = episodesContainer.children[j].value.trim();
        if (episodeUrl) {
          const episodeNumber = (j + 1).toString(); // Asegurarse de que el número de episodio sea una cadena simple
          await setDoc(doc(seasonDocRef, 'episodes', episodeNumber), {
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

// Función para agregar una nueva temporada a una serie ya existente
window.addSeasonToExistingSeries = async function () {
  const documentId = prompt("Ingrese el ID del documento de la serie a la que desea agregar una temporada:");
  if (!documentId) return;

  const seasonsContainer = document.getElementById('seasons-container');
  const newSeasonNumber = seasonsContainer.children.length + 1;
  const seasonDocRef = doc(db, 'series', documentId, 'seasons', newSeasonNumber.toString());

  try {
    await setDoc(seasonDocRef, {});
    alert(`Temporada ${newSeasonNumber} agregada a la serie ${documentId} exitosamente.`);
  } catch (error) {
    alert("Error al agregar la temporada: " + error.message);
  }
};

// Función para agregar nuevos episodios a una temporada existente
window.addEpisodeToExistingSeason = async function () {
  const documentId = prompt("Ingrese el ID del documento de la serie:");
  const seasonNumber = prompt("Ingrese el número de la temporada a la que desea agregar episodios:");
  if (!documentId || !seasonNumber) return;

  const episodesContainer = document.getElementById(`episodes-container-${seasonNumber}`);
  const newEpisodeNumber = episodesContainer.children.length + 1;
  const seasonDocRef = doc(db, 'series', documentId, 'seasons', seasonNumber);
  const episodeDocRef = doc(seasonDocRef, 'episodes', newEpisodeNumber.toString());

  const episodeUrl = prompt(`Ingrese la URL del episodio ${newEpisodeNumber}:`);
  if (!episodeUrl) return;

  try {
    await setDoc(episodeDocRef, { videoUrl: episodeUrl });
    alert(`Episodio ${newEpisodeNumber} agregado a la temporada ${seasonNumber} de la serie ${documentId} exitosamente.`);
  } catch (error) {
    alert("Error al agregar el episodio: " + error.message);
  }
};

// Función para agregar una nueva temporada en el formulario
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
    <button type="button" onclick="addEpisode(${newSeasonNumber})">Agregar Episodio</button>
  `;
  seasonsContainer.appendChild(seasonDiv);
};

// Función para agregar un nuevo episodio en el formulario
window.addEpisode = function (seasonNumber) {
  const episodesContainer = document.getElementById(`episodes-container-${seasonNumber}`);
  const newEpisodeNumber = episodesContainer.children.length + 1;

  const episodeInput = document.createElement('input');
  episodeInput.type = 'text';
  episodeInput.placeholder = `URL del episodio ${newEpisodeNumber}`;
  episodeInput.classList.add('episode-url');
  episodesContainer.appendChild(episodeInput);
};
