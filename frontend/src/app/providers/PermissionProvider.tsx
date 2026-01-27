import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useBranch } from './BranchProvider';

interface PermissionContextType {
    permissions: string[];
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
    loading: boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { currentBranch } = useBranch();
    const [permissions, setPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && currentBranch) {
            // In a real app, you'd fetch permissions for the user + branch combo
            // or they would be part of the user object already
            // For now, let's derive them from user role or placeholder
            const userRole = user.role.toLowerCase();

            let derivedPermissions: string[] = [];

            if (userRole === 'admin') {
                derivedPermissions = ['*']; // All permissions
            } else if (userRole === 'manager') {
                derivedPermissions = ['dashboard:view', 'pos:view', 'inventory:view', 'orders:view', 'customers:view'];
            } else if (userRole === 'waiter' || userRole === 'bartender') {
                derivedPermissions = ['pos:view', 'orders:view', 'customers:view'];
            } else if (userRole === 'store keeper') {
                derivedPermissions = ['inventory:manage', 'inventory:view'];
            } else if (userRole === 'cashier') {
                derivedPermissions = ['pos:view', 'orders:view', 'cashier:view'];
            }

            setPermissions(derivedPermissions);
        } else {
            setPermissions([]);
        }
        setLoading(false);
    }, [user, currentBranch]);

    const hasPermission = (permission: string) => {
        if (permissions.includes('*')) return true;
        return permissions.includes(permission);
    };

    const hasAnyPermission = (requiredPermissions: string[]) => {
        if (permissions.includes('*')) return true;
        return requiredPermissions.some(p => permissions.includes(p));
    };

    return (
        <PermissionContext.Provider
            value={{
                permissions,
                hasPermission,
                hasAnyPermission,
                loading
            }}
        >
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermission = () => {
    const context = useContext(PermissionContext);
    if (context === undefined) {
        throw new Error('usePermission must be used within a PermissionProvider');
    }
    return context;
};
