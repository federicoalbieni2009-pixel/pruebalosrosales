/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Device, ActionLog, MaintenanceRecord } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u-1',
    name: 'Ana Gómez',
    email: 'ana.gomez@empresa.com',
    department: 'Marketing',
    role: 'Diseñadora Senior',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    systemRole: 'usuario'
  },
  {
    id: 'u-2',
    name: 'Carlos Ruiz',
    email: 'carlos.ruiz@empresa.com',
    department: 'Tecnología',
    role: 'Administrador de Servidores',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    systemRole: 'admin'
  },
  {
    id: 'u-3',
    name: 'Diana Pérez',
    email: 'diana.perez@empresa.com',
    department: 'Finanzas',
    role: 'Analista Presupuestal',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    systemRole: 'usuario'
  },
  {
    id: 'u-4',
    name: 'Eduardo Silva',
    email: 'eduardo.silva@empresa.com',
    department: 'Recursos Humanos',
    role: 'Coordinador de Beneficios',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    systemRole: 'usuario'
  },
  {
    id: 'u-5',
    name: 'Sofía Castro',
    email: 'sofia.castro@empresa.com',
    department: 'Sistemas',
    role: 'Técnico de Helpdesk',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    systemRole: 'owner'
  }
];

export const INITIAL_DEVICES: Device[] = [
  {
    id: 'd-1',
    name: 'MacBook Pro 16 M3',
    type: 'laptop',
    brand: 'Apple',
    model: 'MacBook Pro 16" (2024)',
    serialNumber: 'C02F89XYZ123',
    status: 'active',
    assignedUserId: 'u-1',
    purchaseDate: '2024-01-15',
    specifications: {
      ram: '36 GB',
      storage: '1 TB SSD',
      processor: 'Apple M3 Pro',
      os: 'macOS Sonoma'
    }
  },
  {
    id: 'd-2',
    name: 'Workstation OptiPlex 7010',
    type: 'desktop',
    brand: 'Dell',
    model: 'OptiPlex 7010 MT',
    serialNumber: 'DL-77382-XQ',
    status: 'active',
    assignedUserId: 'u-2',
    purchaseDate: '2023-05-10',
    specifications: {
      ram: '64 GB',
      storage: '2 TB NVMe SSD',
      processor: 'Intel Core i9-13900',
      ipAddress: '192.168.10.45',
      os: 'Windows 11 Pro'
    }
  },
  {
    id: 'd-3',
    name: 'Impresora LaserJet Pro MFP 4103',
    type: 'printer',
    brand: 'HP',
    model: 'LaserJet Pro MFP 4103fdw',
    serialNumber: 'PH-US89210-A',
    status: 'active',
    assignedUserId: null, // Shared department device or in stock
    purchaseDate: '2022-11-05',
    specifications: {
      ipAddress: '192.168.10.150',
      tonerModel: 'HP 151A Black'
    }
  },
  {
    id: 'd-4',
    name: 'ThinkPad T14 Gen 4',
    type: 'laptop',
    brand: 'Lenovo',
    model: 'ThinkPad T14',
    serialNumber: 'PF-399ZZ-AA',
    status: 'active',
    assignedUserId: 'u-3',
    purchaseDate: '2023-09-22',
    specifications: {
      ram: '16 GB',
      storage: '512 GB SSD',
      processor: 'AMD Ryzen 5 PRO 7540U',
      os: 'Windows 11 Pro'
    }
  },
  {
    id: 'd-5',
    name: 'iMac 24" TouchID',
    type: 'desktop',
    brand: 'Apple',
    model: 'iMac 24-inch (M1)',
    serialNumber: 'C02G8HJD14P2',
    status: 'maintenance',
    assignedUserId: 'u-5', // Assigned to support for maintenance
    purchaseDate: '2021-08-11',
    specifications: {
      ram: '16 GB',
      storage: '512 GB SSD',
      processor: 'Apple M1',
      os: 'macOS Ventura'
    }
  },
  {
    id: 'd-6',
    name: 'Impresora Epson L8180 EcoTank',
    type: 'printer',
    brand: 'Epson',
    model: 'EcoTank Photo L8180',
    serialNumber: 'EP-44211-ZZ',
    status: 'inactive',
    assignedUserId: null,
    purchaseDate: '2021-12-01',
    specifications: {
      ipAddress: '192.168.10.180',
      tonerModel: 'Epson 115 Cyan/Magenta/Yellow/Black'
    }
  },
  {
    id: 'd-7',
    name: 'HP ProDesk 400 G9',
    type: 'desktop',
    brand: 'HP',
    model: 'ProDesk 400',
    serialNumber: 'MXL-91183-YY',
    status: 'active',
    assignedUserId: 'u-4',
    purchaseDate: '2023-10-30',
    specifications: {
      ram: '16 GB',
      storage: '512 GB SSD',
      processor: 'Intel Core i5-12500',
      ipAddress: '192.168.10.62',
      os: 'Windows 11 Pro'
    }
  },
  {
    id: 'd-8',
    name: 'Dell Latitude 3440',
    type: 'laptop',
    brand: 'Dell',
    model: 'Latitude 3440 Laptop',
    serialNumber: 'CN-0XJ391-A',
    status: 'active',
    assignedUserId: null, // Available in stock
    purchaseDate: '2024-03-05',
    specifications: {
      ram: '16 GB',
      storage: '512 GB NVMe',
      processor: 'Intel Core i5-1335U',
      os: 'Windows 11 Pro'
    }
  }
];

