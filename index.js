let word;
let wordArray;
let guessedLetters = [];
let mistakes_remaining = 6;
let setWordInput;
let guessLetterInput;
let mistakeCountText;
let wordDisplayText;
let startingScreen;
let gameScreen;
let gameOverScreen;
let gameOverTitle;
let letterDisplay;
let setupErrorText;
let gameErrorText;
let revealWordText;
let randomWord;
let mpButton, spButton, guessButton;
let game_over = false;

document.addEventListener("DOMContentLoaded", () => {
    setWordInput = document.getElementById("set-word");
    guessLetterInput = document.getElementById("guess-letter");
    mistakeCountText = document.getElementById("mistakes-remaining");
    startingScreen = document.getElementById("starting-screen");
    gameScreen = document.getElementById("game-screen");
    gameOverScreen = document.getElementById("game-over-screen");
    wordDisplayText = document.getElementById("word-display");
    letterDisplay = document.getElementById("letter-display");
    setupErrorText = document.getElementById("start-error");
    gameErrorText = document.getElementById("game-error");
    revealWordText = document.getElementById("reveal-word");
    gameOverTitle = document.getElementById("game-over-title");
    mpButton = document.getElementById("play-multiplayer");
    spButton = document.getElementById("play-singleplayer");
    guessButton = document.getElementById("guess-button");

    [setWordInput, guessLetterInput].forEach(field => {
        field.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                field.nextElementSibling.click();
            }
        })
    })

    setWordInput.addEventListener('keydown', (e) => {
        clearError("start");

        if (e.code === `Key${e.key.toUpperCase()}` && setWordInput.value.length === parseInt(setWordInput.getAttribute("maxlength"))) {
            setWordInput.classList.add("invalid-input");
            error("Word must be 10 characters at most", "start");

            setTimeout(() => {
                setWordInput.classList.remove("invalid-input");
            }, 501);
        }
    })

    setWordInput.addEventListener('keyup', (e) => {
        mpButton.disabled = setWordInput.value.length > 0 && (setWordInput.value.length < 3 || setWordInput.value.length > 10);
    })

    guessLetterInput.addEventListener('keyup', (e) => {
        guessButton.disabled = guessLetterInput.value === 0;
    })

    fetch(`https://random-word-api.herokuapp.com/word?lang=en&length=${Math.floor(Math.random() * 5) + 5}`)
        .then(r => r.json())
        .then(data => {
            randomWord = data[0];
            setWordInput.placeholder = randomWord;
            startingScreen.classList.add('open');
        })
});

function error(msg, which = "game") {
    if (which === "start") {
        setupErrorText.textContent = msg;
    } else {
        gameErrorText.textContent = msg;
    }
}

function clearError(which = "game") {
    if (which === "start") {
        setupErrorText.textContent = "";
    } else {
        gameErrorText.textContent = "";
    }
}

function beginGame() {
    let tmpWord = setWordInput.value;

    if (tmpWord.length === 0) tmpWord = randomWord;

    if (tmpWord.length < 3 || tmpWord.length > 10) {
        error("Word must be between 3 and 10 characters.", "start");
        setWordInput.focus();
        return;
    }

    word = tmpWord.toLowerCase();
    clearError("start");
    initGame();
}

function beginSingleplayerGame() {
    mpButton.disabled = true;
    spButton.disabled = true;
    spButton.textContent = "Thinking of a word...";

    fetch(`https://random-word-api.herokuapp.com/word?lang=en&length=${Math.floor(Math.random() * 5) + 5}`)
        .then(r => r.json())
        .then(data => {
            word = data[0];
            clearError("start");
            initGame();
        })
}

function initGame() {
    wordArray = [...word.replace(/[^ ]/g, "_")];
    startingScreen?.classList.remove("open");
    gameScreen?.classList.add("open");

    updateDisplay();
}

function updateDisplay(correctGuess = false) {
    wordDisplayText.textContent = wordArray.join("");
    mistakeCountText.textContent = mistakes_remaining;
    guessLetterInput.value = "";
    guessLetterInput.focus();

    if (guessedLetters.length > 0) {
        const letter = letterDisplay.querySelector(`#${guessedLetters[guessedLetters.length - 1]}`);

        if (letter) {
            letter.classList.add("guessed");
        }

        if (!correctGuess) {
            letter.classList.add("incorrect");
        }
    }
}

function guess(letter = null) {
    const userGuess = letter ?? guessLetterInput.value.toLowerCase();
    let letterFound = false;

    if (game_over) return;

    clearError();

    if (!letter && userGuess.length > 1 && userGuess.length !== word.length) {
        error("Your guess is not the correct amount of letters");
        return;
    } else if (userGuess.length === word.length) {
        if (userGuess === word) {
            return endGame(true);
        } else {
            --mistakes_remaining;

            guessLetterInput.classList.add('invalid-input');
            setTimeout(() => {
                guessLetterInput.classList.remove('invalid-input');
            }, 501);

            return updateDisplay();
        }
    }

    if (userGuess === "") {
        error("Please enter a letter");
        return;
    } else if (!(/[a-z]/.test(userGuess))) {
        error("Please only guess letters");
        return;
    } else if (guessedLetters.includes(userGuess)) {
        error("You have already guessed this letter");
        return;
    }

    for (let i = 0; i < word.length; ++i) {
        if (word[i] === userGuess) {
            letterFound = true;
            wordArray[i] = word[i];
        }
    }

    if (!letterFound && !letter) {
        --mistakes_remaining;
    }

    if (!wordArray.includes("_")) {
        game_over = true;
        endGame(true);
    }

    if (mistakes_remaining === 0) {
        game_over = true;
        return endGame(false);
    }

    guessedLetters.push(userGuess);
    updateDisplay(letterFound);
}

function endGame(win) {
    gameOverTitle.textContent = win ? "Congratulations!" : "Game Over!";
    revealWordText.textContent = word;
    guessLetterInput.blur();

    gameScreen.classList.remove('open');
    gameOverScreen.classList.add('open');
}

function reloadPage() {
    gameOverScreen.classList.add("left");
    gameOverScreen.classList.remove("open");

    setTimeout(() => {
        location.reload();
    }, 500);
}