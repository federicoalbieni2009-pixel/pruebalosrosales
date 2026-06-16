/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DeviceType = 'desktop' | 'laptop' | 'printer';
export type DeviceStatus = 'active' | 'maintenance' | 'inactive';

export interface DeviceSpecifications {
  ram?: string;         // e.g., "16 GB"
  storage?: string;     // e.g., "512 GB SSD"
  processor?: string;   // e.g., "Intel i7"
  ipAddress?: string;   // e.g., "192.168.1.100"
  tonerModel?: string;  // e.g., "HP 85A Black"
  os?: string;          // e.g., "Windows 11", "macOS Sonoma"
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  brand: string;
  model: string;
  serialNumber: string;
  status: DeviceStatus;
  assignedUserId: string | null; // ID of the user, null if inventory/stock
  purchaseDate: string;
  specifications: DeviceSpecifications;
}

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  avatarUrl?: string;
  systemRole?: 'owner' | 'admin' | 'usuario';
}

export interface ActionLog {
  id: string;
  timestamp: string; // ISO string
  action: string;    // e.g., "Dispositivo creado", "Usuario asignado"
  details: string;   // description
  module: 'devices' | 'users' | 'maintenance' | 'general';
}

export interface MaintenanceRecord {
  id: string;
  deviceId: string;
  deviceName: string;
  date: string;
  description: string;
  cost: number;
  performer: string; // who did it
}
