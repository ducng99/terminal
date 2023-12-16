s_registerCommand("texteditor", async () => {
    await s_print(`Hi! This is the most basic and useless text editor that no one should use.

You can type text and delete them. And navigate around the text (whaaaaaaaaaaaaaat!!).
Press Escape to exit and save it as file.

Continue? (Y/n) `);

    try {
        let userConfirm = (await s_prompt()).toLowerCase();

        if (userConfirm === '' || userConfirm === 'y') {
            s_clear();

            let textContent = await s_prompt("", {
                multiLine: true,
                onKeyDown: (event) => {
                    if (event.key === "Escape") {
                        event.currentTarget.dispatchEvent(new Event("finish"));
                    }
                }
            });

            s_clear();

            await s_print("Do you want to save the file? (Y/n) ");
            let userConfirmSave = (await s_prompt()).toLowerCase();

            if (userConfirmSave === '' || userConfirmSave === 'y') {
                await s_print('Save as: ');
                let fileName = await s_prompt();

                if (fileName === '') {
                    fileName = 'untitled';
                }

                await s_print(`Saving as ${fileName}...`);

                // Download file
                let element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(textContent));
                element.setAttribute('download', fileName);
                element.style.display = 'none';
                element.click();

                await s_print(' OK\n');
            }
        }
    } catch (e) {
        // User cancelled. Just exit the program.
    }
});
