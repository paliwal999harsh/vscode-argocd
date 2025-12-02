/**
 * Utility class for tree item icons with centralized icon management
 */
export class IconUtils {
  // Map of type -> icon name
  private static readonly iconMap: Map<string, string> = new Map([
    // Cluster types
    ['cluster', 'server'], // Server with environment context
    ['server-info', 'globe'], // Globe for server URL
    ['version-info', 'versions'], // Versions icon for version info
    ['status-info', 'pulse'], // Pulse for status/health
    ['applications-info', 'layers'], // Layers for applications collection
    ['tls-info', 'shield'], // Shield for TLS/security
    ['cache-info', 'database'], // Database for cache
    ['cache-detail', 'list-tree'], // Tree list for cache details
    ['application-ref', 'circuit-board'], // References icon for app references

    // Repository types
    ['repository', 'repo'], // Generic repo icon
    ['repository-git', 'source-control'], // Git branch for Git repos
    ['repository-helm', 'package'], // Package for Helm charts
    ['repository-oci', 'archive'], // Archive for OCI/container registries

    // Application types
    ['application', 'circuit-board'], // Namespace symbol for applications
    ['applicationset', 'layers-active'], // Active layers for application sets
    ['health-status', 'heart-filled'], // Filled heart for health status
    ['sync-status', 'sync'], // Sync icon for sync status
    ['namespace-group', 'folder'], // Folder for namespace grouping
    ['kind-group', 'symbol-class'], // Class symbol for resource kinds
    ['resource', 'symbol-misc'], // Misc symbol for generic resources

    // Template types
    ['template', 'layout'], // Template icon for templates
    ['template-application', 'layout'], // Template icon for app templates
    ['template-applicationset', 'layers'], // Active layers for appset templates
    ['empty', 'circle-outline'], // Empty circle for empty states

    // Connection types
    ['add-connection', 'plug'], // Plug for adding connections
    ['switch-connection', 'arrow-swap'], // Swap arrows for switching
    ['configure', 'settings-gear'], // Settings gear for configuration
    ['connected', 'pass-filled'], // Filled checkmark for connected state
    ['connection-failed', 'error'], // Error for failed connections
    ['server-config', 'settings-gear'], // Settings for server config
    ['server-url', 'link'], // Link for server URL
    ['auth-method', 'key'], // Key for authentication
    ['tls-config', 'lock'], // Lock for TLS configuration
    ['username', 'person'], // Person for username

    // Generic types
    ['error', 'error'], // Error icon
    ['info', 'info'] // Info icon
  ]);

  /**
   * Gets the icon for a tree item based on its type and optional data
   * @param type The item type
   * @returns ThemeIcon with appropriate styling
   */
  static getIcon(type: string): string {
    return this.iconMap.get(type) || 'circle-outline';
  }
}
