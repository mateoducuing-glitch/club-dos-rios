export default function Header({ titulo, subtitulo, accion }) {
  return (
    <div className="bg-verde-700 text-white px-5 pt-12 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{titulo}</h1>
          {subtitulo && <p className="text-verde-200 text-sm mt-0.5">{subtitulo}</p>}
        </div>
        {accion && <div>{accion}</div>}
      </div>
    </div>
  )
}
