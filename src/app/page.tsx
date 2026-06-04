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
    <div className="min-h-screen flex flex-col bg-jdm-bg">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* VIN Input */}
        <VinInput onSearch={handleSearch} loading={loading} />

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
            <p className="text-red-600 font-medium text-sm">⚠ {error}</p>
            <p className="text-red-400 text-xs mt-1">
              Bekannte Präfixe: BNR32, HCR32, HNR32, ECR33, HCR33, BCNR33, HR34, ER34, ENR34, BNR34
            </p>
          </div>
        )}

        {/* Results */}
        {vehicle && (
          <div className="animate-slide-up space-y-5">
            <VehicleCard vehicle={vehicle} />

            <div className="bg-white border border-jdm-border rounded-xl shadow-card overflow-hidden">
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
            <p className="text-5xl">🏎</p>
            <p className="text-jdm-muted">Gib deine Fahrgestellnummer ein, um zu starten.</p>
            <p className="text-jdm-muted/60 text-sm">
              Beispiel:{' '}
              <code className="font-mono text-jdm-red bg-red-50 px-1.5 py-0.5 rounded">
                ER34-030828
              </code>
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-jdm-border bg-white py-5 text-center text-jdm-muted text-xs">
        <p>SkylineDB — Inoffizieller Nissan Skyline VIN-Decoder &amp; Teile-Finder</p>
        <p className="mt-1 text-jdm-muted/50">Alle Daten zu Informationszwecken. Keine Gewähr für Datenkorrektheit.</p>
      </footer>
    </div>
  );
}
