import { useState } from 'react';
import { Receipt, DollarSign, Download, CheckCircle, Clock, AlertCircle, Eye, PlusCircle, History, CreditCard, Banknote, FileText, X } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import { BILL_STATUS_MAP, BILL_ITEM_TYPE_MAP } from '@/types';
import type { Bill, PaymentRecord } from '@/types';

const statusIconMap: Record<string, any> = {
  pending: Clock,
  issued: Receipt,
  partial_paid: DollarSign,
  paid: CheckCircle,
  overdue: AlertCircle,
};

const statusClsMap: Record<string, string> = {
  pending: 'badge-slate',
  issued: 'badge-primary',
  partial_paid: 'badge-amber',
  paid: 'badge-success',
  overdue: 'badge-danger',
};

const paymentMethodOptions = [
  { value: 'bank_transfer', label: '银行转账', icon: Banknote },
  { value: 'electronic_acceptance', label: '电子承兑', icon: CreditCard },
  { value: 'cash', label: '现金', icon: DollarSign },
  { value: 'check', label: '支票', icon: FileText },
];

export default function BillingList() {
  const { bills, paymentRecords, generateBill, payBill } = useAppStore();
  const [period, setPeriod] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('bank_transfer');
  const [payRemark, setPayRemark] = useState('');

  const filteredBills = bills.filter((b) => b.period === period);

  const totalStorage = filteredBills.reduce((acc, b) => acc + b.storageFee, 0);
  const totalAccess = filteredBills.reduce((acc, b) => acc + b.accessFee, 0);
  const totalOverdue = filteredBills.reduce((acc, b) => acc + (b.overdueFee || 0), 0);
  const totalDestruction = filteredBills.reduce((acc, b) => acc + (b.destructionFee || 0), 0);
  const totalManual = filteredBills.reduce((acc, b) => acc + (b.manualServiceFee || 0), 0);
  const totalAmount = filteredBills.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalPaid = filteredBills.reduce((acc, b) => acc + (b.paidAmount || 0), 0);
  const totalUnpaid = totalAmount - totalPaid;

  const handleGenerate = () => {
    generateBill(period);
  };

  const openPayModal = (bill: Bill) => {
    setSelectedBill(bill);
    const unpaid = bill.totalAmount - (bill.paidAmount || 0);
    setPayAmount(unpaid.toString());
    setPayMethod('bank_transfer');
    setPayRemark('');
    setPayModalOpen(true);
  };

  const openDetailModal = (bill: Bill) => {
    setSelectedBill(bill);
    setDetailModalOpen(true);
  };

  const openHistoryModal = (bill: Bill) => {
    setSelectedBill(bill);
    setHistoryModalOpen(true);
  };

  const handlePaySubmit = () => {
    if (!selectedBill || !payAmount) return;
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) return;
    payBill(selectedBill.id, amount, payMethod, payRemark || undefined);
    setPayModalOpen(false);
  };

  const billPaymentRecords = selectedBill
    ? paymentRecords.filter((p) => p.billId === selectedBill.id).sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
    : [];

  const Modal = ({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">账单管理</h1>
          <p className="text-sm text-slate-500 mt-1">{period} 账期共 {filteredBills.length} 条账单记录</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            className="input w-44"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={handleGenerate}>
            <Receipt className="w-4 h-4" />
            生成月度账单
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">账单总额</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">¥{totalAmount.toLocaleString()}</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">已收款</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">¥{totalPaid.toLocaleString()}</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">待收款</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">¥{totalUnpaid.toLocaleString()}</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-accent-50 flex items-center justify-center">
            <Receipt className="w-6 h-6 text-accent-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">调阅服务费</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">¥{totalAccess.toLocaleString()}</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">逾期费</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">¥{totalOverdue.toLocaleString()}</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">销毁服务费</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">¥{totalDestruction.toLocaleString()}</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
            <PlusCircle className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">人工服务费</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">¥{totalManual.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">账单编号</th>
                <th className="table-th">客户</th>
                <th className="table-th">账期</th>
                <th className="table-th">寄存费</th>
                <th className="table-th">调阅服务费</th>
                <th className="table-th">合计</th>
                <th className="table-th">已收款</th>
                <th className="table-th">待收款</th>
                <th className="table-th">明细项</th>
                <th className="table-th">开票日期</th>
                <th className="table-th">到期日期</th>
                <th className="table-th">状态</th>
                <th className="table-th text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan={13} className="table-td text-center py-8 text-slate-400 text-sm">
                    当前账期暂无账单记录，点击右上角"生成月度账单"创建
                  </td>
                </tr>
              )}
              {filteredBills.map((b) => {
                const statusLabel = BILL_STATUS_MAP[b.status];
                const Icon = statusIconMap[b.status];
                const cls = statusClsMap[b.status];
                const paidAmount = b.paidAmount || 0;
                const unpaidAmount = b.totalAmount - paidAmount;
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="table-td font-mono text-primary-600 font-medium">{b.billNo}</td>
                    <td className="table-td text-slate-700 font-medium">{b.customerName}</td>
                    <td className="table-td text-slate-600">{b.period}</td>
                    <td className="table-td">¥{b.storageFee.toLocaleString()}</td>
                    <td className="table-td">¥{b.accessFee.toLocaleString()}</td>
                    <td className="table-td font-semibold text-slate-800">¥{b.totalAmount.toLocaleString()}</td>
                    <td className="table-td text-emerald-600 font-medium">¥{paidAmount.toLocaleString()}</td>
                    <td className={cn('table-td font-medium', unpaidAmount > 0 ? 'text-red-600' : 'text-slate-400')}>
                      ¥{unpaidAmount.toLocaleString()}
                    </td>
                    <td className="table-td">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {b.items?.length || 0} 项
                      </span>
                    </td>
                    <td className="table-td text-slate-600">{b.issueDate}</td>
                    <td className={cn('table-td', b.status === 'overdue' && 'text-red-600 font-medium')}>
                      {b.dueDate}
                    </td>
                    <td className="table-td">
                      <span className={cn('badge', cls)}>
                        <Icon className="w-3 h-3 mr-1" />
                        {statusLabel}
                      </span>
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="btn-ghost btn-sm" onClick={() => openDetailModal(b)} title="查看明细">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="btn-ghost btn-sm" onClick={() => openHistoryModal(b)} title="收款记录">
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button className="btn-ghost btn-sm" title="下载">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {b.status !== 'paid' && b.status !== 'pending' && (
                          <button onClick={() => openPayModal(b)} className="btn btn-sm btn-primary">
                            <PlusCircle className="w-3.5 h-3.5" /> 收款登记
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={payModalOpen} title="收款登记" onClose={() => setPayModalOpen(false)}>
        {selectedBill && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
              <div>
                <div className="text-xs text-slate-500">账单编号</div>
                <div className="font-mono font-medium text-slate-800 mt-1">{selectedBill.billNo}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">客户名称</div>
                <div className="font-medium text-slate-800 mt-1">{selectedBill.customerName}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">账单金额</div>
                <div className="font-semibold text-slate-800 mt-1">¥{selectedBill.totalAmount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">待收款金额</div>
                <div className="font-semibold text-red-600 mt-1">
                  ¥{(selectedBill.totalAmount - (selectedBill.paidAmount || 0)).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">收款金额</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">¥</span>
                  <input
                    type="number"
                    className="input pl-8 w-full"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="请输入收款金额"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">付款方式</label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethodOptions.map((option) => {
                    const OptIcon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPayMethod(option.value)}
                        className={cn(
                          'flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all text-left',
                          payMethod === option.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        )}
                      >
                        <OptIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">备注</label>
                <textarea
                  className="input w-full min-h-[80px] resize-none"
                  value={payRemark}
                  onChange={(e) => setPayRemark(e.target.value)}
                  placeholder="请输入备注信息（选填）"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button className="btn btn-secondary" onClick={() => setPayModalOpen(false)}>取消</button>
              <button className="btn btn-primary" onClick={handlePaySubmit}>
                <CheckCircle className="w-4 h-4" />
                确认收款
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={detailModalOpen} title="账单明细" onClose={() => setDetailModalOpen(false)}>
        {selectedBill && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl">
              <div>
                <div className="text-xs text-slate-500">账单编号</div>
                <div className="font-mono font-medium text-slate-800 mt-1">{selectedBill.billNo}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">客户名称</div>
                <div className="font-medium text-slate-800 mt-1">{selectedBill.customerName}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">账期</div>
                <div className="font-medium text-slate-800 mt-1">{selectedBill.period}</div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">费用类型</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">项目名称</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">数量</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">单位</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">单价</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">金额</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">备注</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedBill.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                          {BILL_ITEM_TYPE_MAP[item.itemType]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-800">{item.itemName}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 text-center">{item.unit}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 text-right">¥{item.unitPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 text-right">¥{item.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{item.remark || '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">合计：</td>
                    <td className="px-4 py-3 text-lg font-bold text-slate-800 text-right">¥{selectedBill.totalAmount.toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button className="btn btn-secondary" onClick={() => setDetailModalOpen(false)}>关闭</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={historyModalOpen} title="收款记录" onClose={() => setHistoryModalOpen(false)}>
        {selectedBill && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl">
              <div>
                <div className="text-xs text-slate-500">账单编号</div>
                <div className="font-mono font-medium text-slate-800 mt-1">{selectedBill.billNo}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">账单金额</div>
                <div className="font-semibold text-slate-800 mt-1">¥{selectedBill.totalAmount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">已收款</div>
                <div className="font-semibold text-emerald-600 mt-1">¥{(selectedBill.paidAmount || 0).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">待收款</div>
                <div className="font-semibold text-red-600 mt-1">
                  ¥{(selectedBill.totalAmount - (selectedBill.paidAmount || 0)).toLocaleString()}
                </div>
              </div>
            </div>

            {billPaymentRecords.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无收款记录</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">收款日期</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">收款金额</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">付款方式</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {billPaymentRecords.map((record: PaymentRecord) => (
                      <tr key={record.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-sm text-slate-700">{record.paymentDate}</td>
                        <td className="px-4 py-3 text-sm font-medium text-emerald-600 text-right">¥{record.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {paymentMethodOptions.find((o) => o.value === record.paymentMethod)?.label || record.paymentMethod}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">{record.remark || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50">
                    <tr>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">累计收款：</td>
                      <td className="px-4 py-3 text-lg font-bold text-emerald-600 text-right">
                        ¥{billPaymentRecords.reduce((acc, r) => acc + r.amount, 0).toLocaleString()}
                      </td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button className="btn btn-secondary" onClick={() => setHistoryModalOpen(false)}>关闭</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
