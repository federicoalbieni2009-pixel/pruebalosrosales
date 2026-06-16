/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BarChart3, 
  Wrench, 
  Activity, 
  TrendingUp, 
  Laptop, 
  Monitor, 
  Printer, 
  FileSpreadsheet, 
  PrinterCheck, 
  Download, 
  Plus, 
  Clock, 
  AlertCircle,
  Tag,
  User,
  Calendar,
  X,
  RefreshCw
} from 'lucide-react';
import { Device, User as UserType, MaintenanceRecord, ActionLog } from '../types';

interface ReportsTabProps {
  devices: Device[];
  users: UserType[];
  maintenanceRecords: MaintenanceRecord[];
  onAddMaintenance: (record: MaintenanceRecord) => void;
  logs: ActionLog[];
  onClearLogs: () => void;
  currentRole: 'owner' | 'admin' | 'usuario';
}

export default function ReportsTab({ 
  devices, 
  users, 
  maintenanceRecords, 
  onAddMaintenance, 
  logs, 
  onClearLogs,
  currentRole
}: ReportsTabProps) {
  
  // Tab within reports
  const [activeSubTab, setActiveSubTab] = useState<'metrics' | 'maintenance' | 'audit'>('metrics');

  // Maintenance form modal states
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [formMaintDevice, setFormMaintDevice] = useState('');
  const [formMaintDesc, setFormMaintDesc] = useState('');
  const [formMaintPerformer, setFormMaintPerformer] = useState('Soporte Interno Softmerc');
  const [formMaintDate, setFormMaintDate] = useState(new Date().toISOString().split('T')[0]);

  // Compute stats
  const totalQty = devices.length;
  const laptopsQty = devices.filter(d => d.type === 'laptop').length;
  const desktopsQty = devices.filter(d => d.type === 'desktop').length;
  const printersQty = devices.filter(d => d.type === 'printer').length;

  const activeQty = devices.filter(d => d.status === 'active').length;
  const maintenanceQty = devices.filter(d => d.status === 'maintenance').length;
  const inactiveQty = devices.filter(d => d.status === 'inactive').length;

  const assignedQty = devices.filter(d => d.assignedUserId !== null).length;
  const stockQty = totalQty - assignedQty;
  const assignmentRate = totalQty > 0 ? Math.round((assignedQty / totalQty) * 100) : 0;

  // Department counts
  const departmentAllocation: { [key: string]: number } = {};
  devices.forEach(device => {
    if (device.assignedUserId) {
      const user = users.find(u => u.id === device.assignedUserId);
      if (user) {
        departmentAllocation[user.department] = (departmentAllocation[user.department] || 0) + 1;
      }
    } else {
      departmentAllocation['En Bodega (Stock)'] = (departmentAllocation['En Bodega (Stock)'] || 0) + 1;
    }
  });

  const departmentData = Object.keys(departmentAllocation).map(dept => ({
    name: dept,
    value: departmentAllocation[dept]
  })).sort((a, b) => b.value - a.value);

  // Submit maintenance record
  const handleAddMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMaintDevice || !formMaintDesc || !formMaintPerformer) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const selectedDev = devices.find(d => d.id === formMaintDevice);
    if (!selectedDev) return;

    const newRecord: MaintenanceRecord = {
      id: `m-${Date.now()}`,
      deviceId: selectedDev.id,
      deviceName: selectedDev.name,
      date: formMaintDate,
      description: formMaintDesc,
      cost: 0,
      performer: formMaintPerformer
    };

    onAddMaintenance(newRecord);
    setIsMaintModalOpen(false);

    // reset fields
    setFormMaintDevice('');
    setFormMaintDesc('');
    setFormMaintPerformer('Soporte Interno Softmerc');
  };

  // CSV Exporter for inventory
  const exportInventoryCSV = () => {
    const headers = ['ID', 'Nombre', 'Tipo', 'Marca', 'Modelo', 'No Serie', 'Estado', 'Asignado ID', 'Fecha Compra', 'Detalles'];
    const rows = devices.map(d => [
      d.id,
      d.name,
      d.type,
      d.brand,
      d.model,
      d.serialNumber,
      d.status,
      d.assignedUserId || 'N/A',
      d.purchaseDate,
      JSON.stringify(d.specifications).replace(/"/g, '""')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventario_ti_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Executive printable report view (opens standard document print preview window)
  const printExecutiveReport = () => {
    window.print();
  };

  return (
    <div id="reports-tab-container" className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display tracking-tight">Reportes y Estadísticas Generales</h2>
          <p className="text-sm text-slate-500 mt-0.5 font-sans">Métricas clave, registros de mantenimiento preventivo y auditoría de eventos.</p>
        </div>
        
        {/* Export operations button shelf */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportInventoryCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Exportar Inventario (CSV)
          </button>
          <button
            onClick={printExecutiveReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
          >
            <PrinterCheck className="w-3.5 h-3.5 text-emerald-700" />
            Imprimir Informe
          </button>
        </div>
      </div>

      {/* Area selection bar */}
      <div className="flex items-center gap-1.5 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('metrics')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'metrics' 
              ? 'border-emerald-700 text-emerald-800' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" />
            Cuadro de Métricas
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('maintenance')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'maintenance' 
              ? 'border-emerald-700 text-emerald-800' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Wrench className="w-4 h-4" />
            Historial de Mantenimiento
            {devices.filter(d => d.status === 'maintenance').length > 0 && (
              <span className="ml-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'audit' 
              ? 'border-emerald-700 text-emerald-800' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Activity className="w-4 h-4" />
            Registro de Auditoría
          </span>
        </button>
      </div>

      {/* Sub-tab 1: General Metrics */}
      {activeSubTab === 'metrics' && (
        <div id="metrics-view" className="space-y-6">
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Devices */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total de Equipos</span>
                <p className="text-3xl font-extrabold text-slate-800 mt-1 font-sans">{totalQty}</p>
                <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                  <Laptop className="w-2.5 h-2.5 text-sky-500" /> {laptopsQty} Port. &middot; 
                  <Monitor className="w-2.5 h-2.5 text-emerald-600" /> {desktopsQty} PC &middot; 
                  <Printer className="w-2.5 h-2.5 text-emerald-500" /> {printersQty} Imp.
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-slate-400 border border-slate-100">
                <Laptop className="w-6 h-6" />
              </div>
            </div>

            {/* Total Users */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Usuarios Activos</span>
                <p className="text-3xl font-extrabold text-slate-800 mt-1 font-sans">{users.length}</p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" />
                  Asignaciones Realizadas
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700 border border-emerald-100">
                <User className="w-6 h-6" />
              </div>
            </div>

            {/* Maintenance State */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">En Mantenimiento</span>
                <p className={`text-3xl font-extrabold mt-1 font-sans ${maintenanceQty > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                  {maintenanceQty}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {inactiveQty} equipos inactivos en bodega.
                </p>
              </div>
              <div className={`p-3 rounded-xl border ${maintenanceQty > 0 ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                <Wrench className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Graphical Section: Custom SVG/HTML Clean Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Breakdown by Type & State (Vibrant and detailed) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 font-display tracking-tight text-base leading-snug">Breakdown por Tipo de Dispositivo</h3>
                <p className="text-slate-400 text-xs mt-0.5">Comparativa porcentual del parque tecnológico asignado.</p>
              </div>

              {/* Progress-style visual representation block */}
              <div className="py-6 space-y-5">
                {/* Visual stacked horizontal bar */}
                <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  {laptopsQty > 0 && (
                    <div 
                      className="bg-sky-500 h-full transition-all duration-300" 
                      style={{ width: `${(laptopsQty / totalQty) * 100}%` }}
                      title={`Laptops: ${laptopsQty}`}
                    ></div>
                  )}
                  {desktopsQty > 0 && (
                    <div 
                      className="bg-emerald-600 h-full transition-all duration-300" 
                      style={{ width: `${(desktopsQty / totalQty) * 100}%` }}
                      title={`Computadoras de Escritorio: ${desktopsQty}`}
                    ></div>
                  )}
                  {printersQty > 0 && (
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300" 
                      style={{ width: `${(printersQty / totalQty) * 100}%` }}
                      title={`Impresoras: ${printersQty}`}
                    ></div>
                  )}
                </div>

                {/* Legend metrics cards */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 bg-sky-50/40 rounded-xl border border-sky-100 text-center">
                    <div className="flex justify-center mb-1 text-sky-600"><Laptop className="w-4 h-4" /></div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Laptops</span>
                    <p className="text-xl font-bold text-slate-800">{laptopsQty}</p>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">
                      {totalQty > 0 ? Math.round((laptopsQty / totalQty) * 100) : 0}%
                    </span>
                  </div>

                  <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 text-center">
                    <div className="flex justify-center mb-1 text-emerald-600"><Monitor className="w-4 h-4" /></div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">PC Escritorio</span>
                    <p className="text-xl font-bold text-slate-800">{desktopsQty}</p>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">
                      {totalQty > 0 ? Math.round((desktopsQty / totalQty) * 100) : 0}%
                    </span>
                  </div>

                  <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 text-center">
                    <div className="flex justify-center mb-1 text-emerald-600"><Printer className="w-4 h-4" /></div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Impresoras</span>
                    <p className="text-xl font-bold text-slate-800">{printersQty}</p>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">
                      {totalQty > 0 ? Math.round((printersQty / totalQty) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Status breakdown helper */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 flex justify-between items-center">
                <span className="font-medium">Salud del Inventario:</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-bold text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {activeQty} Operativos
                  </span>
                  <span className="flex items-center gap-1 font-bold text-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    {maintenanceQty} Taller
                  </span>
                </div>
              </div>
            </div>

            {/* Chart 2: Department deployment distribution mapping (Visual horizontal list-bar chart) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 font-display tracking-tight text-base leading-snug">Equipos por Departamento / Bodega</h3>
                <p className="text-slate-400 text-xs mt-0.5 font-sans">Distribución de inventario corporativo asignado por área funcional.</p>
              </div>

              {/* Graphical vertical bars */}
              <div className="py-4 space-y-3">
                {departmentData.map((item, index) => {
                  const maxVal = Math.max(...departmentData.map(d => d.value)) || 1;
                  const pct = Math.round((item.value / maxVal) * 100);
                  
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700 font-sans">{item.name}</span>
                        <span className="font-bold font-mono text-slate-500 bg-slate-100 px-1.5 py-0.25 rounded">
                          {item.value} {item.value === 1 ? 'dispositivo' : 'dispositivos'}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.name === 'En Bodega (Stock)' 
                              ? 'bg-slate-400' 
                              : index === 0 
                              ? 'bg-emerald-700' 
                              : index === 1 
                              ? 'bg-emerald-600' 
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom statistics quick check */}
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                <span className="text-slate-400">Tasa de Asignación Física:</span>
                <span className="font-bold font-mono text-emerald-800 bg-emerald-50 border border-emerald-100 rounded px-2.5 py-0.5">
                  {assignmentRate}% ({assignedQty} asignados)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Maintenance records ledger */}
      {activeSubTab === 'maintenance' && (
        <div id="maintenance-view" className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-amber-500 shrink-0">
                <Wrench className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Mantenimiento Interno Softmerc</h4>
                <p className="text-xs text-slate-500 leading-normal max-w-xl">
                  Registra reparaciones, revisiones preventivas, optimizaciones de hardware y software realizadas de manera interna por el equipo técnico de Softmerc para sus propias computadoras.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsMaintModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-green-900 hover:bg-green-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Ingresar Ficha Mantenimiento
            </button>
          </div>

          {/* Maintenance Records Data Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            {maintenanceRecords.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-base font-semibold">Sin registros históricos de mantenimiento de Softmerc</p>
                <p className="text-xs text-slate-400 font-sans">Registra un trabajo de mantenimiento realizado de forma interna.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold tracking-wider text-slate-400 uppercase select-none">
                      <th className="py-3 px-4">Dispositivo</th>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Técnico / Encargado</th>
                      <th className="py-3 px-4">Detalle del Trabajo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {maintenanceRecords.map(record => (
                      <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{record.deviceName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID Equipo: {record.deviceId}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                          {record.date}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {record.performer}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate" title={record.description}>
                          {record.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab 3: System logs audit trail */}
      {activeSubTab === 'audit' && (
        <div id="audit-view" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-800">Bitácora de Sucesos y Cambios</h4>
              <p className="text-xs text-slate-500">Historial interno automático de asignaciones, altas y bajas en el sistema.</p>
            </div>
            {currentRole === 'owner' ? (
              <button
                onClick={onClearLogs}
                className="text-xs text-red-500 font-semibold hover:underline bg-transparent border-none cursor-pointer"
              >
                Borrar Bitácora Temporal
              </button>
            ) : (
              <span className="text-[10px] text-slate-400 font-sans italic bg-slate-50 px-2 py-1 rounded">
                Solo Propietarios pueden borrar bitácora
              </span>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 overflow-hidden">
            <div className="flow-root">
              {logs.length === 0 ? (
                <p className="text-center py-10 text-slate-400 text-xs font-medium">No hay logs registrados todavía.</p>
              ) : (
                <ul className="-mb-8">
                  {logs.map((log, logIdx) => (
                    <li key={log.id}>
                      <div className="relative pb-8">
                        {logIdx !== logs.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-500 text-xs">
                              <Clock className="w-4 h-4" />
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-xs font-semibold text-slate-800">
                                {log.action}{' '}
                                <span className="font-normal text-slate-500">&middot; {log.details}</span>
                              </p>
                              <div className="mt-1 flex items-center gap-1.5">
                                <span className="inline-flex items-center text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.25 rounded bg-slate-100 border border-slate-200 text-slate-600">
                                  MODULO: {log.module.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="text-right text-[10px] whitespace-nowrap text-slate-400 font-mono">
                              {new Date(log.timestamp).toLocaleString('es-ES', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Maintenance record add modal */}
      {isMaintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-800">Ficha de Mantenimiento Interno Softmerc</h3>
                <p className="text-xs text-slate-400 font-sans">Documenta el mantenimiento preventivo o correctivo realizado por la empresa.</p>
              </div>
              <button 
                onClick={() => setIsMaintModalOpen(false)}
                className="p-1 px-2 text-slate-400 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddMaintenanceSubmit} className="p-5 space-y-4">
              {/* Select device */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Seleccionar Dispositivo afectado <span className="text-red-500">*</span>
                </label>
                <select
                  id="form-maint-device"
                  required
                  value={formMaintDevice}
                  onChange={(e) => setFormMaintDevice(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 bg-white focus:outline-none focus:border-slate-500"
                >
                  <option value="">Seleccione el equipo afectado...</option>
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>
                      [{d.serialNumber}] {d.name} &middot; ({d.brand})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and performer side-by-side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Fecha del Servicio
                  </label>
                  <input
                    id="form-maint-date"
                    type="date"
                    required
                    value={formMaintDate}
                    onChange={(e) => setFormMaintDate(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Técnico de Mantenimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="form-maint-performer"
                    type="text"
                    required
                    placeholder="Ej. Soporte Softmerc o Soporte Técnico Interno"
                    value={formMaintPerformer}
                    onChange={(e) => setFormMaintPerformer(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              {/* Service description details */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Descripción Diagnóstico / Resolución <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="form-maint-desc"
                  required
                  placeholder="Ej. Cambio de tarjeta madre dañada por pico de tensión o limpieza periódica preventiva..."
                  value={formMaintDesc}
                  onChange={(e) => setFormMaintDesc(e.target.value)}
                  rows={3}
                  className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-500"
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMaintModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-900 hover:bg-green-800 text-white rounded-lg text-sm font-medium shadow-sm transition-colors cursor-pointer"
                >
                  Registrar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
