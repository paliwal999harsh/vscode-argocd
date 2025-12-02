export interface ArgocdApplication {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
  };
  spec: {
    project: string;
    source: {
      repoURL: string;
      path: string;
      targetRevision: string;
      helm?: {
        valueFiles?: string[];
        parameters?: Array<{
          name: string;
          value: string;
        }>;
      };
      kustomize?: {
        images?: string[];
      };
    };
    destination: {
      server: string;
      namespace: string;
    };
    syncPolicy?: {
      automated?: {
        prune: boolean;
        selfHeal: boolean;
      };
      syncOptions?: string[];
      retry?: {
        limit: number;
        backoff: {
          duration: string;
          maxDuration: string;
          factor: number;
        };
      };
    };
  };
  status?: {
    health: {
      status: 'Healthy' | 'Progressing' | 'Degraded' | 'Suspended' | 'Missing' | 'Unknown';
      message?: string;
    };
    sync: {
      status: 'Synced' | 'OutOfSync' | 'Unknown';
      revision: string;
      comparedTo?: {
        source: {
          repoURL: string;
          path: string;
          targetRevision: string;
        };
        destination: {
          server: string;
          namespace: string;
        };
      };
    };
    resources?: Array<{
      version: string;
      kind: string;
      namespace: string;
      name: string;
      status: 'Synced' | 'OutOfSync' | 'Unknown';
      health: {
        status: 'Healthy' | 'Progressing' | 'Degraded' | 'Suspended' | 'Missing' | 'Unknown';
        message?: string;
      };
    }>;
    history?: Array<{
      revision: string;
      deployedAt: string;
      id: number;
      source: {
        repoURL: string;
        path: string;
        targetRevision: string;
      };
    }>;
    operationState?: {
      operation: {
        sync: {
          revision: string;
        };
      };
      phase: 'Running' | 'Succeeded' | 'Failed' | 'Error' | 'Terminating';
      message?: string;
      startedAt: string;
      finishedAt?: string;
    };
  };
}

export interface ArgocdApplicationSet {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
  };
  spec: {
    generators: Array<{
      git?: {
        repoURL: string;
        revision: string;
        directories?: Array<{
          path: string;
        }>;
      };
      clusters?: {
        selector?: {
          matchLabels?: Record<string, string>;
        };
      };
      list?: {
        elements: Array<Record<string, any>>;
      };
    }>;
    template: {
      metadata: {
        name: string;
        labels?: Record<string, string>;
      };
      spec: {
        project: string;
        source: {
          repoURL: string;
          path: string;
          targetRevision: string;
        };
        destination: {
          server: string;
          namespace: string;
        };
        syncPolicy?: {
          automated?: {
            prune: boolean;
            selfHeal: boolean;
          };
        };
      };
    };
  };
  status?: {
    conditions?: Array<{
      type: string;
      status: string;
      message?: string;
      lastTransitionTime: string;
    }>;
  };
}

export interface ArgocdCluster {
  name: string;
  server: string;
  config: {
    bearerToken?: string;
    tlsClientConfig: {
      insecure: boolean;
      caData?: string;
      certData?: string;
      keyData?: string;
    };
  };
  connectionState: {
    status: 'Successful' | 'Failed' | 'Unknown';
    message?: string;
    attemptedAt: string;
  };
  serverVersion: string;
  info: {
    applicationsCount: number;
    serverVersion: string;
    cacheInfo?: {
      resourcesCount: number;
    };
  };
}

export interface ArgocdRepository {
  repo: string;
  username?: string;
  password?: string;
  sshPrivateKey?: string;
  insecure: boolean;
  enableLfs: boolean;
  tlsClientCertData?: string;
  tlsClientCertKey?: string;
  type: 'git' | 'helm' | 'oci';
  name?: string;
  connectionState: {
    status: 'Successful' | 'Failed' | 'Unknown';
    message?: string;
    attemptedAt: string;
  };
}

export type HealthStatus = 'Healthy' | 'Progressing' | 'Degraded' | 'Suspended' | 'Missing' | 'Unknown';
export type SyncStatus = 'Synced' | 'OutOfSync' | 'Unknown';
export type ConnectionStatus = 'Successful' | 'Failed' | 'Unknown';
