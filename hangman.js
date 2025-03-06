// Load sound effects from static folder
const correctSound = new Audio("/static/sounds/correct.mp3");
const wrongSound = new Audio("/static/sounds/wrong.mp3");
const winSound = new Audio("/static/sounds/win.mp3");
const loseSound = new Audio("/static/sounds/lose.mp3");

// APIs
const RANDOM_WORD_API = "https://random-word-api.herokuapp.com/word?number=1"; 
const DICTIONARY_API = "https://api.datamuse.com/words?sp="; 

let wordLength = 0;  // Stores the length of the chosen word
let guessedLetters = [];
let attemptsLeft = 7;
let timeLeft = 60;
let timerInterval;

const wordDisplay = document.getElementById("word-display");
const attemptsDisplay = document.getElementById("attempts");
const timerDisplay = document.getElementById("timer");
const hintBtn = document.getElementById("hint-btn");
const giveUpBtn = document.getElementById("give-up-btn");
const restartBtn = document.getElementById("restart-btn");
const keyboard = document.getElementById("keyboard");

// ✅ Fetch a random word and set its length
async function fetchRandomWord() {
    try {
        let response = await fetch(RANDOM_WORD_API);
        let data = await response.json();
        let chosenWord = data[0].toUpperCase(); // Convert to uppercase

        wordLength = chosenWord.length; // Store the word length
        guessedLetters = new Array(wordLength).fill("_"); // Generate blanks dynamically
        updateWordDisplay();
        createKeyboard(); // Ensure keyboard is recreated after fetching the word
    } catch (error) {
        console.error("Error fetching word:", error);
        wordLength = 7;  // Default fallback length
        guessedLetters = new Array(wordLength).fill("_"); 
        updateWordDisplay();
        createKeyboard(); // Recreate keyboard
    }
}

// ✅ Start the game timer
function startTimer() {
    timeLeft = 60;
    timerDisplay.innerText = timeLeft;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            playSound(loseSound);
            alert("⏳ Time's up! You lost!");
            disableAllButtons();
        }
    }, 1000);
}

// ✅ Update the word display (shows correct number of blanks dynamically)
function updateWordDisplay() {
    wordDisplay.innerHTML = guessedLetters
        .map((letter, index) => {
            return `<span class="letter" onclick="fillLetter(${index})">${letter}</span>`;
        })
        .join(" ");
}

// ✅ Allow user to enter any letter into any blank
function fillLetter(index) {
    let selectedLetter = prompt("Enter a letter:").toUpperCase();
    if (selectedLetter && /^[A-Z]$/.test(selectedLetter)) {
        guessedLetters[index] = selectedLetter; // Update blank
        playSound(correctSound);
        updateWordDisplay();
        checkWin();
    }
}

// ✅ Handle keyboard clicks & allow multiple letter usage
function handleGuess(letter) {
    let emptyIndexes = guessedLetters.map((l, i) => l === "_" ? i : -1).filter(i => i !== -1);
    
    if (emptyIndexes.length > 0) {
        guessedLetters[emptyIndexes[0]] = letter; // Fill first available blank
        playSound(correctSound);
        updateWordDisplay();
        checkWin();
    }
}

// ✅ Check if the guessed word is valid
async function checkWin() {
    if (!guessedLetters.includes("_")) {
        let guessedWord = guessedLetters.join("").toLowerCase();

        // Validate word using dictionary API
        let response = await fetch(DICTIONARY_API + guessedWord + "&max=1");
        let data = await response.json();

        if (data.length > 0 && data[0].word === guessedWord) {
            clearInterval(timerInterval);
            playSound(winSound);
            alert(`🎉 Congratulations! "${guessedWord.toUpperCase()}" is a valid word!`);
            triggerConfetti();
            disableAllButtons();
        } else {
            playSound(wrongSound);
            alert(`❌ "${guessedWord.toUpperCase()}" is not a real word! Try again.`);
            guessedLetters = new Array(wordLength).fill("_"); // Reset blanks
            updateWordDisplay();
        }
    }
}

// ✅ Disable all keyboard buttons
function disableAllButtons() {
    document.querySelectorAll(".key").forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = 0.5;
    });
}

// ✅ Restart the game (Restores keyboard, blanks, and fetches a new word)
async function restartGame() {
    attemptsLeft = 7;
    attemptsDisplay.innerText = attemptsLeft;
    
    await fetchRandomWord(); // Fetch new word length & reset blanks

    document.querySelectorAll(".key").forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = 1;
    });

    clearInterval(timerInterval);
    startTimer();
}

// ✅ Give up functionality (Lets the user give up but doesn't reveal the exact word)
function giveUp() {
    alert("🏳️ You gave up! Try again.");
    disableAllButtons();
}

// ✅ Play sound function
function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}

// ✅ Generate keyboard buttons dynamically
function createKeyboard() {
    keyboard.innerHTML = "";
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(letter => {
        let button = document.createElement("button");
        button.classList.add("key");
        button.innerText = letter;
        button.onclick = () => handleGuess(letter);
        keyboard.appendChild(button);
    });
}

// ✅ Start the game
fetchRandomWord().then(() => {
    startTimer();
});

// ✅ Fix Restart & Give Up Button Click Issues
restartBtn.addEventListener("click", restartGame);
giveUpBtn.addEventListener("click", giveUp);
