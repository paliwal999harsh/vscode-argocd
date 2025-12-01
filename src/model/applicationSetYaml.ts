/**
 * YAML manifest models for ArgoCD ApplicationSet
 * These interfaces represent the declarative YAML structure
 * Used for validation, code lens, and template generation
 */

import {
  ApplicationDestinationYaml,
  ApplicationSourceYaml,
  SyncPolicyYaml,
  IgnoreDifferenceYaml,
  InfoYaml
} from './applicationYaml';

/**
 * ApplicationSet metadata for YAML manifest
 */
export interface ApplicationSetYamlMetadata {
  name: string;
  namespace: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

/**
 * List generator element
 */
export interface ListGeneratorElement {
  cluster?: string;
  url?: string;
  values?: Record<string, string>;
  [key: string]: any;
}

/**
 * List generator
 */
export interface ListGenerator {
  elements: ListGeneratorElement[];
  elementsYaml?: string;
  template?: ApplicationSetTemplate;
}

/**
 * Cluster generator selector
 */
export interface ClusterGeneratorSelector {
  matchLabels?: Record<string, string>;
  matchExpressions?: Array<{
    key: string;
    operator: string;
    values?: string[];
  }>;
}

/**
 * Cluster generator
 */
export interface ClusterGenerator {
  selector?: ClusterGeneratorSelector;
  template?: ApplicationSetTemplate;
  values?: Record<string, string>;
}

/**
 * Git directory generator
 */
export interface GitDirectoryGenerator {
  repoURL: string;
  revision?: string;
  directories?: Array<{
    path: string;
    exclude?: boolean;
  }>;
  exclude?: boolean;
}

/**
 * Git file generator
 */
export interface GitFileGenerator {
  repoURL: string;
  revision?: string;
  files?: Array<{
    path: string;
  }>;
}

/**
 * SCM provider generator
 */
export interface SCMProviderGenerator {
  github?: {
    organization: string;
    api?: string;
    tokenRef?: {
      secretName: string;
      key: string;
    };
    allBranches?: boolean;
  };
  gitlab?: {
    group: string;
    api?: string;
    tokenRef?: {
      secretName: string;
      key: string;
    };
    allBranches?: boolean;
    includeSubgroups?: boolean;
  };
  gitea?: {
    owner: string;
    api: string;
    tokenRef?: {
      secretName: string;
      key: string;
    };
    allBranches?: boolean;
    insecure?: boolean;
  };
  bitbucketServer?: {
    project: string;
    api: string;
    tokenRef?: {
      secretName: string;
      key: string;
    };
    allBranches?: boolean;
  };
  filters?: Array<{
    repositoryMatch?: string;
    pathsExist?: string[];
    pathsDoNotExist?: string[];
    labelMatch?: string;
    branchMatch?: string;
  }>;
  cloneProtocol?: 'ssh' | 'https';
  template?: ApplicationSetTemplate;
  values?: Record<string, string>;
}

/**
 * Pull request generator
 */
export interface PullRequestGenerator {
  github?: {
    owner: string;
    repo: string;
    api?: string;
    tokenRef?: {
      secretName: string;
      key: string;
    };
    labels?: string[];
  };
  gitlab?: {
    project: string;
    api?: string;
    tokenRef?: {
      secretName: string;
      key: string;
    };
    labels?: string[];
    pullRequestState?: string;
  };
  gitea?: {
    owner: string;
    repo: string;
    api: string;
    tokenRef?: {
      secretName: string;
      key: string;
    };
    insecure?: boolean;
  };
  bitbucketServer?: {
    project: string;
    repo: string;
    api: string;
    tokenRef?: {
      secretName: string;
      key: string;
    };
  };
  filters?: Array<{
    branchMatch?: string;
  }>;
  requeueAfterSeconds?: number;
  template?: ApplicationSetTemplate;
}

/**
 * Matrix generator
 */
export interface MatrixGenerator {
  generators: ApplicationSetGenerator[];
  template?: ApplicationSetTemplate;
}

/**
 * Merge generator
 */
export interface MergeGenerator {
  generators: ApplicationSetGenerator[];
  mergeKeys: string[];
  template?: ApplicationSetTemplate;
}

/**
 * Cluster decision resource generator
 */
export interface ClusterDecisionResourceGenerator {
  configMapRef: string;
  name?: string;
  requeueAfterSeconds?: number;
  labelSelector?: {
    matchLabels?: Record<string, string>;
    matchExpressions?: Array<{
      key: string;
      operator: string;
      values?: string[];
    }>;
  };
  template?: ApplicationSetTemplate;
  values?: Record<string, string>;
}

/**
 * Plugin generator
 */
export interface PluginGenerator {
  configMapRef: {
    name: string;
  };
  input?: {
    parameters?: Record<string, any>;
  };
  requeueAfterSeconds?: number;
  template?: ApplicationSetTemplate;
  values?: Record<string, string>;
}

/**
 * ApplicationSet generator
 */
export interface ApplicationSetGenerator {
  list?: ListGenerator;
  clusters?: ClusterGenerator;
  git?: {
    repoURL: string;
    revision?: string;
    directories?: GitDirectoryGenerator[];
    files?: GitFileGenerator[];
  };
  scmProvider?: SCMProviderGenerator;
  clusterDecisionResource?: ClusterDecisionResourceGenerator;
  pullRequest?: PullRequestGenerator;
  matrix?: MatrixGenerator;
  merge?: MergeGenerator;
  selector?: {
    matchLabels?: Record<string, string>;
    matchExpressions?: Array<{
      key: string;
      operator: string;
      values?: string[];
    }>;
  };
  plugin?: PluginGenerator;
}

/**
 * ApplicationSet template metadata
 */
export interface ApplicationSetTemplateMetadata {
  name?: string;
  namespace?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  finalizers?: string[];
}

/**
 * ApplicationSet template spec
 */
export interface ApplicationSetTemplateSpec {
  project?: string;
  source?: ApplicationSourceYaml;
  sources?: ApplicationSourceYaml[];
  destination?: ApplicationDestinationYaml;
  syncPolicy?: SyncPolicyYaml;
  ignoreDifferences?: IgnoreDifferenceYaml[];
  info?: InfoYaml[];
  revisionHistoryLimit?: number;
}

/**
 * ApplicationSet template
 */
export interface ApplicationSetTemplate {
  metadata: ApplicationSetTemplateMetadata;
  spec: ApplicationSetTemplateSpec;
}

/**
 * Template patch
 */
export interface TemplatePatch {
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
  type?: string;
}

/**
 * ApplicationSet strategy (progressive sync)
 */
export interface ApplicationSetStrategy {
  type?: 'AllAtOnce' | 'RollingSync';
  rollingSync?: {
    steps?: Array<{
      matchExpressions?: Array<{
        key: string;
        operator: string;
        values?: string[];
      }>;
      maxUpdate?: number | string;
    }>;
  };
}

/**
 * Preserve resources on deletion
 */
export interface PreserveResourcesOnDeletion {
  enabled?: boolean;
}

/**
 * ApplicationSet spec for YAML manifest
 */
export interface ApplicationSetSpecYaml {
  generators: ApplicationSetGenerator[];
  template?: ApplicationSetTemplate;
  goTemplate?: boolean;
  goTemplateOptions?: string[];
  syncPolicy?: {
    preserveResourcesOnDeletion?: boolean;
    applicationsSync?: 'create-only' | 'create-update' | 'create-delete' | 'sync';
  };
  strategy?: ApplicationSetStrategy;
  templatePatch?: string;
  applyNestedSelectors?: boolean;
  ignoreApplicationDifferences?: Array<{
    name?: string;
    jqPathExpressions?: string[];
    jsonPointers?: string[];
  }>;
}

/**
 * Complete ApplicationSet YAML manifest
 * Represents the declarative ArgoCD ApplicationSet resource
 */
export interface ApplicationSetYaml {
  apiVersion: 'argoproj.io/v1alpha1';
  kind: 'ApplicationSet';
  metadata: ApplicationSetYamlMetadata;
  spec: ApplicationSetSpecYaml;
}
