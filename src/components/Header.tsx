export default function Header() {
  return (
    <header className="bg-white border-b border-jdm-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-jdm-red rounded-md flex items-center justify-center select-none">
            <span className="font-display font-bold text-white text-sm leading-none">S</span>
          </div>
          <div>
            <span className="font-display font-bold text-lg text-jdm-text tracking-wide leading-none">
              SkylineDB
            </span>
            <span className="hidden sm:inline text-jdm-muted text-xs ml-2">
              VIN Decoder &amp; Parts
            </span>
          </div>
        </div>

        {/* Generation pills */}
        <div className="flex items-center gap-1.5">
          {['R32', 'R33', 'R34'].map((gen) => (
            <span key={gen} className="text-[11px] font-medium px-2 py-0.5 rounded bg-jdm-bg text-jdm-muted border border-jdm-border">
              {gen}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
