import React, { useState, useEffect } from 'react';
import api from './services/api';
import { brand } from './brand';

const PortfolioChart = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState(30);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [range]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/portfolio/history?days=${range}`);
      setHistory(response.data.history || []);
    } catch (error) {
      console.error('Error fetching portfolio history:', error);
      setError('Failed to load portfolio chart');
    } finally {
      setLoading(false);
    }
  };

  const ranges = [
    { label: '7D', value: 7 },
    { label: '30D', value: 30 },
    { label: '90D', value: 90 },
    { label: '1Y', value: 365 },
  ];

  // Calculate chart data
  const getChartData = () => {
    if (history.length === 0) return null;

    const values = history.map(h => h.totalBalance);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const rangeValue = maxValue - minValue || 1;

    const width = 800;
    const height = 200;
    const padding = 20;

    const points = history.map((item, index) => {
      const x = history.length === 1 
        ? width / 2 
        : padding + (index / (history.length - 1)) * (width - padding * 2);
      
      const y = height - padding - ((item.totalBalance - minValue) / rangeValue) * (height - padding * 2);

      return {
        x,
        y,
        value: item.totalBalance,
        date: new Date(item.snapshotDate),
      };
    });

    // Create path
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    // Create area path
    const areaPath = `${path} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return {
      points,
      path,
      areaPath,
      maxValue,
      minValue,
      width,
      height,
      padding,
    };
  };

  const chartData = getChartData();

  // Calculate change percentage
  const getChange = () => {
    if (history.length < 2) return { value: 0, percent: 0, positive: true };
    
    const first = history[0].totalBalance;
    const last = history[history.length - 1].totalBalance;
    const change = last - first;
    const percent = first > 0 ? (change / first) * 100 : 0;

    return {
      value: change,
      percent,
      positive: change >= 0,
    };
  };

  const change = getChange();

  const currentBalance = history.length > 0 
    ? history[history.length - 1].totalBalance 
    : 0;

  if (loading) {
    return (
      <div className="rounded-2xl shadow-lg p-4 sm:p-6" style={{ background: brand.colors.surface }}>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📈</div>
          <p style={{ color: brand.colors.textLight }}>Loading chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl shadow-lg p-4 sm:p-6" style={{ background: brand.colors.surface }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-base sm:text-lg" style={{ color: brand.colors.text }}>
            📈 Portfolio Value
          </h3>
          <p className="text-2xl font-bold mt-1" style={{ color: brand.colors.text }}>
            ${currentBalance.toFixed(2)}
          </p>
          {history.length > 1 && (
            <p 
              className="text-sm font-medium mt-1"
              style={{ color: change.positive ? brand.colors.success : brand.colors.error }}
            >
              {change.positive ? '▲' : '▼'} ${Math.abs(change.value).toFixed(2)} ({change.positive ? '+' : ''}{change.percent.toFixed(2)}%)
            </p>
          )}
        </div>

        {/* Range Selector */}
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: brand.colors.surfaceAlt }}>
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className="px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition"
              style={{
                background: range === r.value ? brand.gradients.primary : 'transparent',
                color: range === r.value ? 'white' : brand.colors.textLight,
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="border-l-4 px-4 py-3 rounded-lg mb-4 text-sm" style={{
          backgroundColor: '#FDF2F2',
          borderColor: brand.colors.error,
          color: brand.colors.error
        }}>
          {error}
        </div>
      )}

      {/* Chart */}
      {history.length === 0 || !chartData ? (
        <div className="text-center py-12 rounded-xl" style={{ background: brand.colors.surfaceAlt }}>
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm" style={{ color: brand.colors.textMuted }}>
            Not enough data yet
          </p>
          <p className="text-xs mt-1" style={{ color: brand.colors.textMuted }}>
            Your portfolio chart will appear as you make transactions
          </p>
        </div>
      ) : (
        <div className="relative">
          <svg 
            viewBox={`0 0 ${chartData.width} ${chartData.height}`} 
            className="w-full"
            style={{ height: 'auto', maxHeight: '250px' }}
          >
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={brand.colors.primary} stopOpacity="0.3" />
                <stop offset="100%" stopColor={brand.colors.primary} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => {
              const y = chartData.padding + (i / 4) * (chartData.height - chartData.padding * 2);
              return (
                <line
                  key={i}
                  x1={chartData.padding}
                  y1={y}
                  x2={chartData.width - chartData.padding}
                  y2={y}
                  stroke={brand.colors.primarySoft}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Area fill */}
            <path
              d={chartData.areaPath}
              fill="url(#portfolioGradient)"
            />

            {/* Line */}
            <path
              d={chartData.path}
              fill="none"
              stroke={brand.colors.primary}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {chartData.points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredPoint === index ? 7 : 4}
                  fill={brand.colors.primary}
                  stroke="white"
                  strokeWidth="2"
                  style={{ cursor: 'pointer', transition: 'r 0.2s' }}
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            ))}
          </svg>

          {/* Hover tooltip */}
          {hoveredPoint !== null && chartData.points[hoveredPoint] && (
            <div 
              className="absolute px-3 py-2 rounded-lg shadow-lg pointer-events-none z-10"
              style={{ 
                background: brand.colors.text,
                color: 'white',
                top: '10px',
                right: '10px',
              }}
            >
              <p className="text-xs opacity-80">
                {chartData.points[hoveredPoint].date.toLocaleDateString()}
              </p>
              <p className="font-bold">
                ${chartData.points[hoveredPoint].value.toFixed(2)}
              </p>
            </div>
          )}

          {/* X-axis labels */}
          <div className="flex justify-between px-2 mt-2">
            <span className="text-xs" style={{ color: brand.colors.textMuted }}>
              {history.length > 0 ? new Date(history[0].snapshotDate).toLocaleDateString() : ''}
            </span>
            <span className="text-xs" style={{ color: brand.colors.textMuted }}>
              {history.length > 0 ? new Date(history[history.length - 1].snapshotDate).toLocaleDateString() : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioChart;