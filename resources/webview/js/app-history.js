(function () {
  const vscode = acquireVsCodeApi();

  const elements = {
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    errorMessage: document.getElementById('errorMessage'),
    historyContent: document.getElementById('historyContent'),
    empty: document.getElementById('empty'),
    historyBody: document.getElementById('historyBody'),
    refreshBtn: document.getElementById('refreshBtn'),
    appTitle: document.getElementById('appTitle')
  };

  // Request initial data
  window.addEventListener('load', () => {
    vscode.postMessage({ command: 'loadHistory' });
  });

  // Refresh button
  elements.refreshBtn.addEventListener('click', () => {
    showLoading();
    vscode.postMessage({ command: 'loadHistory' });
  });

  // Listen for messages from extension
  window.addEventListener('message', (event) => {
    const message = event.data;

    switch (message.command) {
      case 'historyLoaded':
        displayHistory(message.data);
        break;
      case 'error':
        showError(message.message);
        break;
    }
  });

  function showLoading() {
    elements.loading.style.display = 'block';
    elements.error.style.display = 'none';
    elements.historyContent.style.display = 'none';
    elements.empty.style.display = 'none';
  }

  function showError(message) {
    elements.loading.style.display = 'none';
    elements.error.style.display = 'block';
    elements.errorMessage.textContent = message;
    elements.historyContent.style.display = 'none';
    elements.empty.style.display = 'none';
  }

  function displayHistory(data) {
    elements.loading.style.display = 'none';
    elements.error.style.display = 'none';

    // Update title
    elements.appTitle.textContent = `Application History: ${data.appName}`;

    if (!data.history || data.history.length === 0) {
      elements.empty.style.display = 'block';
      elements.historyContent.style.display = 'none';
      return;
    }

    elements.empty.style.display = 'none';
    elements.historyContent.style.display = 'block';

    // Display source URL
    const sourceUrl = data.history.length > 0 ? data.history[0].source : 'N/A';
    document.getElementById('sourceUrl').textContent = sourceUrl;

    // Clear existing rows
    elements.historyBody.innerHTML = '';

    // Add history entries
    data.history.forEach((entry) => {
      const row = document.createElement('tr');

      row.innerHTML = `
                <td>${escapeHtml(entry.id)}</td>
                <td class="date">${escapeHtml(entry.date)}</td>
                <td><code class="revision">${escapeHtml(entry.revision)}</code></td>
                <td class="actions">
                    <button class="action-btn primary" data-revision="${escapeHtml(entry.revision)}" data-id="${escapeHtml(entry.id)}">View Manifest</button>
                    <button class="action-btn" data-revision="${escapeHtml(entry.revision)}" data-id="${escapeHtml(entry.id)}" data-action="rollback">Rollback</button>
                </td>
            `;

      elements.historyBody.appendChild(row);
    });

    // Add event listeners to action buttons
    document.querySelectorAll('.action-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const action = e.target.dataset.action;

        if (action === 'rollback') {
          vscode.postMessage({
            command: 'rollback',
            id: id
          });
        } else {
          vscode.postMessage({
            command: 'viewManifest',
            id: id
          });
        }
      });
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
})();
