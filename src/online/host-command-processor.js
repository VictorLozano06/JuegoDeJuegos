// Executes guest requests against the authoritative game, never arbitrary methods.
// A prepared result is retained across failed network requests so a retry does
// not run the same game action twice.
const ACTIONS = Object.freeze({
    setWorkMode: args => args.length === 1 && ['normal', 'relaxed', 'crunch'].includes(args[0]),
    purchaseOffice: args => args.length === 1 && typeof args[0] === 'string' && args[0].length <= 80,
    activateOffice: args => args.length === 1 && typeof args[0] === 'string' && args[0].length <= 80,
    orderTeamCoffee: args => args.length === 0,
    sendOnVacation: args => args.length === 1 && typeof args[0] === 'string' && args[0].length <= 80,
    startTechResearch: args => args.length === 1 && typeof args[0] === 'string' && args[0].length <= 80,
    startTopicResearch: args => args.length === 1 && typeof args[0] === 'string' && args[0].length <= 80,
    startGenreResearch: args => args.length === 1 && typeof args[0] === 'string' && args[0].length <= 80
});

export class HostCommandProcessor {
    constructor({ game, saves, request, sessionId, revision = 0 }) {
        Object.assign(this, { game, saves, request, sessionId, revision });
        this.pending = new Map();
        this.running = false;
    }

    async process() {
        if (this.running) return;
        this.running = true;
        try {
            for (const [id, prepared] of this.pending) {
                const response = await this.request('command-complete', prepared);
                this.revision = response.revision;
                this.pending.delete(id);
            }
            const { commands } = await this.request('commands', { id: this.sessionId });
            for (const command of commands) {
                let prepared = this.pending.get(command.id);
                if (!prepared) {
                    const valid = Object.hasOwn(ACTIONS, command.action) && Array.isArray(command.args) && ACTIONS[command.action](command.args);
                    let result;
                    if (!valid || typeof this.game[command.action] !== 'function') {
                        result = { success: false, message: 'Esta acción no está disponible online.' };
                    } else {
                        try {
                            const value = this.game[command.action](...command.args);
                            result = { success: value?.success !== false, message: String(value?.message || 'Acción realizada.').slice(0, 500) };
                        } catch {
                            result = { success: false, message: 'No se ha podido ejecutar la acción.' };
                        }
                    }
                    prepared = { id: this.sessionId, commandId: command.id, ...result, revision: this.revision };
                    if (result.success) prepared.snapshot = this.saves.exportSnapshot(this.game);
                    this.pending.set(command.id, prepared);
                }
                const response = await this.request('command-complete', prepared);
                this.revision = response.revision;
                this.pending.delete(command.id);
            }
        } finally { this.running = false; }
    }
}
