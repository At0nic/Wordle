let wordLength = parseInt(prompt("Vyber si délku slova (4 - 6):"));
// Keep prompting until (4, 5, or 6) is entered
while (wordLength < 4 || wordLength > 6 || isNaN(wordLength)) {
    wordLength = parseInt(prompt("Neplatná délka. Vyber si délku slova (4 - 6):"));
}

let words = [];
let wordToGuess = '';
let currentRow = 0;
let guesses = [];
const maxRows = 6;

// Select '.board'
let board = document.querySelector('.board');
console.log(`board${wordLength}`);

// Rename class to 'board4' || 'board5'|| 'board6'
if (board) {
    board.classList.replace('board', `board${wordLength}`);  // Corrected this part
} else {
    console.error('Element with class "board" not found');
}

//index.txt load
function loadWords() {
    fetch('index.txt')
        .then(response => response.text())
        .then(text => {
            // Split the text, newlines
            words = text.split('\n').map(word => {
                // Trim whitespace, split '/'
                return word.trim().split('/')[0].toUpperCase(); // Process each word
            }).filter(word => word.length === wordLength);  // Filter words that match wordLength

            // Pick a word from list
            if (words.length > 0) {
                wordToGuess = words[Math.floor(Math.random() * words.length)];
                console.log("Word to guess:", wordToGuess);  // For debugging
            } else {
                console.error("No valid words found.");
            }
        })
        .catch(error => {
            console.error('Error loading words:', error);
            alert('Could not load words. Please try again later.');
        });
}

//load
document.addEventListener('DOMContentLoaded', () => {
    loadWords();
    createBoard();
    createKeyboard();
    document.getElementById('submitBtn').addEventListener('click', submitGuess);
    document.getElementById('resetBtn').addEventListener('click', resetGame);

    // Add event listener for keyboard input
    document.addEventListener('keydown', handlePhysicalKeyboardInput);
});

//board
function createBoard() {
    const board = document.querySelector(`.board${wordLength}`);  // Using dynamic class name

    // Create the board based on wordLength
    for (let row = 0; row < maxRows; row++) {
        for (let col = 0; col < wordLength; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            board.appendChild(cell);
        }
    }
}

//keyboard
function createKeyboard() {
    const keyboardContainer = document.querySelector('.keyboard');
    const alphabet = 'ĚŠČŘŽÝÁÍÉŮQWERTYUIOPASDFGHJKL ZXCVBNM '.split('');
    alphabet.forEach((letter) => {
        const button = document.createElement('button');
        button.textContent = letter;
        button.addEventListener('click', () => appendToGuessBox(letter));
        keyboardContainer.appendChild(button);
    });

    // backspace & enter buttons
    const backspaceButton = document.createElement('button');
    backspaceButton.textContent = '←';
    backspaceButton.addEventListener('click', deleteFromGuessBox);
    keyboardContainer.appendChild(backspaceButton);

    const enterButton = document.createElement('button');
    enterButton.textContent = 'Enter';
    enterButton.addEventListener('click', submitGuess);
    keyboardContainer.appendChild(enterButton);
}

function appendToGuessBox(letter) {
    if (currentRow < maxRows && document.querySelectorAll('.guess-letter').length < wordLength) {
        const guessBox = document.getElementById('guessBox');
        const letterElement = document.createElement('div');
        letterElement.classList.add('guess-letter');
        letterElement.textContent = letter;
        guessBox.appendChild(letterElement);
    }
}

function deleteFromGuessBox() {
    const guessBox = document.getElementById('guessBox');
    if (guessBox.lastChild) {
        guessBox.removeChild(guessBox.lastChild);
    }
}

function submitGuess() {
    const guessBox = document.getElementById('guessBox');
    const guessLetters = Array.from(guessBox.children).map(letter => letter.textContent);

    const guess = guessLetters.join('');

    if (guess.length === wordLength && /^[A-ZÁÉÍÓÚÝĚŮČĎŇŘŠŤŽ]+$/.test(guess)) {
        if (currentRow < maxRows) {
            updateBoard(guess);
            if (guess === wordToGuess) {
                document.getElementById('message').textContent = 'Congratulations! You guessed the word!';
                document.getElementById('message').style.color = 'green';
                disableInput();
            } else {
                currentRow++;
                guessBox.innerHTML = '';  // Clear guess box
                if (currentRow === maxRows) {
                    document.getElementById('message').textContent = 'Game Over! The word was ' + wordToGuess.toLowerCase();
                    document.getElementById('message').style.color = 'red';
                    disableInput();
                }
            }
        }
    } else {
        document.getElementById('message').textContent = 'Please enter a valid word.';
        document.getElementById('message').style.color = 'red';
    }
}

function updateBoard(guess) {
    const board = document.querySelector(`.board${wordLength}`);  // Select dynamically
    const cells = board.children;
    let rowIndex = currentRow * wordLength;
    
    for (let i = 0; i < wordLength; i++) {
        const cell = cells[rowIndex + i];
        const letter = guess[i];
        cell.textContent = letter;

        if (letter === wordToGuess[i]) {
            cell.style.backgroundColor = 'green';  // Correct letter & position
        } else if (wordToGuess.includes(letter)) {
            cell.style.backgroundColor = 'yellow';  // Correct, wrong position
        } else {
            cell.style.backgroundColor = 'gray';  // Incorrect
        }
    }
}

function disableInput() {
    document.querySelectorAll('.keyboard button').forEach(button => button.disabled = true);
    document.getElementById('submitBtn').disabled = true;
}

function resetGame() {
    currentRow = 0;
    guesses = [];
    wordToGuess = words[Math.floor(Math.random() * words.length)].toUpperCase();
    document.getElementById('message').textContent = '';
    document.querySelectorAll('.cell').forEach(cell => cell.textContent = '');
    document.querySelectorAll('.cell').forEach(cell => cell.style.backgroundColor = '#ffffff');
    document.getElementById('guessBox').innerHTML = '';
    document.querySelectorAll('.keyboard button').forEach(button => button.disabled = false);
}

//physical keyboard input
function handlePhysicalKeyboardInput(event) {
    const key = event.key.toUpperCase();
    const isLetter = /^[A-ZÁÉÍÓÚÝĚŮČĎŇŘŠŤŽ]+$/.test(key);
    
    if (isLetter) {
        appendToGuessBox(key);
    }
    if (key === 'BACKSPACE') {
        deleteFromGuessBox();
    }
    if (key === 'ENTER') {
        submitGuess();
    }
}
