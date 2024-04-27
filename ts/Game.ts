/// <reference path="ElementManager.ts" />

class Game extends ElementManager {
    private word: string;
    private display_word: string[];
    private allowed_mistakes: number;
    private num_mistakes: number;
    private game_over: boolean;
    private guesses: string[];

    constructor(newWord: string, newAllowedMistakes: number) {
        super();

        this.word = newWord.toLowerCase();
        
        this.allowed_mistakes = newAllowedMistakes;
        this.num_mistakes = 0;
        this.game_over = false;
        this.guesses = [];

        this.registerElements();
        this.startGame();
    }

    private startGame(): void {
        this.display_word = this.word.replace(/[a-z]/g, "_").split("");
        
        this.updateDisplay();
        this.fitWordToScreen();
        this.getElement("game-screen").classList.add("open");
    }

    private guess(): void {
        if (this.game_over) return;

        const userGuess = (this.getElement("guess-letter") as HTMLInputElement).value.trim().toLowerCase();
        let letterFound: boolean = false;

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

        (this.getElement("guess-letter") as HTMLInputElement).value = "";
        this.clearError();
        this.checkGameOver();
        this.updateDisplay();
    }

    private error(message: string): void {
        this.getElement("error").textContent = message;
        this.errorInput();
    }

    private clearError(): void {
        this.getElement("error").textContent = "";
    }
    
    private errorInput(): void {
        const input = this.getElement("guess-letter");

        input.classList.add("invalid-input");

        setTimeout(() => {
            input.classList.remove("invalid-input");
        }, 500);
    }

    private updateDisplay(): void {
        this.getElement("word-display").textContent = this.display_word.join("");
        this.getElement("mistakes-remaining").textContent = (this.allowed_mistakes - this.num_mistakes).toString();
    }

    private fitWordToScreen(): void {
        const wordDisplayText = this.getElement("word-display");

        const wordDisplayWidth = wordDisplayText.getBoundingClientRect().width;
        let currentFS = parseInt(getComputedStyle(wordDisplayText).getPropertyValue("--font-size"));

        while (wordDisplayText.scrollWidth > wordDisplayWidth) {
            --currentFS;
            wordDisplayText.style.setProperty("--font-size", `${currentFS}px`);
        }
    }

    private checkGameOver(): void {
        if (this.num_mistakes === this.allowed_mistakes) {
            // Game is over, lost
            // #TODO: Make game over logic for loss
        } else if (this.display_word.join("") === this.word) {
            alert("You win!");
        }
    }

    private registerElements(): void {
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

    public getWord(): string {
        return this.word;
    }
}