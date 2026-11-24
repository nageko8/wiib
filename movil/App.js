import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Slider from "@react-native-community/slider";
import * as DocumentPicker from "expo-document-picker";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

// Mismos colores que la versión de escritorio; el tema sigue al del sistema
const temas = {
  light: { fondo: "#fff", texto: "#222", tenue: "#888" },
  dark: { fondo: "#111", texto: "#eee", tenue: "#888" },
};

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

function Boton({ titulo, onPress, disabled, activo, c }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: activo }}
      style={[s.boton, { borderColor: c.texto }, activo && { backgroundColor: c.texto }, disabled && s.desactivado]}
    >
      <Text style={{ color: activo ? c.fondo : c.texto }}>{titulo}</Text>
    </Pressable>
  );
}

export default function App() {
  const c = temas[useColorScheme() === "dark" ? "dark" : "light"];
  const player = useAudioPlayer(null);
  const estado = useAudioPlayerStatus(player);

  const [canciones, setCanciones] = useState([]);
  const [indiceActual, setIndiceActual] = useState(-1);
  const [repetir, setRepetir] = useState(false);
  const [volumen, setVolumen] = useState(0.8);
  const [arrastrando, setArrastrando] = useState(null);

  const hayCanciones = canciones.length > 0;
  const cancion = canciones[indiceActual];

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: "doNotMix" });
  }, []);

  useEffect(() => { player.volume = volumen; }, [player, volumen]);
  useEffect(() => { player.loop = repetir; }, [player, repetir]);

  function cargarCancion(i, reproducir, lista = canciones) {
    const nueva = lista[i];
    setIndiceActual(i);
    player.replace({ uri: nueva.uri });
    player.loop = repetir;
    player.setActiveForLockScreen(true, { title: nueva.titulo, artist: nueva.artista });
    if (reproducir) player.play();
  }

  function alternarReproduccion() {
    if (indiceActual === -1) return;
    if (estado.playing) player.pause();
    else player.play();
  }

  function siguiente() {
    if (!hayCanciones) return;
    cargarCancion((indiceActual + 1) % canciones.length, true);
  }

  function anterior() {
    if (!hayCanciones) return;
    // Si ya han pasado 3 s, vuelve al inicio de la canción actual
    if (estado.currentTime > 3) {
      player.seekTo(0);
      return;
    }
    cargarCancion((indiceActual - 1 + canciones.length) % canciones.length, true);
  }

  // Al terminar una canción pasa a la siguiente (salvo que esté en modo repetir)
  useEffect(() => {
    if (estado.didJustFinish && !repetir) siguiente();
  }, [estado.didJustFinish]);

  // Añadir canciones desde el dispositivo
  async function anadir() {
    const resultado = await DocumentPicker.getDocumentAsync({ type: "audio/*", multiple: true });
    if (resultado.canceled) return;
    const nuevas = resultado.assets.map((a) => ({ ...leerNombre(a.name), uri: a.uri }));
    const lista = [...canciones, ...nuevas];
    setCanciones(lista);
    if (!hayCanciones && lista.length > 0) cargarCancion(0, false, lista);
  }

  const duracion = estado.duration || 0;
  const actual = arrastrando ?? estado.currentTime;

  return (
    <SafeAreaView style={[s.pantalla, { backgroundColor: c.fondo }]}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={s.contenido}>
        <Text style={[s.h1, { color: c.texto }]}>{cancion ? cancion.titulo : "Sin canción"}</Text>
        <Text style={[s.p, { color: c.tenue }]}>
          {cancion ? cancion.artista : "Añade archivos de audio para empezar"}
        </Text>

        <Slider
          value={duracion ? actual : 0}
          minimumValue={0}
          maximumValue={duracion || 1}
          disabled={!hayCanciones}
          onValueChange={setArrastrando}
          onSlidingComplete={(v) => { player.seekTo(v); setArrastrando(null); }}
          minimumTrackTintColor={c.texto}
          thumbTintColor={c.texto}
          accessibilityLabel="Progreso"
        />
        <Text style={[s.p, { color: c.tenue }]}>
          {formatearTiempo(actual)} / {formatearTiempo(duracion)}
        </Text>

        <View style={s.fila}>
          <Boton c={c} titulo="Anterior" onPress={anterior} disabled={canciones.length < 2} />
          <Boton c={c} titulo={estado.playing ? "Pausar" : "Reproducir"} onPress={alternarReproduccion} disabled={!hayCanciones} />
          <Boton c={c} titulo="Siguiente" onPress={siguiente} disabled={canciones.length < 2} />
          <Boton c={c} titulo="Repetir" onPress={() => setRepetir(!repetir)} disabled={!hayCanciones} activo={repetir} />
        </View>

        <Text style={[s.p, { color: c.tenue }]}>Volumen</Text>
        <Slider
          value={volumen}
          minimumValue={0}
          maximumValue={1}
          onValueChange={setVolumen}
          minimumTrackTintColor={c.texto}
          thumbTintColor={c.texto}
          accessibilityLabel="Volumen"
        />

        <View style={[s.fila, s.separado]}>
          <Boton c={c} titulo="Añadir canciones" onPress={anadir} />
        </View>

        {canciones.map((cn, i) => (
          <Pressable key={cn.uri + i} onPress={() => cargarCancion(i, true)}>
            <Text style={[s.li, { color: c.texto }, i === indiceActual && s.activa]}>
              {i + 1}. {cn.titulo} — {cn.artista}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1 },
  contenido: { padding: 16, paddingTop: 48 },
  h1: { fontSize: 24, fontWeight: "600" },
  p: { fontSize: 14, marginTop: 4, marginBottom: 24 },
  fila: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 24 },
  separado: { marginTop: 24 },
  boton: { borderWidth: 1, paddingVertical: 6, paddingHorizontal: 12 },
  desactivado: { opacity: 0.3 },
  li: { fontSize: 14, paddingVertical: 4 },
  activa: { fontWeight: "600" },
});
