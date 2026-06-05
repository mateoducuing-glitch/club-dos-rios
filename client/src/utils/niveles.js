const NIVELES = [
  { nombre: 'Bronce',  minPuntos: 0,     maxPuntos: 1999  },
  { nombre: 'Plata',   minPuntos: 2000,  maxPuntos: 4999  },
  { nombre: 'Oro',     minPuntos: 5000,  maxPuntos: 9999  },
  { nombre: 'Platino', minPuntos: 10000, maxPuntos: Infinity },
]

export function puntosParaSiguienteNivelClient(puntosTotales) {
  for (let i = 0; i < NIVELES.length - 1; i++) {
    if (puntosTotales < NIVELES[i + 1].minPuntos) {
      return {
        siguienteNivel: NIVELES[i + 1].nombre,
        puntosNecesarios: NIVELES[i + 1].minPuntos - puntosTotales,
        minNivelActual: NIVELES[i].minPuntos,
        maxNivelActual: NIVELES[i].maxPuntos
      }
    }
  }
  return { siguienteNivel: null, puntosNecesarios: 0, minNivelActual: 10000, maxNivelActual: Infinity }
}
