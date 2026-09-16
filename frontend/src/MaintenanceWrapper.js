import React, { useState, useEffect } from 'react';
import MaintenancePage from './MaintenancePage';
import api from './services/api';
import { Loader2 } from './icons';

const MaintenanceWrapper = ({ children }) => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkMaintenanceStatus();

    // Re-check every 60 seconds
    const interval = setInterval(checkMaintenanceStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkMaintenanceStatus = async () => {
    try {
      const response = await api.get('/settings');
      // Always set the value (true OR false)
      setIsMaintenance(response.data.maintenanceMode === true);
    } catch (error) {
      console.error('Error checking maintenance status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-background)' }}
      >
        <div className="text-center">
          <Loader2
            size={40}
            className="animate-spin mx-auto mb-4"
            style={{ color: 'var(--color-primary)' }}
          />
          <p style={{ color: 'var(--color-text-light)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (isMaintenance) {
    return <MaintenancePage />;
  }

  return children;
};

export default MaintenanceWrapper;