import * as vscode from 'vscode';
import * as lodash from 'lodash';
import * as yaml from 'js-yaml';
import gitUrlParse from 'git-url-parse';
import parsePath from 'parse-path';


/**
 * Helper class for URL operations and validation
 */
export class UrlHelper {
    /**
     * Validates if a string is a valid URL
     * @param url The URL string to validate
     * @returns boolean True if valid
     */
    static isValidUrl(url: string): boolean {
        try {
            const parsed = parsePath(url);
            return !!parsed.protocol && !!parsed.resource;
        } catch {
            return false;
        }
    }

    /**
     * Validates if a string is a valid Git URL
     * @param url The URL string to validate
     * @returns boolean True if valid Git URL
     */
    static isValidGitUrl(url: string): boolean {
        try {
            const parsed = gitUrlParse(url);
            return !!parsed.source && (!!parsed.name || !!parsed.full_name);
        } catch {
            return false;
        }
    }

    /**
     * Sanitizes a URL by trimming and removing trailing slashes
     * @param url The URL to sanitize
     * @returns Sanitized URL string
     */
    static sanitizeUrl(url: string): string {
        return lodash.trim(url).replace(/\/+$/, '');
    }
}

/**
 * Helper class for Kubernetes-specific validation
 */
export class ValidationHelper {
    private static readonly K8S_NAME_PATTERN = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
    private static readonly NAMESPACE_PATTERN = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
    private static readonly DNS_SUBDOMAIN_PATTERN = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
    private static readonly LABEL_NAME_PATTERN = /^[a-zA-Z0-9]([-a-zA-Z0-9_.]*[a-zA-Z0-9])?$/;
    private static readonly LABEL_VALUE_PATTERN = /^[a-zA-Z0-9]([-a-zA-Z0-9_.]*[a-zA-Z0-9])?$/;

    /**
     * Validates a Kubernetes resource name
     * @param name The name to validate
     * @returns boolean True if valid
     */
    static isValidKubernetesName(name: string): boolean {
        return !lodash.isEmpty(name) && name.length <= 253 && this.K8S_NAME_PATTERN.test(name);
    }

    /**
     * Validates a Kubernetes namespace name
     * @param namespace The namespace to validate
     * @returns boolean True if valid
     */
    static isValidNamespace(namespace: string): boolean {
        return !lodash.isEmpty(namespace) && namespace.length <= 63 && this.NAMESPACE_PATTERN.test(namespace);
    }

    /**
     * Validates a Kubernetes label (key=value format)
     * @param label The label string to validate
     * @returns boolean True if valid
     */
    static isValidLabel(label: string): boolean {
        const parts = label.split('=');
        if (parts.length !== 2) {
            return false;
        }
        
        const [key, value] = parts;
        return this.isValidLabelKey(key) && this.isValidLabelValue(value);
    }

    /**
     * Validates a Kubernetes label key
     * @param key The label key to validate
     * @returns boolean True if valid
     */
    static isValidLabelKey(key: string): boolean {
        if (lodash.isEmpty(key) || key.length > 253) {
            return false;
        }
        
        const parts = key.split('/');
        if (parts.length > 2) {
            return false;
        }
        
        if (parts.length === 2) {
            const [prefix, name] = parts;
            return this.isValidDNSSubdomain(prefix) && this.isValidLabelName(name);
        } else {
            return this.isValidLabelName(parts[0]);
        }
    }

    /**
     * Validates a Kubernetes label value
     * @param value The label value to validate
     * @returns boolean True if valid
     */
    static isValidLabelValue(value: string): boolean {
        if (value.length > 63) {
            return false;
        }
        if (lodash.isEmpty(value)) {
            return true; // Empty values are allowed
        }
        
        return this.LABEL_VALUE_PATTERN.test(value);
    }

    /**
     * Validates a DNS subdomain
     * @param subdomain The subdomain to validate
     * @returns boolean True if valid
     */
    private static isValidDNSSubdomain(subdomain: string): boolean {
        return !lodash.isEmpty(subdomain) && 
               subdomain.length <= 253 && 
               this.DNS_SUBDOMAIN_PATTERN.test(subdomain);
    }

    /**
     * Validates a label name
     * @param name The label name to validate
     * @returns boolean True if valid
     */
    private static isValidLabelName(name: string): boolean {
        return !lodash.isEmpty(name) && 
               name.length <= 63 && 
               this.LABEL_NAME_PATTERN.test(name);
    }
}

/**
 * Helper class for time and date operations
 */
export class TimeHelper {
    /**
     * Formats a timestamp to a localized string
     * @param timestamp The timestamp to format
     * @returns Formatted timestamp string
     */
    static formatTimestamp(timestamp: string): string {
        try {
            const date = new Date(timestamp);
            return date.toLocaleString();
        } catch {
            return timestamp;
        }
    }

