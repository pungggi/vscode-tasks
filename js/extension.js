const vscode = require('vscode');

var statusBarArray = [];
var taskMap = {};

function deinitTasks(context) {
    statusBarArray.forEach(i => {
        i.dispose();
    });
    statusBarArray = [];
}

function loadTasks(context) {
    deinitTasks(context)
    if (vscode.workspace.workspaceFolders == undefined) {
        return;
    }
    for (const workspaceFolder of vscode.workspace.workspaceFolders) {
        const config = vscode.workspace.getConfiguration('tasks', workspaceFolder.uri);
        if (!config || !Array.isArray(config.tasks)) {
            continue;
        }
        for (const task of config.tasks) {
            const name = "label" in task ? task.label : task.taskName;
            if (typeof name != 'string') {
                continue;
            }
            if (task.options && task.options.statusbar == 'hide') {
                continue;
            }
            let statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 51);
            statusBar.text = name;
            statusBar.command = "actboy168.task-" + name;
            statusBar.show();
            statusBarArray.push(statusBar);
            context.subscriptions.push(statusBar);
            if (!(name in taskMap)) {
                context.subscriptions.push(vscode.commands.registerCommand(statusBar.command, () => {
                    vscode.commands.executeCommand("workbench.action.tasks.runTask", name);
                }));
            }
            taskMap[name] = true
        }
    }
}

function initTasks(context) {
    statusBarArray = [];
    taskMap = {};
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => {
        loadTasks(context);
    }));
    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(() => {
        loadTasks(context);
    }));
    loadTasks(context);
}

exports.activate = initTasks;
exports.deactivate = deinitTasks;
