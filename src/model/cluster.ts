/**
 * TLS client configuration for cluster connection
 */
export interface TLSClientConfig {
    insecure: boolean;
    certData?: string;
    keyData?: string;
    caData?: string;
}

/**
 * Cluster configuration settings
 */
export interface ClusterConfig {
    tlsClientConfig?: TLSClientConfig;
}

/**
 * Connection state information for a cluster
 */
export interface ClusterConnectionState {
    status: 'Successful' | 'Failed' | 'Unknown';
    message: string;
    attemptedAt: string;
}

/**
 * Application reference in cluster info
 */
export interface ClusterApplication {
    name: string;
    namespace?: string;
}

/**
 * Cache information for cluster resources
 */
export interface ClusterCacheInfo {
    apisCount?: number;
    resourcesCount?: number;
    lastCacheSyncTime?: string;
}

/**
 * Detailed cluster information
 */
export interface ClusterInfo {
    serverVersion?: string;
    applicationsCount?: number;
    applications?: ClusterApplication[];
    apiVersions?: string[];
    cacheInfo?: ClusterCacheInfo;
    connectionState?: ClusterConnectionState;
}

/**
 * Cluster information from ArgoCD
 */
export interface Cluster {
    name: string;
    server: string;
    serverVersion?: string;
    config?: ClusterConfig;
    connectionState?: ClusterConnectionState;
    info?: ClusterInfo;
}