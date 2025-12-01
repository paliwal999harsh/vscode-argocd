import { CommandServices, CommandProviders } from '../../commands';

/**
 * Add a new application set
 */
export function addApplicationSet(services: CommandServices, providers: CommandProviders) {
  return async () => {
    const { appService } = services;
    const { applicationsProvider } = providers;

    await appService.addApplicationSet();
    applicationsProvider.refresh();
  };
}
