import { createContext, useContext, useState, useReducer } from 'react'

const CarritoContext = createContext(null)

function carritoReducer(state, action) {
  switch (action.type) {
    case 'AGREGAR': {
      const existe = state.find(i => i.id === action.producto.id)
      if (existe) {
        return state.map(i => i.id === action.producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      }
      return [...state, { ...action.producto, cantidad: 1 }]
    }
    case 'QUITAR': {
      return state
        .map(i => i.id === action.id ? { ...i, cantidad: i.cantidad - 1 } : i)
        .filter(i => i.cantidad > 0)
    }
    case 'ELIMINAR':
      return state.filter(i => i.id !== action.id)
    case 'VACIAR':
      return []
    default:
      return state
  }
}

export function CarritoProvider({ children }) {
  const [items, dispatch] = useReducer(carritoReducer, [])
  const [abierto, setAbierto] = useState(false)

  const total = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0)
  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0)

  function agregar(producto) { dispatch({ type: 'AGREGAR', producto }) }
  function quitar(id) { dispatch({ type: 'QUITAR', id }) }
  function eliminar(id) { dispatch({ type: 'ELIMINAR', id }) }
  function vaciar() { dispatch({ type: 'VACIAR' }) }
  function cantidadDe(id) { return items.find(i => i.id === id)?.cantidad || 0 }

  return (
    <CarritoContext.Provider value={{ items, total, totalItems, abierto, setAbierto, agregar, quitar, eliminar, vaciar, cantidadDe }}>
      {children}
    </CarritoContext.Provider>
  )
}

export function useCarrito() {
  return useContext(CarritoContext)
}
