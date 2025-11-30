const vscode = acquireVsCodeApi();

// Load projects on page load
window.addEventListener('load', () => {
    vscode.postMessage({ command: 'getProjects' });
});

// Handle messages from extension
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        case 'projectsLoaded':
            const projectSelect = document.getElementById('project');
            message.data.forEach(project => {
                const option = document.createElement('option');
                option.value = project;
                option.textContent = project;
                projectSelect.appendChild(option);
            });
            break;
        case 'fileSelected':
            document.getElementById(message.data.field).value = message.data.path;
            break;
    }
});

// Handle repository type changes
document.getElementById('type').addEventListener('change', function() {
    const type = this.value;
    const nameField = document.getElementById('name');
    const enableLfsGroup = document.getElementById('enableLfsGroup');
    const forceBasicAuthGroup = document.getElementById('forceBasicAuthGroup');
    const enableOciGroup = document.getElementById('enableOciGroup');
    const forceHttpGroup = document.getElementById('forceHttpGroup');

    // Show/hide type-specific options
    if (type === 'git') {
        enableLfsGroup.classList.remove('hidden');
        forceBasicAuthGroup.classList.remove('hidden');
        enableOciGroup.classList.add('hidden');
        forceHttpGroup.classList.add('hidden');
        nameField.placeholder = 'Optional for Git repositories';
    } else if (type === 'helm') {
        enableLfsGroup.classList.add('hidden');
        forceBasicAuthGroup.classList.add('hidden');
        enableOciGroup.classList.remove('hidden');
        forceHttpGroup.classList.add('hidden');
        nameField.placeholder = 'Required for Helm repositories';
    } else if (type === 'oci') {
        enableLfsGroup.classList.add('hidden');
        forceBasicAuthGroup.classList.add('hidden');
        enableOciGroup.classList.add('hidden');
        forceHttpGroup.classList.remove('hidden');
        nameField.placeholder = 'Required for OCI repositories';
    }
});

// Handle authentication type changes
document.getElementById('authType').addEventListener('change', function() {
    const authType = this.value;
    const authSections = document.querySelectorAll('.auth-type-content');
    authSections.forEach(section => section.classList.add('hidden'));

    if (authType !== 'none') {
        const activeSection = document.getElementById(authType + 'Auth');
        if (activeSection) {
            activeSection.classList.remove('hidden');
        }
    }
});

// Handle button clicks using event delegation
document.body.addEventListener('click', function(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) {
        return;
    }
    
    const action = button.getAttribute('data-action');
    
    if (action === 'browse') {
        const fieldId = button.getAttribute('data-target');
        const label = button.getAttribute('data-title');
        vscode.postMessage({
            command: 'selectFile',
            data: { field: fieldId, label: label }
        });
    } else if (action === 'cancel') {
        vscode.postMessage({ command: 'cancel' });
    }
});

// Handle form submission
document.getElementById('addRepoForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const type = document.getElementById('type').value;
    const name = document.getElementById('name').value;

    // Validate required name for helm/oci
    if ((type === 'helm' || type === 'oci') && !name) {
        alert(`Repository name is required for ${type} repositories`);
        return;
    }

    const formData = {
        url: document.getElementById('url').value,
        type: type,
        name: name,
        auth: getAuthData(),
        security: getSecurityData(),
        project: document.getElementById('project').value
    };

    vscode.postMessage({
        command: 'addRepository',
        data: formData
    });
});

function getAuthData() {
    const authType = document.getElementById('authType').value;
    const authData = { type: authType };

    switch (authType) {
        case 'username':
            authData.username = document.getElementById('username').value;
            authData.password = document.getElementById('password').value;
            break;
        case 'sshKey':
            authData.sshKeyPath = document.getElementById('sshKeyPath').value;
            break;
        case 'bearerToken':
            authData.bearerToken = document.getElementById('bearerToken').value;
            break;
        case 'githubApp':
            authData.githubApp = {
                appId: document.getElementById('githubAppId').value,
                installationId: document.getElementById('githubInstallationId').value,
                privateKeyPath: document.getElementById('githubPrivateKeyPath').value,
                enterpriseUrl: document.getElementById('githubEnterpriseUrl').value
            };
            break;
        case 'gcpServiceAccount':
            authData.gcpKeyPath = document.getElementById('gcpKeyPath').value;
            break;
    }

    return authData;
}

function getSecurityData() {
    return {
        skipTlsVerification: document.getElementById('skipTlsVerification').checked,
        enableLfs: document.getElementById('enableLfs').checked,
        forceBasicAuth: document.getElementById('forceBasicAuth').checked,
        enableOci: document.getElementById('enableOci').checked,
        forceHttp: document.getElementById('forceHttp').checked,
        tlsClientCertPath: document.getElementById('tlsClientCertPath').value,
        tlsClientKeyPath: document.getElementById('tlsClientKeyPath').value
    };
}
