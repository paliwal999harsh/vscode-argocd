/**
 * Helper utilities for converting between ArgoCD runtime objects and YAML manifest objects
 * Used for validation, code lens, and template generation
 */

import {
  Application,
  ApplicationMetadata,
  ApplicationSpec,
  ApplicationSource,
  HelmConfig,
  HelmParameter,
  ApplicationDestination,
  SyncPolicy,
  IgnoreDifference,
  ApplicationInfo
} from '../model/application';
import {
  ApplicationYaml,
  ApplicationYamlMetadata,
  ApplicationSpecYaml,
  ApplicationSourceYaml,
  HelmConfigYaml,
  ApplicationDestinationYaml,
  SyncPolicyYaml,
  IgnoreDifferenceYaml,
  InfoYaml
} from '../model/applicationYaml';
import { Repository } from '../model/repository';
import { RepositoryYaml } from '../model/repositoryYaml';

/**
 * Convert Application runtime object to ApplicationYaml manifest object
 */
export function applicationToYaml(app: Application): ApplicationYaml {
  return {
    apiVersion: 'argoproj.io/v1alpha1',
    kind: 'Application',
    metadata: applicationMetadataToYaml(app.metadata),
    spec: applicationSpecToYaml(app.spec)
  };
}

/**
 * Convert ApplicationYaml manifest object to Application runtime object
 */
export function yamlToApplication(yaml: ApplicationYaml): Application {
  return {
    metadata: yamlToApplicationMetadata(yaml.metadata),
    spec: yamlToApplicationSpec(yaml.spec),
    status: {
      sync: {
        status: 'Unknown',
        comparedTo: yaml.spec.source
          ? {
              source: yamlToApplicationSource(yaml.spec.source),
              destination: applicationDestinationToYaml(yaml.spec.destination)
            }
          : undefined
      },
      health: {
        status: 'Unknown'
      }
    }
  };
}

/**
 * Convert Application metadata to YAML metadata
 */
function applicationMetadataToYaml(metadata: ApplicationMetadata): ApplicationYamlMetadata {
  return {
    name: metadata.name,
    namespace: metadata.namespace,
    finalizers: metadata.annotations?.['argocd.argoproj.io/finalizers']?.split(','),
    labels: metadata.labels,
    annotations: metadata.annotations
  };
}

/**
 * Convert YAML metadata to Application metadata
 */
function yamlToApplicationMetadata(metadata: ApplicationYamlMetadata): ApplicationMetadata {
  const result: ApplicationMetadata = {
    name: metadata.name,
    namespace: metadata.namespace,
    labels: metadata.labels,
    annotations: metadata.annotations
  };

  if (metadata.finalizers && metadata.finalizers.length > 0) {
    result.annotations = {
      ...result.annotations,
      'argocd.argoproj.io/finalizers': metadata.finalizers.join(',')
    };
  }

  return result;
}

/**
 * Convert Application spec to YAML spec
 */
function applicationSpecToYaml(spec: ApplicationSpec): ApplicationSpecYaml {
  const result: ApplicationSpecYaml = {
    project: spec.project,
    destination: applicationDestinationToYaml(spec.destination)
  };

  if (spec.source) {
    result.source = applicationSourceToYaml(spec.source);
  }

  if (spec.syncPolicy) {
    result.syncPolicy = syncPolicyToYaml(spec.syncPolicy);
  }

  if (spec.ignoreDifferences) {
    result.ignoreDifferences = spec.ignoreDifferences.map(ignoreDifferenceToYaml);
  }

  if (spec.info) {
    result.info = spec.info.map(infoToYaml);
  }

  if (spec.revisionHistoryLimit !== undefined) {
    result.revisionHistoryLimit = spec.revisionHistoryLimit;
  }

  return result;
}

/**
 * Convert YAML spec to Application spec
 */
