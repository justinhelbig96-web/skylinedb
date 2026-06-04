export default function Header() {
  return (
    <header className="border-b border-jdm-border bg-jdm-surface/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-jdm-red rounded-lg flex items-center justify-center font-display font-bold text-white text-lg leading-none select-none shadow-[0_0_15px_rgba(204,0,34,0.5)]">
            S
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-jdm-text leading-none tracking-wide">
              SkylineDB
            </h1>
            <p className="text-[11px] text-jdm-muted tracking-widest uppercase">
              VIN Decoder &amp; Parts
            </p>
          </div>
        </div>

        {/* Nav badges */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-jdm-muted">
          {['R32', 'R33', 'R34'].map((gen) => (
            <span
              key={gen}
              className="badge border-jdm-border text-jdm-muted"
            >
              {gen}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
