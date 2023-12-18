export class PromptCancelEvent extends CustomEvent {
    constructor(options = {}) {
        super('cancel', {
            detail: {
                remove: options.remove
            }
        });
    }
}
