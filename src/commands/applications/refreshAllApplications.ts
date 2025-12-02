import { ApplicationsProvider } from '../../views/providers';

/**
 * Refresh the applications tree view
 */
export function refreshAllApplications(applicationsProvider: ApplicationsProvider) {
  return () => {
    applicationsProvider.refresh();
  };
}