function yamlToApplicationSpec(spec: ApplicationSpecYaml): ApplicationSpec {
  const result: ApplicationSpec = {
    project: spec.project,
    source: spec.source
      ? yamlToApplicationSource(spec.source)
      : {
          repoURL: '',
          targetRevision: '',
          path: ''
        },
    destination: applicationDestinationToYaml(spec.destination)
  };

  if (spec.syncPolicy) {
    result.syncPolicy = yamlToSyncPolicy(spec.syncPolicy);
  }

  if (spec.ignoreDifferences) {
    result.ignoreDifferences = spec.ignoreDifferences.map(yamlToIgnoreDifference);
  }

  if (spec.info) {
    result.info = spec.info.map(infoToYaml);
  }

  if (spec.revisionHistoryLimit !== undefined) {
    result.revisionHistoryLimit = spec.revisionHistoryLimit;
  }

  return result;
}

/**
 * Convert Application source to YAML source
 */
function applicationSourceToYaml(source: ApplicationSource): ApplicationSourceYaml {
  const result: ApplicationSourceYaml = {
    repoURL: source.repoURL,
    targetRevision: source.targetRevision
  };

  if (source.path) {
    result.path = source.path;
  }

  if (source.chart) {
    result.chart = source.chart;
  }

  if (source.helm) {
    result.helm = helmConfigToYaml(source.helm);
  }

  return result;
}

/**
 * Convert YAML source to Application source
 */
function yamlToApplicationSource(source: ApplicationSourceYaml): ApplicationSource {
  const result: ApplicationSource = {
    repoURL: source.repoURL,
    targetRevision: source.targetRevision,
    path: source.path || source.chart || ''
  };

  if (source.chart) {
    result.chart = source.chart;
  }

  if (source.helm) {
    result.helm = yamlToHelmConfig(source.helm);
  }

  return result;
}

/**
 * Convert Helm config to YAML Helm config
 */
function helmConfigToYaml(helm: HelmConfig): HelmConfigYaml {
  const result: HelmConfigYaml = {};

  if (helm.parameters) {
    result.parameters = helm.parameters.map((p: HelmParameter) => ({
      name: p.name,
      value: p.value
    }));
  }

  if (helm.valuesObject) {
    result.valuesObject = helm.valuesObject;
  }

  return result;
}

/**
 * Convert YAML Helm config to Helm config
 */
function yamlToHelmConfig(helm: HelmConfigYaml): HelmConfig {
  const result: HelmConfig = {};

  if (helm.parameters) {
    result.parameters = helm.parameters.map((p: { name: string; value: string }) => ({
      name: p.name,
      value: p.value
    }));
  }

  if (helm.valuesObject) {
    result.valuesObject = helm.valuesObject;
  }

  return result;
}

/**
 * Convert Application destination to YAML destination
 */
function applicationDestinationToYaml(destination: ApplicationDestination): ApplicationDestinationYaml {
  return {
    server: destination.server,
    name: destination.name,
    namespace: destination.namespace
  };
}

/**
 * Convert sync policy to YAML sync policy
 */
function syncPolicyToYaml(policy: SyncPolicy): SyncPolicyYaml {
  const result: SyncPolicyYaml = {};

  if (policy.automated) {
    result.automated = {
      prune: policy.automated.prune,
      selfHeal: policy.automated.selfHeal
    };
  }

  if (policy.syncOptions) {
    result.syncOptions = policy.syncOptions;
  }

  if (policy.retry) {
    result.retry = {
      limit: policy.retry.limit,
      backoff: {
        duration: policy.retry.backoff.duration,
        maxDuration: policy.retry.backoff.maxDuration,
        factor: policy.retry.backoff.factor
      }
    };
  }

  return result;
}

/**
 * Convert YAML sync policy to sync policy
 */
function yamlToSyncPolicy(policy: SyncPolicyYaml): SyncPolicy {
  const result: SyncPolicy = {};

  if (policy.automated) {
    result.automated = {
      enabled: true,
      prune: policy.automated.prune ?? false,
      selfHeal: policy.automated.selfHeal ?? false
    };
  }

  if (policy.syncOptions) {
    result.syncOptions = policy.syncOptions;
  }

  if (policy.retry) {
    result.retry = {
      limit: policy.retry.limit ?? 5,
      backoff: {
        duration: policy.retry.backoff?.duration ?? '5s',
        maxDuration: policy.retry.backoff?.maxDuration ?? '3m',
        factor: policy.retry.backoff?.factor ?? 2
      }
    };
  }

  return result;
}

