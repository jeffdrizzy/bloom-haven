import React, { useState, useEffect } from 'react';
import MaintenancePage from './MaintenancePage';
import api from './services/api';

const MaintenanceWrapper = ({ children }) => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkMaintenanceStatus();
  }, []);

  const checkMaintenanceStatus = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data.maintenanceMode === true) {
        setIsMaintenance(true);
      }
    } catch (error) {
      console.error('Error checking maintenance status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF9F6' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">🌸</div>
          <p style={{ color: '#6B7568' }}>Loading...</p>
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