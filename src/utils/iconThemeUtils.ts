import * as vscode from 'vscode';
/**
 * Utility class for managing icon colors based on type and status
 */
export class IconThemeUtils {
    // Map of type -> status -> color
    private static readonly colorMap: Map<string, Map<string, string>> = new Map([
        // Cluster status colors
        ['cluster', new Map([
            ['Successful', 'charts.green'],
            ['Failed', 'charts.red'],
            ['Unknown', 'charts.yellow'],
            ['default', 'charts.blue']
        ])],
        
        // Repository connection colors
        ['repository', new Map([
            ['Successful', 'charts.green'],
            ['Failed', 'charts.red'],
            ['Unknown', 'charts.yellow'],
            ['default', 'charts.blue']
        ])],
        
        // Application health status colors
        ['application', new Map([
            ['Healthy', 'charts.green'],
            ['Degraded', 'charts.red'],
            ['Progressing', 'charts.yellow'],
            ['Suspended', 'charts.gray'],
            ['Missing', 'charts.orange'],
            ['Unknown', 'charts.gray'],
            ['Synced', 'charts.green'],
            ['OutOfSync', 'charts.orange'],
            ['default', 'charts.blue']
        ])],
        
        // Health status colors (for ApplicationHealthItem)
        ['health-status', new Map([
            ['Healthy', 'charts.green'],
            ['Degraded', 'charts.red'],
            ['Progressing', 'charts.yellow'],
            ['Suspended', 'charts.gray'],
            ['Missing', 'charts.orange'],
            ['Unknown', 'charts.gray'],
            ['default', 'charts.gray']
        ])],
        
        // Sync status colors (for ApplicationSyncItem)
        ['sync-status', new Map([
            ['Synced', 'charts.green'],
            ['OutOfSync', 'charts.orange'],
            ['Unknown', 'charts.gray'],
            ['default', 'charts.gray']
        ])],
        
        // Resource health colors (for ResourceItem)
        ['resource', new Map([
            ['Healthy', 'charts.green'],
            ['Degraded', 'charts.red'],
            ['Progressing', 'charts.yellow'],
            ['Missing', 'charts.orange'],
            ['Suspended', 'charts.gray'],
            ['Unknown', 'charts.gray'],
            ['default', 'charts.blue']
        ])],
        
        // Template type colors
        ['template', new Map([
            ['application', 'charts.blue'],
            ['applicationset', 'charts.purple'],
            ['default', 'charts.blue']
        ])],
        
        // Generic status colors
        ['status', new Map([
            ['success', 'charts.green'],
            ['failed', 'charts.red'],
            ['warning', 'charts.yellow'],
            ['info', 'charts.blue'],
            ['default', 'charts.gray']
        ])]
    ]);

    /**
     * Gets the color for a given type and status
     * @param type The item type (cluster, application, repository, etc.)
     * @param status The status value
     * @returns Theme color string
     */
    static getColor(type: string, status?: string): string {
        const typeMap = this.colorMap.get(type);
        if (!typeMap) {
            return 'foreground';
        }
        
        return typeMap.get(status || 'default') || typeMap.get('default') || 'foreground';
    }

    /**
     * Creates a ThemeColor for a given type and status
     * @param type The item type
     * @param status The status value
     * @returns ThemeColor instance or undefined
     */
    static getThemeColor(type: string, status?: string): vscode.ThemeColor | undefined {
        const typeMap = this.colorMap.get(type);
        if (!typeMap) {
            return undefined;
        }
        
        const color = typeMap.get(status || 'default') || typeMap.get('default');
        return color ? new vscode.ThemeColor(color) : undefined;
    }
}