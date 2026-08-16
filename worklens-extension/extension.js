const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('WorkLens extension is now active!');

    let disposable = vscode.commands.registerCommand('worklens.analyzeCode', async function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active file open.');
            return;
        }

        const document = editor.document;
        const selection = editor.selection;
        const selectedText = document.getText(selection);

        if (!selectedText || !selectedText.trim()) {
            vscode.window.showWarningMessage('Please highlight some code first!');
            return;
        }

        const fileName = document.fileName;
        const languageId = document.languageId;
        const startLine = selection.start.line + 1;
        const endLine = selection.end.line + 1;

        const payload = {
            file: fileName,
            language: languageId,
            lineRange: `${startLine}-${endLine}`,
            code: selectedText
        };

        // Open side panel with an initial status
        const panel = vscode.window.createWebviewPanel(
            'worklensView',
            'WorkLens Inspector',
            vscode.ViewColumn.Beside,
            { enableScripts: true }
        );

        panel.webview.html = renderHtml(languageId, startLine, endLine, fileName, selectedText, "Connecting to Django backend at http://127.0.0.1:8000...");

        // Send POST request to Django backend
        try {
            const response = await fetch('http://127.0.0.1:8000/api/receive-code/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Server returned status ${response.status}`);
            }

            const data = await response.json();
            vscode.window.showInformationMessage('Code successfully sent to Django!');

            // Update webview with success message
            panel.webview.html = renderHtml(
                languageId,
                startLine,
                endLine,
                fileName,
                selectedText,
                `Backend Status: ${data.status.toUpperCase()}\nMessage: ${data.message}`
            );
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to reach backend: ${error.message}`);
            panel.webview.html = renderHtml(
                languageId,
                startLine,
                endLine,
                fileName,
                selectedText,
                `Connection Error: ${error.message}\nEnsure Django is running on http://127.0.0.1:8000`
            );
        }
    });

    context.subscriptions.push(disposable);
}

function renderHtml(languageId, startLine, endLine, fileName, selectedText, backendMessage) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    padding: 16px;
                    color: var(--vscode-editor-foreground);
                    background-color: var(--vscode-editor-background);
                }
                .tag {
                    background: #007acc;
                    color: white;
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                    display: inline-block;
                    margin-bottom: 12px;
                }
                .backend-box {
                    background: rgba(0, 122, 204, 0.15);
                    border-left: 4px solid #007acc;
                    padding: 10px;
                    border-radius: 4px;
                    margin-bottom: 14px;
                    font-size: 13px;
                }
                .meta-box {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 10px;
                    border-radius: 6px;
                    margin-bottom: 14px;
                    font-size: 13px;
                }
                pre {
                    background: rgba(0, 0, 0, 0.25);
                    padding: 12px;
                    border-radius: 6px;
                    overflow-x: auto;
                    font-size: 13px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
            </style>
        </head>
        <body>
            <span class="tag">WorkLens Active</span>

            <div class="backend-box">
                <strong>Backend Communication:</strong>
                <p style="white-space: pre-wrap; margin: 4px 0 0 0;">${escapeHtml(backendMessage)}</p>
            </div>

            <div class="meta-box">
                <p><strong>Language:</strong> ${escapeHtml(languageId)}</p>
                <p><strong>Lines:</strong> ${startLine} to ${endLine}</p>
                <p><strong>File:</strong> ${escapeHtml(fileName)}</p>
            </div>

            <h3>Captured Code Snippet</h3>
            <pre><code>${escapeHtml(selectedText)}</code></pre>
        </body>
        </html>
    `;
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};