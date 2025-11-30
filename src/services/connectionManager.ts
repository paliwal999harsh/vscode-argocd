import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { OutputChannelService } from './outputChannel';
import { ContextKeys } from '../utils/contextKeys';
import { refreshAllViews } from '../views/views';

/**
 * Connection configuration stored in connections.json
 */
export interface ArgocdConnection {
    id: string;
    name: string;
    serverAddress: string;
    authMethod: 'token' | 'username' | 'sso';
    apiToken?: string;
    username?: string;
    skipTls?: boolean;
    createdAt: string;
    lastUsed?: string;
}

interface ConnectionsData {
    activeConnectionId?: string;
    connections: ArgocdConnection[];
}

/**
 * Manages multiple ArgoCD connections
 */
export class ConnectionManager {
    private static instance: ConnectionManager;
    private outputChannel = OutputChannelService.getInstance();
    private connectionsFile: string;
    private connectionsData: ConnectionsData = { connections: [] };

    private constructor(private context: vscode.ExtensionContext) {
        // Store connections in user data directory
        const userDataPath = context.globalStorageUri.fsPath;
        if (!fs.existsSync(userDataPath)) {
            fs.mkdirSync(userDataPath, { recursive: true });
        }
        this.connectionsFile = path.join(userDataPath, 'connections.json');
        this.loadConnections();
    }

    public static getInstance(context?: vscode.ExtensionContext): ConnectionManager {
        if (!ConnectionManager.instance) {
            if (!context) {
                throw new Error('ConnectionManager must be initialized with context first');
            }
            ConnectionManager.instance = new ConnectionManager(context);
        }
        return ConnectionManager.instance;
    }

    /**
     * Load connections from file
     */
    private loadConnections(): void {
        try {
            if (fs.existsSync(this.connectionsFile)) {
                const data = fs.readFileSync(this.connectionsFile, 'utf-8');
                this.connectionsData = JSON.parse(data);
                this.outputChannel.debug(`ConnectionManager: Loaded ${this.connectionsData.connections.length} connection(s)`);
            } else {
                this.outputChannel.debug('ConnectionManager: No connections file found, starting fresh');
            }
        } catch (error) {
            this.outputChannel.error('ConnectionManager: Failed to load connections', error as Error);
            this.connectionsData = { connections: [] };
        }
    }

    /**
     * Save connections to file
     */
    private saveConnections(): void {
        try {
            const data = JSON.stringify(this.connectionsData, null, 2);
            fs.writeFileSync(this.connectionsFile, data, 'utf-8');
            this.outputChannel.debug('ConnectionManager: Connections saved');
        } catch (error) {
            this.outputChannel.error('ConnectionManager: Failed to save connections', error as Error);
            throw error;
        }
    }

    /**
     * Add a new connection
     */
    public addConnection(connection: Omit<ArgocdConnection, 'id' | 'createdAt'>): ArgocdConnection {
        const newConnection: ArgocdConnection = {
            ...connection,
            id: this.generateId(),
            createdAt: new Date().toISOString()
        };

        this.connectionsData.connections.push(newConnection);
        
        // If this is the first connection, make it active
        if (this.connectionsData.connections.length === 1) {
            this.connectionsData.activeConnectionId = newConnection.id;
        }

        this.saveConnections();
        this.outputChannel.info(`ConnectionManager: Added connection "${newConnection.name}"`);
        return newConnection;
    }

    /**
     * Update an existing connection
     */
    public updateConnection(id: string, updates: Partial<Omit<ArgocdConnection, 'id' | 'createdAt'>>): void {
        const index = this.connectionsData.connections.findIndex(c => c.id === id);
        if (index === -1) {
            throw new Error(`Connection with id ${id} not found`);
        }

        this.connectionsData.connections[index] = {
            ...this.connectionsData.connections[index],
            ...updates
        };

        this.saveConnections();
        this.outputChannel.info(`ConnectionManager: Updated connection "${this.connectionsData.connections[index].name}"`);
    }

    /**
     * Delete a connection
     */
    public deleteConnection(id: string): void {
        const index = this.connectionsData.connections.findIndex(c => c.id === id);
        if (index === -1) {
            throw new Error(`Connection with id ${id} not found`);
        }

        const connectionName = this.connectionsData.connections[index].name;
        this.connectionsData.connections.splice(index, 1);

        // If deleted connection was active, clear active connection or set to first available
        if (this.connectionsData.activeConnectionId === id) {
            this.connectionsData.activeConnectionId = this.connectionsData.connections.length > 0 
                ? this.connectionsData.connections[0].id 
                : undefined;
        }

        this.saveConnections();
        this.outputChannel.info(`ConnectionManager: Deleted connection "${connectionName}"`);
    }

    /**
     * Set active connection
     */
    public setActiveConnection(id: string): void {
        const connection = this.connectionsData.connections.find(c => c.id === id);
        if (!connection) {
            throw new Error(`Connection with id ${id} not found`);
        }

        this.connectionsData.activeConnectionId = id;
        connection.lastUsed = new Date().toISOString();
        this.saveConnections();
        this.outputChannel.info(`ConnectionManager: Activated connection "${connection.name}"`);
    }

    /**
     * Clear active connection (e.g., when logging out)
     */
    public async clearActiveConnection(): Promise<void> {
        this.connectionsData.activeConnectionId = undefined;
        this.saveConnections();
        this.outputChannel.info('ConnectionManager: Cleared active connection');
        
        // Set configured context key to show welcome view
        await ContextKeys.isAuthenticated(false);
        this.outputChannel.info('ConnectionManager: Set argocd:notConfigured to true');
        
        // Refresh all views
        refreshAllViews();
        this.outputChannel.info('ConnectionManager: Refreshed all views');
    }

    /**
     * Get active connection
     */
    public getActiveConnection(): ArgocdConnection | undefined {
        if (!this.connectionsData.activeConnectionId) {
            return undefined;
        }
        return this.connectionsData.connections.find(c => c.id === this.connectionsData.activeConnectionId);
    }

    /**
     * Get all connections
     */
    public getAllConnections(): ArgocdConnection[] {
        return [...this.connectionsData.connections];
    }

    /**
     * Get connection by ID
     */
    public getConnectionById(id: string): ArgocdConnection | undefined {
        return this.connectionsData.connections.find(c => c.id === id);
    }

    /**
     * Check if any connections exist
     */
    public hasConnections(): boolean {
        return this.connectionsData.connections.length > 0;
    }

    /**
     * Check if there's an active connection
     */
    public hasActiveConnection(): boolean {
        return !!this.connectionsData.activeConnectionId && !!this.getActiveConnection();
    }

    /**
     * Generate unique ID
     */
    private generateId(): string {
        return `conn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
}
