const alpha = "abcdefghijklmnopqrstuvwxyz";
let MAX_WORD_LENGTH = 15;
// const RANDOM_URL = `https://random-word-api.herokuapp.com/word?lang=en&length=${Math.floor(Math.random() * (MAX_WORD_LENGTH - 5)) + 5}`;
const RANDOM_URL = "https://random-word-form.herokuapp.com/random/noun";
let word;
let wordArray;
let guessedLetters = [];
let mistakes_remaining = 6;
let num_attempts;
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
let shareCompletedMessage;
let settingsDrawer;
let themeCheckbox;
let motionCheckbox;
let numAttemptsInput;
let maxLengthInput;
let numAttemptsText, numAttemptsSetting;
let shareAttempts;
let game_over = true;

function $(selector) {
    return document.querySelector(selector);
}

document.addEventListener("DOMContentLoaded", () => {
    setWordInput = $("#set-word");
    guessLetterInput = $("#guess-letter");
    mistakeCountText = $("#mistakes-remaining");
    startingScreen = $("#starting-screen");
    gameScreen = $("#game-screen");
    gameOverScreen = $("#game-over-screen");
    wordDisplayText = $("#word-display");
    letterDisplay = $("#letter-display");
    setupErrorText = $("#start-error");
    gameErrorText = $("#game-error");
    revealWordText = $("#reveal-word");
    gameOverTitle = $("#game-over-title");
    mpButton = $("#play-multiplayer");
    spButton = $("#play-singleplayer");
    guessButton = $("#guess-button");
    shareWordButton = $("#share-word");
    shareDrawer = $("#share-drawer");
    shareWordHeading = $("#share-word-heading");
    shareNameInput = $("#sharer-name");
    shareButton = $("#share-button");
    shareResultsDrawer = $("#share-results-drawer");
    shareMistakesRemaining = $("#share-mistakes-remaining");
    shareCompletedMessage = $("#share-results-completed-message");
    settingsDrawer = $("#settings-drawer");
    themeCheckbox = $("#theme-toggle");
    motionCheckbox = $("#reduce-motion");
    numAttemptsInput = $("#num-tries");
    maxLengthInput = $("#max-length");
    numAttemptsText = $("#num-attempts-message");
    numAttemptsSetting = $("#num-attempts-setting");
    shareAttempts = $("#share-attempts");

    setWordInput.setAttribute('maxlength', MAX_WORD_LENGTH);

    if (!getCookie("theme") && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setCookie("theme", "dark");
    } else if (!getCookie("theme")) {
        setCookie("theme", "light");
    }

    setDefaultSettings();

    [setWordInput, guessLetterInput].forEach(field => {
        field.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                $(`#${field.dataset.target}`)?.click();
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
        let dis = (setWordInput.value.length > 0 && (setWordInput.value.length < 3 || setWordInput.value.length > MAX_WORD_LENGTH)) || randomWord === undefined && setWordInput.value.length === 0;
        mpButton.disabled = dis;
        shareWordButton.disabled = dis;
    })

    if (location.search.includes("word")) {
        const sharedWord = unshuffleWord(decodeURIComponent(getQueryValue("word")));
        startingScreen.classList.add('open');

        word = sharedWord;
        if (getQueryValue("attempts")) {
            num_attempts = parseInt(getQueryValue("attempts"));
            mistakes_remaining = num_attempts;
        }
        return beginGame(true);
    }
    startingScreen.classList.add('open');

    assignRandomWord();
});

async function assignRandomWord() {
    const word = await getRandomWord();

    randomWord = word;
    spButton.disabled = false;
    shareWordButton.disabled = false;
    mpButton.disabled = false;
    setWordInput.placeholder = randomWord;
}

async function getRandomWord() {
    const [word] = await (await fetch(RANDOM_URL)).json();

    if (word.length < 3 || word.length > MAX_WORD_LENGTH) return getRandomWord();
    else return word;
}

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

async function beginSingleplayerGame() {
    mpButton.disabled = true;
    spButton.disabled = true;
    spButton.textContent = "Thinking of a word...";
    shareWordButton.disabled = true;

    word = await getRandomWord();
    clearError("start");
    initGame();
}

function initGame() {
    game_over = false;
    wordArray = [...word.replace(/[a-z]/g, "_")];
    startingScreen?.classList.remove("open");
    gameScreen?.classList.add("open");

    updateDisplay();
}

function shareResults() {
    openBrowserShare({
        url: `${location.origin}?word=${encodeURIComponent(shuffleWord(word))}`,
        text: `Hangman challenge. Completed with ${num_attempts - mistakes_remaining} mistakes`
    });
}

function shareSite() {
    openBrowserShare({
        url: `${location.origin}`,
        text: "Play Hangman!"
    });
}

function openShareDrawer(finished = false) {
    const shareWord = finished ? word : (setWordInput.value === "" ? randomWord : setWordInput.value);
    shareWordHeading.textContent = shareWord;

    shareButton.addEventListener('click', () => {
        openBrowserShare({
            url: `${location.origin}?word=${encodeURIComponent(shuffleWord(shareWord))}${shareAttempts.value.trim() !== "" ? `&attempts=${parseInt(shareAttempts.value)}` : ""}`,
            text: `Hangman challenge`
        })
    })

    openDrawer(shareDrawer);
}

