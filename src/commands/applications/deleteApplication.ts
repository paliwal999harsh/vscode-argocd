import { CommandServices, CommandProviders } from "../../commands";
import { ApplicationItem } from "../../views/nodes";

/**
 * Delete an application
 */
export function deleteApplication(services: CommandServices, providers: CommandProviders) {
    return async (item: ApplicationItem) => {
        const { appService } = services;
        const { applicationsProvider } = providers;

        if (item && item instanceof ApplicationItem) {
            await appService.deleteApplication(item.application.metadata.name);
            applicationsProvider.refresh();
        }
    };
}