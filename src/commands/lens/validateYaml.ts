import { ApplicationYaml } from '../../model';
import { YamlHelper, ErrorHelper } from '../../utils';
import * as vscode from 'vscode';
import * as fs from 'fs';

/**
 * Validates YAML syntax in a file
 * @param uri File URI
 */
export async function validateYaml(uri: vscode.Uri): Promise<void> {
  try {
    const content = fs.readFileSync(uri.fsPath, 'utf-8');
    const validation = YamlHelper.validateYaml(content);

    if (!validation.valid) {
      vscode.window.showErrorMessage(`Invalid YAML:\n${validation.error}`, { modal: true });
      return;
    }

    const resources = YamlHelper.detectArgoCDResources(content);

    if (resources.length === 0) {
      vscode.window.showInformationMessage('Valid YAML (no ArgoCD resources detected)');
      return;
    }

    // Validate each ArgoCD Application resource against the model
    const validationErrors: string[] = [];
    const validResources: any[] = [];

    for (const resource of resources) {
      if (resource.kind === 'Application') {
        try {
          // Parse the YAML and validate structure
          const yaml = require('js-yaml');
          const parsed = yaml.load(content) as ApplicationYaml;

          // Validate required fields according to ApplicationYaml model
          const errors: string[] = [];

          // Check apiVersion
          if (parsed.apiVersion !== 'argoproj.io/v1alpha1') {
            errors.push(`Invalid apiVersion: expected 'argoproj.io/v1alpha1', got '${parsed.apiVersion}'`);
          }

          // Check kind
          if (parsed.kind !== 'Application') {
            errors.push(`Invalid kind: expected 'Application', got '${parsed.kind}'`);
          }

          // Check metadata
          if (!parsed.metadata) {
            errors.push('Missing required field: metadata');
          } else {
            if (!parsed.metadata.name) {
              errors.push('Missing required field: metadata.name');
            }
            if (!parsed.metadata.namespace) {
              errors.push('Missing required field: metadata.namespace');
            }
          }

          // Check spec
          if (!parsed.spec) {
            errors.push('Missing required field: spec');
          } else {
            if (!parsed.spec.project) {
              errors.push('Missing required field: spec.project');
            }

            // Check source or sources
            if (!parsed.spec.source && !parsed.spec.sources) {
              errors.push('Missing required field: spec.source or spec.sources');
            } else if (parsed.spec.source) {
              // Validate source structure
              if (!parsed.spec.source.repoURL) {
                errors.push('Missing required field: spec.source.repoURL');
              }
              if (!parsed.spec.source.targetRevision) {
                errors.push('Missing required field: spec.source.targetRevision');
              }
              // Must have either path or chart
              if (!parsed.spec.source.path && !parsed.spec.source.chart) {
                errors.push('spec.source must have either path or chart field');
              }
            }

            // Check destination
            if (!parsed.spec.destination) {
              errors.push('Missing required field: spec.destination');
            } else {
              if (!parsed.spec.destination.namespace) {
                errors.push('Missing required field: spec.destination.namespace');
              }
              // Must have either server or name
              if (!parsed.spec.destination.server && !parsed.spec.destination.name) {
                errors.push('spec.destination must have either server or name field');
              }
            }
          }

          if (errors.length > 0) {
            validationErrors.push(`Application "${resource.name || '(unnamed)'}":\n  ${errors.join('\n  ')}`);
          } else {
            validResources.push(resource);
          }
        } catch (error) {
          validationErrors.push(`Application "${resource.name || '(unnamed)'}": Failed to validate - ${error}`);
        }
      } else {
        // For non-Application resources (like ApplicationSet), just mark as valid
        validResources.push(resource);
      }
    }

    // Show validation results
    if (validationErrors.length > 0) {
      const errorMessage = `Validation Errors:\n\n${validationErrors.join('\n\n')}`;
      vscode.window.showErrorMessage(errorMessage, { modal: true });
    } else {
      const resourceList = validResources.map((r) => `  • ${r.kind}: ${r.name || '(unnamed)'}`).join('\n');

      vscode.window.showInformationMessage(
        `Valid YAML - All ArgoCD Application resources validated\n\nDetected resources:\n${resourceList}`,
        { modal: false }
      );
    }
  } catch (error) {
    ErrorHelper.showErrorMessage(error, 'validateYaml');
  }
}