/**
 * Convert ignore difference to YAML ignore difference
 */
function ignoreDifferenceToYaml(diff: IgnoreDifference): IgnoreDifferenceYaml {
  return {
    group: diff.group,
    kind: diff.kind,
    jsonPointers: diff.jsonPointers
  };
}

/**
 * Convert YAML ignore difference to ignore difference
 */
function yamlToIgnoreDifference(diff: IgnoreDifferenceYaml): IgnoreDifference {
  return {
    group: diff.group || '',
    kind: diff.kind,
    jsonPointers: diff.jsonPointers || []
  };
}

/**
 * Convert info to YAML info
 */
function infoToYaml(info: ApplicationInfo): InfoYaml {
  return {
    name: info.name,
    value: info.value
  };
}

/**
 * Convert Repository runtime object to RepositoryYaml manifest object
 */
export function repositoryToYaml(repo: Repository): RepositoryYaml {
  return {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: repo.name || `repo-${Date.now()}`,
      namespace: 'argocd',
      labels: {
        'argocd.argoproj.io/secret-type': 'repository'
      }
    },
    type: 'Opaque',
    stringData: {
      url: repo.repo,
      type: repo.type,
      name: repo.name,
      username: repo.username,
      project: repo.project
    }
  };
}

/**
 * Convert RepositoryYaml manifest object to Repository runtime object
 */
export function yamlToRepository(yaml: RepositoryYaml): Repository {
  return {
    repo: yaml.stringData.url,
    type: yaml.stringData.type || 'git',
    name: yaml.stringData.name,
    username: yaml.stringData.username,
    project: yaml.stringData.project,
    connectionState: {
      status: 'Unknown',
      message: '',
      attemptedAt: new Date().toISOString()
    }
  };
}

/**
 * Validate Application YAML manifest
 * Returns array of validation errors, empty if valid
 */
export function validateApplicationYaml(yaml: ApplicationYaml): string[] {
  const errors: string[] = [];

  if (!yaml.apiVersion || yaml.apiVersion !== 'argoproj.io/v1alpha1') {
    errors.push('apiVersion must be "argoproj.io/v1alpha1"');
  }

  if (!yaml.kind || yaml.kind !== 'Application') {
    errors.push('kind must be "Application"');
  }

  if (!yaml.metadata?.name) {
    errors.push('metadata.name is required');
  }

  if (!yaml.metadata?.namespace) {
    errors.push('metadata.namespace is required');
  }

  if (!yaml.spec?.project) {
    errors.push('spec.project is required');
  }

  if (!yaml.spec?.source && !yaml.spec?.sources) {
    errors.push('spec.source or spec.sources is required');
  }

  if (yaml.spec?.source) {
    if (!yaml.spec.source.repoURL) {
      errors.push('spec.source.repoURL is required');
    }
    if (!yaml.spec.source.targetRevision) {
      errors.push('spec.source.targetRevision is required');
    }
  }

  if (yaml.spec?.destination) {
    if (!yaml.spec.destination.server && !yaml.spec.destination.name) {
      errors.push('spec.destination.server or spec.destination.name is required');
    }
    if (!yaml.spec.destination.namespace) {
      errors.push('spec.destination.namespace is required');
    }
  } else {
    errors.push('spec.destination is required');
  }

  return errors;
}

/**
 * Validate Repository YAML manifest
 * Returns array of validation errors, empty if valid
 */
export function validateRepositoryYaml(yaml: RepositoryYaml): string[] {
  const errors: string[] = [];

  if (!yaml.apiVersion || yaml.apiVersion !== 'v1') {
    errors.push('apiVersion must be "v1"');
  }

  if (!yaml.kind || yaml.kind !== 'Secret') {
    errors.push('kind must be "Secret"');
  }

  if (!yaml.metadata?.name) {
    errors.push('metadata.name is required');
  }

  if (!yaml.metadata?.labels?.['argocd.argoproj.io/secret-type']) {
    errors.push('metadata.labels["argocd.argoproj.io/secret-type"] must be "repository"');
  }

  if (!yaml.stringData?.url) {
    errors.push('stringData.url is required');
  }

  return errors;
}
