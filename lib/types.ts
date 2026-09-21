export type Track = {
  id: string
  title: string
  artist: string
  album?: string
  artwork: string
  // URL del audio reproducible (preview de 30s de iTunes o un MP3 completo tuyo)
  audioUrl: string
  // true cuando es una canción dedicada con audio completo
  isDedicated?: boolean
  // mensaje opcional que le dedicas con esta canción
  dedication?: string
  lyrics?: string
  moment?: string
  // true si solo es un fragmento de 30s
  isPreview?: boolean
}
