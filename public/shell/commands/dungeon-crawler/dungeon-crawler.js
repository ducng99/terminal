shell.registerCommand("dungeon-crawler", () => {
    return new Promise(async (resolve, reject) => {
        await shell.print("Loading...\n");

        try {
            const { default: create_dungeoncrawler_module } = await import("./textbased_dungeoncrawler.js");

            const Module = await create_dungeoncrawler_module({
                preRun: () => {
                    shell.clear();
                },
                print: (text) => {
                    shell.print(text + "\n", { printDelay: 0 });
                },
            });

            Module.addOnExit(() => {
                resolve();
            });
        } catch (err) {
            reject(err);
        }
    });
});
