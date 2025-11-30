const vscode = acquireVsCodeApi();

// Handle button clicks using event delegation
document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('click', function(event) {
        const button = event.target.closest('button[data-action]');
        if (!button) {
            return;
        }
        
        const action = button.getAttribute('data-action');
        
        if (action === 'add') {
            vscode.postMessage({ command: 'addConnection' });
        } else if (action === 'connect') {
            const connectionData = button.getAttribute('data-connection');
            if (connectionData) {
                try {
                    const connection = JSON.parse(connectionData);
                    vscode.postMessage({ 
                        command: 'switchConnection',
                        connection: connection
                    });
                } catch (error) {
                    console.error('Failed to parse connection data:', error);
                }
            }
        } else if (action === 'editConnection') {
            const connectionData = button.getAttribute('data-connection');
            if (connectionData) {
                try {
                    const connection = JSON.parse(connectionData);
                    vscode.postMessage({ 
                        command: 'editConnection',
                        connection: connection
                    });
                } catch (error) {
                    console.error('Failed to parse connection data:', error);
                }
            }
        } else if (action === 'deleteConnection') {
            const connectionData = button.getAttribute('data-connection');
            if (connectionData) {
                try {
                    const connection = JSON.parse(connectionData);
                    vscode.postMessage({ 
                        command: 'deleteConnection',
                        connection: connection
                    });
                } catch (error) {
                    console.error('Failed to parse connection data:', error);
                }
            }
        }
    });
});
