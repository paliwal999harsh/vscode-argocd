/**
 * YAML manifest models for ArgoCD Repository
 * These interfaces represent the declarative YAML structure
 * Used for validation, code lens, and template generation
 */

/**
 * Repository metadata for YAML manifest
 */
export interface RepositoryYamlMetadata {
  name?: string;
  namespace?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

/**
 * TLS client configuration for repository
 */
export interface RepositoryTLSClientConfig {
  insecure?: boolean;
  clientCert?: string;
  clientKey?: string;
  caData?: string;
  serverName?: string;
}

/**
 * GitHub App credentials
 */
export interface GitHubAppCreds {
  id: string;
  installationId: string;
  privateKey?: string;
  privateKeySecret?: {
    name: string;
    key: string;
  };
}

/**
 * Google Cloud Source configuration
 */
export interface GCPConfig {
  gcpServiceAccountKey?: string;
  gcpServiceAccountKeySecret?: {
    name: string;
    key: string;
  };
}

/**
 * Repository credentials reference
 */
export interface RepoCredsRef {
  name: string;
}

/**
 * Repository spec for YAML manifest
 */
export interface RepositorySpecYaml {
  /**
   * Repository URL
   */
  url: string;

  /**
   * Repository type: git, helm, or oci
   */
  type?: 'git' | 'helm' | 'oci';

  /**
   * Repository name (optional)
   */
  name?: string;

  /**
   * Username for authentication
   */
  username?: string;

  /**
   * Password for authentication (not recommended, use passwordSecret instead)
   */
  password?: string;

  /**
   * Password secret reference
   */
  passwordSecret?: {
    name: string;
    key: string;
  };

  /**
   * SSH private key for authentication
   */
  sshPrivateKey?: string;

  /**
   * SSH private key secret reference
   */
  sshPrivateKeySecret?: {
    name: string;
    key: string;
  };

  /**
   * TLS client configuration
   */
  tlsClientConfig?: RepositoryTLSClientConfig;

  /**
   * Enable insecure connections
   */
  insecure?: boolean;

  /**
   * Enable Git LFS support
   */
  enableLFS?: boolean;

  /**
   * GitHub App credentials
   */
  githubAppCreds?: GitHubAppCreds;

  /**
   * GitHub App credentials secret reference
   */
  githubAppCredsSecret?: {
    name: string;
    key: string;
  };

  /**
   * Google Cloud Source configuration
   */
  gcpConfig?: GCPConfig;

  /**
   * Proxy URL for repository access
   */
  proxy?: string;

  /**
   * Reference to repository credentials
   */
  repoCredsRef?: RepoCredsRef;

  /**
   * Project assignment (for multi-tenancy)
   */
  project?: string;

  /**
   * Enable OCI support
   */
  enableOCI?: boolean;

  /**
   * Force HTTP basic authentication
   */
  forceHttpBasicAuth?: boolean;
}

/**
 * Complete Repository YAML manifest
 * Represents the declarative ArgoCD Repository resource
 * Can be used as a Secret (preferred) or as a ConfigMap
 */
export interface RepositoryYaml {
  apiVersion: 'v1';
  kind: 'Secret';
  metadata: RepositoryYamlMetadata;
  type: 'Opaque';
  stringData: {
    /**
     * Repository URL
     */
    url: string;

    /**
     * Repository type: git, helm, or oci
     */
    type?: string;

    /**
     * Repository name
     */
    name?: string;

    /**
     * Username for authentication
     */
    username?: string;

    /**
     * Password for authentication
     */
    password?: string;

    /**
     * SSH private key
     */
    sshPrivateKey?: string;

    /**
     * Enable insecure connections
     */
    insecure?: string;

    /**
     * Enable Git LFS
     */
    enableLFS?: string;

    /**
     * TLS client certificate
     */
    tlsClientCert?: string;

    /**
     * TLS client key
     */
    tlsClientKey?: string;

    /**
     * TLS CA certificate
     */
    tlsCACert?: string;

    /**
     * GitHub App ID
     */
    githubAppID?: string;

    /**
     * GitHub App installation ID
     */
    githubAppInstallationID?: string;

    /**
     * GitHub App private key
     */
    githubAppPrivateKey?: string;

    /**
     * GCP service account key
     */
    gcpServiceAccountKey?: string;

    /**
     * Proxy URL
     */
    proxy?: string;

    /**
     * Project assignment
     */
    project?: string;

    /**
     * Enable OCI
     */
    enableOCI?: string;
  };
}

/**
 * Repository credentials template YAML manifest
 * Used for configuring credentials that can be shared across multiple repositories
 */
export interface RepositoryCredentialsYaml {
  apiVersion: 'v1';
  kind: 'Secret';
  metadata: RepositoryYamlMetadata;
  type: 'Opaque';
  stringData: {
    /**
     * URL pattern (can use wildcards)
     */
    url: string;

    /**
     * Username for authentication
     */
    username?: string;

    /**
     * Password for authentication
     */
    password?: string;

    /**
     * SSH private key
     */
    sshPrivateKey?: string;

    /**
     * TLS client certificate
     */
    tlsClientCert?: string;

    /**
     * TLS client key
     */
    tlsClientKey?: string;

    /**
     * TLS CA certificate
     */
    tlsCACert?: string;

    /**
     * GitHub App ID
     */
    githubAppID?: string;

    /**
     * GitHub App installation ID
     */
    githubAppInstallationID?: string;

    /**
     * GitHub App private key
     */
    githubAppPrivateKey?: string;

    /**
     * GCP service account key
     */
    gcpServiceAccountKey?: string;

    /**
     * Enable OCI
     */
    enableOCI?: string;
  };
}
