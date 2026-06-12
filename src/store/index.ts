import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Archive, ArchiveStatus, Accession, AccessionItem, InventoryTask, InventoryStatus, DestructionRecord, EnvironmentRecord, Bill, Customer, ShelfPosition } from '@/types';
import { mockCustomers, mockContracts, mockWarehouses, mockShelfPositions, mockArchives, mockEnvRecords, mockAccessions, mockInventoryTasks, mockDestructions, mockBills } from '@/data/mockData';

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
        const { contracts, archives, accessions } = get();
        const newBills: Bill[] = contracts.map((c) => {
          const custArchives = archives.filter((a) => a.customerId === c.customerId && a.status !== 'destroyed');
          const custAccessions = accessions.filter((a) => a.customerId === c.customerId);
          const storageFee = custArchives.length * c.feePerBox;
          const accessFee = custAccessions.length * c.accessFeePerTime;
          return {
            id: 'b' + genId(),
            billNo: `ZF${period.replace(/-/g, '')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            contractId: c.id,
            customerId: c.customerId,
            customerName: c.customerName,
            period,
            storageFee,
            accessFee,
            totalAmount: storageFee + accessFee,
            status: 'pending',
            issueDate: todayStr(),
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          };
        });
        set((s) => ({ bills: [...s.bills, ...newBills] }));
      },

      payBill: (id) => set((s) => ({
        bills: s.bills.map((b) => b.id === id ? { ...b, status: 'paid', paidDate: todayStr() } : b),
      })),

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
    { name: 'archive-management-storage', skipHydration: true },
  ),
);
