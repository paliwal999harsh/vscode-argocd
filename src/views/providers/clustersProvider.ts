import { BaseProvider } from './baseProvider';
import { ClusterItem, ClusterApplicationsItem, ClusterApplicationRefItem, ArgocdItem } from '../nodes';
import { ClusterService, ConfigurationService } from '../../services';
import { ContextKeys } from '../../utils';

/**
 * Tree data provider for ArgoCD clusters.
 * Displays the list of Kubernetes clusters managed by ArgoCD and allows users to add new clusters.
 */
export class ClustersProvider extends BaseProvider<ArgocdItem> {
  constructor(
    private clusterService: ClusterService,
    private configService: ConfigurationService
  ) {
    super();
  }

  protected getProviderName(): string {
    return 'ClustersProvider';
  }

  async getChildren(element?: ArgocdItem): Promise<ArgocdItem[]> {
    this.logDebug(`Getting children${element ? ' for ' + element.label : ' (root)'}`);

    if (!element) {
      // Root level - show clusters
      if (!this.configService.isAuthenticated()) {
        this.logWarn('ArgoCD not configured, returning empty list');
        return [];
      }

      await ContextKeys.isLoadingClusters(true);
      this.logInfo('Fetching clusters from ArgoCD');

      try {
        const clusters = await this.clusterService.getClusters();
        await ContextKeys.isLoadingClusters(false);

        this.logInfo(`Retrieved ${clusters.length} cluster(s)`);

        const items = clusters.map((cluster) => new ClusterItem(cluster));
        return this.sortByLabel(items);
      } catch (error) {
        await ContextKeys.isLoadingClusters(false);
        this.logError('Failed to fetch clusters', error as Error);
        return [];
      }
    } else if (element instanceof ClusterItem) {
      // Show cluster details
      const cluster = element.cluster;
      this.logDebug(`Fetching details for cluster ${cluster.name}`);

      const applicationsCount = cluster.info?.applicationsCount || 0;

      const items: ArgocdItem[] = [];

      // Add applications section if there are any
      if (applicationsCount > 0) {
        items.push(new ClusterApplicationsItem(applicationsCount, cluster));
      }

      return items;
    } else if (element instanceof ClusterApplicationsItem) {
      // Fetch and show applications for this cluster
      const cluster = element.cluster;
      this.logDebug(`Fetching applications for cluster ${cluster.server}`);

      try {
        const apps = await this.clusterService.getClusterApplications(cluster.server);
        this.logInfo(`Found ${apps.length} application(s) for cluster ${cluster.name}`);
        return apps.map((app) => new ClusterApplicationRefItem(app.name, app.namespace, cluster));
      } catch (error) {
        this.logError(`Failed to fetch applications for cluster ${cluster.name}`, error as Error);
        return [];
      }
    }

    return [];
  }
}
