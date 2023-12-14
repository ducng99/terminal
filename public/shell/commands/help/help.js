s_registerCommand('help', async function() {
    await s_print('Available commands: ' + s_getCommands().join(', ') + '\n');
});
