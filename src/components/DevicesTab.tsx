/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Laptop, 
  Monitor, 
  Printer, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  HardDrive, 
  Cpu, 
  Network, 
  Tag, 
  Calendar, 
  X,
  Info
} from 'lucide-react';
import { Device, DeviceType, DeviceStatus, User } from '../types';
import { BRANDS } from '../data/mockData';

interface DevicesTabProps {
  devices: Device[];
  users: User[];
  onAddDevice: (device: Device) => void;
  onUpdateDevice: (device: Device) => void;
  onDeleteDevice: (id: string) => void;
  currentRole: 'owner' | 'admin' | 'usuario';
}

export default function DevicesTab({ devices, users, onAddDevice, onUpdateDevice, onDeleteDevice, currentRole }: DevicesTabProps) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all');
  
  // Selected device for viewing detailed specifications
  const [selectedDeviceDetails, setSelectedDeviceDetails] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<DeviceType>('laptop');
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formStatus, setFormStatus] = useState<DeviceStatus>('active');
  const [formAssignedUser, setFormAssignedUser] = useState<string>('');
  const [formPurchaseDate, setFormPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Specs form state
  const [formRam, setFormRam] = useState('');
  const [formStorage, setFormStorage] = useState('');
  const [formProcessor, setFormProcessor] = useState('');
  const [formIpAddress, setFormIpAddress] = useState('');
  const [formTonerModel, setFormTonerModel] = useState('');
  const [formOs, setFormOs] = useState('');

  // Handle opening modal for adding
  const handleOpenAddModal = () => {
    setEditingDevice(null);
    setFormName('');
    setFormType('laptop');
    setFormBrand('Lenovo');
    setFormModel('');
    setFormSerial('');
    setFormStatus('active');
    setFormAssignedUser('');
    setFormPurchaseDate(new Date().toISOString().split('T')[0]);
    // Specs
    setFormRam('16 GB');
    setFormStorage('512 GB SSD');
    setFormProcessor('Intel Core i7');
    setFormIpAddress('');
    setFormTonerModel('');
    setFormOs('Windows 11 Pro');
    
    setIsModalOpen(true);
  };

  // Handle opening modal for editing
  const handleOpenEditModal = (device: Device, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDevice(device);
    setFormName(device.name);
    setFormType(device.type);
    setFormBrand(device.brand);
    setFormModel(device.model);
    setFormSerial(device.serialNumber);
    setFormStatus(device.status);
    setFormAssignedUser(device.assignedUserId || '');
    setFormPurchaseDate(device.purchaseDate);
    
    // Specs
    setFormRam(device.specifications.ram || '');
    setFormStorage(device.specifications.storage || '');
    setFormProcessor(device.specifications.processor || '');
    setFormIpAddress(device.specifications.ipAddress || '');
    setFormTonerModel(device.specifications.tonerModel || '');
    setFormOs(device.specifications.os || '');

    setIsModalOpen(true);
  };

  // Handle Type Change in modal to populate smart brand defaults
  const handleTypeChange = (type: DeviceType) => {
    setFormType(type);
    // Auto preset reasonable brands
    const availableBrands = BRANDS[type];
    if (availableBrands && availableBrands.length > 0) {
      setFormBrand(availableBrands[0]);
    }
    
    // Sensible specification defaults
    if (type === 'printer') {
      setFormRam('');
      setFormStorage('');
      setFormProcessor('');
      setFormOs('');
      setFormTonerModel('HP 151A Black');
      setFormIpAddress('192.168.10.');
    } else {
      setFormTonerModel('');
      setFormRam('16 GB');
      setFormStorage('512 GB SSD');
      setFormProcessor(type === 'desktop' ? 'Intel i5-12500' : 'Intel Core i5');
      setFormOs('Windows 11 Pro');
      setFormIpAddress(type === 'desktop' ? '192.168.10.' : '');
    }
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formModel || !formSerial) {
      alert('Por favor complete los campos obligatorios: Nombre, Modelo y Número de Serie.');
      return;
    }

    const specifications: any = {};
    if (formType === 'printer') {
      if (formIpAddress) specifications.ipAddress = formIpAddress;
      if (formTonerModel) specifications.tonerModel = formTonerModel;
    } else {
      if (formRam) specifications.ram = formRam;
      if (formStorage) specifications.storage = formStorage;
      if (formProcessor) specifications.processor = formProcessor;
      if (formIpAddress) specifications.ipAddress = formIpAddress;
      if (formOs) specifications.os = formOs;
    }

    const deviceData: Device = {
      id: editingDevice?.id || `d-${Date.now()}`,
      name: formName,
      type: formType,
      brand: formBrand,
      model: formModel,
      serialNumber: formSerial.toUpperCase(),
      status: formStatus,
      assignedUserId: formAssignedUser || null,
      purchaseDate: formPurchaseDate,
      specifications
    };

    if (editingDevice) {
      onUpdateDevice(deviceData);
    } else {
      onAddDevice(deviceData);
    }
    setIsModalOpen(false);
  };

  // Filter logic
  const filteredDevices = devices.filter(device => {
    const matchesSearch = 
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || device.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    
    let matchesAssignment = true;
    if (assignmentFilter === 'assigned') {
      matchesAssignment = device.assignedUserId !== null;
    } else if (assignmentFilter === 'available') {
      matchesAssignment = device.assignedUserId === null;
    }

    return matchesSearch && matchesType && matchesStatus && matchesAssignment;
  });

  const getStatusBadge = (status: DeviceStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Activo
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            En Mantenimiento
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Inactivo
          </span>
        );
    }
  };

  const getTypeIcon = (type: DeviceType) => {
    switch (type) {
      case 'desktop':
        return <Monitor className="w-5 h-5 text-emerald-600" />;
      case 'laptop':
        return <Laptop className="w-5 h-5 text-teal-600" />;
      case 'printer':
        return <Printer className="w-5 h-5 text-green-700" />;
    }
  };

  const getTypeName = (type: DeviceType) => {
    switch (type) {
      case 'desktop': return 'PC Escritorio';
      case 'laptop': return 'Laptop';
      case 'printer': return 'Impresora';
    }
  };

  const getUserName = (userId: string | null) => {
    if (!userId) return 'Sin asignar (En Bodega)';
    const user = users.find(u => u.id === userId);
    return user ? `${user.name} (${user.department})` : 'Usuario desconocido';
  };

  return (
    <div id="devices-tab-container" className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display tracking-tight">Inventario de Dispositivos</h2>
          <p className="text-sm text-slate-500 font-sans mt-0.5">Administra computadoras de escritorio, laptops e impresoras de la organización.</p>
        </div>
        <button
          id="btn-add-device"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-900 hover:bg-green-800 text-white rounded-lg text-sm font-medium shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Registrar Dispositivo
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              id="device-search"
              type="text"
              placeholder="Buscar por serie, modelo, marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-all"
            />
          </div>

          {/* Type dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 text-sm">
            <span className="text-slate-400 flex items-center shrink-0">
              <Filter className="w-3.5 h-3.5 mr-1" /> Tipo:
            </span>
            <select
              id="filter-type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-transparent border-none py-2 text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">Todos los Equipos</option>
              <option value="desktop">Computadora de Escritorio</option>
              <option value="laptop">Laptops</option>
              <option value="printer">Impresoras</option>
            </select>
          </div>

          {/* Status dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 text-sm">
            <span className="text-slate-400 flex items-center shrink-0">
              <span className="inline-block w-2 h-2 rounded-full bg-slate-400 mr-1.5"></span> Estado:
            </span>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent border-none py-2 text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">Cualquier Estado</option>
              <option value="active">Activos</option>
              <option value="maintenance">En Mantenimiento / Taller</option>
              <option value="inactive">Inactivos / Almacén</option>
            </select>
          </div>

          {/* Assignment filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 text-sm">
            <span className="text-slate-400 flex items-center shrink-0 border-r border-slate-200 pr-2">
              Asignación:
            </span>
            <select
              id="filter-assignment"
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="w-full bg-transparent border-none py-2 text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">Ver Todos</option>
              <option value="assigned">Asignados</option>
              <option value="available">Disponibles (Bodega)</option>
            </select>
          </div>
        </div>

        {/* Filters Active HUD */}
        {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || assignmentFilter !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400">Filtros aplicados:</span>
            {searchTerm && (
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-200">
                Búsqueda: {searchTerm}
                <X className="w-3 h-3 hover:text-red-500 cursor-pointer" onClick={() => setSearchTerm('')} />
              </span>
            )}
            {typeFilter !== 'all' && (
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-200">
                Tipo: {getTypeName(typeFilter as DeviceType)}
                <X className="w-3 h-3 hover:text-red-500 cursor-pointer" onClick={() => setTypeFilter('all')} />
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-200">
                Estado: {statusFilter === 'active' ? 'Activo' : statusFilter === 'maintenance' ? 'Mantenimiento' : 'Inactivo'}
                <X className="w-3 h-3 hover:text-red-500 cursor-pointer" onClick={() => setStatusFilter('all')} />
              </span>
            )}
            {assignmentFilter !== 'all' && (
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-200">
                Asignación: {assignmentFilter === 'assigned' ? 'Asignado' : 'Disponible'}
                <X className="w-3 h-3 hover:text-red-500 cursor-pointer" onClick={() => setAssignmentFilter('all')} />
              </span>
            )}
            <button 
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setStatusFilter('all');
                setAssignmentFilter('all');
              }}
              className="text-emerald-700 hover:text-emerald-800 text-xs font-semibold cursor-pointer ml-auto"
            >
              Restaurar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Main Grid/Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredDevices.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-3">
            <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-base font-medium">No se encontraron dispositivos</p>
            <p className="text-xs text-slate-400">Prueba ajustando los filtros o registra un nuevo dispositivo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold tracking-wider text-slate-400 uppercase select-none">
                  <th className="py-3.5 px-4 w-12 text-center">Tipo</th>
                  <th className="py-3.5 px-4">Dispositivo</th>
                  <th className="py-3.5 px-4">Marca / Modelo</th>
                  <th className="py-3.5 px-4">Nº Serie</th>
                  <th className="py-3.5 px-4">Asignado a</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredDevices.map(device => {
                  const isExpanded = selectedDeviceDetails === device.id;
                  return (
                    <React.Fragment key={device.id}>
                      <tr 
                        id={`device-row-${device.id}`}
                        onClick={() => setSelectedDeviceDetails(isExpanded ? null : device.id)}
                        className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${isExpanded ? 'bg-emerald-50/20' : ''}`}
                      >
                        {/* Type icon column */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex p-2 bg-slate-50 border border-slate-200/60 rounded-lg">
                            {getTypeIcon(device.type)}
                          </div>
                        </td>

                        {/* Name/Specs quick-peek column */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            {device.name}
                            <span className="inline-flex items-center text-[10px] text-slate-400 px-1 bg-slate-100 rounded">
                              {getTypeName(device.type)}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {device.id}</div>
                        </td>

                        {/* Brand / Model */}
                        <td className="py-4 px-4">
                          <div className="text-slate-700 font-medium">{device.brand}</div>
                          <div className="text-xs text-slate-400">{device.model}</div>
                        </td>

                        {/* Serial Number */}
                        <td className="py-4 px-4">
                          <code className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono rounded">
                            {device.serialNumber}
                          </code>
                        </td>

                        {/* Assigned user name */}
                        <td className="py-4 px-4">
                          <div className={`text-slate-700 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] ${device.assignedUserId ? 'font-medium' : 'text-slate-400 italic'}`}>
                            {getUserName(device.assignedUserId)}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          {getStatusBadge(device.status)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              id={`btn-edit-device-${device.id}`}
                              onClick={(e) => handleOpenEditModal(device, e)}
                              className="p-1 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-emerald-700 text-slate-600 transition-colors text-xs inline-flex items-center gap-1 font-medium cursor-pointer"
                              title="Editar Dispositivo"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Editar
                            </button>
                            {(currentRole === 'owner' || currentRole === 'admin') ? (
                              <button
                                id={`btn-delete-device-${device.id}`}
                                onClick={() => {
                                  if (confirm(`¿Está seguro de eliminar el dispositivo "${device.name}"?`)) {
                                    onDeleteDevice(device.id);
                                  }
                                }}
                                className="p-1 px-2 text-xs rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-colors inline-flex items-center gap-1 font-medium cursor-pointer"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-sans italic bg-slate-50 px-1.5 py-1 rounded border border-slate-100" title="Sólo lectura: no puede eliminar">Solo lectura</span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Specs Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="bg-slate-50/50 p-4 border-t border-b border-emerald-100/30">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                              {/* Spec block 1: General details */}
                              <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                  <Tag className="w-3 h-3 text-slate-500" />
                                  Información General
                                </h4>
                                <div className="space-y-1.5 text-slate-600 py-1">
                                  <div className="flex justify-between border-b border-slate-50 py-1">
                                    <span className="text-slate-400 text-xs">Tipo de Equipo:</span>
                                    <span className="font-medium text-slate-800">{getTypeName(device.type)}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-50 py-1">
                                    <span className="text-slate-400 text-xs">Marca / Modelo:</span>
                                    <span className="font-medium text-slate-800">{device.brand} {device.model}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-50 py-1">
                                    <span className="text-slate-400 text-xs">Fecha de Compra:</span>
                                    <span className="font-medium text-slate-800 flex items-center gap-1 font-mono text-xs">
                                      <Calendar className="w-3 h-3 text-slate-400" />
                                      {device.purchaseDate}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Spec block 2: System Specs or Toner Info */}
                              <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                  {device.type === 'printer' ? (
                                    <>
                                      <Printer className="w-3 h-3 text-slate-500" />
                                      Insumos y Suministros
                                    </>
                                  ) : (
                                    <>
                                      <Cpu className="w-3 h-3 text-slate-500" />
                                      Especificaciones Técnicas
                                    </>
                                  )}
                                </h4>
                                <div className="space-y-1.5 text-slate-600 py-1">
                                  {device.type === 'printer' ? (
                                    <div className="flex justify-between border-b border-slate-50 py-1">
                                      <span className="text-slate-400 text-xs">Modelo de Tóner:</span>
                                      <code className="text-purple-600 font-mono text-xs font-bold">
                                        {device.specifications.tonerModel || 'No definido'}
                                      </code>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex justify-between border-b border-slate-50 py-1">
                                        <span className="text-slate-400 text-xs text-left">Procesador:</span>
                                        <span className="font-medium text-slate-800 text-right">{device.specifications.processor || 'No especificado'}</span>
                                      </div>
                                      <div className="flex justify-between border-b border-slate-50 py-1">
                                        <span className="text-slate-400 text-xs text-left">RAM:</span>
                                        <span className="font-medium text-slate-800 text-right">{device.specifications.ram || 'No especificado'}</span>
                                      </div>
                                      <div className="flex justify-between border-b border-slate-50 py-1">
                                        <span className="text-slate-400 text-xs text-left">Almacenamiento:</span>
                                        <span className="font-medium text-slate-800 text-right">{device.specifications.storage || 'No especificado'}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Spec block 3: System OS or Network */}
                              <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                  <Network className="w-3 h-3 text-slate-500" />
                                  Software y Conectividad
                                </h4>
                                <div className="space-y-1.5 text-slate-600 py-1">
                                  <div className="flex justify-between border-b border-slate-50 py-1">
                                    <span className="text-slate-400 text-xs">Dirección IP:</span>
                                    <code className="px-1 py-0.25 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-mono rounded">
                                      {device.specifications.ipAddress || 'DHCP (Dinámica)'}
                                    </code>
                                  </div>
                                  {device.type !== 'printer' && (
                                    <div className="flex justify-between border-b border-slate-50 py-1">
                                      <span className="text-slate-400 text-xs">Sist. Operativo:</span>
                                      <span className="font-medium text-slate-800">{device.specifications.os || 'Sin registrar'}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between mt-2 pt-1 border-t border-slate-100 text-xs font-medium text-slate-400">
                                    <span>Haga clic en la fila para contraer</span>
                                    <span className="inline-flex items-center text-slate-500 font-bold hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); handleOpenEditModal(device, e); }}>
                                      Editar Ficha &rarr;
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display tracking-tight">
                  {editingDevice ? `Editar Ficha Tecnológica: ${editingDevice.name}` : 'Registrar Nuevo Dispositivo Organizacional'}
                </h3>
                <p className="text-xs text-slate-400">Fichas de identificación para equipos internos corporativos.</p>
              </div>
              <button 
                id="btn-close-modal"
                onClick={() => setIsModalOpen(false)}
                className="p-1 px-2.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Prominent Status selection switcher at the very top */}
                <div className="col-span-1 sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-2xs">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-display">
                    🚦 {editingDevice ? 'Editar Estado del Dispositivo' : 'Estado Inicial del Dispositivo'} <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[10px] text-slate-400 font-sans mb-3">Establece si el equipo está listo para su uso, en nuestro taller de mantenimiento o inactivo.</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { value: 'active', label: '🟢 Activo', desc: 'Listo y Operacional', activeBg: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600' },
                      { value: 'maintenance', label: '🟡 Mantenimiento', desc: 'Soporte / Softmerc', activeBg: 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500' },
                      { value: 'inactive', label: '🔴 Fuera de Servicio', desc: 'No operativo / Bodega', activeBg: 'bg-red-600 hover:bg-red-700 text-white border-red-600' },
                    ].map((opt) => {
                      const isActive = formStatus === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormStatus(opt.value as DeviceStatus)}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            isActive
                              ? `${opt.activeBg} shadow-xs font-bold ring-2 ring-offset-2 ring-emerald-500/20`
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-[13px] font-bold font-sans">{opt.label}</span>
                          <span className="text-[9px] opacity-90 mt-0.5">{opt.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Device type selection (disabled if editing to maintain history correctness) */}
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Tipo de Equipo <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { value: 'laptop', label: 'Laptop', icon: Laptop },
                      { value: 'desktop', label: 'Escritorio', icon: Monitor },
                      { value: 'printer', label: 'Impresora', icon: Printer },
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = formType === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          disabled={!!editingDevice}
                          onClick={() => handleTypeChange(item.value as DeviceType)}
                          className={`flex flex-col items-center gap-1.5 py-3.5 px-3 border text-sm rounded-xl font-medium transition-all cursor-pointer ${
                            active 
                              ? 'bg-green-950 text-white border-green-950 shadow-xs' 
                              : editingDevice 
                              ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                              : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Device Name */}
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Nombre Identificador del Equipo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="form-device-name"
                    type="text"
                    required
                    placeholder="Ej. MacBook Pro M3 de Marketing o PC Servidor Sistemas"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-500"
                  />
                </div>

                {/* Brand Selection with manual entry and suggestion list */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Marca <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="form-device-brand"
                      type="text"
                      required
                      list="brands-datalist"
                      placeholder="Ej. Lenovo, HP, Apple..."
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-500 font-sans"
                    />
                    <datalist id="brands-datalist">
                      {BRANDS[formType]?.map((brand) => (
                        <option key={brand} value={brand} />
                      ))}
                    </datalist>
                  </div>
                  {/* Clickable Quick Suggestions */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {BRANDS[formType]?.map((brand) => (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => setFormBrand(brand)}
                        className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold transition-all cursor-pointer ${
                          formBrand.toLowerCase() === brand.toLowerCase()
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Modelo del Equipo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="form-device-model"
                    type="text"
                    required
                    placeholder="Ej. ThinkPad T14 o EcoTank L8180"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-500"
                  />
                </div>

                {/* Serial Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Número de Serie S/N <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="form-device-serial"
                    type="text"
                    required
                    placeholder="Ej. S9828XYZ81"
                    value={formSerial}
                    onChange={(e) => setFormSerial(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-500 uppercase font-mono"
                  />
                </div>

                {/* Purchase date */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Fecha de Compra
                  </label>
                  <input
                    id="form-device-purchase"
                    type="date"
                    value={formPurchaseDate}
                    onChange={(e) => setFormPurchaseDate(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-500 font-mono"
                  />
                </div>

                {/* Assignment Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Asignar a Colaborador
                  </label>
                  <select
                    id="form-device-assigned"
                    value={formAssignedUser}
                    onChange={(e) => setFormAssignedUser(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 bg-white focus:outline-none focus:border-slate-500"
                  >
                    <option value="">Sin Asignar (Disponible en Almacén / Stock)</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>{user.name} ({user.department})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Specifications Sub-Form section */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.75 rounded">
                  <Info className="w-3 h-3" /> Ficha Técnica Detallada
                </span>
                
                {formType === 'printer' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* IP and Toner for printers */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Dirección IP de Red (Opcional)
                      </label>
                      <input
                        id="form-spec-ip"
                        type="text"
                        placeholder="Ej. 192.168.10.150"
                        value={formIpAddress}
                        onChange={(e) => setFormIpAddress(e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Modelo de Cartucho/Tóner
                      </label>
                      <input
                        id="form-spec-toner"
                        type="text"
                        placeholder="Ej. HP 151A Negro"
                        value={formTonerModel}
                        onChange={(e) => setFormTonerModel(e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-500 font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Processor */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Procesador / CPU
                      </label>
                      <input
                        id="form-spec-cpu"
                        type="text"
                        placeholder="Ej. Intel Core i7 / AMD Ryzen 5"
                        value={formProcessor}
                        onChange={(e) => setFormProcessor(e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-500"
                      />
                    </div>
                    {/* Memory */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Memoria RAM
                      </label>
                      <input
                        id="form-spec-ram"
                        type="text"
                        placeholder="Ej. 16 GB DDR5"
                        value={formRam}
                        onChange={(e) => setFormRam(e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-500"
                      />
                    </div>
                    {/* Storage */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Disco / Almacenamiento
                      </label>
                      <input
                        id="form-spec-storage"
                        type="text"
                        placeholder="Ej. 512 GB SSD PCIe"
                        value={formStorage}
                        onChange={(e) => setFormStorage(e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-500"
                      />
                    </div>
                    {/* Operating system */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Sistema Operativo
                      </label>
                      <input
                        id="form-spec-os"
                        type="text"
                        placeholder="Ej. Windows 11 Home / macOS"
                        value={formOs}
                        onChange={(e) => setFormOs(e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-500"
                      />
                    </div>
                    {/* Optional desktop IP network */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Dirección IP Local (Opcional)
                      </label>
                      <input
                        id="form-spec-ip"
                        type="text"
                        placeholder="Ej. 192.168.10.45"
                        value={formIpAddress}
                        onChange={(e) => setFormIpAddress(e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-500 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3.5">
                <button
                  id="btn-cancel"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn-submit"
                  type="submit"
                  className="px-5 py-2.5 bg-green-900 hover:bg-green-800 text-white rounded-lg text-sm font-medium shadow-sm transition-all cursor-pointer"
                >
                  {editingDevice ? 'Guardar Cambios' : 'Registrar Equipo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
