shell.registerCommand('help', async function () {
    await shell.print('Available commands: ' + shell.getCommands().join(', ') + '\n');
});
