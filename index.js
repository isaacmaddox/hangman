class Hangman {
    static RANDOM_URL = "https://random-word-form.herokuapp.com/random/noun";
    word;
    randomWord;
    settings;
    elements;
    constructor() {
        this.settings = new Map();
        this.elements = new Map();
    }
    pageLoaded() {
        this.registerElements();
        this.getElement("start-screen").classList.add("open");
    }
    registerElements() {
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
    addElement(key, selector = null) {
        this.elements.set(key, selector ? document.querySelector(selector) : document.querySelector(`#${key}`));
    }
    getElement(key) {
        return this.elements.get(key);
    }
    setSetting(key, value) {
        this.settings.set(key, value);
        this.setCookie(key, value);
    }
    setCookie(name, value) {
        let d = new Date();
        d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${d};path=/`;
    }
    deleteCookie(name) {
        document.cookie = `${name}=;expires=${new Date()};path=/`;
    }
    getCookie(name) {
        const value = document.cookie.split(";").find(c => c.trim().startsWith(name))?.split("=")[1] ?? null;
        // Parse the value as the appropriate type
        if (/[0-9]+/.test(value)) {
            return parseInt(value);
        }
        else if (/true|false/.test(value)) {
            return value === "true";
        }
        else {
            return value;
        }
    }
    async getRandomWord() {
        return await (await fetch(Hangman.RANDOM_URL)).json()[0];
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const game = new Hangman();
    game.pageLoaded();
});
