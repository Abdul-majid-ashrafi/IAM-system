export function hasPermission(items, moduleName, action) {
    if (!items || items.length === 0) return false;
    return items.some(p => p.module === moduleName && p.action === action);
}