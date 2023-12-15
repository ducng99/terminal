function clearScreen() {
    s_clear();
}

s_registerCommand("clear", clearScreen);
s_registerCommand("cls", clearScreen);
