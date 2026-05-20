import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp, Users, Wallet, Activity, Award } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { user, writerHistory, studioImages } = useApp();
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // SVG Chart Data - Traffic (clicks) over 6 weeks
  const trafficData = [240, 480, 390, 680, 890, 1240];
  const chartWidth = 500;
  const chartHeight = 150;
  const padding = 20;

  // Compute SVG line path points
  const points = trafficData.map((val, idx) => {
    const x = padding + (idx * (chartWidth - padding * 2)) / (trafficData.length - 1);
    const maxVal = Math.max(...trafficData);
    const y = chartHeight - padding - (val * (chartHeight - padding * 2)) / maxVal;
    return { x, y, val };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Fill path under the line
  const fillD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

  // Bar chart data - conversions by channel
  const barData = [
    { label: 'Twitter', val: 340, color: '#1da1f2' },
    { label: 'LinkedIn', val: 560, color: '#0077b5' },
    { label: 'Instagram', val: 410, color: '#e1306c' },
    { label: 'Facebook', val: 210, color: '#1877f2' }
  ];

  return (
    <div style={containerStyle}>
      {/* Metric Cards Grid */}
      <div style={metricGridStyle}>
        
        <div className="glass" style={metricCardStyle}>
          <div style={metricHeaderStyle}>
            <div style={iconBoxStyle('var(--color-primary)')}>
              <TrendingUp size={16} color="var(--color-primary)" />
            </div>
            <span style={percentageUpStyle}>+28.4%</span>
          </div>
          <div style={metricValueStyle}>12,480</div>
          <div style={metricLabelStyle}>Traffic Generated</div>
        </div>

        <div className="glass" style={metricCardStyle}>
          <div style={metricHeaderStyle}>
            <div style={iconBoxStyle('var(--color-secondary)')}>
              <Users size={16} color="var(--color-secondary)" />
            </div>
            <span style={percentageUpStyle}>+16.2%</span>
          </div>
          <div style={metricValueStyle}>1,840</div>
          <div style={metricLabelStyle}>Total Lead Conversions</div>
        </div>

        <div className="glass" style={metricCardStyle}>
          <div style={metricHeaderStyle}>
            <div style={iconBoxStyle('var(--color-indigo)')}>
              <Wallet size={16} color="var(--color-indigo)" />
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Workspace Pool</span>
          </div>
          <div style={metricValueStyle}>{user.credits}</div>
          <div style={metricLabelStyle}>Credits Remaining</div>
        </div>

        <div className="glass" style={metricCardStyle}>
          <div style={metricHeaderStyle}>
            <div style={iconBoxStyle('var(--color-pink)')}>
              <Award size={16} color="var(--color-pink)" />
            </div>
            <span style={percentageUpStyle}>+8.4x</span>
          </div>
          <div style={metricValueStyle}>$4,820</div>
          <div style={metricLabelStyle}>Est. Value Generated</div>
        </div>

      </div>

      {/* Charting Panel Grid */}
      <div style={chartsPanelGridStyle}>
        
        {/* Line Chart */}
        <div className="glass" style={chartCardStyle}>
          <h4 style={chartTitleStyle}>Traffic Generated (Clicks over Time)</h4>
          <div style={svgWrapperStyle}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(255,255,255,0.05)" />
              <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(255,255,255,0.02)" />

              {/* Gradient Area Fill */}
              <path d={fillD} fill="url(#chartGradient)" />

              {/* Smooth Path Line */}
              <path d={pathD} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />

              {/* Data Interactive Circles */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r={hoveredPoint === idx ? 6 : 4} 
                    fill="var(--bg-dark)" 
                    stroke="var(--color-secondary)" 
                    strokeWidth="2.5"
                    style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {hoveredPoint === idx && (
                    <g>
                      <rect 
                        x={p.x - 30} 
                        y={p.y - 30} 
                        width="60" 
                        height="20" 
                        rx="4" 
                        fill="var(--bg-darker)" 
                        stroke="var(--border-color)"
                      />
                      <text 
                        x={p.x} 
                        y={p.y - 17} 
                        fill="var(--text-primary)" 
                        fontSize="9" 
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {p.val} cls
                      </text>
                    </g>
                  )}
                </g>
              ))}
            </svg>
          </div>
          <div style={chartLegendStyle}>
            {['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6'].map((label, idx) => (
              <span key={idx} style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{label}</span>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="glass" style={chartCardStyle}>
          <h4 style={chartTitleStyle}>Conversions by Campaign Platform</h4>
          <div style={barChartWrapperStyle}>
            {barData.map((bar, idx) => {
              const maxVal = Math.max(...barData.map(b => b.val));
              const heightPct = (bar.val / maxVal) * 100;
              return (
                <div key={idx} style={barColStyle}>
                  <div style={barTrackStyle}>
                    <div 
                      style={{
                        ...barFillStyle,
                        height: `${heightPct}%`,
                        background: bar.color
                      }}
                      title={`${bar.val} conversions`}
                    ></div>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '8px' }}>{bar.label}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>{bar.val}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Activity Feed */}
      <div className="glass" style={activityFeedCardStyle}>
        <div style={activityHeaderStyle}>
          <Activity size={14} color="var(--color-primary)" />
          <h4 style={{ fontSize: '13px', fontWeight: 600 }}>Active Generation Logs</h4>
        </div>
        
        <div style={logsContainerStyle}>
          {writerHistory.length === 0 && studioImages.length === 0 ? (
            <div style={emptyLogsStyle}>No logs available. Start generating content to populate analytics tracking.</div>
          ) : (
            <>
              {writerHistory.slice(0, 3).map((item) => (
                <div key={item.id} style={logItemStyle}>
                  <div style={logDotStyle('var(--color-primary)')}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>
                      Generated Text Node via <span style={{ color: 'var(--color-primary)' }}>{item.template}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Prompt target: "{item.prompt.substring(0, 60)}..."
                    </div>
                  </div>
                  <span style={logTimeStyle}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {studioImages.slice(0, 2).map((item) => (
                <div key={item.id} style={logItemStyle}>
                  <div style={logDotStyle('var(--color-secondary)')}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>
                      Diffused Canvas Asset in <span style={{ color: 'var(--color-secondary)' }}>{item.style}</span> style
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Prompt target: "{item.prompt.substring(0, 60)}..."
                    </div>
                  </div>
                  <span style={logTimeStyle}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const metricGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px'
};

const metricCardStyle: React.CSSProperties = {
  padding: '20px',
  background: 'rgba(255,255,255,0.01)',
  borderRadius: '12px'
};

const metricHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px'
};

const iconBoxStyle = (color: string): React.CSSProperties => ({
  width: '32px',
  height: '32px',
  borderRadius: '6px',
  background: `${color}15`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const percentageUpStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--success)',
  display: 'flex',
  alignItems: 'center',
  gap: '2px'
};

const metricValueStyle: React.CSSProperties = {
  fontSize: '26px',
  fontWeight: 800,
  fontFamily: 'Outfit, sans-serif'
};

const metricLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--text-secondary)',
  marginTop: '4px'
};

const chartsPanelGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '24px'
};

const chartCardStyle: React.CSSProperties = {
  padding: '20px',
  background: 'rgba(255,255,255,0.01)',
  display: 'flex',
  flexDirection: 'column'
};

const chartTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: '15px'
};

const svgWrapperStyle: React.CSSProperties = {
  height: '160px',
  position: 'relative'
};

const chartLegendStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0 10px',
  marginTop: '6px'
};

const barChartWrapperStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'flex-end',
  height: '160px',
  paddingTop: '20px'
};

const barColStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1
};

const barTrackStyle: React.CSSProperties = {
  width: '28px',
  height: '100px',
  background: 'rgba(255,255,255,0.03)',
  borderRadius: '4px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'flex-end'
};

const barFillStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: '4px',
  transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
};

const activityFeedCardStyle: React.CSSProperties = {
  padding: '20px',
  background: 'rgba(255,255,255,0.01)'
};

const activityHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  paddingBottom: '10px',
  marginBottom: '12px'
};

const logsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const emptyLogsStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '20px',
  color: 'var(--text-muted)',
  fontSize: '12px'
};

const logItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 10px',
  background: 'rgba(255,255,255,0.01)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px'
};

const logDotStyle = (color: string): React.CSSProperties => ({
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: color,
  boxShadow: `0 0 6px ${color}`
});

const logTimeStyle: React.CSSProperties = {
  fontSize: '10px',
  color: 'var(--text-muted)'
};
