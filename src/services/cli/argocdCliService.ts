import * as vscode from 'vscode';
import { BaseCliService } from './baseCliService';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * User information from ArgoCD
 */
export interface UserInfo {
    loggedIn: boolean;
    username?: string;
    iss?: string;
    groups?: string[];
    email?: string;
    name?: string;
}

/**
 * ArgoCD CLI Service
 * Handles all interactions with the ArgoCD command-line interface
 */
export class ArgocdCliService extends BaseCliService {
    protected readonly cliName = 'argocd';

    /**
     * Logs in to ArgoCD server using username and password
     * @param serverAddress The ArgoCD server address (without protocol)
     * @param username The username
     * @param password The password
     * @param skipTls Whether to skip TLS verification
     * @returns Promise<boolean> True if login successful
     */
    async login(serverAddress: string, username: string, password: string, skipTls: boolean = false): Promise<boolean> {
        this.outputChannel.info(`ArgoCD CLI Service: Attempting login to ${serverAddress} as user: ${username}`);
        
        try {
            const tlsFlag = skipTls ? '--insecure' : '';
            const command = `login ${serverAddress} --username ${username} --password ${password} ${tlsFlag}`.trim();
            this.outputChannel.debug(`ArgoCD CLI Service: Executing login command (password masked)`);
            
            await this.executeCommand(command);
            this.outputChannel.info('ArgoCD CLI Service: Login successful');
            return true;
        } catch (error) {
            this.outputChannel.error('ArgoCD CLI Service: Login failed', error as Error);
            vscode.window.showErrorMessage(`Failed to login to ArgoCD: ${error}`);
            return false;
        }
    }

    /**
     * Logs in to ArgoCD server using SSO
     * @param serverAddress The ArgoCD server address (without protocol)
     * @param skipTls Whether to skip TLS verification
     * @returns Promise<boolean> True if login successful
     */
    async loginSSO(serverAddress: string, skipTls: boolean = false): Promise<boolean> {
        this.outputChannel.info(`ArgoCD CLI Service: Attempting SSO login to ${serverAddress}`);
        
        try {
            const tlsFlag = skipTls ? '--insecure' : '';
            const command = `login ${serverAddress} --sso ${tlsFlag}`.trim();
            this.outputChannel.debug(`ArgoCD CLI Service: Executing SSO login command (browser will open automatically)`);
            
            // Show information message before opening browser
            vscode.window.showInformationMessage(
                'SSO authentication will open in your browser. Complete the authentication and then click "Done".',
                { modal: false }
            );

            // Execute the SSO login command (will open browser automatically)
            const loginPromise = this.executeCommand(command);
            try {
                // Wait for the login command to complete
                await loginPromise;
                // Verify login by testing a simple command
                this.outputChannel.debug('ArgoCD CLI Service: Verifying SSO login');
                await this.executeCommand('cluster list');
                this.outputChannel.info('ArgoCD CLI Service: SSO Login successful');
                return true;
            } catch (error) {
                this.outputChannel.error('ArgoCD CLI Service: SSO Login verification failed', error as Error);
                vscode.window.showErrorMessage('SSO authentication was not completed successfully. Please try again.');
                return false;
            }
        } catch (error) {
            this.outputChannel.error('ArgoCD CLI Service: SSO Login failed', error as Error);
            vscode.window.showErrorMessage(`Failed to initiate SSO login: ${error}`);
            return false;
        }
    }

    /**
     * Executes an ArgoCD command with authentication token
     * Useful for token-based authentication where login is not required
     * @param command The command to execute (without 'argocd' prefix)
     * @param serverAddress The ArgoCD server address
     * @param authToken The authentication token
     * @param skipTls Whether to skip TLS verification
     * @returns Promise<string> The command output
     */
    async executeWithAuth(command: string, serverAddress: string, authToken: string, skipTls: boolean = false): Promise<string> {
        const tlsFlag = skipTls ? '--insecure' : '';
        const fullCommand = `${command} --server ${serverAddress} --auth-token ${authToken} ${tlsFlag}`.trim();
        this.outputChannel.debug(`ArgoCD CLI Service: Executing command with auth token (token masked)`);
        
        try {
            const { stdout, stderr } = await execAsync(`argocd ${fullCommand}`);
            if (stderr) {
                this.outputChannel.warn(`ArgoCD CLI Service: Command stderr: ${stderr}`);
            }
            this.outputChannel.debug(`ArgoCD CLI Service: Command executed successfully, output length: ${stdout.length} characters`);
            return stdout;
        } catch (error) {
            this.outputChannel.error(`ArgoCD CLI Service: Command failed with auth token`, error as Error);
            throw new Error(`ArgoCD CLI error: ${error}`);
        }
    }

