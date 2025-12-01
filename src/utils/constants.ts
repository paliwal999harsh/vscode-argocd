export const ARGOCD_CONSTANTS = {
  // Default values
  DEFAULT_PROJECT: 'default',
  DEFAULT_NAMESPACE: 'default',
  DEFAULT_PATH: '.',
  DEFAULT_REVISION: 'HEAD',

  // ArgoCD specific
  APPLICATION_FINALIZER: 'resources-finalizer.argocd.argoproj.io',
  ARGOCD_NAMESPACE: 'argocd',

  // API versions
  APPLICATION_API_VERSION: 'argoproj.io/v1alpha1',
  APPLICATIONSET_API_VERSION: 'argoproj.io/v1alpha1',

  // Kinds
  APPLICATION_KIND: 'Application',
  APPLICATIONSET_KIND: 'ApplicationSet',

  // Sync policies
  SYNC_POLICIES: {
    AUTO_PRUNE: 'Prune=true',
    AUTO_SELF_HEAL: 'SelfHeal=true',
    CREATE_NAMESPACE: 'CreateNamespace=true',
    VALIDATE: 'Validate=false',
    PRESERVE_RESOURCE_VERSION: 'PreserveResourceVersion=true'
  },

  // Health statuses
  HEALTH_STATUS: {
    HEALTHY: 'Healthy',
    PROGRESSING: 'Progressing',
    DEGRADED: 'Degraded',
    SUSPENDED: 'Suspended',
    MISSING: 'Missing',
    UNKNOWN: 'Unknown'
  } as const,

  // Sync statuses
  SYNC_STATUS: {
    SYNCED: 'Synced',
    OUT_OF_SYNC: 'OutOfSync',
    UNKNOWN: 'Unknown'
  } as const,

  // Operation phases
  OPERATION_PHASES: {
    RUNNING: 'Running',
    SUCCEEDED: 'Succeeded',
    FAILED: 'Failed',
    ERROR: 'Error',
    TERMINATING: 'Terminating'
  } as const,

  // Repository types
  REPOSITORY_TYPES: {
    GIT: 'git',
    HELM: 'helm',
    OCI: 'oci'
  } as const,

  // CLI commands
  CLI_COMMANDS: {
    VERSION: 'version --client',
    LOGIN: 'login',
    LOGIN_SSO: 'login --sso --sso-launch-browser=false',
    LOGOUT: 'logout',
    CLUSTER_LIST: 'cluster list',
    CLUSTER_ADD: 'cluster add',
    REPO_LIST: 'repo list',
    REPO_ADD: 'repo add',
    APP_LIST: 'app list',
    APP_GET: 'app get',
    APP_CREATE: 'app create',
    APP_DELETE: 'app delete',
    APP_SYNC: 'app sync',
    APP_REFRESH: 'app refresh',
    APP_HISTORY: 'app history',
    APP_RESOURCES: 'app resources',
    APPSET_LIST: 'appset list',
    APPSET_GET: 'appset get',
    APPSET_CREATE: 'appset create',
    APPSET_DELETE: 'appset delete'
  },

  // Output formats
  OUTPUT_FORMATS: {
    JSON: 'json',
    YAML: 'yaml',
    WIDE: 'wide',
    NAME: 'name'
  },

  // Configuration keys
  CONFIG_KEYS: {
    SERVER_URL: 'argocd.serverUrl',
    SERVER_ADDRESS: 'argocd.serverAddress',
    AUTH_METHOD: 'argocd.authMethod',
    USERNAME: 'argocd.username',
    PASSWORD: 'argocd.password',
    API_TOKEN: 'argocd.apiToken',
    SKIP_TLS: 'argocd.skipTls',
    REFRESH_INTERVAL: 'argocd.refreshInterval'
  },

  // UI Constants
  UI: {
    TREE_ITEM_TYPES: {
      APPLICATION: 'application',
      APPLICATIONSET: 'applicationset',
      CLUSTER: 'cluster',
      REPOSITORY: 'repository',
      ERROR: 'error',
      CONFIGURE: 'configure'
    },

    CONTEXT_VALUES: {
      APPLICATION: 'application',
      APPLICATIONSET: 'applicationset',
      CLUSTER: 'cluster',
      REPOSITORY: 'repository'
    }
  },

  // Validation patterns
  VALIDATION: {
    KUBERNETES_NAME: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
    NAMESPACE: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
    LABEL_NAME: /^[a-zA-Z0-9]([-a-zA-Z0-9_.]*[a-zA-Z0-9])?$/,
    LABEL_VALUE: /^[a-zA-Z0-9]([-a-zA-Z0-9_.]*[a-zA-Z0-9])?$/,
    DNS_SUBDOMAIN: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/,
    GIT_URL: /^(https?:\/\/|git@|ssh:\/\/)/
  },

  // Limits
  LIMITS: {
    MAX_NAME_LENGTH: 253,
    MAX_NAMESPACE_LENGTH: 63,
    MAX_LABEL_KEY_LENGTH: 253,
    MAX_LABEL_VALUE_LENGTH: 63,
    MAX_LABEL_NAME_LENGTH: 63
  },

  // Error messages
  ERRORS: {
    CLI_NOT_FOUND: 'ArgoCD CLI not found. Please install it first.',
    CONNECTION_FAILED: 'Failed to connect to ArgoCD server',
    INVALID_CONFIGURATION: 'Invalid ArgoCD configuration',
    OPERATION_FAILED: 'Operation failed',
    INVALID_NAME: 'Invalid name format',
    INVALID_URL: 'Invalid URL format'
  }
};

export type HealthStatus = (typeof ARGOCD_CONSTANTS.HEALTH_STATUS)[keyof typeof ARGOCD_CONSTANTS.HEALTH_STATUS];
export type SyncStatus = (typeof ARGOCD_CONSTANTS.SYNC_STATUS)[keyof typeof ARGOCD_CONSTANTS.SYNC_STATUS];
export type OperationPhase = (typeof ARGOCD_CONSTANTS.OPERATION_PHASES)[keyof typeof ARGOCD_CONSTANTS.OPERATION_PHASES];
export type RepositoryType = (typeof ARGOCD_CONSTANTS.REPOSITORY_TYPES)[keyof typeof ARGOCD_CONSTANTS.REPOSITORY_TYPES];
