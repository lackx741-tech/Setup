import { type Address } from 'viem';
import { logger } from '@/lib/logger';

const log = logger.child('permissions');

export type Permission =
  | 'relay:delegate'
  | 'relay:execute'
  | 'relay:batch'
  | 'daas:sweep'
  | 'daas:recover'
  | 'admin';

export interface PermissionSet {
  address: Address;
  permissions: Permission[];
  grantedAt: number;
  expiresAt?: number;
}

const DEFAULT_PERMISSIONS: Permission[] = ['relay:delegate', 'relay:execute'];

/**
 * Check if a permission set includes the required permission.
 */
export function hasPermission(
  permissionSet: PermissionSet,
  required: Permission,
): boolean {
  if (permissionSet.expiresAt && Date.now() > permissionSet.expiresAt) {
    log.warn('Permission set expired', { address: permissionSet.address });
    return false;
  }

  if (permissionSet.permissions.includes('admin')) {
    return true;
  }

  return permissionSet.permissions.includes(required);
}

/**
 * Check if a permission set includes all required permissions.
 */
export function hasAllPermissions(
  permissionSet: PermissionSet,
  required: Permission[],
): boolean {
  return required.every((p) => hasPermission(permissionSet, p));
}

/**
 * Create a default permission set for a new user.
 */
export function createDefaultPermissionSet(address: Address): PermissionSet {
  return {
    address,
    permissions: DEFAULT_PERMISSIONS,
    grantedAt: Date.now(),
  };
}

/**
 * Parse permissions from a JWT token permissions array.
 */
export function parsePermissions(raw: string[]): Permission[] {
  const valid: Permission[] = [
    'relay:delegate',
    'relay:execute',
    'relay:batch',
    'daas:sweep',
    'daas:recover',
    'admin',
  ];
  return raw.filter((p) => valid.includes(p as Permission)) as Permission[];
}

/**
 * Serialize permissions for storage in a JWT.
 */
export function serializePermissions(permissions: Permission[]): string[] {
  return permissions as string[];
}
