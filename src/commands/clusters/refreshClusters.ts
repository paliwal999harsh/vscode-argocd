import { ClustersProvider } from '../../views/providers';

/**
 * Refresh the clusters tree view
 */
export function refreshClusters(clustersProvider: ClustersProvider) {
  return () => {
    clustersProvider.refresh();
  };
}
