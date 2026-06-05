const NIVELES = [
  { nombre: 'Bronce',  minPuntos: 0,     maxPuntos: 1999  },
  { nombre: 'Plata',   minPuntos: 2000,  maxPuntos: 4999  },
  { nombre: 'Oro',     minPuntos: 5000,  maxPuntos: 9999  },
  { nombre: 'Platino', minPuntos: 10000, maxPuntos: Infinity },
]

export function calcularNivel(puntosTotales) {
  for (const nivel of NIVELES) {
    if (puntosTotales >= nivel.minPuntos && puntosTotales <= nivel.maxPuntos) {
      return nivel.nombre
    }
  }
  return 'Bronce'
}

export function puntosParaSiguienteNivel(puntosTotales) {
  for (let i = 0; i < NIVELES.length - 1; i++) {
    if (puntosTotales < NIVELES[i + 1].minPuntos) {
      return {
        siguienteNivel: NIVELES[i + 1].nombre,
        puntosNecesarios: NIVELES[i + 1].minPuntos - puntosTotales,
        puntosActuales: puntosTotales,
        minNivelActual: NIVELES[i].minPuntos,
        maxNivelActual: NIVELES[i].maxPuntos
      }
    }
  }
  return {
    siguienteNivel: null,
    puntosNecesarios: 0,
    puntosActuales: puntosTotales,
    minNivelActual: 10000,
    maxNivelActual: Infinity
  }
}

export function getBeneficiosNivel(nivel) {
  const beneficios = {
    Bronce:  ['Acumular puntos', 'Promociones generales'],
    Plata:   ['Cupón 5% OFF mensual', 'Promociones exclusivas', 'Puntos extra cumpleaños'],
    Oro:     ['Envío gratis mensual', 'Preventa promociones', 'Sorteos exclusivos'],
    Platino: ['Envíos gratis', 'Cupón 10% mensual', 'Vino premium cumpleaños', 'Atención prioritaria', 'Acceso anticipado a promociones', 'Regalo anual Club Dos Ríos', 'Tarjeta digital Platino']
  }
  return beneficios[nivel] || beneficios.Bronce
}
