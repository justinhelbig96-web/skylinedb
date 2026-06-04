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
    <div className="space-y-6 animate-fade-in">
      {/* Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <p className="text-blue-700 font-medium">🛒 Shop-Verzeichnis</p>
        <p className="text-blue-600/80 text-xs mt-1">
          Shop-Logos unter <code className="bg-blue-100 px-1 rounded">/public/logos/</code> hinterlegen.
        </p>
      </div>

      {Object.entries(grouped)
        .sort(([, a], [, b]) => a[0].priority - b[0].priority)
        .map(([country, shops]) => (
          <div key={country}>
            <p className="section-title">
              {FLAG[shops[0].countryCode] ?? '🌍'} {country}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {shops.map((shop) => (
                <a
                  key={shop.id}
                  href={shop.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-3 p-4 bg-white border border-jdm-border
                             rounded-xl hover:border-jdm-red/50 hover:shadow-card-hover
                             transition-all duration-150 group"
                >
                  {/* Logo area */}
                  <div className="w-full h-10 bg-jdm-bg rounded border border-jdm-border
                                  flex items-center justify-center text-xl">
                    🛒
                  </div>

                  <div>
                    <p className="font-semibold text-sm text-jdm-text group-hover:text-jdm-red transition-colors">
                      {shop.name}
                    </p>
                    <p className="text-xs text-jdm-muted/70 mt-0.5 truncate">{shop.website}</p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {shop.specialties.slice(0, 3).map((spec) => (
                      <span key={spec} className="text-[10px] px-1.5 py-0.5 rounded bg-jdm-bg border border-jdm-border text-jdm-muted">
                        {spec}
                      </span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
