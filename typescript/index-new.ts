class Hangman {
    private static RANDOM_URL = "https://random-word-form.herokuapp.com/random/noun";
    private word: string;
    private randomWord: string;
    private settings: Map<string, SettingValue>;
    private elements: Map<string, HTMLElement>;

    constructor() {
        this.settings = new Map();
        this.elements = new Map();
    }

    public pageLoaded(): void {
        this.registerElements();
        this.getElement("start-screen").classList.add("open");
    }

    private registerElements(): void {
        // Screens
        this.addElement("start-screen");
        this.addElement("game-screen");
        this.addElement("game-over-screen");

        // Inputs
        this.addElement("set-word");

        // Buttons
        this.addElement("sp-button", "#play-singleplayer");
        this.addElement("mp-button", "#play-multiplayer");
        this.addElement("share-button", "#share-word");
    }

    private addElement(key: string, selector: HTMLSelector = null): void {
        this.elements.set(
            key,
            selector ? document.querySelector(selector) : document.querySelector(`#${key}`),
        );
    }

    private getElement(key: string): HTMLElement {
        return this.elements.get(key);
    }

    private setSetting(key: string, value: SettingValue): void {
        this.settings.set(key, value);
        this.setCookie(key, value);
    }

    private setCookie(name: string, value: SettingValue): void {
        let d = new Date();
        d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${d};path=/`;
    }

    private deleteCookie(name: string): void {
        document.cookie = `${name}=;expires=${new Date()};path=/`;
    }

    private getCookie(name: string): SettingValue {
        const value = document.cookie.split(";").find(c => c.trim().startsWith(name))?.split("=")[1] ?? null;

        // Parse the value as the appropriate type
        if (/[0-9]+/.test(value)) {
            return parseInt(value);
        } else if (/true|false/.test(value)) {
            return value === "true";
        } else {
            return value;
        }
    }

    private async getRandomWord() {
        return await (await fetch(Hangman.RANDOM_URL)).json()[0];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const game = new Hangman();
    game.pageLoaded();
})