import { CommandServices, CommandProviders } from "../../commands";
import { ApplicationItem } from "../../views/nodes";

/**
 * Sync an application
 */
export function syncApplication(services: CommandServices, providers: CommandProviders) {
    return async (item: ApplicationItem) => {
        const { appService } = services;
        const { applicationsProvider } = providers;

        if (item && item instanceof ApplicationItem) {
            await appService.syncApplication(item.application.metadata.name);
            // Clear manifest cache so it's refreshed on next resource click
            item.manifestsCache = undefined;
            applicationsProvider.refresh();
        }
    };
}