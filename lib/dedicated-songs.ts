import type { Track } from './types'

// ============================================================
//  TUS CANCIONES DEDICADAS (audio completo)
// ============================================================
//  Para añadir tus propias canciones completas:
//   1. Copia el archivo .mp3 a la carpeta /public/songs/
//   2. Pon en "audioUrl" la ruta, por ejemplo: "/songs/nuestra-cancion.mp3"
//   3. Escribe el título, artista y tu dedicatoria.
//
//  Mientras no añadas el MP3, la tarjeta seguirá apareciendo con su
//  dedicatoria; al darle al play buscará el archivo en /public/songs/.
//  Las carátulas usan las imágenes románticas ya generadas, pero puedes
//  cambiarlas por una foto vuestra en /public/images/.
// ============================================================

export const dedicatedSongs: Track[] = [
  {
    id: 'ded-1',
    title: 'Nuestra primera canción',
    artist: 'La que sonaba aquella noche',
    artwork: '/images/cover-3.png',
    audioUrl: '/songs/cancion-1.mp3',
    isDedicated: true,
    dedication:
      'La pongo y vuelvo justo al momento en que supe que me gustabas de verdad.',
  },
  {
    id: 'ded-2',
    title: 'La de los viajes en coche',
    artist: 'Volumen al máximo, ventanas abajo',
    artwork: '/images/cover-2.png',
    audioUrl: '/songs/cancion-2.mp3',
    isDedicated: true,
    dedication: 'Cada vez que la escucho te imagino cantándola fatal a mi lado. Te quiero así.',
  },
  {
    id: 'ded-3',
    title: 'Para los días tranquilos',
    artist: 'Cuando solo estábamos tú y yo',
    artwork: '/images/cover-1.png',
    audioUrl: '/songs/cancion-3.mp3',
    isDedicated: true,
    dedication: 'Para esas tardes sin hacer nada, que al final son mis favoritas.',
  },
  {
    id: 'ded-4',
    title: 'La que te dedico hoy',
    artist: 'Por nuestros 6 meses',
    artwork: '/images/cover-4.png',
    audioUrl: '/songs/cancion-4.mp3',
    isDedicated: true,
    dedication: 'Porque medio año contigo se ha pasado en un suspiro. Por muchísimos más.',
  },
]
