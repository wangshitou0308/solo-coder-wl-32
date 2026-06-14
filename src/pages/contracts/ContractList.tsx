import { useState } from 'react';
import { FileText, Calendar, Box, DollarSign, RefreshCw, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import { FEE_BASIS_MAP } from '@/types';
import type { Contract } from '@/types';

const statusMap: Record<string, { label: string; cls: string }> = {
  active: { label: '生效中', cls: 'badge-success' },
  expired: { label: '已到期', cls: 'badge-slate' },
  terminated: { label: '已终止', cls: 'badge-danger' },
};

const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const addYears = (dateStr: string, years: number): string => {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

const getPreviewContractNo = (contracts: Contract[], newStartDate: string): string => {
  const year = new Date(newStartDate).getFullYear();
  const maxNo = Math.max(0, ...contracts.filter((c) => c.contractNo.startsWith(`HT-${year}`)).map((c) => parseInt(c.contractNo.slice(-3)) || 0));
  return `HT-${year}-${String(maxNo + 1).padStart(3, '0')}`;
};

export default function ContractList() {
  const { contracts, renewContract } = useAppStore();
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successContractNo, setSuccessContractNo] = useState('');
  const [dateError, setDateError] = useState('');

  const handleOpenRenewModal = (contract: Contract) => {
    const defaultStart = addDays(contract.endDate, 1);
    const defaultEnd = addYears(defaultStart, 3);
    setSelectedContract(contract);
    setNewStartDate(defaultStart);
    setNewEndDate(defaultEnd);
    setDateError('');
    setShowModal(true);
  };

  const validateDates = (): boolean => {
    if (!selectedContract) return false;

    const start = new Date(newStartDate);
    const end = new Date(newEndDate);
    const originalEnd = new Date(selectedContract.endDate);

    if (start <= originalEnd) {
      setDateError('新合同开始日期必须晚于原合同结束日期');
      return false;
    }

    if (start >= end) {
      setDateError('开始日期必须早于结束日期');
      return false;
    }

    setDateError('');
    return true;
  };

  const handleRenew = () => {
    if (!selectedContract || !validateDates()) return;

    const newContract = renewContract(selectedContract.id, newStartDate, newEndDate);
    if (newContract) {
      setShowModal(false);
      setSuccessContractNo(newContract.contractNo);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const getOriginalContractNo = (originalId?: string): string => {
    if (!originalId) return '';
    const original = contracts.find((c) => c.id === originalId);
    return original?.contractNo || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">合同管理</h1>
          <p className="text-sm text-slate-500 mt-1">共 {contracts.length} 份客户寄存合同</p>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-green-50 border border-green-200 px-4 py-3 rounded-xl shadow-lg animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <div className="font-medium text-green-800">续签成功</div>
            <div className="text-sm text-green-600">新合同 {successContractNo} 已生成</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {contracts.map((c) => {
          const today = new Date();
          const end = new Date(c.endDate);
          const daysLeft = Math.ceil((end.getTime() - today.getTime()) / 86400000);
          const isNearExpiry = daysLeft > 0 && daysLeft <= 90;
          const originalContractNo = getOriginalContractNo(c.originalContractId);

          return (
            <div key={c.id} className={cn('card p-5 relative', isNearExpiry && 'ring-2 ring-amber-200')}>
              {isNearExpiry && (
                <div className="absolute top-0 right-0 bg-amber-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg rounded-tr-lg flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  即将到期
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-800 font-serif">{c.customerName}</h3>
                      {originalContractNo && (
                        <span className="badge badge-slate text-xs">
                          续签自 {originalContractNo}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{c.contractNo}</div>
                  </div>
                </div>
                <span className={cn('badge', statusMap[c.status].cls)}>{statusMap[c.status].label}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Calendar className="w-3 h-3" />
                    合同期限
                  </div>
                  <div className="text-sm font-medium text-slate-700">{c.startDate}</div>
                  <div className="text-xs text-slate-400">至 {c.endDate}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Box className="w-3 h-3" />
                    寄存上限
                  </div>
                  <div className="text-sm font-medium text-slate-700">{c.maxBoxes} 盒</div>
                  <div className={cn('text-xs', isNearExpiry ? 'text-amber-600 font-medium' : 'text-slate-400')}>
                    {daysLeft > 0 ? `剩余 ${daysLeft} 天` : '已到期'}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mb-4">
                <div className="text-xs text-slate-500 mb-3">费用标准</div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-primary-600 font-serif">¥{c.feePerBox}</div>
                    <div className="text-[10px] text-slate-500">每盒/月</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary-600 font-serif">¥{c.feePerVolume}</div>
                    <div className="text-[10px] text-slate-500">每m³/月</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary-600 font-serif">¥{c.feePerWeight}</div>
                    <div className="text-[10px] text-slate-500">每kg/月</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-accent-600 font-serif">¥{c.accessFeePerTime}</div>
                    <div className="text-[10px] text-slate-500">调阅/次</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <button
                  onClick={() => handleOpenRenewModal(c)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-sm hover:shadow"
                >
                  <RefreshCw className="w-4 h-4" />
                  续签合同
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 font-serif">续签合同</h2>
                  <p className="text-sm text-slate-500">为客户 {selectedContract.customerName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-500" />
                  原合同信息
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">合同编号：</span>
                    <span className="text-slate-700 font-mono">{selectedContract.contractNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">客户名称：</span>
                    <span className="text-slate-700">{selectedContract.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">原起止日期：</span>
                    <span className="text-slate-700">{selectedContract.startDate} 至 {selectedContract.endDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">原费用标准：</span>
                    <span className="text-slate-700">{FEE_BASIS_MAP[selectedContract.feeBasis]}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  新合同期限
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">开始日期</label>
                    <input
                      type="date"
                      value={newStartDate}
                      onChange={(e) => {
                        setNewStartDate(e.target.value);
                        setDateError('');
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">结束日期</label>
                    <input
                      type="date"
                      value={newEndDate}
                      onChange={(e) => {
                        setNewEndDate(e.target.value);
                        setDateError('');
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {dateError && (
                  <div className="flex items-center gap-1.5 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                    {dateError}
                  </div>
                )}
                <div className="text-xs text-slate-500">
                  默认开始日期为原合同结束日期+1天，结束日期为开始日期+3年
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary-500" />
                  费用标准明细（将复制原合同）
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">按盒单价</div>
                    <div className="text-base font-bold text-primary-600 font-serif">¥{selectedContract.feePerBox} 元/盒/月</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">按体积单价</div>
                    <div className="text-base font-bold text-primary-600 font-serif">¥{selectedContract.feePerVolume} 元/m³/月</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">按重量单价</div>
                    <div className="text-base font-bold text-primary-600 font-serif">¥{selectedContract.feePerWeight} 元/kg/月</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">调阅服务费</div>
                    <div className="text-base font-bold text-accent-600 font-serif">¥{selectedContract.accessFeePerTime} 元/次</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">逾期归还费</div>
                    <div className="text-base font-bold text-amber-600 font-serif">¥{selectedContract.overdueFeePerDay} 元/天</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">销毁服务费</div>
                    <div className="text-base font-bold text-rose-600 font-serif">¥{selectedContract.destructionFeePerItem} 元/件</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">人工服务费</div>
                    <div className="text-base font-bold text-indigo-600 font-serif">¥{selectedContract.manualServiceFeePerHour} 元/小时</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">月最低收费</div>
                    <div className="text-base font-bold text-emerald-600 font-serif">¥{selectedContract.minimumChargePerMonth} 元/月</div>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary-700 mb-2">
                  <FileText className="w-4 h-4" />
                  新合同编号预览
                </div>
                <div className="text-2xl font-bold text-primary-600 font-mono font-serif">
                  {getPreviewContractNo(contracts, newStartDate)}
                </div>
                <div className="text-xs text-primary-500 mt-1">
                  有效期：{formatDate(newStartDate)} 至 {formatDate(newEndDate)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleRenew}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-sm hover:shadow flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                确认续签
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
