import * as vscode from 'vscode';
import { CommandServices, CommandProviders } from '../../commands';
import { ClusterItem } from '../../views/nodes';

/**
 * Remove a cluster
 */
export function removeCluster(services: CommandServices, providers: CommandProviders) {
  return async (item: ClusterItem) => {
    const { clusterService } = services;
    const { clustersProvider } = providers;

    if (!item || !item.cluster) {
      vscode.window.showErrorMessage('No cluster selected');
      return;
    }

    const cluster = item.cluster;
    const confirm = await vscode.window.showWarningMessage(
      `Are you sure you want to remove cluster "${cluster.name}" (${cluster.server})?`,
      { modal: true },
      'Remove'
    );

    if (confirm === 'Remove') {
      await clusterService.removeCluster(cluster.server);
      clustersProvider.refresh();
    }
  };
}
