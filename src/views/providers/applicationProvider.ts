import * as vscode from 'vscode';
import { BaseProvider } from './baseProvider';
import { AppService, ClusterService, RepoService, ConfigurationService } from '../../services';
import { ContextKeys } from '../../utils';
import { Cluster, Repository } from '../../model';
import {
  ApplicationItem,
  ApplicationSetItem,
  ApplicationHealthItem,
  ApplicationSyncItem,
  NamespaceGroupItem,
  KindGroupItem,
  ResourceItem,
  ArgocdItem
} from '../nodes';

/**
 * Tree data provider for ArgoCD Application (applications and application sets).
 * Displays applications, application sets, and their Kubernetes resources.
 * Supports syncing, refreshing, and managing application lifecycle.
 */
export class ApplicationsProvider extends BaseProvider<ArgocdItem> {
  private clustersCache: Cluster[] = [];
  private reposCache: Repository[] = [];

  constructor(
    private appService: AppService,
    private configService: ConfigurationService,
    private clusterService: ClusterService,
    private repoService: RepoService
  ) {
    super();
    this.initializeCaches();
  }

  async initializeCaches(): Promise<void> {
    this.clustersCache = await this.clusterService.getClusters();
    this.reposCache = await this.repoService.getRepositories();
  }

  protected getProviderName(): string {
    return 'ApplicationsProvider';
  }

  async getChildren(element?: ArgocdItem): Promise<ArgocdItem[]> {
    this.logDebug(`Getting children${element ? ' for ' + element.label : ' (root)'}`);

    if (!element) {
      // Root level - show applications and application sets
      if (!this.configService.isAuthenticated()) {
        this.logWarn('ArgoCD not configured, returning empty list');
        return [];
      }

      await ContextKeys.isLoadingApplications(true);

      try {
        this.logInfo('Fetching applications and application sets');
        const [applications, applicationSets] = await Promise.all([
          this.appService.getApplications(),
          this.appService.getApplicationSets()
        ]);

        await ContextKeys.isLoadingApplications(false);
        await ContextKeys.hasApplications(applications.length !== 0 || applicationSets.length !== 0);

        this.logInfo(
          `Retrieved ${applications.length} application(s) and ${applicationSets.length} application set(s)`
        );

        const items: ArgocdItem[] = [];

        // Add applications
        items.push(...applications.map((app) => new ApplicationItem(app, this.clustersCache, this.reposCache)));

        // Add application sets if any
        if (applicationSets.length > 0) {
          items.push(...applicationSets.map((appset) => new ApplicationSetItem(appset.metadata.name, appset)));
        }

        return items;
      } catch (error) {
        await ContextKeys.isLoadingApplications(false);
        this.logError('Failed to fetch Application', error as Error);
        return [];
      }
    } else if (element instanceof ApplicationItem) {
      // Show application resources grouped by namespace and kind
      const app = element.application;
      this.logDebug(`Fetching resources for application ${app.metadata.name}`);

      const items: ArgocdItem[] = [
        new ApplicationHealthItem(app.status?.health?.status || 'Unknown', app),
        new ApplicationSyncItem(app.status?.sync?.status || 'Unknown', app.status?.sync?.revision, app)
      ];

      try {
        // Fetch only resources, manifests will be fetched lazily on first resource click
        const resources = await this.appService.getApplicationResources(app.metadata.name);

        this.logInfo(`Retrieved ${resources.length} resource(s) for application ${app.metadata.name}`);

        if (resources.length === 0) {
          return items;
        }

        // Store reference to parent ApplicationItem in resources for lazy manifest loading
        resources.forEach((resource: any) => {
          resource._parentApp = element;
        });

        // Group resources by namespace
        const namespaceGroups = new Map<string, any[]>();
        resources.forEach((resource: any) => {
          const ns = resource.namespace || 'default';
          if (!namespaceGroups.has(ns)) {
            namespaceGroups.set(ns, []);
          }
          namespaceGroups.get(ns)!.push(resource);
        });

        // Create namespace group items
        for (const [namespace, nsResources] of namespaceGroups) {
          items.push(new NamespaceGroupItem(namespace, nsResources));
        }

        return items;
      } catch (error) {
        this.logError(`Failed to fetch resources for application ${app.metadata.name}`, error as Error);
        return items;
      }
    } else if (element instanceof NamespaceGroupItem) {
      // Show resources grouped by kind within namespace
      const resources = element.resources;

      // Group by kind
      const kindGroups = new Map<string, any[]>();
      resources.forEach((resource) => {
        const kind = resource.kind || 'Unknown';
        if (!kindGroups.has(kind)) {
          kindGroups.set(kind, []);
        }
        kindGroups.get(kind)!.push(resource);
      });

      const items: ArgocdItem[] = [];

      // Sort kinds alphabetically
      const sortedKinds = Array.from(kindGroups.keys()).sort();

      // Create kind group items
      for (const kind of sortedKinds) {
        const kindResources = kindGroups.get(kind)!;
        items.push(new KindGroupItem(kind, kindResources));
      }

      return items;
    } else if (element instanceof KindGroupItem) {
      // Show individual resources
      const resources = element.resources;

      return resources.map((resource) => new ResourceItem(resource));
    } else if (element instanceof ApplicationSetItem) {
      // Show applicationset details (simplified for now)
      // TODO: Implement ApplicationSet children in future
      return [];
    }

    return [];
  }
}
