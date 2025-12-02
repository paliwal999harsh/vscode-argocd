const vscode = acquireVsCodeApi();

// Handle button clicks using event delegation
document.addEventListener('DOMContentLoaded', function () {
  document.body.addEventListener('click', function (event) {
    const button = event.target.closest('button[data-action]');
    if (!button) {
      return;
    }

    const action = button.dataset.action;

    if (action === 'add') {
      vscode.postMessage({ command: 'addConnection' });
    } else {
      const connectionData = button.dataset.connection;
      executeConnectionCommand(action, connectionData);
    }
  });
});

function executeConnectionCommand(command, connectionData) {
  if (connectionData) {
    try {
      const connection = JSON.parse(connectionData);
      vscode.postMessage({
        command: command,
        connection: connection
      });
    } catch (error) {
      console.error('Failed to parse connection data:', error);
    }
  }
}
