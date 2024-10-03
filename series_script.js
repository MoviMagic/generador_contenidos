import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, Timestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

// Manejar la creación o actualización de la serie
document.getElementById('series-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!currentUser) {
    alert("Debe iniciar sesión para agregar o actualizar una serie.");
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

// Función para verificar si la serie ya está en Firestore y completar los episodios
document.getElementById('verify-series-btn').addEventListener('click', async () => {
  const documentId = document.getElementById('documentId').value.trim();
  if (!documentId) {
    alert("Por favor ingrese el ID del documento para verificar.");
    return;
  }

  try {
    const docRef = doc(db, 'series', documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      document.getElementById('name').value = data.name || '';
      document.getElementById('tmdbid').value = data.tmdbid || '';
      document.getElementById('category').value = data.category || '';
      document.getElementById('addedDate').value = data.addedDate ? data.addedDate.toDate().toISOString().split('T')[0] : '';

      // Cargar las temporadas y episodios
      await cargarTemporadasYCapitulos(documentId);

      document.getElementById('message').innerText = "La serie ya está agregada. Puede actualizarla.";
    } else {
      document.getElementById('message').innerText = "La serie no está en Firestore. Puede agregarla.";
    }
  } catch (error) {
    document.getElementById('message').innerText = "Error al verificar la serie: " + error.message;
  }
});

// Función para cargar temporadas y episodios desde Firestore
async function cargarTemporadasYCapitulos(documentId) {
  const seasonsContainer = document.getElementById('seasons-container');
  seasonsContainer.innerHTML = ''; // Limpiar el contenido actual

  const seasonsRef = collection(db, 'series', documentId, 'seasons');
  const seasonsSnapshot = await getDocs(seasonsRef);

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

    const episodesContainer = document.getElementById(`episodes-container-${seasonNumber}`);
    const episodesRef = collection(db, 'series', documentId, 'seasons', seasonNumber, 'episodes');
    const episodesSnapshot = await getDocs(episodesRef);

    episodesSnapshot.forEach((episodeDoc) => {
      const episodeData = episodeDoc.data();
      const episodeInput = document.createElement('input');
      episodeInput.type = 'text';
      episodeInput.value = episodeData.videoUrl || '';
      episodeInput.classList.add('episode-url');
      episodesContainer.appendChild(episodeInput);
    });
  });
}

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
    <button type="button" onclick="addEpisode(${newSeasonNumber})">Agregar Episodio</button>
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
