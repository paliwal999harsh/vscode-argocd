import { exec } from 'child_process';
import { promisify } from 'util';
import { OutputChannelService } from '../outputChannel';

const execAsync = promisify(exec);

/**
 * Base CLI service providing common functionality for command-line operations.
 * This abstract class serves as a foundation for specific CLI implementations (ArgoCD, kubectl, helm, etc.)
 */
export abstract class BaseCliService {
  protected abstract readonly cliName: string;
  protected outputChannel = OutputChannelService.getInstance();

  /**
   * Checks if the CLI tool is installed and accessible
   * @returns Promise<boolean> True if CLI is available
   */
  async checkCli(): Promise<boolean> {
    this.outputChannel.debug(`${this.cliName} CLI Service: Checking for ${this.cliName} CLI installation`);
    try {
      const { stdout } = await execAsync(this.getVersionCommand());
      const hasCli = stdout.toLowerCase().includes(this.cliName.toLowerCase());

      if (hasCli) {
        this.outputChannel.info(`${this.cliName} CLI Service: CLI found - ${stdout.trim()}`);
      } else {
        this.outputChannel.warn(`${this.cliName} CLI Service: CLI not found in system PATH`);
      }

      return hasCli;
    } catch (error) {
      this.outputChannel.error(`${this.cliName} CLI Service: Failed to check CLI installation`, error as Error);
      return false;
    }
  }

  /**
   * Executes a CLI command
   * @param command The command to execute (without the CLI name prefix)
   * @returns Promise<string> The command output
   * @throws Error if command execution fails
   */
  async executeCommand(command: string): Promise<string> {
    const fullCommand = `${this.cliName} ${command}`;
    const debugCommand = this.maskConfidentialInfo(fullCommand);
    this.outputChannel.debug(`${this.cliName} CLI Service: Executing command: ${debugCommand}`);

    try {
      const { stdout, stderr } = await execAsync(fullCommand);

      if (stderr) {
        this.outputChannel.warn(`${this.cliName} CLI Service: Command stderr: ${stderr}`);
      }

      this.outputChannel.debug(
        `${this.cliName} CLI Service: Command executed successfully, output length: ${stdout.length} characters`
      );
      return stdout;
    } catch (error) {
      this.outputChannel.error(`${this.cliName} CLI Service: Command failed: ${fullCommand}`, error as Error);
      throw new Error(`${this.cliName} CLI error: ${error}`);
    }
  }

  /**
   * Gets the version command for the CLI
   * Override this in child classes if needed
   * @returns string The version command
   */
  protected getVersionCommand(): string {
    return `${this.cliName} version --client`;
  }

  private maskConfidentialInfo(fullCommand: string): string {
    if (fullCommand.includes('--password ')) {
      const regex = /(--password\s+)([^\s]+)/;
      const maskedCommand = fullCommand.replace(regex, '$1[REDACTED]');
      return maskedCommand;
    } else if (fullCommand.includes('-authToken ')) {
      const regex = /(-authToken\s+)([^\s]+)/;
      const maskedCommand = fullCommand.replace(regex, '$1[REDACTED]');
      return maskedCommand;
    }
    return fullCommand;
  }
}
