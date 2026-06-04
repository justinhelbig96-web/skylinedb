'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import VinInput from '@/components/VinInput';
import VehicleCard from '@/components/VehicleCard';
import TabBar from '@/components/TabBar';
import SpecsTab from '@/components/tabs/SpecsTab';
import EquipmentTab from '@/components/tabs/EquipmentTab';
import EpcTab from '@/components/tabs/EpcTab';
import PartsTab from '@/components/tabs/PartsTab';
import ShopsTab from '@/components/tabs/ShopsTab';
import type { VehicleData, TabId } from '@/types';

export default function Home() {
  const [vehicle, setVehicle]   = useState<VehicleData | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('specs');

  async function handleSearch(chassis: string) {
    setLoading(true);
    setError(null);
    setVehicle(null);
    setActiveTab('specs');

    try {
      const res  = await fetch(`/api/vin?chassis=${encodeURIComponent(chassis)}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Kein Fahrzeug gefunden.');
      } else {
        setVehicle(json.data);
      }
    } catch {
      setError('Verbindungsfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10 space-y-8">
        {/* VIN Input */}
        <VinInput onSearch={handleSearch} loading={loading} />

        {/* Error */}
        {error && (
          <div className="card p-5 border-jdm-red/60 bg-jdm-red/10 animate-fade-in">
            <p className="text-jdm-red-bright font-medium">⚠ {error}</p>
            <p className="text-jdm-muted text-sm mt-1">
              Bekannte Chassis-Präfixe: BNR32, ECR33, BCNR33, HR32, ER34, ENR34, BNR34
            </p>
          </div>
        )}

        {/* Results */}
        {vehicle && (
          <div className="animate-slide-up space-y-6">
            <VehicleCard vehicle={vehicle} />

            <div className="card overflow-hidden">
              <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

              <div className="p-6">
                {activeTab === 'specs'     && <SpecsTab     vehicle={vehicle} />}
                {activeTab === 'equipment' && <EquipmentTab vehicle={vehicle} />}
                {activeTab === 'epc'       && <EpcTab       vehicle={vehicle} />}
                {activeTab === 'parts'     && <PartsTab     vehicle={vehicle} />}
                {activeTab === 'shops'     && <ShopsTab />}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!vehicle && !loading && !error && (
          <div className="text-center py-20 space-y-3 animate-fade-in">
            <p className="text-6xl">🏎</p>
            <p className="text-jdm-muted text-lg">
              Gib deine Fahrgestellnummer ein, um zu starten.
            </p>
            <p className="text-jdm-muted/60 text-sm">
              Beispiel: <span className="font-mono text-jdm-red">ER34-030828</span>
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-jdm-border py-6 text-center text-jdm-muted text-sm">
        <p>SkylineDB — Inoffizieller Nissan Skyline VIN-Decoder &amp; Teile-Finder</p>
        <p className="text-xs mt-1 text-jdm-muted/50">
          Keine Gewähr für Datenkorrektheit. Alle Daten zu Informationszwecken.
        </p>
      </footer>
    </div>
  );
}
