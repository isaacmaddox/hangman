const alpha = "abcdefghijklmnopqrstuvwxyz";
const MAX_WORD_LENGTH = 15;
const RANDOM_URL = `https://random-word-api.herokuapp.com/word?lang=en&length=${Math.floor(Math.random() * (MAX_WORD_LENGTH - 5)) + 5}`;
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
let mpButton, spButton, guessButton, shareWordButton;
let shareDrawer;
let shareWordHeading;
let shareNameInput;
let shareButton;
let shareResultsDrawer;
let shareMistakesRemaining;
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
    shareWordButton = document.getElementById("share-word");
    shareDrawer = document.getElementById("share-drawer");
    shareWordHeading = document.getElementById("share-word-heading");
    shareNameInput = document.getElementById("sharer-name");
    shareButton = document.getElementById("share-button");
    shareResultsDrawer = document.getElementById("share-results-drawer");
    shareMistakesRemaining = document.getElementById("share-mistakes-remaining");

    setWordInput.setAttribute('maxlength', MAX_WORD_LENGTH);

    [setWordInput, guessLetterInput].forEach(field => {
        field.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                document.getElementById(field.dataset.target)?.click();
            }
        })
    })

    setWordInput.addEventListener('keydown', (e) => {
        clearError("start");

        if (e.code === `Key${e.key.toUpperCase()}` && setWordInput.value.length === parseInt(setWordInput.getAttribute("maxlength")) && !e.ctrlKey) {
            setWordInput.classList.add("invalid-input");
            error(`Word must be ${MAX_WORD_LENGTH} characters at most`, "start");

            setTimeout(() => {
                setWordInput.classList.remove("invalid-input");
            }, 501);
        }
    })

    setWordInput.addEventListener('keyup', (e) => {
        let dis = setWordInput.value.length > 0 && (setWordInput.value.length < 3 || setWordInput.value.length > MAX_WORD_LENGTH);
        mpButton.disabled = dis;
        shareWordButton.disabled = dis;
    })

    guessLetterInput.addEventListener('keyup', (e) => {
        guessButton.disabled = guessLetterInput.value === "";
    })

    if (location.search.includes("word")) {
        const sharedWord = unshuffleWord(decodeURIComponent(getQueryValue("word")));
        startingScreen.classList.add('open');

        word = sharedWord;
        return beginGame(true);
    }
    startingScreen.classList.add('open');

    fetch(RANDOM_URL)
        .then(r => r.json())
        .then(data => {
            spButton.disabled = false;
            randomWord = data[0];
            setWordInput.placeholder = randomWord;
        }).catch(e => {
            error("I can't think of random words right now.", "start");
        })
});

function getQueryValue(param) {
    return location.search.substring(1)?.split("&").find(w => w.startsWith(param))?.split("=")[1] ?? null;
}

function shuffleWord(word) {
    const original = word.toLowerCase();
    const off = Math.floor(Math.random() * 100);
    let newString = `${off}-`;

    for (let i = 0; i < original.length; ++i) {
        if (/[a-z]/.test(original.charAt(i))) {
            let pos = alpha.indexOf(original.charAt(i));
            let newPos = (pos + off);
            newString += newPos;
        } else {
            newString += original.charAt(i);
        }

        newString += (i < original.length - 1 ? "-" : "");
    }

    return newString;
}

function unshuffleWord(word) {
    const data = word.split("-");
    off = parseInt(data[0]);
    let newString = "";

    for (let i = 1; i < data.length; ++i) {
        if (!(/[0-9]{1,3}/.test(data[i]))) {
            newString += data[i];
        } else {
            let pos = parseInt(data[i]) - off;
            newString += alpha.charAt(pos);
        }
    }

    return newString;
}

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

function beginGame(wordDefined = false) {
    closeAllDrawers();

    if (!wordDefined) {
        let tmpWord = word ?? setWordInput.value;

        if (tmpWord.length === 0) tmpWord = randomWord;

        if (tmpWord.length < 3 || tmpWord.length > MAX_WORD_LENGTH) {
            error(`Word must be between 3 and ${MAX_WORD_LENGTH} characters.`, "start");
            setWordInput.focus();
            return;
        }

        word = tmpWord.toLowerCase();
        clearError("start");
        initGame();
    } else {
        clearError("start");
        initGame();
    }
}

function beginSingleplayerGame() {
    mpButton.disabled = true;
    spButton.disabled = true;
    spButton.textContent = "Thinking of a word...";
    shareWordButton.disabled = true;

    fetch(RANDOM_URL)
        .then(r => r.json())
        .then(data => {
            word = data[0];
            clearError("start");
            initGame();
        })
}

function initGame() {
    wordArray = [...word.replace(/[a-z]/g, "_")];
    startingScreen?.classList.remove("open");
    gameScreen?.classList.add("open");

    updateDisplay();
}

function shareResults() {
    openBrowserShare({
        url: `${location.origin}?word=${encodeURIComponent(shuffleWord(word))}`,
        text: `Hangman challenge. Completed with ${6 - mistakes_remaining} mistakes`
    });
}

function openShareDrawer(finished = false) {
    const shareWord = finished ? word : (setWordInput.value === "" ? randomWord : setWordInput.value);
    shareWordHeading.textContent = shareWord;

    shareButton.addEventListener('click', () => {
        openBrowserShare({
            url: `${location.origin}?word=${encodeURIComponent(shuffleWord(shareWord))}`,
            text: `Hangman challenge`
        })
    })

    openDrawer(shareDrawer);
}

function openShareResultsDrawer() {
    const num_mistakes = 6 - mistakes_remaining;
    const share_url = `${location.origin}?word=${encodeURIComponent(shuffleWord(word))}`;
    shareMistakesRemaining.textContent = num_mistakes;

    openDrawer(shareResultsDrawer);
}

function openDrawer(drawer) {
    document.querySelectorAll('.drawer').forEach(drawer => {
        drawer.classList.remove('open');
    });

    drawer.classList.add("open");
    initDrawerHandlers();
}

function initDrawerHandlers() {
    setTimeout(() => {
        document.body.addEventListener('click', closeAllDrawers);
    }, 1);
}

function closeAllDrawers(e = null) {
    if (e) {
        e.stopPropagation();

        if (e.target.closest(".drawer")) {
            return;
        }
    }

    document.querySelectorAll(".drawer").forEach(drawer => {
        drawer.classList.remove("open");
    });

    document.body.removeEventListener('click', closeAllDrawers);
}

function openBrowserShare(props) {
    navigator.share(props);
    closeAllDrawers();
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

    fitWordToScreen();
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
    startingScreen.classList.remove('open');
    gameOverScreen.classList.add('open');
}

function reloadPage() {
    gameOverScreen.classList.add("left");
    gameOverScreen.classList.remove("open");

    setTimeout(() => {
        window.location = location.origin;
    }, 500);
}

function fitWordToScreen() {
    let iters = 0;
    const wordDisplayWidth = wordDisplayText.getBoundingClientRect().width;
    let currentFS = parseInt(getComputedStyle(wordDisplayText).getPropertyValue("--font-size"));

    while (wordDisplayText.scrollWidth > wordDisplayWidth) {
        --currentFS;
        wordDisplayText.style.setProperty("--font-size", `${currentFS}px`);
    }
}