    /**
     * Converts a timestamp to a human-readable "time ago" format
     * @param timestamp The timestamp to convert
     * @returns Human-readable time ago string
     */
    static timeAgo(timestamp: string): string {
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();

            const seconds = Math.floor(diffMs / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 0) {
                return `${days} day${days > 1 ? 's' : ''} ago`;
            }
            if (hours > 0) {
                return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            }
            if (minutes > 0) {
                return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            }
            return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
        } catch {
            return timestamp;
        }
    }
}

/**
 * Helper class for error handling and logging
 */
export class ErrorHelper {
    /**
     * Handles and logs an error
     * @param error The error to handle
     * @param context The context where the error occurred
     * @returns Error message string
     */
    static handleError(error: any, context: string): string {
        console.error(`Error in ${context}:`, error);
        
        if (error instanceof Error) {
            return error.message;
        }
        
        if (lodash.isString(error)) {
            return error;
        }
        
        return `Unknown error occurred in ${context}`;
    }

    /**
     * Shows an error message in VS Code UI
     * @param error The error to display
     * @param context The context where the error occurred
     */
    static showErrorMessage(error: any, context: string): void {
        const message = this.handleError(error, context);
        vscode.window.showErrorMessage(`ArgoCD: ${message}`);
    }
}

/**
 * Helper class for creating formatted tooltips
 */
export class TooltipHelper {
    /**
     * Creates a formatted markdown table tooltip from a map of properties
     * @param properties Map of property names to values. Undefined/null values are filtered out.
     * @returns MarkdownString with formatted table
     */
    static createTableTooltip(properties: Map<string, string | undefined>): vscode.MarkdownString {
        const markdown = new vscode.MarkdownString();
        markdown.supportHtml = true;
        markdown.isTrusted = true;

        // Filter out undefined/null values using lodash
        const filteredEntries = Array.from(properties.entries())
            .filter(([_, value]) => !lodash.isNil(value));

        if (lodash.isEmpty(filteredEntries)) {
            markdown.appendText('No information available');
            return markdown;
        }

        // Create table header
        markdown.appendMarkdown('| Property | Value |\n');
        markdown.appendMarkdown('|:----------|:-------|\n');

        // Add table rows
        filteredEntries.forEach(([key, value]) => {
            markdown.appendMarkdown(`| ${key} | ${value} |\n`);
        });

        return markdown;
    }
}

/**
 * Helper class for YAML file detection and parsing
 */
export class YamlHelper {
    private static readonly ARGOCD_APPLICATION_API_VERSIONS = [
        'argoproj.io/v1alpha1'
    ];
    private static readonly ARGOCD_APPLICATION_KINDS = [
        'Application',
        'ApplicationSet'
    ];

    /**
     * Checks if a file is a YAML or YML file
     * @param uri The file URI to check
     * @returns boolean True if file is YAML/YML
     */
    static isYamlFile(uri: vscode.Uri): boolean {
        const extension = uri.fsPath.toLowerCase().split('.').pop();
        return extension === 'yaml' || extension === 'yml';
    }

    /**
     * Parses YAML content and detects if it contains ArgoCD Application resources
     * @param content The YAML content to parse
     * @returns Array of detected ArgoCD resources with their positions
     */
    static detectArgoCDResources(content: string): Array<{
        kind: string;
        apiVersion: string;
        name?: string;
        namespace?: string;
        lineNumber: number;
    }> {
        const resources: Array<{
            kind: string;
            apiVersion: string;
            name?: string;
            namespace?: string;
            lineNumber: number;
        }> = [];

        try {
            // Split content by YAML document separator (---)
            const documents = content.split(/^---$/m);
            let currentLine = 0;

            for (const doc of documents) {
                if (lodash.trim(doc)) {
                    try {
                        const parsed = yaml.load(doc) as any;
                        
                        if (parsed && 
                            this.ARGOCD_APPLICATION_API_VERSIONS.includes(parsed.apiVersion) &&
                            this.ARGOCD_APPLICATION_KINDS.includes(parsed.kind)) {
                            
                            resources.push({
                                kind: parsed.kind,
                                apiVersion: parsed.apiVersion,
                                name: parsed.metadata?.name,
                                namespace: parsed.metadata?.namespace,
                                lineNumber: currentLine
                            });
                        }
                    } catch (parseError) {
                        // Skip invalid YAML documents
                        console.debug('Failed to parse YAML document:', parseError);
                    }
                }
                
                // Count lines in this document
                currentLine += doc.split('\n').length + 1; // +1 for the --- separator
            }
        } catch (error) {
            console.error('Error detecting ArgoCD resources:', error);
        }

        return resources;
    }

    /**
     * Checks if content contains ArgoCD Application or ApplicationSet
     * @param content The YAML content to check
     * @returns boolean True if contains ArgoCD resources
     */
    static containsArgoCDResource(content: string): boolean {
        return this.detectArgoCDResources(content).length > 0;
    }

    /**
     * Validates YAML content
     * @param content The YAML content to validate
     * @returns Object with validation result and error message if invalid
     */
    static validateYaml(content: string): { valid: boolean; error?: string } {
        try {
            yaml.loadAll(content);
            return { valid: true };
        } catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Invalid YAML'
            };
        }
    }
}