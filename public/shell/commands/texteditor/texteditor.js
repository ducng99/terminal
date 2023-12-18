shell.registerCommand("texteditor", async () => {
    await shell.print(`Hi! This is the most basic and useless text editor that no one should use.

You can type text and delete them. And navigate around the text (whaaaaaaaaaaaaaat!!).
Press Escape to exit and save it as file.

Continue? (Y/n) `);

    try {
        let userConfirm = (await shell.prompt()).toLowerCase();

        if (userConfirm === '' || userConfirm === 'y') {
            shell.clear();

            let textContent = await shell.prompt("", {
                multiLine: true,
                onKeyDown: (event) => {
                    if (event.key === "Escape") {
                        event.currentTarget.dispatchEvent(new Event("finish"));
                    }
                }
            });

            shell.clear();

            await shell.print("Do you want to save as file? (Y/n) ");
            let userConfirmSave = (await shell.prompt()).toLowerCase();

            if (userConfirmSave === '' || userConfirmSave === 'y') {
                await shell.print('File name: ');
                let fileName = await shell.prompt();

                if (fileName === '') {
                    fileName = 'untitled.txt';
                }

                await shell.print(`Saving as ${fileName}...`);

                // Download file
                let element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(textContent));
                element.setAttribute('download', fileName);
                element.style.display = 'none';
                element.click();

                await shell.print(' OK\n');
            }
        }
    } catch (e) {
        await shell.print("User cancelled! Exiting...\n");
    }
});
