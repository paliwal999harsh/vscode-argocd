import { window } from 'vscode';
import { CommandServices, CommandProviders } from '../../commands';
import { ApplicationItem } from '../../views/nodes';
import * as yaml from 'js-yaml';

/**
 * Create a template from an application
 */
export function createTemplateFromApplication(services: CommandServices, providers: CommandProviders) {
  return async (item: ApplicationItem) => {
    const { appService } = services;
    const { templatesProvider } = providers;

    if (!item || !(item instanceof ApplicationItem)) {
      return;
    }

    const app = item.application;
    const appName = app.metadata.name;

    const templateName = await window.showInputBox({
      prompt: 'Enter template name',
      value: `${appName}-template`,
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Template name is required';
        }
        const existing = templatesProvider.getAllTemplates().find((t) => t.name === value.trim());
        if (existing) {
          return 'A template with this name already exists';
        }
        return null;
      }
    });

    if (!templateName) {
      return;
    }

    const description = await window.showInputBox({
      prompt: 'Enter template description (optional)',
      placeHolder: 'Description of this template'
    });

    try {
      // Get the application YAML directly from ArgoCD CLI
      const yamlContent = await appService.getApplicationYaml(appName);

      if (!yamlContent) {
        window.showErrorMessage('Failed to get application YAML');
        return;
      }

      // Filter the YAML to remove unwanted fields
      const filteredYaml = filterApplicationYaml(yamlContent);

      const template = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: templateName.trim(),
        type: 'application' as const,
        description: description?.trim(),
        template: filteredYaml,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await templatesProvider.addTemplate(template);
      window.showInformationMessage(`Template "${templateName}" created successfully`);
    } catch (error) {
      window.showErrorMessage(`Failed to create template: ${error}`);
    }
  };
}

/**
 * Helper function to filter application YAML
 */
function filterApplicationYaml(yamlString: string): string {
  try {
    // Parse YAML to object
    const doc = yaml.load(yamlString) as any;

    if (!doc) {
      return yamlString;
    }

    // Ensure apiVersion and kind are present
    if (!doc.apiVersion) {
      doc.apiVersion = 'argoproj.io/v1alpha1';
    }
    if (!doc.kind) {
      doc.kind = 'Application';
    }

    // Remove status section entirely
    delete doc.status;

    // Filter metadata fields
    if (doc.metadata) {
      // Remove unwanted metadata fields
      delete doc.metadata.resourceVersion;
      delete doc.metadata.uid;
      delete doc.metadata.generation;
      delete doc.metadata.creationTimestamp;
      delete doc.metadata.selfLink;
      delete doc.metadata.managedFields;
      delete doc.metadata.finalizers;

      // Remove last-applied-configuration from annotations
      if (doc.metadata.annotations) {
        delete doc.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'];

        // Remove annotations object if empty
        if (Object.keys(doc.metadata.annotations).length === 0) {
          delete doc.metadata.annotations;
        }
      }
    }

    // Convert back to YAML with proper ordering
    const orderedDoc: any = {
      apiVersion: doc.apiVersion,
      kind: doc.kind,
      metadata: doc.metadata,
      spec: doc.spec
    };

    return yaml.dump(orderedDoc, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false
    });
  } catch (error) {
    console.error('Failed to filter YAML:', error);
    return yamlString;
  }
}