function openShareResultsDrawer() {
    const num_mistakes = num_attempts - mistakes_remaining;

    if (num_mistakes < num_attempts) {
        shareMistakesRemaining.textContent = num_mistakes;
    } else {
        shareCompletedMessage.textContent = "You weren't able to get this one.";
    }


    openDrawer(shareResultsDrawer);
}

function openSettingsDrawer() {
    controlNumAttemptsSetting();
    openDrawer(settingsDrawer);
}

function openDrawer(drawer) {
    document.querySelectorAll('.drawer').forEach(d => {
        d.classList.remove('open');
    });

    drawer.classList.add("open");
    initDrawerHandlers();
}

function initDrawerHandlers() {
    setTimeout(() => {
        document.body.addEventListener('click', closeAllDrawers);
        document.body.addEventListener('keydown', closeOnEscape)
    }, 1);
}

function closeOnEscape(e) {
    if (e.key === "Escape") {
        closeAllDrawers();
    }
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
    document.body.removeEventListener('keydown', closeOnEscape);
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
    const userGuess = letter ?? guessLetterInput.value.toLowerCase().trim();
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
        endGame(true);
    }

    if (mistakes_remaining === 0) {
        return endGame(false);
    }

    guessedLetters.push(userGuess);
    updateDisplay(letterFound);
}

function endGame(win) {
    game_over = true;
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
    const wordDisplayWidth = wordDisplayText.getBoundingClientRect().width;
    let currentFS = parseInt(getComputedStyle(wordDisplayText).getPropertyValue("--font-size"));

    while (wordDisplayText.scrollWidth > wordDisplayWidth) {
        --currentFS;
        wordDisplayText.style.setProperty("--font-size", `${currentFS}px`);
    }
}

function updateTheme() {
    setCookie("theme", !themeCheckbox.checked ? "light" : "dark");
    document.body.classList.remove(themeCheckbox.checked ? "light" : "dark");
    document.body.classList.add(!themeCheckbox.checked ? "light" : "dark");
}

function updateSettings() {
    // Set theme
    setCookie("theme", !themeCheckbox.checked ? "light" : "dark");
    document.body.classList.remove(themeCheckbox.checked ? "light" : "dark");
    document.body.classList.add(!themeCheckbox.checked ? "light" : "dark");

    // Set reduced motion
    if (motionCheckbox.checked) {
        setCookie("reduce-motion", true);
        document.body.classList.add("reduce-motion");
    } else {
        removeCookie("reduce-motion");
        document.body.classList.remove("reduce-motion");
    }

    // Set number of attempts
    if (numAttemptsInput.value !== "" && numAttemptsInput.value != mistakes_remaining && game_over) {
        setCookie("num-attempts", parseInt(numAttemptsInput.value));
        mistakes_remaining = parseInt(numAttemptsInput.value);
        num_attempts = numAttemptsInput.value;
    } else if (numAttemptsInput.value === "" && game_over) {
        removeCookie("num-attempts");
        num_attempts = 6;
        mistakes_remaining = num_attempts;
    }

    // Set max word length
    if (maxLengthInput.value !== "" && maxLengthInput.value != MAX_WORD_LENGTH) {
        setCookie("max-length", parseInt(maxLengthInput.value));
        MAX_WORD_LENGTH = parseInt(maxLengthInput.value);
        setWordInput.setAttribute("maxlength", MAX_WORD_LENGTH);
        assignRandomWord();
    } else if (maxLengthInput.value === "" && MAX_WORD_LENGTH !== 15) {
        MAX_WORD_LENGTH = 15;
        setWordInput.setAttribute("maxlength", MAX_WORD_LENGTH);
        removeCookie("max-length");
        assignRandomWord();
    }
}

function setDefaultSettings() {
    themeCheckbox.checked = getCookie("theme") === "dark";
    motionCheckbox.checked = getCookie("reduce-motion") === "true";
    document.body.classList.add(getCookie("theme"));

    if (getCookie("reduce-motion")) {
        document.body.classList.add("reduce-motion");
    }

    numAttemptsInput.value = getCookie("num-attempts") ?? "";
    num_attempts = parseInt(getCookie("num-attempts") ?? 6);
    mistakes_remaining = num_attempts;

    maxLengthInput.value = getCookie("max-length") ?? "";
    MAX_WORD_LENGTH = parseInt(getCookie("max-length") ?? 15);
    setWordInput.setAttribute("maxlength", MAX_WORD_LENGTH);
}

function setCookie(name, value) {
    let d = new Date();
    d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${d};path=/`;
}

function getCookie(name) {
    return document.cookie.split(";").find(s => s.trim().startsWith(name))?.split("=")[1] ?? null;
}

function removeCookie(name) {
    document.cookie = `${name}=;expires=${new Date(0)};path=/`;
}

function exitWithoutSaving() {
    closeAllDrawers();
    setDefaultSettings();
}

function closeAndSave() {
    closeAllDrawers();
    updateSettings();
}

function controlNumAttemptsSetting() {
    if (game_over) {
        numAttemptsText.textContent = "Customize the number of attempts";
        numAttemptsInput.disabled = false;
        numAttemptsSetting.classList.remove("disabled");
    } else {
        numAttemptsText.textContent = "You can't edit this setting during a game";
        numAttemptsInput.disabled = true;
        numAttemptsSetting.classList.add("disabled");
    }
}