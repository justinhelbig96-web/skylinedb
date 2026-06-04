import type { TabId, TabConfig } from '@/types';

const TABS: TabConfig[] = [
  { id: 'specs',     label: 'Specs',      labelDE: 'Fahrzeugdaten',  icon: '📋' },
  { id: 'equipment', label: 'Equipment',  labelDE: 'Ausstattung',    icon: '🔩' },
  { id: 'epc',       label: 'OEM Parts',  labelDE: 'OEM Teile',      icon: '📐' },
  { id: 'parts',     label: 'Teile',      labelDE: 'Teile-Suche',    icon: '🔍' },
  { id: 'shops',     label: 'Shops',      labelDE: 'Shops',          icon: '🛒' },
];

interface Props {
  activeTab:   TabId;
  onTabChange: (id: TabId) => void;
}

export default function TabBar({ activeTab, onTabChange }: Props) {
  return (
    <div className="flex gap-1 overflow-x-auto px-4 pt-4 pb-0 border-b border-jdm-border scrollbar-none">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`tab-btn border-b-2 rounded-none pb-3 transition-colors ${
            activeTab === tab.id
              ? 'border-jdm-red text-jdm-red font-semibold'
              : 'border-transparent text-jdm-muted hover:text-jdm-text'
          }`}
        >
          <span className="text-sm">{tab.icon}</span>
          <span>{tab.labelDE}</span>
        </button>
      ))}
    </div>
  );
}
