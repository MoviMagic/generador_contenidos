import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, updateDoc, getDoc, Timestamp, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "API_KEY_HERE",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
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

// Función para verificar si la serie ya existe y autocompletar la información
document.getElementById('verify-series-btn').addEventListener('click', async () => {
  const documentId = document.getElementById('documentId').value.trim();
  if (!documentId) {
    alert("Por favor ingrese el ID del documento.");
    return;
  }

  try {
    const seriesDocRef = doc(db, 'series', documentId);
    const seriesDoc = await getDoc(seriesDocRef);

    if (seriesDoc.exists()) {
      // Autocompletar la información de la serie
      const seriesData = seriesDoc.data();
      document.getElementById('name').value = seriesData.name;
      document.getElementById('tmdbid').value = seriesData.tmdbid;
      document.getElementById('category').value = seriesData.category;
      document.getElementById('addedDate').value = seriesData.addedDate.toDate().toISOString().substr(0, 10);

      // Obtener las temporadas y episodios
      const seasonsCollectionRef = collection(db, 'series', documentId, 'seasons');
      const seasonsSnapshot = await getDocs(seasonsCollectionRef);

      const seasonsContainer = document.getElementById('seasons-container');
      seasonsContainer.innerHTML = ''; // Limpiar las temporadas existentes en el formulario

      seasonsSnapshot.forEach(async (seasonDoc) => {
        const seasonNumber = seasonDoc.id;
        const seasonDiv = document.createElement('div');
        seasonDiv.classList.add('season');
        seasonDiv.innerHTML = `
          <label>Temporada ${seasonNumber}</label>
          <div id="episodes-container-${seasonNumber}" class="episodes-container"></div>
          <button type="button" onclick="addEpisode(${seasonNumber})">Agregar Episodio</button>
        `;
        seasonsContainer.appendChild(seasonDiv);

        // Obtener los episodios de la temporada
        const episodesCollectionRef = collection(db, 'series', documentId, 'seasons', seasonNumber, 'episodes');
        const episodesSnapshot = await getDocs(episodesCollectionRef);

        const episodesContainer = document.getElementById(`episodes-container-${seasonNumber}`);
        episodesSnapshot.forEach((episodeDoc) => {
          const episodeNumber = episodeDoc.id;
          const episodeData = episodeDoc.data();
          const episodeInput = document.createElement('input');
          episodeInput.type = 'text';
          episodeInput.placeholder = `URL del episodio ${episodeNumber}`;
          episodeInput.value = episodeData.videoUrl;
          episodeInput.classList.add('episode-url');
          episodesContainer.appendChild(episodeInput);
        });
      });
    } else {
      alert("La serie no existe en Firestore. Puede proceder a agregarla.");
    }
  } catch (error) {
    alert("Error al verificar la serie: " + error.message);
  }
});

// Manejar la creación o actualización de la serie
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
