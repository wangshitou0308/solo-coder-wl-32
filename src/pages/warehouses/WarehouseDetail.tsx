import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Box, Search, Thermometer, Droplets } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';

export default function WarehouseDetail() {
  const { id } = useParams<{ id: string }>();
  const { warehouses, shelfPositions, archives } = useAppStore();
  const warehouse = warehouses.find((w) => w.id === id);
  const [selectedColumn, setSelectedColumn] = useState<number>(1);
  const [search, setSearch] = useState('');

  const positions = useMemo(() => shelfPositions.filter((p) => p.warehouseId === id), [shelfPositions, id]);

  if (!warehouse) {
    return (
      <div className="space-y-4">
        <Link to="/warehouses" className="btn-ghost btn-sm w-fit">
          <ArrowLeft className="w-4 h-4" />
          返回库房列表
        </Link>
        <p>库房不存在</p>
      </div>
    );
  }

  const columns = Array.from({ length: warehouse.columns }, (_, i) => i + 1);
  const filteredPositions = positions.filter(
    (p) => p.column === selectedColumn && (!search || p.code.includes(search)),
  );

  const grouped = new Map<number, Map<number, typeof filteredPositions>>();
  filteredPositions.forEach((p) => {
    if (!grouped.has(p.side)) grouped.set(p.side, new Map());
    const sideMap = grouped.get(p.side)!;
    if (!sideMap.has(p.level)) sideMap.set(p.level, []);
    sideMap.get(p.level)!.push(p);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/warehouses" className="btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4" />
            返回
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-serif">{warehouse.name}</h1>
            <p className="text-sm text-slate-500 mt-1">
              库房编号 <span className="font-mono">{warehouse.code}</span> · 架位使用率 {Math.round((warehouse.usedPositions / warehouse.totalPositions) * 100)}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Thermometer className="w-4 h-4 text-red-500" />
            <span className="font-medium">标准 14-24℃</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="font-medium">标准 45-60%RH</span>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100">
            {columns.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedColumn(c)}
                className={cn(
                  'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                  selectedColumn === c ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700',
                )}
              >
                第 {c} 列
              </button>
            ))}
          </div>
          <div className="relative md:ml-auto md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="搜索架位编码..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {Array.from(grouped.entries()).sort(([a], [b]) => a - b).map(([side, levelMap]) => (
            <div key={side} className="space-y-2">
              <div className="text-sm font-medium text-slate-600">第 {side} 面</div>
              <div className="space-y-1">
                {Array.from(levelMap.entries()).sort(([a], [b]) => b - a).map(([level, posList]) => (
                  <div key={level} className="flex items-center gap-2">
                    <div className="w-12 text-xs text-slate-400 text-right">L{level}</div>
                    <div className="flex-1 flex flex-wrap gap-1.5 p-2 rounded-md bg-slate-50 min-h-[44px]">
                      {posList.map((p) => {
                        const archive = archives.find((a) => a.positionId === p.id);
                        return (
                          <div
                            key={p.id}
                            title={archive ? `${archive.title} - ${archive.customerName}` : p.code}
                            className={cn(
                              'group relative flex items-center gap-1 px-2 py-1 rounded text-xs font-mono cursor-pointer transition-all border',
                              p.occupied
                                ? 'bg-primary-600 text-white border-primary-700 hover:bg-primary-700'
                                : 'bg-white text-slate-400 border-slate-200 hover:border-emerald-400 hover:text-emerald-600',
                            )}
                          >
                            <Box className="w-3 h-3" />
                            {p.code.split('-').slice(1).join('-')}
                            {archive && (
                              <div className="absolute left-0 bottom-full mb-1 z-10 hidden group-hover:block">
                                <div className="w-56 p-2 rounded bg-slate-900 text-white text-xs shadow-lg">
                                  <div className="font-medium truncate">{archive.title}</div>
                                  <div className="text-slate-300 truncate mt-0.5">{archive.customerName}</div>
                                  <div className="text-slate-400 font-mono mt-0.5">{archive.barcode}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-primary-600" />
            <span>已占用</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-white border border-slate-200" />
            <span>空闲</span>
          </div>
          <div className="ml-auto">
            第{selectedColumn}列：共 {filteredPositions.length} 个架位，
            已占用 {filteredPositions.filter((p) => p.occupied).length} 个
          </div>
        </div>
      </div>
    </div>
  );
}
