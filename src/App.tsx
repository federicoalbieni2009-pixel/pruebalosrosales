/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Monitor, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  Activity, 
  Laptop, 
  Printer, 
  Wrench
} from 'lucide-react';
import { User, Device, ActionLog, MaintenanceRecord } from './types';
import { 
  INITIAL_USERS, 
  INITIAL_DEVICES, 
  INITIAL_MAINTENANCE, 
  INITIAL_LOGS 
} from './data/mockData';
import DevicesTab from './components/DevicesTab';
import UsersTab from './components/UsersTab';
import ReportsTab from './components/ReportsTab';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'devices' | 'users' | 'reports'>('devices');

  // Persistence States
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [logs, setLogs] = useState<ActionLog[]>([]);

  // Simulation Role state (defaults to 'owner' as requested)
  const [currentRole, setCurrentRole] = useState<'owner' | 'admin' | 'usuario'>('owner');

  // 1. Initial State Hydration
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('ti_users');
      const storedDevices = localStorage.getItem('ti_devices');
      const storedMaint = localStorage.getItem('ti_maint');
      const storedLogs = localStorage.getItem('ti_logs');

      if (storedUsers) setUsers(JSON.parse(storedUsers));
      else {
        setUsers(INITIAL_USERS);
        localStorage.setItem('ti_users', JSON.stringify(INITIAL_USERS));
      }

      if (storedDevices) setDevices(JSON.parse(storedDevices));
      else {
        setDevices(INITIAL_DEVICES);
        localStorage.setItem('ti_devices', JSON.stringify(INITIAL_DEVICES));
      }

      if (storedMaint) setMaintenanceRecords(JSON.parse(storedMaint));
      else {
        setMaintenanceRecords(INITIAL_MAINTENANCE);
        localStorage.setItem('ti_maint', JSON.stringify(INITIAL_MAINTENANCE));
      }

      if (storedLogs) setLogs(JSON.parse(storedLogs));
      else {
        setLogs(INITIAL_LOGS);
        localStorage.setItem('ti_logs', JSON.stringify(INITIAL_LOGS));
      }
    } catch (e) {
      console.error("Hydration failed, resetting to initial seed", e);
      setUsers(INITIAL_USERS);
      setDevices(INITIAL_DEVICES);
      setMaintenanceRecords(INITIAL_MAINTENANCE);
      setLogs(INITIAL_LOGS);
    }
  }, []);

  // 3. Helper: Save and log actions
  const saveState = (updatedUsers?: User[], updatedDevices?: Device[], updatedMaint?: MaintenanceRecord[], updatedLogs?: ActionLog[]) => {
    if (updatedUsers) {
      setUsers(updatedUsers);
      localStorage.setItem('ti_users', JSON.stringify(updatedUsers));
    }
    if (updatedDevices) {
      setDevices(updatedDevices);
      localStorage.setItem('ti_devices', JSON.stringify(updatedDevices));
    }
    if (updatedMaint) {
      setMaintenanceRecords(updatedMaint);
      localStorage.setItem('ti_maint', JSON.stringify(updatedMaint));
    }
    if (updatedLogs) {
      setLogs(updatedLogs);
      localStorage.setItem('ti_logs', JSON.stringify(updatedLogs));
    }
  };

  const createAuditLog = (action: string, details: string, module: 'devices' | 'users' | 'maintenance' | 'general', currentDevicesList = devices, currentLogsList = logs) => {
    const newLog: ActionLog = {
      id: `l-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      module
    };
    const updated = [newLog, ...currentLogsList].slice(0, 50); // Keep max 50 recent items
    saveState(undefined, undefined, undefined, updated);
  };

  // 4. State mutator handlers for DEVICE
  const handleAddDevice = (newDevice: Device) => {
    const updated = [...devices, newDevice];
    saveState(undefined, updated);
    
    let suffix = newDevice.assignedUserId ? ` asignado a ID: ${newDevice.assignedUserId}` : ' en stock libre';
    createAuditLog(
      'Equipo Registrado', 
      `Dispositivo ${newDevice.name} (${newDevice.brand}) registrado con serie ${newDevice.serialNumber}${suffix}.`, 
      'devices',
      updated
    );
  };

  const handleUpdateDevice = (updatedDevice: Device) => {
    const original = devices.find(d => d.id === updatedDevice.id);
    const updated = devices.map(d => d.id === updatedDevice.id ? updatedDevice : d);
    saveState(undefined, updated);

    let changesDetail = `${updatedDevice.name} actualizado.`;
    if (original && original.status !== updatedDevice.status) {
      changesDetail += ` Estado cambiado de ${original.status} a ${updatedDevice.status}.`;
    }
    if (original && original.assignedUserId !== updatedDevice.assignedUserId) {
      const originalUser = users.find(u => u.id === original.assignedUserId)?.name || 'Nadie';
      const newUser = users.find(u => u.id === updatedDevice.assignedUserId)?.name || 'Liberado';
      changesDetail += ` Reasignación: ${originalUser} -> ${newUser}.`;
    }

    createAuditLog('Equipo Modificado', changesDetail, 'devices', updated);
  };

  const handleDeleteDevice = (id: string) => {
    const target = devices.find(d => d.id === id);
    const updated = devices.filter(d => d.id !== id);
    saveState(undefined, updated);

    createAuditLog(
      'Equipo Eliminado', 
      `Dispositivo "${target?.name || id}" fue retirado permanentemente del inventario corporativo.`, 
      'devices',
      updated
    );
  };

  // 5. State mutator handlers for USER
  const handleAddUser = (newUser: User) => {
    const updated = [...users, newUser];
    saveState(updated);
    
    createAuditLog(
      'Usuario Registrado', 
      `Se agregó al colaborador "${newUser.name}" en el departamento de ${newUser.department} con cargo ${newUser.role}.`, 
      'users'
    );
  };

  const handleUpdateUser = (updatedUser: User) => {
    const updated = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    saveState(updated);

    createAuditLog(
      'Usuario Modificado', 
      `Ficha del colaborador "${updatedUser.name}" fue actualizada en el directorio.`, 
      'users'
    );
  };

  const handleDeleteUser = (id: string) => {
    const target = users.find(u => u.id === id);
    const updatedUsersList = users.filter(u => u.id !== id);
    
    // Automatically liberate devices assigned to this user to avoid dangling assignments
    const updatedDevicesList = devices.map(d => {
      if (d.assignedUserId === id) {
        return { ...d, assignedUserId: null };
      }
      return d;
    });

    saveState(updatedUsersList, updatedDevicesList);

    createAuditLog(
      'Usuario Eliminado', 
      `Socio "${target?.name || id}" removido. Sus hardware asignados regresaron a stock libre.`, 
      'users',
      updatedDevicesList
    );
  };

  // Quick Action: unassign device to make it available in stock
  const handleUnassignDevice = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    const originalUserId = device.assignedUserId;
    const userName = users.find(u => u.id === originalUserId)?.name || 'Nadie';

    const updatedDevicesList = devices.map(d => {
      if (d.id === deviceId) {
        return { ...d, assignedUserId: null };
      }
      return d;
    });

    saveState(undefined, updatedDevicesList);

    createAuditLog(
      'Dispositivo Liberado', 
      `Equipo ${device.name} fue desvinculado de ${userName} y retornó a Almacén.`, 
      'devices',
      updatedDevicesList
    );
  };

  // 6. State mutator handlers for MAINTENANCE
  const handleAddMaintenance = (newRecord: MaintenanceRecord) => {
    const updatedMaint = [...maintenanceRecords, newRecord];
    
    // Auto shift status of the assigned device to 'maintenance' corresponding to the logged record
    const updatedDevicesList = devices.map(d => {
      if (d.id === newRecord.deviceId) {
        return { ...d, status: 'maintenance' as const };
      }
      return d;
    });

    saveState(undefined, updatedDevicesList, updatedMaint);
    
    createAuditLog(
      'Registro de Mantenimiento', 
      `Servicio documentado sobre "${newRecord.deviceName}". Costo: $${newRecord.cost}. Responsable: ${newRecord.performer}. Acciones: ${newRecord.description}.`, 
      'maintenance',
      updatedDevicesList
    );
  };

  const handleClearLogs = () => {
    saveState(undefined, undefined, undefined, []);
  };

  // Quick Counter Aggregation for side indicator lights
  const activeServicesCount = devices.filter(d => d.status === 'maintenance').length;

  return (
    <div id="main-application-frame" className="min-h-screen bg-slate-50 flex flex-col antialiased">
      
      {/* ⚠️ Print-Only CSS Overlay specifically for window.print() output formatting */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          #sidebar-wrapper, #tab-switching-nav, #btn-add-device, #btn-add-user, #btn-close-modal, .px-3.py-2.bg-white.hover\\:bg-slate-50 {
            display: none !important;
          }
          #main-content-canvas {
            margin-left: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          .shadow-sm, .shadow-md, .shadow-xl {
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
          }
        }
      `}</style>

      {/* Top Professional Header Navigation */}
      <header id="corporate-header" className="bg-green-950 text-white py-4 px-6 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Brand/Logo Layout */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight font-display text-white selection:bg-emerald-500">Fundación Los Rosales</h1>
              <p className="text-[10px] text-emerald-300 font-semibold tracking-wider uppercase">Gestión TI &bull; por Softmerc</p>
            </div>
          </div>

          {/* User Account indicator and Current Role switcher */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Simulator select dropdown with nice border highlights */}
            <div className="flex items-center gap-2 bg-emerald-900/60 px-3 py-1.5 rounded-xl border border-emerald-700/60 shadow-xs">
              <label htmlFor="header-role-selector" className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Simular Rol:</label>
              <select
                id="header-role-selector"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as any)}
                className="bg-green-950 text-white text-xs font-bold rounded-lg px-2.5 py-1 border border-emerald-600/50 focus:outline-none focus:border-emerald-400 cursor-pointer hover:border-emerald-500 transition-colors"
                style={{ contentVisibility: 'auto' }}
              >
                <option value="owner">🛡️ Owner (Acceso Completo)</option>
                <option value="admin">💼 Admin (Rango Alto)</option>
                <option value="usuario">👤 Usuario (Básico)</option>
              </select>
            </div>

            {/* Simulated Administrator Account details */}
            <div className="flex items-center gap-2.5 bg-green-900/30 px-3 py-1.5 rounded-xl border border-white/5">
              <div className="text-right">
                <div className="text-xs font-bold font-sans">Soporte Softmerc</div>
                <div className="text-[9px] text-emerald-300 font-mono font-semibold uppercase tracking-wider">
                  {currentRole === 'owner' ? 'Propietario / Owner' : currentRole === 'admin' ? 'Administrador / Admin' : 'Empleado / Usuario'}
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-emerald-600 font-display text-white font-black text-xs flex items-center justify-center border border-white/10 shadow-inner">
                {currentRole === 'owner' ? 'OW' : currentRole === 'admin' ? 'AD' : 'US'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Switching Navigation Bar */}
      <nav id="tab-switching-nav" className="bg-white border-b border-slate-200 sticky top-[68px] sm:top-[68px] z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'devices', label: 'Dispositivos', icon: Laptop, count: devices.length },
              { id: 'users', label: 'Directorio Colaboradores', icon: Users, count: users.length },
              { id: 'reports', label: 'Estadísticas e Informes', icon: BarChart3, highlight: activeServicesCount > 0 ? activeServicesCount : undefined },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-nav-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                    active 
                      ? 'border-emerald-700 text-emerald-800' 
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-700 animate-pulse' : 'text-slate-400'}`} />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.25 rounded-full ${
                      active ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.highlight !== undefined && (
                    <span className="bg-amber-50 text-amber-800 text-[9px] px-1.5 py-0.25 rounded-md font-bold tracking-tight border border-amber-200 animate-bounce">
                      {tab.highlight} En Mantenimiento
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content Area Canvas Container */}
      <main id="main-content-canvas" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">
        
        {/* Render Active Tab */}
        {activeTab === 'devices' && (
          <DevicesTab
            devices={devices}
            users={users}
            onAddDevice={handleAddDevice}
            onUpdateDevice={handleUpdateDevice}
            onDeleteDevice={handleDeleteDevice}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'users' && (
          <UsersTab
            users={users}
            devices={devices}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onUnassignDevice={handleUnassignDevice}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab
            devices={devices}
            users={users}
            maintenanceRecords={maintenanceRecords}
            onAddMaintenance={handleAddMaintenance}
            logs={logs}
            onClearLogs={handleClearLogs}
            currentRole={currentRole}
          />
        )}
      </main>

      {/* Soft Bottom Brand Indicator Footer */}
      <footer id="main-app-footer" className="bg-slate-900 border-t border-green-900/40 py-5 px-6 text-center text-[11px] text-slate-400 font-mono mt-auto select-none print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span>&copy; {new Date().getFullYear()} Fundación Los Rosales &bull; Gestión de Inventario Tecnológico.</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> Soporte de TI de Softmerc</span>
            <span className="text-slate-700">|</span>
            <span>Versión 2.2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
