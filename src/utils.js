/**
 * Sleeps for a given amount of time
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Loads a javascript file from the given URL
 * @param {string} url URL to the JS file
 * @return {Promise<void>} Resolves when the script is loaded or rejects if the script fails to load
 */
export function loadScript(url) {
    return new Promise((resolve, reject) => {
        let scriptEle = document.createElement('script');
        scriptEle.src = url;
        scriptEle.type = "module";

        scriptEle.onload = () => { resolve(); };
        scriptEle.onerror = () => { reject(); };

        document.body.appendChild(scriptEle);
    });
}
