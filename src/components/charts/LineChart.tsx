interface LineChartProps {
  data: { label: string; temperature: number; humidity: number }[];
  width?: number;
  height?: number;
}

export default function LineChart({ data, width = 600, height = 220 }: LineChartProps) {
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxTemp = 30;
  const minTemp = 10;
  const maxHum = 70;
  const minHum = 30;

  const xStep = chartW / Math.max(data.length - 1, 1);

  const tempPoints = data.map((d, i) => {
    const x = padding.left + i * xStep;
    const y = padding.top + ((maxTemp - d.temperature) / (maxTemp - minTemp)) * chartH;
    return `${x},${y}`;
  }).join(' ');

  const humPoints = data.map((d, i) => {
    const x = padding.left + i * xStep;
    const y = padding.top + ((maxHum - d.humidity) / (maxHum - minHum)) * chartH;
    return `${x},${y}`;
  }).join(' ');

  const tempAreaPath = `M${padding.left},${padding.top + chartH} L${tempPoints.split(' ').join(' L')} L${padding.left + (data.length - 1) * xStep},${padding.top + chartH} Z`;
  const humAreaPath = `M${padding.left},${padding.top + chartH} L${humPoints.split(' ').join(' L')} L${padding.left + (data.length - 1) * xStep},${padding.top + chartH} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const tempLabels = yTicks.map(t => Math.round(maxTemp - t * (maxTemp - minTemp)));
  const humLabels = yTicks.map(t => Math.round(maxHum - t * (maxHum - minHum)));

  const displayLabels = data.filter((_, i) => i % 5 === 0 || i === data.length - 1);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={padding.top + t * chartH}
              x2={width - padding.right}
              y2={padding.top + t * chartH}
              stroke="#e2e8f0"
              strokeDasharray={i === yTicks.length - 1 ? '' : '4 4'}
            />
            <text x={padding.left - 6} y={padding.top + t * chartH + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
              {tempLabels[i]}°
            </text>
            <text x={width - padding.right + 6} y={padding.top + t * chartH + 4} fontSize="10" fill="#94a3b8">
              {humLabels[i]}%
            </text>
          </g>
        ))}

        <path d={humAreaPath} fill="url(#humGrad)" />
        <path d={tempAreaPath} fill="url(#tempGrad)" />

        <polyline points={humPoints} fill="none" stroke="#3b82f6" strokeWidth="2" />
        <polyline points={tempPoints} fill="none" stroke="#ef4444" strokeWidth="2" />

        {displayLabels.map((d, i) => {
          const idx = data.indexOf(d);
          return (
            <text
              key={i}
              x={padding.left + idx * xStep}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#94a3b8"
            >
              {d.label.slice(5)}
            </text>
          );
        })}
      </svg>
      <div className="flex items-center justify-center gap-6 mt-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-slate-600">温度 (℃)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-slate-600">湿度 (%RH)</span>
        </div>
      </div>
    </div>
  );
}
