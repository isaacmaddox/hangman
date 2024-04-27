class ElementManager {
    eles;
    constructor() {
        this.eles = new Map();
    }
    addElement(key, selector = null) {
        const ele = selector ? document.querySelector(selector) : document.querySelector(`#${key}`);
        this.eles.set(key, ele);
        return ele;
    }
    getElement(key) {
        return this.eles.get(key);
    }
}
function $(selector) {
    return document.querySelector(selector);
}
/// <reference path="ElementManager.ts" />
class Game extends ElementManager {
    word;
    display_word;
    allowed_mistakes;
    num_mistakes;
    game_over;
    guesses;
    constructor(newWord, newAllowedMistakes) {
        super();
        this.word = newWord.toLowerCase();
        this.allowed_mistakes = newAllowedMistakes;
        this.num_mistakes = 0;
        this.game_over = false;
        this.guesses = [];
        this.registerElements();
        this.startGame();
    }
    startGame() {
        this.display_word = this.word.replace(/[a-z]/g, "_").split("");
        this.updateDisplay();
        this.fitWordToScreen();
        this.getElement("game-screen").classList.add("open");
    }
    guess() {
        if (this.game_over)
            return;
        const userGuess = this.getElement("guess-letter").value.trim().toLowerCase();
        let letterFound = false;
        if (this.guesses.includes(userGuess)) {
            this.errorInput();
            return this.error("You have already guessed this");
        }
        if (userGuess.length > 1 && userGuess.length !== this.word.length) {
            return this.error("Your guess is not the right length");
        }
        if (userGuess.length === this.word.length && userGuess !== this.word) {
            ++this.num_mistakes;
            this.updateDisplay();
            return this.errorInput();
        }
        if (userGuess === this.word) {
            this.display_word = this.word.split("");
            this.updateDisplay();
            // #TODO: Add win condition here
            return;
        }
        console.log(userGuess);
        $(`#${userGuess}`).classList.add("guessed");
        for (let i = 0; i < this.word.length; ++i) {
            console.log(this.word.charAt(i));
            if (this.word.charAt(i) === userGuess) {
                letterFound = true;
                this.display_word[i] = userGuess;
            }
        }
        if (!letterFound) {
            ++this.num_mistakes;
            $(`#${userGuess}`).classList.add("incorrect");
            this.errorInput();
        }
        this.getElement("guess-letter").value = "";
        this.clearError();
        this.checkGameOver();
        this.updateDisplay();
    }
    error(message) {
        this.getElement("error").textContent = message;
        this.errorInput();
    }
    clearError() {
        this.getElement("error").textContent = "";
    }
    errorInput() {
        const input = this.getElement("guess-letter");
        input.classList.add("invalid-input");
        setTimeout(() => {
            input.classList.remove("invalid-input");
        }, 500);
    }
    updateDisplay() {
        this.getElement("word-display").textContent = this.display_word.join("");
        this.getElement("mistakes-remaining").textContent = (this.allowed_mistakes - this.num_mistakes).toString();
    }
    fitWordToScreen() {
        const wordDisplayText = this.getElement("word-display");
        const wordDisplayWidth = wordDisplayText.getBoundingClientRect().width;
        let currentFS = parseInt(getComputedStyle(wordDisplayText).getPropertyValue("--font-size"));
        while (wordDisplayText.scrollWidth > wordDisplayWidth) {
            --currentFS;
            wordDisplayText.style.setProperty("--font-size", `${currentFS}px`);
        }
    }
    checkGameOver() {
        if (this.num_mistakes === this.allowed_mistakes) {
            // Game is over, lost
            // #TODO: Make game over logic for loss
        }
        else if (this.display_word.join("") === this.word) {
            alert("You win!");
        }
    }
    registerElements() {
        this.addElement("game-screen");
        this.addElement("word-display");
        this.addElement("guess-letter").addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.guess();
            }
        });
        this.addElement("mistakes-remaining");
        this.addElement("error", "#game-error");
    }
    getWord() {
        return this.word;
    }
}
/// <reference path="ElementManager.ts" />
class Hangman extends ElementManager {
    static RANDOM_URL = "https://random-word-form.herokuapp.com/random/noun";
    game;
    randomWord;
    settings;
    constructor() {
        super();
        this.settings = new Map();
    }
    async pageLoaded() {
        this.registerElements();
        this.getElement("start-screen").classList.add("open");
        const [random] = await Hangman.getRandomWord();
        this.randomWord = random;
        this.getElement("set-word").setAttribute("placeholder", random);
        this.eachElement(["sp-button", "mp-button", "share-button"], (btn) => {
            btn.disabled = false;
        });
        this.getElement("mp-button").addEventListener("click", () => { this.startGame(); });
    }
    startGame() {
        const inputWord = this.getElement("set-word").value.trim();
        this.getElement("start-screen").classList.remove("open");
        // #TODO Use settings for number of guesses
        this.game = new Game(inputWord.length === 0 ? this.randomWord : inputWord, 6);
    }
    registerElements() {
        // Screens
        this.addElement("start-screen");
        // Inputs
        this.addElement("set-word").addEventListener("keydown", (e) => {
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
            e.target.textContent = "Thinking of a word...";
            const [random] = await Hangman.getRandomWord();
            // #TODO: Change 6 for guesses allowed setting
            this.game = new Game(random, 6);
            this.getElement("start-screen").classList.remove("open");
        });
        this.addElement("mp-button", "#play-multiplayer");
        this.addElement("share-button", "#share-word");
    }
    eachElement(keys, callback) {
        keys.forEach(selector => {
            callback(this.getElement(selector));
        });
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
    error(message) {
        this.getElement("error").textContent = message;
        this.errorInput();
    }
    errorInput() {
        const input = this.getElement("set-word");
        input.classList.add("invalid-input");
        setTimeout(() => {
            input.classList.remove("invalid-input");
        }, 500);
    }
    static async getRandomWord() {
        try {
            return await (await fetch(Hangman.RANDOM_URL)).json();
        }
        catch (err) {
        }
    }
    getGame() {
        return this.game;
    }
}
let game;
document.addEventListener("DOMContentLoaded", () => {
    game = new Hangman();
    game.pageLoaded();
});
