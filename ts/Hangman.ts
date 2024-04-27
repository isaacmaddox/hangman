/// <reference path="ElementManager.ts" />

class Hangman extends ElementManager {
    private static RANDOM_URL = "https://random-word-form.herokuapp.com/random/noun";
    private game: Game;
    private randomWord: string;
    private settings: Map<string, SettingValue>;

    constructor() {
        super();
        this.settings = new Map();
    }

    public async pageLoaded(): Promise<void> {
        this.registerElements();
        this.getElement("start-screen").classList.add("open");

        const [random] = await Hangman.getRandomWord();
        this.randomWord = random;
        this.getElement("set-word").setAttribute("placeholder", random);

        this.eachElement(["sp-button", "mp-button", "share-button"], (btn) => {
            btn.disabled = false;
        });

        this.getElement("mp-button").addEventListener("click", () => { this.startGame() });
    }

    public startGame(): void {
        const inputWord = (this.getElement("set-word") as HTMLInputElement).value.trim();
        this.getElement("start-screen").classList.remove("open");

        // #TODO Use settings for number of guesses
        this.game = new Game(inputWord.length === 0 ? this.randomWord : inputWord, 6);
    }

    private registerElements(): void {
        // Screens
        this.addElement("start-screen");

        // Inputs
        this.addElement("set-word").addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                this.startGame();
            }
            // #TODO: Add check for word too long
        });
        this.addElement("error", "#start-error");

        // Buttons
        this.addElement("sp-button", "#play-singleplayer").addEventListener("click", async (e) => {
            this.eachElement(["sp-button", "mp-button", "share-button"], (btn) => {
                btn.disabled = true;
            });
            (e.target as HTMLButtonElement).textContent = "Thinking of a word...";
            const [random] = await Hangman.getRandomWord();
            // #TODO: Change 6 for guesses allowed setting
            this.game = new Game(random, 6);
            this.getElement("start-screen").classList.remove("open");
        })
        this.addElement("mp-button", "#play-multiplayer");
        this.addElement("share-button", "#share-word");
    }

    private eachElement(keys: string[], callback: CallableFunction): void {
        keys.forEach(selector => {
            callback(this.getElement(selector));
        });
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

    private error(message: string): void {
        this.getElement("error").textContent = message;
        this.errorInput();
    }

    private errorInput(): void {
        const input = this.getElement("set-word");

        input.classList.add("invalid-input");

        setTimeout(() => {
            input.classList.remove("invalid-input");
        }, 500);
    }

    private static async getRandomWord(): Promise<string> {
        try {
            return await (await fetch(Hangman.RANDOM_URL)).json();
        } catch (err) {
        }
    }

    public getGame(): Game {
        return this.game;
    }
}
