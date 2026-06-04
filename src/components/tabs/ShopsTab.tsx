import { SHOPS } from '@/data/shops';

const FLAG: Record<string, string> = {
  DE: '🇩🇪',
  JP: '🇯🇵',
  GB: '🇬🇧',
  NL: '🇳🇱',
  US: '🇺🇸',
};

export default function ShopsTab() {
  const grouped = SHOPS.reduce<Record<string, typeof SHOPS>>(
    (acc, shop) => {
      const key = shop.country;
      if (!acc[key]) acc[key] = [];
      acc[key].push(shop);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Notice */}
      <div className="card p-4 border-jdm-blue/40 bg-jdm-blue/5">
        <p className="text-jdm-blue text-sm font-medium">🛒 Shop-Verzeichnis</p>
        <p className="text-jdm-muted text-xs mt-1">
          Logos werden angezeigt sobald Bilddateien unter{' '}
          <code className="text-jdm-text">/public/logos/</code> hinterlegt sind.
          {/* TODO: add shop logos and direct API integrations when available */}
        </p>
      </div>

      {Object.entries(grouped)
        .sort(([, a], [, b]) => a[0].priority - b[0].priority)
        .map(([country, shops]) => (
          <div key={country}>
            <p className="section-title">
              {FLAG[shops[0].countryCode] ?? '🌍'} {country}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shops.map((shop) => (
                <a
                  key={shop.id}
                  href={shop.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card p-5 flex flex-col gap-3 hover:border-jdm-red/60
                             transition-all duration-150 group"
                >
                  {/* Logo area */}
                  <div className="w-full h-12 bg-jdm-surface rounded-lg border border-jdm-border
                                  flex items-center justify-center text-2xl">
                    🛒
                    {/* TODO: <Image src={shop.logoPath} alt={shop.name} fill /> */}
                  </div>

                  <div>
                    <p className="font-semibold text-jdm-text group-hover:text-jdm-red-bright transition-colors">
                      {shop.name}
                    </p>
                    <p className="text-xs text-jdm-muted/70 mt-0.5">{shop.website}</p>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1">
                    {shop.specialties.slice(0, 3).map((spec) => (
                      <span
                        key={spec}
                        className="badge border border-jdm-border text-jdm-muted text-[10px]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-2 border-t border-jdm-border/50 text-xs text-jdm-muted">
                    Priorität #{shop.priority}
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
