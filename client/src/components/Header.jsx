export default function Header({ titulo, subtitulo, accion }) {
  return (
    <div
      className="relative overflow-hidden px-5 pt-12 pb-6"
      style={{ background: 'linear-gradient(160deg, #0a0a0a 0%, #1a1208 60%, #0f0a00 100%)' }}
    >
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #e5ae1e 0%, transparent 70%)' }}
      />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-2xl font-bold text-white">{titulo}</h1>
          {subtitulo && <p className="text-white/50 text-sm mt-0.5">{subtitulo}</p>}
        </div>
        {accion && <div>{accion}</div>}
      </div>
    </div>
  )
}
