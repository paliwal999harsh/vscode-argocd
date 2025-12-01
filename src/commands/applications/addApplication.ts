import { CommandServices, CommandProviders } from '../../commands';

/**
 * Add a new application
 */
export function addApplication(services: CommandServices, providers: CommandProviders) {
  return async () => {
    const { webviewService } = services;
    const { applicationsProvider } = providers;

    await webviewService.showCreateApplicationForm();
    applicationsProvider.refresh();
  };
}
