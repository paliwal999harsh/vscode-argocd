import { window, ProgressLocation, workspace } from 'vscode';
import * as yaml from 'js-yaml';
import { CommandServices } from '../../commands';

/**
 * View the manifest for a specific Kubernetes resource
 * Manifests are fetched lazily on first resource click and cached in the ApplicationItem
 */
export function viewResourceManifest(services: CommandServices) {
  return async (item: any) => {
    const { appService } = services;
    if (!item?.resource) {
      return;
    }

    const resource = item.resource;
    const parentApp = resource._parentApp;

    if (!parentApp) {
      window.showWarningMessage('Unable to locate parent application for this resource');
      return;
    }

    try {
      await window.withProgress(
        {
          location: ProgressLocation.Notification,
          title: `Loading manifest for ${resource.kind}/${resource.name}...`,
          cancellable: false
        },
        async () => {
          // Lazy load manifests on first access
          if (!parentApp.manifestsCache) {
            // Fetch all manifests for the application
            const manifestsYaml = await appService.getApplicationManifests(parentApp.application.metadata.name);

            // Parse manifests into a map for quick lookup
            const manifestDocs = yaml.loadAll(manifestsYaml) as any[];
            const manifestMap = new Map<string, any>();

            manifestDocs.forEach((doc: any) => {
              if (doc?.kind && doc.metadata?.name) {
                const key = `${doc.kind}/${doc.metadata.namespace || 'default'}/${doc.metadata.name}`;
                manifestMap.set(key, doc);
              }
            });

            // Cache the manifests in the parent ApplicationItem
            parentApp.manifestsCache = manifestMap;
          }

          // Get manifest from cache
          const key = `${resource.kind}/${resource.namespace || 'default'}/${resource.name}`;
          const manifest = parentApp.manifestsCache.get(key);

          if (!manifest) {
            window.showWarningMessage(`Manifest not found for ${resource.kind}/${resource.name}`);
            return;
          }

          // Convert to YAML and display
          const resourceYaml = yaml.dump(manifest, {
            indent: 2,
            lineWidth: -1,
            noRefs: true,
            sortKeys: false
          });

          const doc = await workspace.openTextDocument({
            content: resourceYaml,
            language: 'yaml'
          });

          await window.showTextDocument(doc);
        }
      );
    } catch (error) {
      window.showErrorMessage(`Failed to load resource manifest: ${error}`);
    }
  };
}
