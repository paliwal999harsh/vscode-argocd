/**
 * Connection state information for a repository
 */
export interface RepositoryConnectionState {
    status: 'Successful' | 'Failed' | 'Unknown';
    message: string;
    attemptedAt: string;
}

/**
 * Repository information from ArgoCD
 */
export interface Repository {
    repo: string;
    type: string;
    name?: string;
    username?: string;
    project?: string;
    connectionState: RepositoryConnectionState;
}
