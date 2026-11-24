const audio = document.getElementById("audio");
const titulo = document.getElementById("titulo");
const artista = document.getElementById("artista");
const progreso = document.getElementById("progreso");
const tiempoActual = document.getElementById("tiempo-actual");
const duracion = document.getElementById("duracion");
const btnPlay = document.getElementById("btn-play");
const btnAnterior = document.getElementById("btn-anterior");
const btnSiguiente = document.getElementById("btn-siguiente");
const btnRepetir = document.getElementById("btn-repetir");
const btnAnadir = document.getElementById("btn-anadir");
const volumen = document.getElementById("volumen");
const archivos = document.getElementById("archivos");
const lista = document.getElementById("lista");

const canciones = [];
let indiceActual = -1;

// Convierte segundos a formato m:ss
function formatearTiempo(segundos) {
  if (!isFinite(segundos)) return "0:00";
  const min = Math.floor(segundos / 60);
  const seg = Math.floor(segundos % 60).toString().padStart(2, "0");
  return `${min}:${seg}`;
}

// "Artista - Canción.mp3" -> { artista, titulo }
function leerNombre(nombreArchivo) {
  const sinExtension = nombreArchivo.replace(/\.[^.]+$/, "");
  const partes = sinExtension.split(" - ");
  if (partes.length >= 2) {
    return { artista: partes[0].trim(), titulo: partes.slice(1).join(" - ").trim() };
  }
  return { artista: "Artista desconocido", titulo: sinExtension };
}

function pintarLista() {
  lista.innerHTML = "";
  canciones.forEach((cancion, i) => {
    const li = document.createElement("li");
    li.textContent = `${cancion.titulo} — ${cancion.artista}`;
    li.classList.toggle("activa", i === indiceActual);
    li.addEventListener("click", () => cargarCancion(i, true));
    lista.appendChild(li);
  });
}

function actualizarBotones() {
  const hayCanciones = canciones.length > 0;
  btnPlay.disabled = !hayCanciones;
  progreso.disabled = !hayCanciones;
  btnAnterior.disabled = canciones.length < 2;
  btnSiguiente.disabled = canciones.length < 2;
  btnRepetir.disabled = !hayCanciones;
}

function cargarCancion(i, reproducir) {
  indiceActual = i;
  const cancion = canciones[i];
  audio.src = cancion.url;
  titulo.textContent = cancion.titulo;
  artista.textContent = cancion.artista;
  progreso.value = 0;
  tiempoActual.textContent = "0:00";
  pintarLista();
  if (reproducir) audio.play();
}

function alternarReproduccion() {
  if (indiceActual === -1) return;
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

function siguiente() {
  if (canciones.length === 0) return;
  cargarCancion((indiceActual + 1) % canciones.length, true);
}

function anterior() {
  if (canciones.length === 0) return;
  // Si ya han pasado 3 s, vuelve al inicio de la canción actual
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  cargarCancion((indiceActual - 1 + canciones.length) % canciones.length, true);
}

// Activa o desactiva la repetición de la canción actual
function alternarRepetir() {
  audio.loop = !audio.loop;
  btnRepetir.setAttribute("aria-pressed", String(audio.loop));
}

btnAnadir.addEventListener("click", () => archivos.click());

// Añadir canciones desde el dispositivo
archivos.addEventListener("change", () => {
  const estabaVacia = canciones.length === 0;
  for (const archivo of archivos.files) {
    canciones.push({ ...leerNombre(archivo.name), url: URL.createObjectURL(archivo) });
  }
  archivos.value = "";
  actualizarBotones();
  if (estabaVacia && canciones.length > 0) {
    cargarCancion(0, false);
  } else {
    pintarLista();
  }
});

btnPlay.addEventListener("click", alternarReproduccion);
btnSiguiente.addEventListener("click", siguiente);
btnAnterior.addEventListener("click", anterior);
btnRepetir.addEventListener("click", alternarRepetir);

audio.addEventListener("play", () => { btnPlay.textContent = "Pausar"; });
audio.addEventListener("pause", () => { btnPlay.textContent = "Reproducir"; });

audio.addEventListener("loadedmetadata", () => {
  duracion.textContent = formatearTiempo(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  progreso.value = (audio.currentTime / audio.duration) * 100;
  tiempoActual.textContent = formatearTiempo(audio.currentTime);
});

audio.addEventListener("ended", siguiente);

// Saltar a otro punto de la canción
progreso.addEventListener("input", () => {
  if (!audio.duration) return;
  audio.currentTime = (progreso.value / 100) * audio.duration;
});

volumen.addEventListener("input", () => {
  audio.volume = volumen.value;
});
audio.volume = volumen.value;

// Atajos de teclado: espacio = play/pausa, flechas = anterior/siguiente, R = repetir
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON") return;
  if (e.code === "Space") {
    e.preventDefault();
    alternarReproduccion();
  } else if (e.code === "ArrowRight") {
    siguiente();
  } else if (e.code === "ArrowLeft") {
    anterior();
  } else if (e.code === "KeyR") {
    alternarRepetir();
  }
});
