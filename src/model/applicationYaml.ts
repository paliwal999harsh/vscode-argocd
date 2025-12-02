/**
 * YAML manifest models for ArgoCD Application
 * These interfaces represent the declarative YAML structure
 * Used for validation, code lens, and template generation
 */

/**
 * Application metadata for YAML manifest
 */
export interface ApplicationYamlMetadata {
  name: string;
  namespace: string;
  finalizers?: string[];
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

/**
 * Helm parameter for YAML manifest
 */
export interface HelmParameterYaml {
  name: string;
  value: string;
  forceString?: boolean;
}

/**
 * Jsonnet external variable
 */
export interface JsonnetVar {
  name: string;
  value: string;
  code?: boolean;
}

/**
 * Directory/Jsonnet configuration
 */
export interface DirectoryConfig {
  recurse?: boolean;
  jsonnet?: {
    extVars?: JsonnetVar[];
    tlas?: JsonnetVar[];
    libs?: string[];
  };
  exclude?: string;
  include?: string;
}

/**
 * Kustomize patch configuration
 */
export interface KustomizePatch {
  target?: {
    kind?: string;
    name?: string;
    namespace?: string;
    group?: string;
    version?: string;
    labelSelector?: string;
    annotationSelector?: string;
  };
  patch?: string;
  path?: string;
  options?: Record<string, boolean>;
}

/**
 * Kustomize replica configuration
 */
export interface KustomizeReplica {
  name: string;
  count: number | string;
}

/**
 * Kustomize configuration for YAML manifest
 */
export interface KustomizeConfig {
  version?: string;
  namePrefix?: string;
  nameSuffix?: string;
  commonLabels?: Record<string, string>;
  commonAnnotations?: Record<string, string>;
  commonAnnotationsEnvsubst?: boolean;
  labelWithoutSelector?: boolean;
  labelIncludeTemplates?: boolean;
  forceCommonLabels?: boolean;
  forceCommonAnnotations?: boolean;
  images?: string[];
  namespace?: string;
  replicas?: KustomizeReplica[];
  components?: string[];
  ignoreMissingComponents?: boolean;
  patches?: KustomizePatch[];
  kubeVersion?: string;
  apiVersions?: string[];
}

/**
 * Helm configuration for YAML manifest
 */
export interface HelmConfigYaml {
  passCredentials?: boolean;
  parameters?: HelmParameterYaml[];
  releaseName?: string;
  valueFiles?: string[];
  ignoreMissingValueFiles?: boolean;
  valuesObject?: Record<string, any>;
  values?: string;
  fileParameters?: Array<{
    name: string;
    path: string;
  }>;
  skipCrds?: boolean;
  skipSchemaValidation?: boolean;
  version?: string;
  kubeVersion?: string;
  namespace?: string;
}

/**
 * Plugin configuration
 */
export interface PluginConfig {
  name: string;
  env?: Array<{
    name: string;
    value: string;
  }>;
  parameters?: Array<{
    name?: string;
    string?: string;
    array?: string[];
    map?: Record<string, string>;
  }>;
}

/**
 * Application source for YAML manifest
 */
export interface ApplicationSourceYaml {
  repoURL: string;
  targetRevision: string;
  path?: string;
  chart?: string;
  helm?: HelmConfigYaml;
  kustomize?: KustomizeConfig;
  directory?: DirectoryConfig;
  plugin?: PluginConfig;
  ref?: string;
}

/**
 * Application destination for YAML manifest
 */
export interface ApplicationDestinationYaml {
  server?: string;
  name?: string;
  namespace: string;
}

/**
 * Automated sync policy for YAML manifest
 */
export interface AutomatedSyncPolicyYaml {
  prune?: boolean;
  selfHeal?: boolean;
  allowEmpty?: boolean;
}

/**
 * Retry backoff for YAML manifest
 */
export interface RetryBackoffYaml {
  duration?: string;
  factor?: number;
  maxDuration?: string;
}

/**
 * Retry policy for YAML manifest
 */
export interface RetryPolicyYaml {
  limit?: number;
  backoff?: RetryBackoffYaml;
}

/**
 * Managed namespace metadata
 */
export interface ManagedNamespaceMetadata {
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

/**
 * Sync policy for YAML manifest
 */
export interface SyncPolicyYaml {
  automated?: AutomatedSyncPolicyYaml;
  syncOptions?: string[];
  retry?: RetryPolicyYaml;
  managedNamespaceMetadata?: ManagedNamespaceMetadata;
}

/**
 * Ignore difference configuration
 */
export interface IgnoreDifferenceYaml {
  group?: string;
  kind: string;
  name?: string;
  namespace?: string;
  jsonPointers?: string[];
  jqPathExpressions?: string[];
  managedFieldsManagers?: string[];
}

/**
 * Info annotation
 */
export interface InfoYaml {
  name: string;
  value: string;
}

/**
 * Sync window configuration
 */
export interface SyncWindow {
  kind?: string;
  schedule?: string;
  duration?: string;
  applications?: string[];
  namespaces?: string[];
  clusters?: string[];
  manualSync?: boolean;
  timeZone?: string;
}

/**
 * Resource action parameter
 */
export interface ResourceActionParam {
  name: string;
  value?: string;
  array?: string[];
  map?: Record<string, string>;
}

/**
 * Application spec for YAML manifest
 */
export interface ApplicationSpecYaml {
  project: string;
  source?: ApplicationSourceYaml;
  sources?: ApplicationSourceYaml[];
  destination: ApplicationDestinationYaml;
  syncPolicy?: SyncPolicyYaml;
  ignoreDifferences?: IgnoreDifferenceYaml[];
  info?: InfoYaml[];
  revisionHistoryLimit?: number;
}

/**
 * Complete Application YAML manifest
 * Represents the declarative ArgoCD Application resource
 */
export interface ApplicationYaml {
  apiVersion: 'argoproj.io/v1alpha1';
  kind: 'Application';
  metadata: ApplicationYamlMetadata;
  spec: ApplicationSpecYaml;
}
