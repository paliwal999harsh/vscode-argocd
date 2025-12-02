import { CommandServices, CommandProviders } from '../../commands';

/**
 * Add a new cluster
 */
export function addCluster(services: CommandServices, providers: CommandProviders) {
  return async () => {
    const { clusterService } = services;
    const { clustersProvider } = providers;

    await clusterService.promptAndAddCluster();
    clustersProvider.refresh();
  };
}
