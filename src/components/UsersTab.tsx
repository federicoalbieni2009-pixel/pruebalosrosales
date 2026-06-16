/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Mail, 
  Building, 
  Briefcase, 
  Laptop, 
  Monitor, 
  Printer, 
  X,
  UserPlus,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { User, Device } from '../types';
import { DEPARTMENTS } from '../data/mockData';

interface UsersTabProps {
  users: User[];
  devices: Device[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  onUnassignDevice: (deviceId: string) => void;
  currentRole: 'owner' | 'admin' | 'usuario';
}

export default function UsersTab({ users, devices, onAddUser, onUpdateUser, onDeleteUser, onUnassignDevice, currentRole }: UsersTabProps) {
  // Filters & selection
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formSystemRole, setFormSystemRole] = useState<'owner' | 'admin' | 'usuario'>('usuario');

  // Open modal config
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormDepartment(DEPARTMENTS[0]);
    setFormRole('');
    setFormSystemRole('usuario');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormDepartment(user.department);
    setFormRole(user.role);
    setFormSystemRole(user.systemRole || 'usuario');
    setIsModalOpen(true);
  };

  // Submit form handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formRole) {
      alert('Por favor complete todos los campos requeridos.');
      return;
    }

    const userData: User = {
      id: editingUser?.id || `u-${Date.now()}`,
      name: formName,
      email: formEmail,
      department: formDepartment,
      role: formRole,
      avatarUrl: editingUser?.avatarUrl || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?w=150`,
      systemRole: formSystemRole
    };

    if (editingUser) {
      onUpdateUser(userData);
      if (selectedUser?.id === userData.id) {
        setSelectedUser(userData); // Keep detail view synced
      }
    } else {
      onAddUser(userData);
    }
    setIsModalOpen(false);
  };

  // Filter computation
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = deptFilter === 'all' || user.department === deptFilter;
    
    return matchesSearch && matchesDept;
  });

  // Helper: Get devices assigned to a user
  const getUserDevices = (userId: string) => {
    return devices.filter(d => d.assignedUserId === userId);
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'desktop': return <Monitor className="w-4 h-4 text-emerald-600" />;
      case 'laptop': return <Laptop className="w-4 h-4 text-teal-600" />;
      case 'printer': return <Printer className="w-4 h-4 text-green-700" />;
      default: return <Laptop className="w-4 h-4 text-slate-500" />;
    }
  };

  const getTypeOfDeviceLabel = (type: string) => {
    switch (type) {
      case 'desktop': return 'Escr.';
      case 'laptop': return 'Port.';
      case 'printer': return 'Imp.';
      default: return '';
    }
  };

  return (
    <div id="users-tab-container" className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display tracking-tight">Directorio de Usuarios y Colaboradores</h2>
          <p className="text-sm text-slate-500 font-sans mt-0.5">Supervisa las cuentas de colaboradores de tu organización y gestiona los equipos asignados a cada uno.</p>
        </div>
        <button
          id="btn-add-user"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-900 hover:bg-green-800 text-white rounded-lg text-sm font-medium shadow-sm transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Agregar Usuario
        </button>
      </div>

      {/* Grid Layout (Left: Directory List, Right: Selected User Profile / Quick-Assign Viewer) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Users List (Takes 2/3 of space) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters shelf */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                id="user-search"
                type="text"
                placeholder="Buscar usuarios por nombre, correo, cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 text-sm max-w-xs">
              <span className="text-slate-400 flex items-center shrink-0">
                <Building className="w-3.5 h-3.5 mr-1" /> Área:
              </span>
              <select
                id="filter-dept"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-transparent border-none py-2 text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">Todas las Áreas</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Directory Box */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-base font-medium">Ningún colaborador encontrado</p>
                <p className="text-xs text-slate-400 font-sans">Ajuste de nuevo sus filtros o cree un registro.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold tracking-wider text-slate-400 uppercase select-none">
                      <th className="py-3 px-4">Colaborador</th>
                      <th className="py-3 px-4">Departamento</th>
                      <th className="py-3 px-4">Cargo / Email</th>
                      <th className="py-3 px-4 text-center">Dispositivos</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredUsers.map(user => {
                      const userDevices = getUserDevices(user.id);
                      const isSelected = selectedUser?.id === user.id;
                      return (
                        <tr
                          key={user.id}
                          onClick={() => setSelectedUser(user)}
                          className={`hover:bg-slate-50/60 cursor-pointer transition-colors ${isSelected ? 'bg-emerald-50/20' : ''}`}
                        >
                          {/* User Name with avatar */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={user.avatarUrl} 
                                alt={user.name} 
                                referrerPolicy="no-referrer"
                                className="w-9 h-9 rounded-full object-cover border border-slate-100 font-bold bg-slate-100 text-[8px] text-slate-400 flex items-center justify-center"
                              />
                              <div>
                                <div className="font-semibold text-slate-800 flex items-center gap-1.5 flex-wrap">
                                  <span>{user.name}</span>
                                  {user.systemRole === 'owner' && (
                                    <span className="bg-red-50 text-[9px] text-red-700 border border-red-200 px-1.5 py-0.25 rounded-md font-bold uppercase tracking-wider">Owner</span>
                                  )}
                                  {user.systemRole === 'admin' && (
                                    <span className="bg-amber-50 text-[9px] text-amber-700 border border-amber-200 px-1.5 py-0.25 rounded-md font-bold uppercase tracking-wider">Admin</span>
                                  )}
                                  {user.systemRole === 'usuario' && (
                                    <span className="bg-slate-50 text-[9px] text-slate-500 border border-slate-200 px-1.5 py-0.25 rounded-md font-medium uppercase tracking-wider">Usuario</span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">ID: {user.id}</div>
                              </div>
                            </div>
                          </td>

                          {/* Department badge layout */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5">
                              {user.department}
                            </span>
                          </td>

                          {/* Role and Email */}
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-700 flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-slate-400" />
                              {user.role}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </td>

                          {/* Number of devices */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center justify-center font-bold font-mono text-xs rounded-full min-w-5 h-5 px-1.5 ${userDevices.length > 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/50' : 'bg-slate-100 text-slate-400'}`}>
                              {userDevices.length}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {(currentRole === 'owner' || currentRole === 'admin') ? (
                                <>
                                  <button
                                    onClick={(e) => handleOpenEditModal(user, e)}
                                    className="p-1 px-2 text-xs rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-emerald-700 text-slate-600 font-medium cursor-pointer transition-colors"
                                    title="Editar Colaborador"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Al eliminar al usuario "${user.name}", todos sus dispositivos asignados volverán a quedar libres en Almacén. ¿Desea continuar?`)) {
                                        onDeleteUser(user.id);
                                        if (selectedUser?.id === user.id) setSelectedUser(null);
                                      }
                                    }}
                                    className="p-1 px-2 text-xs rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-medium cursor-pointer transition-colors"
                                    title="Eliminar Colaborador"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-sans italic bg-slate-50 px-1.5 py-1 rounded border border-slate-100" title="Sólo lectura: no puede editar ni eliminar colaboradores">Solo lectura</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Selected User Profiles Details Panel (Right: 1/3 layout) */}
        <div className="lg:col-span-1">
          {selectedUser ? (
            <div className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden sticky top-4">
              {/* User Bio Header */}
              <div className="bg-green-950 p-6 text-white text-center relative">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <img 
                  src={selectedUser.avatarUrl} 
                  alt={selectedUser.name} 
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-white/20 shadow-md mb-3"
                />
                <h3 className="font-bold text-lg leading-tight tracking-tight">{selectedUser.name}</h3>
                <p className="text-xs text-emerald-300 font-medium mt-1">{selectedUser.role}</p>
                <span className="inline-block bg-white/10 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full mt-3 border border-white/5">
                  {selectedUser.department}
                </span>
              </div>

              {/* Contact info shelf */}
              <div className="p-4 border-b border-slate-100 text-xs text-slate-500 flex flex-col gap-2 bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> Correo:</span>
                  <span className="font-medium text-slate-700 select-all font-mono text-[11px]">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1"><Building className="w-3 h-3 text-slate-400" /> Departamento:</span>
                  <span className="font-medium text-slate-700">{selectedUser.department}</span>
                </div>
              </div>

              {/* Assigned Hardware Shelf */}
              <div className="p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Equipos Asignados</span>
                  <span className="bg-emerald-50 text-[10px] text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    {getUserDevices(selectedUser.id).length} unidades
                  </span>
                </h4>

                {getUserDevices(selectedUser.id).length === 0 ? (
                  <div className="py-8 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-1.5 p-4">
                    <Laptop className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold">Sin equipos a cargo</p>
                    <p className="text-[10px] text-slate-400 px-2">Este colaborador no tiene computadoras ni impresoras vinculadas en este momento.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {getUserDevices(selectedUser.id).map(device => (
                      <div 
                        key={device.id} 
                        className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs hover:border-emerald-200 transition-all flex items-start gap-3 relative group"
                      >
                        <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg shrink-0 mt-0.5 text-slate-500">
                          {getDeviceIcon(device.type)}
                        </div>
                        <div className="flex-1 min-w-0 pr-10">
                          <div className="font-semibold text-xs text-slate-800 leading-tight truncate">{device.name}</div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">{device.brand} &middot; {device.model}</div>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="inline-flex text-[9px] font-bold font-mono bg-slate-100 text-slate-600 px-1 py-0.25 rounded">
                              {getTypeOfDeviceLabel(device.type)}
                            </span>
                            <code className="text-[9px] font-mono text-slate-400">S/N: {device.serialNumber}</code>
                          </div>
                        </div>

                        {/* Quick Unassign link */}
                        {currentRole !== 'usuario' && (
                          <button
                            onClick={() => {
                              if (confirm(`¿Liberar dispositivo "${device.name}"? Pasará a stock como libre.`)) {
                                onUnassignDevice(device.id);
                              }
                            }}
                            className="absolute right-3.5 top-3.5 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50/50 rounded-md cursor-pointer transition-colors"
                            title="Liberar / Desvincular"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-slate-300 bg-slate-50/50 text-center rounded-2xl py-12 px-6 text-slate-400 space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-slate-700">Ficha de Colaborador</h4>
                <p className="text-xs text-slate-400 leading-normal">Haga clic en cualquier usuario de la tabla para ver información de contacto y su lista de hardware asignado en tiempo real.</p>
              </div>
              <div className="pt-2 text-emerald-700 font-bold text-xs inline-flex items-center gap-1.5">
                Carga de inventario directa <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-[17px] font-bold text-slate-900 font-display tracking-tight">
                  {editingUser ? `Editar Ficha Colaborador: ${editingUser.name}` : 'Registrar Colaborador Corporativo'}
                </h3>
                <p className="text-xs text-slate-400 font-sans">Administración de cuentas con cargos organizacionales.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 px-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  id="form-user-name"
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-500"
                />
              </div>

              {/* Corporate Email */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Correo Electrónico Corporativo <span className="text-red-500">*</span>
                </label>
                <input
                  id="form-user-email"
                  type="email"
                  required
                  placeholder="Ej. juan.perez@empresa.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-500 font-mono"
                />
              </div>

              {/* Corporate Area / Department with manual entry and suggestions */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Área / Departamento <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="form-user-department"
                    type="text"
                    required
                    list="depts-datalist"
                    placeholder="Ej. Administración, TI, Finanzas..."
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-500"
                  />
                  <datalist id="depts-datalist">
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} />
                    ))}
                  </datalist>
                </div>
                {/* Clickable Quick Suggestions */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {DEPARTMENTS.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setFormDepartment(dept)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold transition-all cursor-pointer ${
                        formDepartment.toLowerCase() === dept.toLowerCase()
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role / Job Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Cargo Organizacional <span className="text-red-500">*</span>
                </label>
                <input
                  id="form-user-role"
                  type="text"
                  required
                  placeholder="Ej. Desarrollador Web, Contador Junior..."
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-500"
                />
              </div>

              {/* System permission role select dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Rol de Sistema / Permisos <span className="text-red-500">*</span>
                </label>
                <select
                  id="form-user-system-role"
                  value={formSystemRole}
                  onChange={(e) => setFormSystemRole(e.target.value as any)}
                  className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 bg-white focus:outline-none focus:border-slate-500 font-sans"
                >
                  <option value="usuario">Usuario (Empleado - Permisos Básicos)</option>
                  <option value="admin">Admin (Administrador - Rango Alto)</option>
                  <option value="owner">Owner (Propietario - Acceso Completo)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                  {formSystemRole === 'owner' && '• Acceso completo: puede registrar, editar y borrar inventario u hojas de soporte.'}
                  {formSystemRole === 'admin' && '• Acceso de administrador: puede dar de alta o editar equipos, pero sin permisos para eliminar.'}
                  {formSystemRole === 'usuario' && '• Acceso de sólo lectura: puede ver el directorio y los equipos sin modificar información.'}
                </p>
              </div>

              {/* Buttons */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-900 hover:bg-green-800 text-white rounded-lg text-sm font-medium shadow-sm transition-colors cursor-pointer"
                >
                  {editingUser ? 'Guardar Cambios' : 'Registrar Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