    /**
     * Checks if user is currently authenticated with ArgoCD
     * @returns Promise<boolean> True if authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        this.outputChannel.debug('ArgoCD CLI Service: Checking authentication status');
        try {
            const output = await this.executeCommand('account get-user-info');
            // Check if the output contains "Logged In: true"
            const loggedInMatch = output.match(/Logged In:\s*(true|false)/i);
            if (loggedInMatch) {
                const isLoggedIn = loggedInMatch[1].toLowerCase() === 'true';
                this.outputChannel.info(`ArgoCD CLI Service: Authentication status: ${isLoggedIn ? 'Authenticated' : 'Not authenticated'}`);
                return isLoggedIn;
            }
            // If we can't parse the output but command succeeded, assume logged in
            this.outputChannel.info('ArgoCD CLI Service: Authentication status: Authenticated (assumed from successful command)');
            return true;
        } catch (error) {
            this.outputChannel.warn('ArgoCD CLI Service: Authentication check failed - not authenticated');
            return false;
        }
    }

    /**
     * Gets detailed user information from ArgoCD
     * @returns Promise<UserInfo | null> User information object or null if not authenticated
     */
    async getUserInfo(): Promise<UserInfo | null> {
        this.outputChannel.debug('ArgoCD CLI Service: Getting user information');
        try {
            const output = await this.executeCommand('account get-user-info -o json');
            const userInfo = JSON.parse(output);
            this.outputChannel.info(`ArgoCD CLI Service: Retrieved user info for ${userInfo.username || 'unknown user'}`);
            return userInfo;
        } catch (error) {
            this.outputChannel.warn('ArgoCD CLI Service: Failed to get user info - not authenticated or error occurred');
            return null;
        }
    }

    /**
     * Gets detailed user information with authentication token
     * @param serverAddress The ArgoCD server address
     * @param authToken The authentication token
     * @param skipTls Whether to skip TLS verification
     * @returns Promise<UserInfo | null> User information object or null if error
     */
    async getUserInfoWithAuth(serverAddress: string, authToken: string, skipTls: boolean = false): Promise<UserInfo | null> {
        this.outputChannel.debug('ArgoCD CLI Service: Getting user information with auth token');
        try {
            const output = await this.executeWithAuth('account get-user-info -o json', serverAddress, authToken, skipTls);
            const userInfo = JSON.parse(output);
            this.outputChannel.info(`ArgoCD CLI Service: Retrieved user info for ${userInfo.username || 'unknown user'}`);
            return userInfo;
        } catch (error) {
            this.outputChannel.warn('ArgoCD CLI Service: Failed to get user info with auth token');
            return null;
        }
    }

    /**
     * Gets the ArgoCD server version
     * @returns Promise<string> The server version
     */
    async getServerVersion(): Promise<string> {
        this.outputChannel.debug('ArgoCD CLI Service: Getting server version');
        try {
            const output = await this.executeCommand('version --client -o json');
            const versionInfo = JSON.parse(output);
            const version = versionInfo.client.version;
            this.outputChannel.info(`ArgoCD CLI Service: Server version: ${version}`);
            return version;
        } catch (error) {
            this.outputChannel.error('ArgoCD CLI Service: Failed to get server version', error as Error);
            throw new Error(`Failed to get ArgoCD version: ${error}`);
        }
    }

    /**
     * Checks connection to ArgoCD server
     * @returns Promise<boolean> True if connected
     */
    async checkConnection(): Promise<boolean> {
        this.outputChannel.debug('ArgoCD CLI Service: Checking connection to ArgoCD server');
        try {
            await this.executeCommand('cluster list');
            this.outputChannel.info('ArgoCD CLI Service: Connection check successful');
            return true;
        } catch (error) {
            this.outputChannel.warn('ArgoCD CLI Service: Connection check failed');
            return false;
        }
    }

    /**
     * Logs out from ArgoCD server
     * Clears local authentication context
     * @param serverAddress Optional server address to logout from (if not provided, logs out from current server)
     * @returns Promise<void>
     */
    async logout(serverAddress?: string): Promise<void> {
        this.outputChannel.info('ArgoCD CLI Service: Logging out from ArgoCD');
        try {
            const args = ['logout'];
            if (serverAddress) {
                args.push(serverAddress);
            }
            await this.executeCommand(args.join(' '));
            this.outputChannel.info('ArgoCD CLI Service: Logout successful');
        } catch (error) {
            this.outputChannel.warn('ArgoCD CLI Service: Logout command failed (may not have been logged in)');
            // Don't throw error - logout can fail if already logged out
        }
    }
}
