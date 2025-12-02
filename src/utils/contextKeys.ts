import * as vscode from 'vscode';

/**
 * Context keys for controlling UI state throughout the extension
 */
export class ContextKeys {
  private static readonly keys = new Map<string, vscode.Disposable>();

  static async set(key: string, value: boolean | string | number): Promise<void> {
    await vscode.commands.executeCommand('setContext', key, value);
  }

  static clearAll(): void {
    for (const disposable of this.keys.values()) {
      disposable.dispose();
    }
    this.keys.clear();
  }

  static async isLoadingClusters(value: boolean): Promise<void> {
    await this.set('isLoadingClusters', value);
  }

  static async isLoadingRepositories(value: boolean): Promise<void> {
    await this.set('isLoadingRepositories', value);
  }

  static async isLoadingApplications(value: boolean): Promise<void> {
    await this.set('isLoadingApplications', value);
  }

  static async isAuthenticated(value: boolean): Promise<void> {
    await this.set('isAuthenticated', value);
  }

  static async hasRepositories(value: boolean): Promise<void> {
    await this.set('hasRepositories', value);
  }

  static async hasApplications(value: boolean): Promise<void> {
    await this.set('hasApplications', value);
  }

  static async hasTemplates(value: boolean): Promise<void> {
    await this.set('hasTemplates', value);
  }

  static async isCliAvailable(value: boolean): Promise<void> {
    await this.set('isCliAvailable', value);
  }
}
