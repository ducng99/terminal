function clearScreen() {
    shell.clear();
}

shell.registerCommand("clear", clearScreen);
shell.registerCommand("cls", clearScreen);
