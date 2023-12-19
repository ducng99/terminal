shell.registerCommand("dungeon-crawler", () => {
    return new Promise(async (resolve, reject) => {
        await shell.print("Loading...\n");

        try {
            const { default: create_dungeoncrawler_module } = await import("./textbased_dungeoncrawler.js");

            const Module = await create_dungeoncrawler_module({
                noInitialRun: true,
                preRun: () => {
                    shell.clear();
                },
                print: (text) => {
                    shell.print(text + "\n", { printDelay: 0 });
                },
            });

            await Module.ccall("main", "number", [], [], { async: true });
            resolve();
        } catch (err) {
            reject(err);
        }
    });
});
