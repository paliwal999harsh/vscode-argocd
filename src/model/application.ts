/**
 * Managed field entry in metadata
 */
export interface ManagedFieldEntry {
  apiVersion: string;
  fieldsType: string;
  fieldsV1: Record<string, any>;
  manager: string;
  operation: string;
  time: string;
}

/**
 * Application metadata
 */
export interface ApplicationMetadata {
  name: string;
  namespace: string;
  uid?: string;
  resourceVersion?: string;
  generation?: number;
  creationTimestamp?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  managedFields?: ManagedFieldEntry[];
}

/**
 * Helm parameters for source configuration
 */
export interface HelmParameter {
  name: string;
  value: string;
}

/**
 * Helm configuration for application source
 */
export interface HelmConfig {
  parameters?: HelmParameter[];
  valuesObject?: Record<string, any>;
}

/**
 * Application source configuration
 */
export interface ApplicationSource {
  repoURL: string;
  targetRevision: string;
  path?: string;
  chart?: string;
  helm?: HelmConfig;
}

/**
 * Application destination configuration
 */
export interface ApplicationDestination {
  server?: string;
  name?: string;
  namespace: string;
}

/**
 * Automated sync policy settings
 */
export interface AutomatedSyncPolicy {
  enabled: boolean;
  prune?: boolean;
  selfHeal?: boolean;
}

/**
 * Retry backoff configuration
 */
export interface RetryBackoff {
  duration: string;
  maxDuration: string;
  factor: number;
}

/**
 * Retry policy configuration
 */
export interface RetryPolicy {
  limit: number;
  backoff: RetryBackoff;
}

/**
 * Sync policy configuration
 */
export interface SyncPolicy {
  automated?: AutomatedSyncPolicy;
  syncOptions?: string[];
  retry?: RetryPolicy;
}

/**
 * Ignore differences configuration
 */
export interface IgnoreDifference {
  group: string;
  kind: string;
  jsonPointers: string[];
}

/**
 * Application info annotation
 */
export interface ApplicationInfo {
  name: string;
  value: string;
}

/**
 * Application specification
 */
export interface ApplicationSpec {
  project: string;
  source: ApplicationSource;
  destination: ApplicationDestination;
  syncPolicy?: SyncPolicy;
  ignoreDifferences?: IgnoreDifference[];
  info?: ApplicationInfo[];
  revisionHistoryLimit?: number;
}

/**
 * Resource health information
 */
export interface ResourceHealth {
  status: string;
  message?: string;
  lastTransitionTime?: string;
}

type SyncStatusType = 'Synced' | 'OutOfSync' | 'Unknown';

/**
 * Resource sync information
 */
export interface ResourceSync {
  status: SyncStatusType;
  revision?: string;
}

/**
 * Application resource reference
 */
export interface ApplicationResource {
  group?: string;
  version?: string;
  kind: string;
  name: string;
  namespace?: string;
  status?: SyncStatusType;
  health?: ResourceHealth;
  syncWave?: number;
  hookPhase?: string;
  message?: string;
  syncPhase?: string;
}

/**
 * Comparison information for sync status
 */
export interface ComparedTo {
  source: ApplicationSource;
  destination: ApplicationDestination;
}

/**
 * Sync status information
 */
export interface SyncStatus {
  status: 'Synced' | 'OutOfSync' | 'Unknown';
  comparedTo?: ComparedTo;
  revision?: string;
}

/**
 * Application health status
 */
export interface ApplicationHealth {
  status: 'Healthy' | 'Progressing' | 'Degraded' | 'Suspended' | 'Missing' | 'Unknown';
  message?: string;
  lastTransitionTime?: string;
}

/**
 * Sync operation initiator information
 */
export interface OperationInitiator {
  username?: string;
  automated?: boolean;
}

/**
 * Sync operation details
 */
export interface SyncOperation {
  revision?: string;
  prune?: boolean;
  dryRun?: boolean;
  syncOptions?: string[];
  resources?: ApplicationResource[];
  autoHealAttemptsCount?: number;
}

/**
 * Operation details
 */
export interface Operation {
  sync?: SyncOperation;
  initiatedBy?: OperationInitiator;
  retry?: RetryPolicy;
}

/**
 * Sync result information
 */
export interface SyncResult {
  resources: ApplicationResource[];
  revision: string;
  source: ApplicationSource;
}

/**
 * Operation state information
 */
export interface OperationState {
  operation: Operation;
  phase: 'Running' | 'Succeeded' | 'Failed' | 'Error' | 'Terminating';
  message?: string;
  syncResult?: SyncResult;
  startedAt: string;
  finishedAt?: string;
}

/**
 * Revision history entry
 */
export interface RevisionHistory {
  id: number;
  revision: string;
  source: ApplicationSource;
  deployedAt: string;
  deployStartedAt?: string;
  initiatedBy?: OperationInitiator;
}

/**
 * Application summary information
 */
export interface ApplicationSummary {
  externalURLs?: string[];
  images?: string[];
}

/**
 * Source hydrator information (placeholder)
 */
export interface SourceHydrator {
  [key: string]: any;
}

/**
 * Application status
 */
export interface ApplicationStatus {
  resources?: ApplicationResource[];
  sync: SyncStatus;
  health: ApplicationHealth;
  history?: RevisionHistory[];
  reconciledAt?: string;
  operationState?: OperationState;
  sourceType?: string;
  summary?: ApplicationSummary;
  resourceHealthSource?: string;
  controllerNamespace?: string;
  sourceHydrator?: SourceHydrator;
}

/**
 * Application information from ArgoCD
 */
export interface Application {
  metadata: ApplicationMetadata;
  spec: ApplicationSpec;
  status: ApplicationStatus;
}
