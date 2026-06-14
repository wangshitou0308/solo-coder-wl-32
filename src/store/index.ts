import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Archive, ArchiveStatus, Accession, AccessionItem, InventoryTask, InventoryStatus, DestructionRecord, EnvironmentRecord, Bill, Customer, ShelfPosition, FeeStandard, PaymentRecord, ExportTask, BillItem, ExportType, Contract, PayBillResult } from '@/types';
import { EXPORT_TYPE_MAP } from '@/types';
import { mockCustomers, mockContracts, mockWarehouses, mockShelfPositions, mockArchives, mockEnvRecords, mockAccessions, mockInventoryTasks, mockDestructions, mockBills, mockFeeStandards, mockPaymentRecords, mockExportTasks } from '@/data/mockData';

const genId = () => Math.random().toString(36).slice(2, 10);
const genBarcode = () => 'ARC' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
const todayStr = () => new Date().toISOString().slice(0, 10);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      customers: mockCustomers,
      contracts: mockContracts,
      warehouses: mockWarehouses,
      shelfPositions: mockShelfPositions,
      archives: mockArchives,
      environmentRecords: mockEnvRecords,
      accessions: mockAccessions,
      inventoryTasks: mockInventoryTasks,
      destructions: mockDestructions,
      bills: mockBills,
      feeStandards: mockFeeStandards,
      paymentRecords: mockPaymentRecords,
      exportTasks: mockExportTasks,

      addCustomer: (data) => set((s) => ({
        customers: [...s.customers, {
          ...data,
          id: 'c' + genId(),
          createdAt: todayStr(),
          archiveCount: 0,
          accessCount: 0,
        } as Customer],
      })),

      addArchive: (data) => {
        const { shelfPositions, warehouses } = get();
        const emptyPos = shelfPositions.find((p) => !p.occupied);
        if (!emptyPos) return;
        const newId = 'a' + genId();
        set((s) => ({
          archives: [...s.archives, {
            ...data,
            id: newId,
            barcode: genBarcode(),
            positionId: emptyPos.id,
            positionCode: emptyPos.code,
            warehouseId: emptyPos.warehouseId,
          } as Archive],
          shelfPositions: s.shelfPositions.map((p) => p.id === emptyPos.id ? { ...p, occupied: true, archiveId: newId } : p),
          warehouses: s.warehouses.map((w) => {
            if (w.id !== emptyPos.warehouseId) return w;
            const used = w.usedPositions + 1;
            return {
              ...w,
              usedPositions: used,
              status: used >= w.totalPositions ? 'full' : used >= w.totalPositions * 0.85 ? 'warning' : 'normal',
            };
          }),
        }));
      },

      updateArchiveStatus: (id, status) => set((s) => ({
        archives: s.archives.map((a) => a.id === id ? { ...a, status } : a),
      })),

      addAccession: (data) => {
        const id = 'acc' + genId();
        const no = 'DY' + todayStr().replace(/-/g, '') + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        set((s) => ({
          accessions: [...s.accessions, {
            ...data,
            id,
            accessionNo: no,
            status: 'pending',
            createdAt: todayStr(),
            items: data.items.map((it, idx) => ({
              ...it,
              id: 'ai' + genId() + idx,
              accessionId: id,
              returnStatus: 'normal',
            })) as AccessionItem[],
          } as Accession],
        }));
      },

      approveAccession: (id) => set((s) => ({
        accessions: s.accessions.map((a) => a.id === id ? { ...a, status: 'approved' } : a),
      })),

      rejectAccession: (id) => set((s) => ({
        accessions: s.accessions.map((a) => a.id === id ? { ...a, status: 'rejected' } : a),
      })),

      outboundAccession: (id) => {
        const { accessions, archives } = get();
        const acc = accessions.find((a) => a.id === id);
        if (!acc) return;
        const outStatus: ArchiveStatus = acc.purpose === 'borrow' ? 'out_borrowed' : 'out_reading';
        const accStatus = acc.purpose === 'borrow' ? 'outbound' : 'in_reading';
        set((s) => ({
          accessions: s.accessions.map((a) => a.id === id ? {
            ...a,
            status: accStatus as Accession['status'],
            items: a.items.map((it) => ({ ...it, outboundTime: todayStr() })),
          } : a),
          archives: s.archives.map((a) => acc.items.some((it) => it.archiveId === a.id) ? { ...a, status: outStatus } : a),
        }));
      },

      confirmReading: (id, itemId) => set((s) => ({
        accessions: s.accessions.map((a) => a.id === id ? {
          ...a,
          status: 'in_reading',
          items: a.items.map((it) => it.id === itemId ? { ...it, readingConfirmTime: todayStr() } : it),
        } : a),
      })),

      returnAccession: (id) => {
        const { accessions, archives, shelfPositions } = get();
        const acc = accessions.find((a) => a.id === id);
        if (!acc) return;
        const accArchiveIds = new Set(acc.items.map((it) => it.archiveId));
        const updatedArchives = archives.map((a) => accArchiveIds.has(a.id) ? { ...a, status: 'in_stock' as ArchiveStatus } : a);
        const posIds = new Set(archives.filter((a) => accArchiveIds.has(a.id)).map((a) => a.positionId).filter(Boolean) as string[]);
        const updatedPositions = shelfPositions.map((p: ShelfPosition) => posIds.has(p.id) ? { ...p, occupied: true } : p);
        set((s) => ({
          accessions: s.accessions.map((a) => a.id === id ? {
            ...a,
            status: 'returned',
            actualReturnDate: todayStr(),
            items: a.items.map((it) => ({ ...it, returnTime: todayStr() })),
          } : a),
          archives: updatedArchives,
          shelfPositions: updatedPositions,
        }));
      },

      addInventoryTask: (data) => {
        const id = 'inv' + genId();
        const no = 'PD' + todayStr().replace(/-/g, '') + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        set((s) => ({
          inventoryTasks: [...s.inventoryTasks, {
            ...data,
            id,
            taskNo: no,
            status: 'pending',
            checkedCount: 0,
            normalCount: 0,
            missingCount: 0,
            misplacedCount: 0,
            damagedCount: 0,
            createdAt: todayStr(),
            items: data.items.map((it, idx) => ({
              ...it,
              id: 'it' + genId() + idx,
              taskId: id,
              status: 'pending',
            })),
          } as InventoryTask],
        }));
      },

      updateInventoryItem: (taskId, itemId, status, actualPosition) => set((s) => ({
        inventoryTasks: s.inventoryTasks.map((t) => {
          if (t.id !== taskId) return t;
          const items = t.items.map((it) => it.id === itemId ? {
            ...it,
            status,
            actualPosition,
            checkedAt: todayStr(),
          } : it);
          const counts = items.reduce<{ normal: number; missing: number; misplaced: number; damaged: number; pending: number }>(
            (acc, it) => {
              if (it.status !== 'pending') acc[it.status] = (acc[it.status] || 0) + 1;
              else acc.pending++;
              return acc;
            },
            { normal: 0, missing: 0, misplaced: 0, damaged: 0, pending: 0 },
          );
          return {
            ...t,
            items,
            checkedCount: t.totalCount - counts.pending,
            normalCount: counts.normal,
            missingCount: counts.missing,
            misplacedCount: counts.misplaced,
            damagedCount: counts.damaged,
            status: t.status === 'pending' ? 'in_progress' : t.status,
            startedAt: t.status === 'pending' ? todayStr() : t.startedAt,
          };
        }),
      })),

      completeInventoryTask: (id) => set((s) => ({
        inventoryTasks: s.inventoryTasks.map((t) => t.id === id ? { ...t, status: 'completed', completedAt: todayStr() } : t),
      })),

      addDestruction: (data) => set((s) => ({
        destructions: [...s.destructions, {
          ...data,
          id: 'des' + genId(),
          applyDate: todayStr(),
          customerApproved: false,
          managerApproved: false,
          status: 'pending_customer',
        } as DestructionRecord],
      })),

      approveDestructionByCustomer: (id, approver) => set((s) => ({
        destructions: s.destructions.map((d) => d.id === id ? {
          ...d,
          customerApproved: true,
          customerApprover: approver,
          customerApproveDate: todayStr(),
          status: 'pending_manager',
        } : d),
      })),

      approveDestructionByManager: (id, approver) => set((s) => ({
        destructions: s.destructions.map((d) => d.id === id ? {
          ...d,
          managerApproved: true,
          managerApprover: approver,
          managerApproveDate: todayStr(),
          status: 'approved',
        } : d),
      })),

      executeDestruction: (id, executeDate) => {
        const { destructions, archives, shelfPositions, warehouses } = get();
        const d = destructions.find((x) => x.id === id);
        if (!d) return;
        const archive = archives.find((a) => a.id === d.archiveId);
        const posId = archive?.positionId;
        const warehouseId = archive?.warehouseId;
        const updatedArchives = archives.map((a) => a.id === d.archiveId ? { ...a, status: 'destroyed' as ArchiveStatus } : a);
        let updatedPositions = shelfPositions;
        let updatedWarehouses = warehouses;
        if (posId) {
          updatedPositions = shelfPositions.map((p: ShelfPosition) => p.id === posId ? { ...p, occupied: false, archiveId: undefined } : p);
        }
        if (warehouseId) {
          updatedWarehouses = warehouses.map((w) => {
            if (w.id !== warehouseId) return w;
            const used = Math.max(0, w.usedPositions - 1);
            return { ...w, usedPositions: used };
          });
        }
        set((s) => ({
          destructions: s.destructions.map((x) => x.id === id ? { ...x, executeDate, status: 'executed' } : x),
          archives: updatedArchives,
          shelfPositions: updatedPositions,
          warehouses: updatedWarehouses,
        }));
      },

      addEnvironmentRecord: (data) => {
        const { warehouses } = get();
        const w = warehouses.find((x) => x.id === data.warehouseId);
        const isPaper = w?.archiveType !== 'film';
        const { temperature, humidity } = data;
        let abnormal = false;
        let risk: EnvironmentRecord['riskLevel'] = 'low';
        if (isPaper) {
          abnormal = temperature < 14 || temperature > 24 || humidity < 45 || humidity > 60;
        } else {
          abnormal = temperature < 13 || temperature > 15 || humidity < 35 || humidity > 45;
        }
        if (abnormal) {
          const deviate = isPaper
            ? Math.abs(temperature - 19) / 5 + Math.abs(humidity - 52) / 7.5
            : Math.abs(temperature - 14) + Math.abs(humidity - 40) / 5;
          risk = deviate > 2 ? 'high' : 'medium';
        }
        set((s) => ({
          environmentRecords: [...s.environmentRecords, {
            ...data,
            id: 'env' + genId(),
            isAbnormal: abnormal,
            riskLevel: risk,
          } as EnvironmentRecord],
        }));
      },

      generateBill: (period) => {
        const { contracts, archives, accessions, bills, destructions, feeStandards } = get();
        const existingContractIds = new Set(
          bills.filter((b) => b.period === period).map((b) => b.contractId),
        );
        const remainingContracts = contracts.filter((c) => !existingContractIds.has(c.id));
        if (remainingContracts.length === 0) return;
        const today = new Date();
        const fmt = (d: Date) => d.toISOString().slice(0, 10);
        const newBills: Bill[] = remainingContracts.map((c) => {
          const custArchives = archives.filter((a) => a.customerId === c.customerId && a.status !== 'destroyed');
          const custAccessions = accessions.filter((a) => a.customerId === c.customerId);
          const custDestructions = destructions.filter((d) => d.customerId === c.customerId && d.status === 'executed');
          const overdues = accessions.filter((a) => a.customerId === c.customerId && (a.status === 'overdue' || (a.status !== 'returned' && a.status !== 'pending' && a.status !== 'rejected' && a.expectedReturnDate < fmt(today))));

          const customerFeeStandard = feeStandards.find((fs) => fs.customerId === c.customerId) || feeStandards.find((fs) => fs.isDefault);
          const fee = customerFeeStandard || c;

          const archiveCount = custArchives.length;
          const totalVolume = custArchives.reduce((sum, a) => sum + a.volume, 0);
          const totalWeight = custArchives.reduce((sum, a) => sum + a.weight, 0);

          let storageFee = 0;
          let storageUnit = '';
          let storageQty = 0;
          let storagePrice = 0;

          if (fee.feeBasis === 'box') {
            storageQty = archiveCount;
            storageUnit = '盒';
            storagePrice = fee.feePerBox;
            storageFee = Math.floor(archiveCount * fee.feePerBox);
          } else if (fee.feeBasis === 'volume') {
            storageQty = +totalVolume.toFixed(2);
            storageUnit = 'm³';
            storagePrice = fee.feePerVolume;
            storageFee = Math.floor(totalVolume * fee.feePerVolume);
          } else {
            storageQty = +totalWeight.toFixed(1);
            storageUnit = 'kg';
            storagePrice = fee.feePerWeight;
            storageFee = Math.floor(totalWeight * fee.feePerWeight);
          }

          const accessFee = custAccessions.length * fee.accessFeePerTime;
          const overdueDays = overdues.reduce((sum, a) => {
            const expected = new Date(a.expectedReturnDate);
            const diff = Math.ceil((today.getTime() - expected.getTime()) / 86400000);
            return sum + Math.max(0, diff);
          }, 0);
          const overdueFee = overdueDays * fee.overdueFeePerDay;
          const destructionFee = custDestructions.length * fee.destructionFeePerItem;
          const manualServiceFee = Math.floor(Math.random() * 3) * fee.manualServiceFeePerHour;
          const subtotal = storageFee + accessFee + overdueFee + destructionFee + manualServiceFee;
          const totalAmount = Math.max(subtotal, fee.minimumChargePerMonth);

          const items: BillItem[] = [
            { id: `bi-${genId()}-1`, billId: '', itemType: 'storage', itemName: '档案寄存费', quantity: storageQty, unit: storageUnit, unitPrice: storagePrice, amount: storageFee, remark: `按${fee.feeBasis === 'box' ? '盒' : fee.feeBasis === 'volume' ? '体积' : '重量'}计费` },
            { id: `bi-${genId()}-2`, billId: '', itemType: 'access', itemName: '调阅服务费', quantity: custAccessions.length, unit: '次', unitPrice: fee.accessFeePerTime, amount: accessFee },
          ];

          if (overdueFee > 0) {
            items.push({ id: `bi-${genId()}-3`, billId: '', itemType: 'overdue', itemName: '逾期归还费', quantity: overdueDays, unit: '天', unitPrice: fee.overdueFeePerDay, amount: overdueFee, remark: `${overdues.length}笔调阅逾期` });
          }
          if (destructionFee > 0) {
            items.push({ id: `bi-${genId()}-4`, billId: '', itemType: 'destruction', itemName: '销毁服务费', quantity: custDestructions.length, unit: '件', unitPrice: fee.destructionFeePerItem, amount: destructionFee });
          }
          if (manualServiceFee > 0) {
            items.push({ id: `bi-${genId()}-5`, billId: '', itemType: 'manual', itemName: '人工服务费', quantity: Math.floor(manualServiceFee / fee.manualServiceFeePerHour), unit: '小时', unitPrice: fee.manualServiceFeePerHour, amount: manualServiceFee });
          }
          if (totalAmount > subtotal) {
            items.push({ id: `bi-${genId()}-6`, billId: '', itemType: 'storage', itemName: '最低收费补足', quantity: 1, unit: '次', unitPrice: totalAmount - subtotal, amount: totalAmount - subtotal, remark: `月最低收费 ¥${fee.minimumChargePerMonth}` });
          }

          const billId = 'b' + genId();
          items.forEach((item) => { item.billId = billId; });

          return {
            id: billId,
            billNo: `ZF${period.replace(/-/g, '')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            contractId: c.id,
            customerId: c.customerId,
            customerName: c.customerName,
            period,
            storageFee,
            accessFee,
            overdueFee,
            destructionFee,
            manualServiceFee,
            totalAmount,
            paidAmount: 0,
            status: 'issued' as const,
            issueDate: todayStr(),
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            items,
          };
        });
        set((s) => ({ bills: [...s.bills, ...newBills] }));
      },

      payBill: (id, amount, paymentMethod, remark) => {
        const { bills } = get();
        const bill = bills.find((b) => b.id === id);
        if (!bill) return { success: false, message: '账单不存在' };

        const unpaidAmount = bill.totalAmount - bill.paidAmount;
        if (amount <= 0) {
          return { success: false, message: '收款金额必须大于0' };
        }
        if (amount > unpaidAmount) {
          return { success: false, message: `收款金额不能超过待收款金额 ¥${unpaidAmount.toLocaleString()}` };
        }

        const newPaidAmount = bill.paidAmount + amount;
        let newStatus: Bill['status'] = bill.status;
        if (newPaidAmount >= bill.totalAmount) {
          newStatus = 'paid';
        } else if (newPaidAmount > 0) {
          newStatus = 'partial_paid';
        }
        const paymentRecord: PaymentRecord = {
          id: 'pr' + genId(),
          billId: id,
          billNo: bill.billNo,
          customerId: bill.customerId,
          customerName: bill.customerName,
          amount,
          paymentDate: todayStr(),
          paymentMethod,
          remark,
          createdAt: todayStr(),
        };
        set((s) => ({
          bills: s.bills.map((b) => b.id === id ? { ...b, paidAmount: newPaidAmount, status: newStatus, paidDate: newStatus === 'paid' ? todayStr() : b.paidDate } : b),
          paymentRecords: [...s.paymentRecords, paymentRecord],
        }));
        return { success: true, message: '收款登记成功' };
      },

      addFeeStandard: (data) => set((s) => ({
        feeStandards: [...s.feeStandards, {
          ...data,
          id: 'fs' + genId(),
          createdAt: todayStr(),
          updatedAt: todayStr(),
        } as FeeStandard],
      })),

      updateFeeStandard: (id, data) => set((s) => ({
        feeStandards: s.feeStandards.map((fs) => fs.id === id ? { ...fs, ...data, updatedAt: todayStr() } : fs),
      })),

      deleteFeeStandard: (id) => set((s) => ({
        feeStandards: s.feeStandards.filter((fs) => fs.id !== id),
      })),

      renewContract: (contractId, newStartDate, newEndDate) => {
        const { contracts, feeStandards } = get();
        const original = contracts.find((c) => c.id === contractId);
        if (!original) return undefined;

        const customerFeeStandard = feeStandards.find((fs) => fs.customerId === original.customerId) || feeStandards.find((fs) => fs.isDefault);

        const year = new Date(newStartDate).getFullYear();
        const maxNo = Math.max(0, ...contracts.filter((c) => c.contractNo.startsWith(`HT-${year}`)).map((c) => parseInt(c.contractNo.slice(-3)) || 0));

        let newContract: Contract = {
          ...original,
          id: 'ct' + genId(),
          contractNo: `HT-${year}-${String(maxNo + 1).padStart(3, '0')}`,
          startDate: newStartDate,
          endDate: newEndDate,
          originalContractId: original.id,
          status: 'active',
        };

        if (customerFeeStandard) {
          newContract = {
            ...newContract,
            feeBasis: customerFeeStandard.feeBasis,
            feePerBox: customerFeeStandard.feePerBox,
            feePerVolume: customerFeeStandard.feePerVolume,
            feePerWeight: customerFeeStandard.feePerWeight,
            accessFeePerTime: customerFeeStandard.accessFeePerTime,
            overdueFeePerDay: customerFeeStandard.overdueFeePerDay,
            destructionFeePerItem: customerFeeStandard.destructionFeePerItem,
            manualServiceFeePerHour: customerFeeStandard.manualServiceFeePerHour,
            minimumChargePerMonth: customerFeeStandard.minimumChargePerMonth,
          };
        }

        set((s) => ({ contracts: [...s.contracts, newContract] }));
        return newContract;
      },

      createExportTask: (type, params) => {
        const typeName = EXPORT_TYPE_MAP[type] || type;
        const task: ExportTask = {
          id: 'exp' + genId(),
          type,
          typeName,
          status: 'pending',
          createdAt: todayStr(),
          params,
        };
        set((s) => ({ exportTasks: [...s.exportTasks, task] }));
        setTimeout(() => {
          set((s) => ({
            exportTasks: s.exportTasks.map((t) => t.id === task.id ? { ...t, status: 'processing' as const } : t),
          }));
        }, 500);
        setTimeout(() => {
          set((s) => ({
            exportTasks: s.exportTasks.map((t) => t.id === task.id ? { ...t, status: 'completed' as const, completedAt: todayStr(), fileSize: `${(Math.random() * 5 + 0.1).toFixed(1)}MB` } : t),
          }));
        }, 2000);
      },

      downloadExport: (taskId) => {
        const { exportTasks, archives, customers, accessions, inventoryTasks, destructions, bills } = get();
        const task = exportTasks.find((t) => t.id === taskId);
        if (!task || task.status !== 'completed') return;

        const { startDate, endDate, customerId } = task.params || {};

        const filterByDate = (dateStr: string) => {
          if (!dateStr) return true;
          if (startDate && dateStr < startDate) return false;
          if (endDate && dateStr > endDate) return false;
          return true;
        };

        const filterByCustomer = (cid: string) => {
          if (!customerId) return true;
          return cid === customerId;
        };

        let content = '';
        let filename = `${task.typeName}_${todayStr()}.csv`;

        switch (task.type) {
          case 'archive_list': {
            const filtered = archives.filter((a) => filterByCustomer(a.customerId));
            content = '档案编号,条码,客户名称,档案类型,标题,盒号,体积,重量,保管期限,存放位置,状态\n';
            filtered.forEach((a) => {
              content += `${a.id},${a.barcode},${a.customerName},${a.typeName},${a.title},${a.boxNo},${a.volume},${a.weight},${a.retentionPeriod},${a.positionCode || ''},${a.status}\n`;
            });
            break;
          }
          case 'customer_list': {
            const filtered = customers;
            content = '客户编号,客户名称,联系人,联系电话,地址,创建日期,档案数量,调阅次数\n';
            filtered.forEach((c) => {
              content += `${c.id},${c.name},${c.contactPerson},${c.contactPhone},${c.address},${c.createdAt},${c.archiveCount},${c.accessCount}\n`;
            });
            break;
          }
          case 'accession_records': {
            const filtered = accessions.filter((a) => filterByCustomer(a.customerId) && filterByDate(a.startTime));
            content = '调阅编号,客户名称,申请人,用途,调阅时间,预计归还,实际归还,状态\n';
            filtered.forEach((a) => {
              content += `${a.accessionNo},${a.customerName},${a.applicant},${a.purposeName},${a.startTime},${a.expectedReturnDate},${a.actualReturnDate || ''},${a.status}\n`;
            });
            break;
          }
          case 'inventory_report': {
            const filtered = inventoryTasks.filter((t) => filterByDate(t.createdAt));
            content = '任务编号,任务名称,类型,总数量,已盘点,正常,缺失,错放,损坏,状态\n';
            filtered.forEach((t) => {
              content += `${t.taskNo},${t.name},${t.type},${t.totalCount},${t.checkedCount},${t.normalCount},${t.missingCount},${t.misplacedCount},${t.damagedCount},${t.status}\n`;
            });
            break;
          }
          case 'destruction_certificate': {
            const filtered = destructions.filter((d) => filterByCustomer(d.customerId) && filterByDate(d.applyDate));
            content = '销毁编号,档案条码,标题,客户名称,申请日期,客户审批,经理审批,执行日期,销毁方式\n';
            filtered.forEach((d) => {
              content += `${d.id},${d.barcode},${d.title},${d.customerName},${d.applyDate},${d.customerApproved ? '已通过' : '待审批'},${d.managerApproved ? '已通过' : '待审批'},${d.executeDate || ''},${d.destroyMethod}\n`;
            });
            break;
          }
          case 'bill_details': {
            const filtered = bills.filter((b) => filterByCustomer(b.customerId) && filterByDate(b.issueDate));
            content = '账单编号,客户名称,账期,寄存费,调阅费,逾期费,销毁服务费,人工服务费,合计,已收款,状态\n';
            filtered.forEach((b) => {
              content += `${b.billNo},${b.customerName},${b.period},${b.storageFee},${b.accessFee},${b.overdueFee || 0},${b.destructionFee || 0},${b.manualServiceFee || 0},${b.totalAmount},${b.paidAmount || 0},${b.status}\n`;
            });
            break;
          }
        }

        const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },

      moveArchive: (archiveId, newPositionId) => {
        const { archives, shelfPositions, warehouses } = get();
        const archive = archives.find((a) => a.id === archiveId);
        const newPos = shelfPositions.find((p) => p.id === newPositionId);
        if (!archive || !newPos || newPos.occupied) return;
        const oldPosId = archive.positionId;
        const oldWarehouseId = archive.warehouseId;
        const updatedPositions = shelfPositions.map((p: ShelfPosition) => {
          if (p.id === oldPosId) return { ...p, occupied: false, archiveId: undefined };
          if (p.id === newPositionId) return { ...p, occupied: true, archiveId };
          return p;
        });
        const updatedArchives = archives.map((a) => a.id === archiveId ? { ...a, positionId: newPos.id, positionCode: newPos.code, warehouseId: newPos.warehouseId } : a);
        const updatedWarehouses = warehouses
          .map((w) => {
            if (w.id === oldWarehouseId) return { ...w, usedPositions: Math.max(0, w.usedPositions - 1) };
            if (w.id === newPos.warehouseId) return { ...w, usedPositions: w.usedPositions + 1 };
            return w;
          })
          .map((w) => ({
            ...w,
            status: (w.usedPositions >= w.totalPositions ? 'full' : w.usedPositions >= w.totalPositions * 0.85 ? 'warning' : 'normal') as any,
          }));
        set({ archives: updatedArchives, shelfPositions: updatedPositions, warehouses: updatedWarehouses });
      },

    }),
    {
      name: 'archive-management-storage',
      merge: (persistedState, currentState) => {
        if (!persistedState || typeof persistedState !== 'object') return currentState;
        const p = persistedState as Partial<AppState>;
        return {
          ...currentState,
          ...p,
          customers: p.customers && p.customers.length > 0 ? p.customers : currentState.customers,
          contracts: p.contracts && p.contracts.length > 0 ? p.contracts : currentState.contracts,
          warehouses: p.warehouses && p.warehouses.length > 0 ? p.warehouses : currentState.warehouses,
          shelfPositions: p.shelfPositions && p.shelfPositions.length > 0 ? p.shelfPositions : currentState.shelfPositions,
          archives: p.archives && p.archives.length > 0 ? p.archives : currentState.archives,
          environmentRecords: p.environmentRecords && p.environmentRecords.length > 0 ? p.environmentRecords : currentState.environmentRecords,
          accessions: p.accessions && p.accessions.length > 0 ? p.accessions : currentState.accessions,
          inventoryTasks: p.inventoryTasks && p.inventoryTasks.length > 0 ? p.inventoryTasks : currentState.inventoryTasks,
          destructions: p.destructions && p.destructions.length > 0 ? p.destructions : currentState.destructions,
          bills: p.bills && p.bills.length > 0 ? p.bills : currentState.bills,
          feeStandards: p.feeStandards && p.feeStandards.length > 0 ? p.feeStandards : currentState.feeStandards,
          paymentRecords: p.paymentRecords && p.paymentRecords.length > 0 ? p.paymentRecords : currentState.paymentRecords,
          exportTasks: p.exportTasks && p.exportTasks.length > 0 ? p.exportTasks : currentState.exportTasks,
        };
      },
    },
  ),
);