export const INITIAL_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: 'm-1',
    deviceId: 'd-5',
    deviceName: 'iMac 24" TouchID',
    date: '2026-06-10',
    description: 'Actualización preventiva del sistema, limpieza física interna y cambio de pasta térmica.',
    cost: 120.00,
    performer: 'Sofía Castro'
  },
  {
    id: 'm-2',
    deviceId: 'd-3',
    deviceName: 'Impresora LaserJet Pro MFP 4103',
    date: '2026-05-18',
    description: 'Reemplazo del cartucho de tóner HP 151A y calibración de escáner dúplex.',
    cost: 85.50,
    performer: 'External Service HP'
  },
  {
    id: 'm-3',
    deviceId: 'd-6',
    deviceName: 'Impresora Epson L8180 EcoTank',
    date: '2026-04-02',
    description: 'Atascamiento de papel avanzado en bandeja 2. Cabezales de impresión tapados. Pendiente de repuesto de rodillo.',
    cost: 45.00,
    performer: 'Sofía Castro'
  }
];

export const INITIAL_LOGS: ActionLog[] = [
  {
    id: 'l-1',
    timestamp: '2026-06-16T09:12:00Z',
    action: 'Asignación de Dispositivo',
    details: 'Impresora HP LaserJet Pro fue establecida en red corporativa.',
    module: 'devices'
  },
  {
    id: 'l-2',
    timestamp: '2026-06-16T10:05:00Z',
    action: 'Mantenimiento Iniciado',
    details: 'Se ingresa iMac M1 a mantenimiento preventivo por recalentamiento.',
    module: 'maintenance'
  },
  {
    id: 'l-3',
    timestamp: '2026-06-15T15:30:00Z',
    action: 'Nuevo Usuario Registrado',
    details: 'Se agrega a Ana Gómez al departamento de Marketing.',
    module: 'users'
  },
  {
    id: 'l-4',
    timestamp: '2026-06-14T11:45:00Z',
    action: 'Nuevo Dispositivo Registrado',
    details: 'Se añade laptop Dell Latitude 3440 al almacén de stock.',
    module: 'devices'
  }
];

export const DEPARTMENTS = [
  'Tecnología',
  'Finanzas',
  'Marketing',
  'Sistemas',
  'Recursos Humanos',
  'Ventas',
  'Operaciones'
];

export const BRANDS = {
  desktop: ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Custom PC'],
  laptop: ['Apple', 'Lenovo', 'Dell', 'HP', 'Asus', 'Acer'],
  printer: ['HP', 'Epson', 'Brother', 'Canon', 'Lexmark']
};
