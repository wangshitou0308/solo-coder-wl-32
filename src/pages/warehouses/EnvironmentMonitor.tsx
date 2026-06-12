import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, AlertTriangle, Thermometer, Droplets } from 'lucide-react';
import { useAppStore } from '@/store';
import LineChart from '@/components/Charts/LineChart';
import { cn } from '@/lib/utils';

export default function EnvironmentMonitor() {
  const { id } = useParams<{ id: string }>();
  const { warehouses, environmentRecords, addEnvironmentRecord } = useAppStore();
  const warehouse = warehouses.find((w) => w.id === id);

  const records = useMemo(
    () => environmentRecords.filter((r) => r.warehouseId === id).sort((a, b) => b.recordDate.localeCompare(a.recordDate)),
    [environmentRecords, id],
  );

  const chartData = useMemo(
    () => [...records].reverse().slice(-30).map((r) => ({ label: r.recordDate, temperature: r.temperature, humidity: r.humidity })),
    [records],
  );

  const abnormalCount = records.filter((r) => r.isAbnormal).length;
  const isPaper = warehouse?.archiveType !== 'film';
  const tempRange = isPaper ? '14-24℃' : '13-15℃';
  const humRange = isPaper ? '45-60%RH' : '35-45%RH';

  if (!warehouse) {
    return <div>库房不存在</div>;
  }

  const handleQuickAdd = () => {
    const temp = +(isPaper ? 18 + (Math.random() - 0.5) * 6 : 14 + (Math.random() - 0.5) * 2).toFixed(1);
    const hum = +(isPaper ? 52 + (Math.random() - 0.5) * 10 : 40 + (Math.random() - 0.5) * 8).toFixed(1);
    addEnvironmentRecord({
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      recordDate: new Date().toISOString().slice(0, 10),
      temperature: temp,
      humidity: hum,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/warehouses" className="btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4" />
            返回
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-serif">温湿度监控 - {warehouse.name}</h1>
            <p className="text-sm text-slate-500 mt-1">
              标准范围：温度 {tempRange} · 湿度 {humRange}
            </p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleQuickAdd}>
          <Plus className="w-4 h-4" />
          记录今日读数
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
            <Thermometer className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <div className="text-xs text-slate-500">今日温度</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">
              {records[0]?.temperature.toFixed(1) || '--'}
              <span className="text-sm font-normal text-slate-500 ml-1">℃</span>
            </div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
            <Droplets className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <div className="text-xs text-slate-500">今日湿度</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">
              {records[0]?.humidity.toFixed(1) || '--'}
              <span className="text-sm font-normal text-slate-500 ml-1">%RH</span>
            </div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <div className="text-xs text-slate-500">异常次数</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">{abnormalCount}</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-emerald-500" />
          </div>
          <div>
            <div className="text-xs text-slate-500">档案损害风险</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">
              {abnormalCount === 0 ? '低' : abnormalCount < 5 ? '中' : '高'}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="section-title mb-4">近30天温湿度波动曲线</h3>
        <LineChart data={chartData} />
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="section-title">历史记录</h3>
          <span className="text-sm text-slate-500">共 {records.length} 条记录</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">日期</th>
                <th className="table-th">温度 (℃)</th>
                <th className="table-th">湿度 (%RH)</th>
                <th className="table-th">状态</th>
                <th className="table-th">风险等级</th>
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 30).map((r) => (
                <tr key={r.id} className={cn('transition', r.isAbnormal && 'bg-red-50/50')}>
                  <td className="table-td font-medium text-slate-700">{r.recordDate}</td>
                  <td className="table-td">
                    <span className={cn('font-mono', r.isAbnormal && 'text-red-600 font-semibold')}>
                      {r.temperature.toFixed(1)}
                    </span>
                  </td>
                  <td className="table-td">
                    <span className={cn('font-mono', r.isAbnormal && 'text-red-600 font-semibold')}>
                      {r.humidity.toFixed(1)}
                    </span>
                  </td>
                  <td className="table-td">
                    {r.isAbnormal ? (
                      <span className="badge badge-danger">异常</span>
                    ) : (
                      <span className="badge badge-success">正常</span>
                    )}
                  </td>
                  <td className="table-td">
                    {r.riskLevel === 'low' && <span className="badge badge-slate">低</span>}
                    {r.riskLevel === 'medium' && <span className="badge badge-warning">中</span>}
                    {r.riskLevel === 'high' && <span className="badge badge-danger">高</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
