import { useState } from 'react';
import { Download, FileText, Users, FileSearch, ClipboardList, Trash2, Receipt, RefreshCw, Clock, CheckCircle, AlertCircle, X, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import { EXPORT_TYPE_MAP, EXPORT_STATUS_MAP } from '@/types';
import type { ExportType, ExportStatus, ExportTask } from '@/types';

const exportTypeConfig: Array<{
  type: ExportType;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  description: string;
}> = [
  {
    type: 'archive_list',
    icon: FileText,
    gradient: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-100',
    description: '导出全部档案的详细清单信息',
  },
  {
    type: 'customer_list',
    icon: Users,
    gradient: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-100',
    description: '导出所有客户的基础信息列表',
  },
  {
    type: 'accession_records',
    icon: FileSearch,
    gradient: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-100',
    description: '导出档案调阅、借阅的历史记录',
  },
  {
    type: 'inventory_report',
    icon: ClipboardList,
    gradient: 'from-purple-500 to-indigo-500',
    iconBg: 'bg-purple-100',
    description: '导出档案盘点任务的详细报告',
  },
  {
    type: 'destruction_certificate',
    icon: Trash2,
    gradient: 'from-red-500 to-rose-500',
    iconBg: 'bg-red-100',
    description: '导出档案销毁审批及执行证明',
  },
  {
    type: 'bill_details',
    icon: Receipt,
    gradient: 'from-pink-500 to-fuchsia-500',
    iconBg: 'bg-pink-100',
    description: '导出账单明细及费用构成详情',
  },
];

const statusIconMap: Record<ExportStatus, LucideIcon> = {
  pending: Clock,
  processing: RefreshCw,
  completed: CheckCircle,
  failed: AlertCircle,
};

const statusClsMap: Record<ExportStatus, string> = {
  pending: 'badge-slate',
  processing: 'badge-primary',
  completed: 'badge-success',
  failed: 'badge-danger',
};

export default function ExportCenter() {
  const { exportTasks, createExportTask, downloadExport, customers } = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ExportType | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [customerFilter, setCustomerFilter] = useState('');
  const [format, setFormat] = useState('csv');

  const sortedTasks = [...exportTasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const openExportModal = (type: ExportType) => {
    setSelectedType(type);
    setDateRange({ start: '', end: '' });
    setCustomerFilter('');
    setFormat('csv');
    setModalOpen(true);
  };

  const handleExport = () => {
    if (!selectedType) return;
    const params: Record<string, string> = { format };
    if (dateRange.start) params.startDate = dateRange.start;
    if (dateRange.end) params.endDate = dateRange.end;
    if (customerFilter) params.customerId = customerFilter;
    createExportTask(selectedType, params);
    setModalOpen(false);
  };

  const handleReExport = (task: ExportTask) => {
    setSelectedType(task.type);
    setDateRange({ start: '', end: '' });
    setCustomerFilter('');
    setFormat('csv');
    setModalOpen(true);
  };

  const Modal = ({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[calc(80vh-64px)]">
            {children}
          </div>
        </div>
      </div>
    );
  };

  const selectedConfig = exportTypeConfig.find((c) => c.type === selectedType);
  const SelectedIcon = selectedConfig?.icon;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 font-serif">导出中心</h1>
        <p className="text-sm text-slate-500 mt-1">导出各类业务数据，支持 CSV 格式下载</p>
      </div>

      <div>
        <h2 className="section-title mb-4">选择导出类型</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exportTypeConfig.map((config) => {
            const Icon = config.icon;
            return (
              <div key={config.type} className="card overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-slate-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800">{EXPORT_TYPE_MAP[config.type]}</h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{config.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button className="btn btn-primary btn-sm" onClick={() => openExportModal(config.type)}>
                      <Download className="w-3.5 h-3.5" />
                      导出
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="section-title mb-4">导出任务</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">任务类型</th>
                  <th className="table-th">状态</th>
                  <th className="table-th">创建时间</th>
                  <th className="table-th">完成时间</th>
                  <th className="table-th">文件大小</th>
                  <th className="table-th text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {sortedTasks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="table-td text-center py-12 text-slate-400">
                      <Download className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>暂无导出任务</p>
                    </td>
                  </tr>
                )}
                {sortedTasks.map((task) => {
                  const statusLabel = EXPORT_STATUS_MAP[task.status];
                  const Icon = statusIconMap[task.status];
                  const cls = statusClsMap[task.status];
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/50">
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg ${exportTypeConfig.find((c) => c.type === task.type)?.iconBg || 'bg-slate-100'} flex items-center justify-center`}>
                            {(() => {
                              const TypeIcon = exportTypeConfig.find((c) => c.type === task.type)?.icon || FileText;
                              return <TypeIcon className="w-4 h-4 text-slate-600" />;
                            })()}
                          </div>
                          <span className="font-medium text-slate-700">{task.typeName}</span>
                        </div>
                      </td>
                      <td className="table-td">
                        <span className={cn('badge', cls)}>
                          <Icon className={cn('w-3 h-3 mr-1', task.status === 'processing' && 'animate-spin')} />
                          {statusLabel}
                        </span>
                      </td>
                      <td className="table-td text-slate-600">{task.createdAt}</td>
                      <td className="table-td text-slate-600">{task.completedAt || '-'}</td>
                      <td className="table-td text-slate-600">{task.fileSize || '-'}</td>
                      <td className="table-td text-right">
                        <div className="flex items-center justify-end gap-1">
                          {task.status === 'completed' && (
                            <button className="btn-ghost btn-sm" onClick={() => downloadExport(task.id)} title="下载">
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button className="btn-ghost btn-sm" onClick={() => handleReExport(task)} title="重新导出">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} title="导出参数设置" onClose={() => setModalOpen(false)}>
        {selectedType && selectedConfig && SelectedIcon && (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className={`w-12 h-12 rounded-xl ${selectedConfig.iconBg} flex items-center justify-center`}>
                <SelectedIcon className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">{EXPORT_TYPE_MAP[selectedType]}</div>
                <div className="text-sm text-slate-500">{selectedConfig.description}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">日期范围（选填）</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="input"
                    value={dateRange.start}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                    placeholder="开始日期"
                  />
                  <input
                    type="date"
                    className="input"
                    value={dateRange.end}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                    placeholder="结束日期"
                  />
                </div>
              </div>

              <div>
                <label className="label">客户筛选（选填）</label>
                <select
                  className="select"
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                >
                  <option value="">全部客户</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">导出格式</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat('csv')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all',
                      format === 'csv'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    )}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">CSV</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleExport}>
                <Download className="w-4 h-4" />
                开始导出
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
