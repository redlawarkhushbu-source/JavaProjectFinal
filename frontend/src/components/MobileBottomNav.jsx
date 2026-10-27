import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LayoutDashboard, Box, ScanLine, CloudSun, Store } from 'lucide-react';

export default function MobileBottomNav({ currentPage, setCurrentPage }) {
  const { t } = useLanguage();

  const items = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { id: '3dfarm', label: t('nav3DFarm'), icon: Box },
    { id: 'diagnosis', label: t('navDiagnosis'), icon: ScanLine },
    { id: 'weather', label: t('navWeather'), icon: CloudSun },
    { id: 'suppliers', label: t('navSuppliers'), icon: Store },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
            aria-label={item.label}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
