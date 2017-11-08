//Store canvas and on screen buttons
const canvas = document.querySelector('canvas');
const buttons = document.getElementsByClassName('letter-input');

let hangmanGame = {
	word: '',
	guessedWord: '',
	guessesRemaining: 10,
	guessedLetters: [],
	score: 0,
	//Define all possible words
	possibleWords: 
		[
		'saloon',
		'cowboy',
		'indian',
		'whiskey',
		'revolver',
		'duel',
		'poker',
		'rodeo',
		'horse',
		'donkey',
		'quarrelsome',
		'yearning',
		'cattle',
		'gold',
		'sherrif',
		'ranch',
		'petticoat',
		'saddle'
		],
	wordBank: [],
	//Define game state and valid input
	currentGameState: 'preGame',
	validInput: /^[A-Za-z]+$/,
	//Store the HTML elements modified by game
	wordDisplay: document.getElementById('word-display'),
	guessedDisplay: document.getElementById('guessed-display'),
	guessesRemainingDisplay: document.getElementById('guesses-remaining-display'),
	keyPromptDisplay: document.getElementById('key-prompt-text'),
	scoreDisplay: document.getElementById('score-display'),
	inputButtons: document.getElementsByClassName('letter-input'),
	//Get audio files
	musicAudio: new Audio('./assets/sound/westernMusic.mp3'),
	hangingSound: new Audio('./assets/sound/hangingSound.wav'),
	clappingSound: new Audio('./assets/sound/clapping.wav'),
	musicStarted: false,

	initialize: function () {
		//Reset the game and variables
		this.guessesRemaining = 10;
		this.guessedLetters = [];
		this.guessedWord = '';
		this.keyPromptDisplay.innerHTML = 'Guess the Word!';
		stickFigure.resetDrawing();
		//Remove flashing class present if won
		this.wordDisplay.classList.remove("flashit");

		//Choose random word
		this.chooseWord();

		//Play and stop audio
		this.hangingSound.pause();
		this.hangingSound.currentTime = 0;
		this.clappingSound.pause();
		this.clappingSound.currentTime = 0;

		if (!this.musicStarted){
			this.musicAudio.volume = 0.25;
			this.musicAudio.loop = true;
			this.musicAudio.play();
			this.musicStarted = true;
		}

		//Set guessed word to correct number of blanks for word length
		for (let i = 0; i < this.word.length; i++) {
			this.guessedWord += '_';
		}

		//Reset all on screen buttons by removing disabled
		for (let i = 0; i < this.inputButtons.length; i++) {
			this.inputButtons[i].removeAttribute('disabled');
		}

		//Initialize display
		this.updateDisplay();

		//Change game state
		this.currentGameState = 'inPlay';
	},

	chooseWord: function () {
		if (this.wordBank.length === 0)
		{
			//No words in word bank, all have been used or hasn't initialized so reset it by copying possibleWords
			this.wordBank = this.possibleWords.slice();
		}
		//Choose random word from bank
		this.word = this.wordBank[Math.floor(Math.random()*this.wordBank.length)];
		//Remove chosen word from wordBank
		this.wordBank.splice(this.wordBank.indexOf(this.word),1);
	},

	updateDisplay: function (gameState) {
		switch(gameState) {
			case 'won':
				//Set prompt text and do victory flash
				this.keyPromptDisplay.innerHTML = 'You win, partner!';
				this.wordDisplay.classList.add("flashit");
				//Display the full word
				this.guessedWord = this.word;
				//Play clapping sounds
				this.clappingSound.volume = .25;
				this.clappingSound.play();
				break;
			case 'lost':
				//Set prompt text
				this.keyPromptDisplay.innerHTML = 'You hung him.';
				//Display the full word
				this.guessedWord = this.word;
				//Play hanging sound
				this.hangingSound.volume = .25;
				this.hangingSound.play();
				break;					
		}

		stickFigure.updateDrawing(this.guessesRemaining);
		
		this.guessesRemainingDisplay.innerHTML = this.guessesRemaining;
		this.scoreDisplay.innerHTML = this.score;
		this.wordDisplay.innerHTML = this.guessedWord;
		//Convert array to string, to upper case, then remove commas. Display formatting is done by CSS
		this.guessedDisplay.innerHTML = this.guessedLetters.toString().toUpperCase().replace(/,/g, '');
	},


	hasBeenGuessed: function(letter) {
		if (this.guessedLetters.indexOf(letter) !== -1) {
		 	return true;
		} else {	
			return false;
		}
	},

	checkGuess: function(letter) {
		//Validate input - check if letter has been guessed, that its actually a letter (not a number or symbol), 
		//and length is one (to catch input like Escape)
		if (this.hasBeenGuessed(letter) || !letter.match(this.validInput) || letter.length != 1) {
			return;
		}

		//Input validated, disable on screen button for corresponding letter
		document.getElementById(`letter-${letter}`).setAttribute('disabled', true);	

		let validGuess = false;

		//Need to iterate over each character in word in case there are duplicates, indexOf won't work here
		for (let i = 0; i < this.word.length; i++) {
			if (this.word[i] === letter){
				//Guess was valid, replace blank with correct letter
				this.guessedWord = this.guessedWord.replaceAt(i, letter);
				validGuess = true;
			}
		}

		if (!validGuess) {
			//Letter was not anywhere in the word, remove a guess chance
			this.guessesRemaining--;
			//Add wrong letter to guessed letters
			this.guessedLetters.push(letter);
		}				
	},

	isWordComplete: function() {
		if (this.guessedWord.indexOf('_') === -1) {
			//No blanks left
			return true;
		} else {
			return false;
		}		
	},

	handleInput: function(event) {
		switch(this.currentGameState) {
			case 'preGame':
				this.initialize();
				break;
			case 'inPlay':
				let letter = '';
				if (event.type === 'click')
				{
					//This was input button event, get data and set disabled
					letter = event.target.getAttribute('data-letter')
				}
				else
				{
					//Keyboard input, process keyCode
					letter = String.fromCharCode(event.keyCode).toLowerCase();
				}

				this.checkGuess(letter);

				if (this.isWordComplete()) {
					//Word is complete, have won the round
					this.currentGameState = 'won';
					this.score++;
				}
				else if (this.guessesRemaining <= 0) {
					//Out of guesses, word not complete, have lost.
					//Reset score because of loss
					this.score = 0;
					this.currentGameState = 'lost';
				}
				break;	
			default:
				//If here, we have either won or lost so reset
				this.initialize();
				break;			
		}

		this.updateDisplay(this.currentGameState);
	}
};

let stickFigure = {
	ctx: canvas.getContext('2d'),

	resetDrawing: function () {
		this.ctx.clearRect(0,0,canvas.width,canvas.height);
	},

	updateDrawing: function (guessesRemaining) {
		switch (guessesRemaining) {
			case 9: //Draw gallows base and setup line style
				this.ctx.strokeStyle = 'black';
				this.ctx.lineWidth = 5;
				this.drawLine(canvas.width/8, canvas.height-10, canvas.width/2,canvas.height-10);
				break;
			case 8: //Draw gallows part 2
				this.drawLine(canvas.width/5, canvas.height-10,canvas.width/5,canvas.height-140);
				break;
			case 7: //Draw gallows 'arm'
				this.ctx.lineCap='round';
				this.drawLine(canvas.width/5,canvas.height-140,canvas.width/2, canvas.height-140);
				break;
			case 6: // Draw rope
				this.drawLine(canvas.width/2, canvas.height-140,canvas.width/2, canvas.height-120);
				break;
			case 5: // Draw head
				this.ctx.beginPath();
				this.ctx.arc(canvas.width/2, canvas.height-110, 10, 0, Math.PI * 2, false);
				this.ctx.stroke();
				this.ctx.closePath();
				break;
			case 4: //Draw body
				this.drawLine(canvas.width/2, canvas.height-100,canvas.width/2, canvas.height-60);
				break;
			case 3: // Draw leg 1
				this.drawLine(canvas.width/2, canvas.height-60,canvas.width/2 - 15, canvas.height-40);
				break;
			case 2: // Draw leg 2
				this.drawLine(canvas.width/2, canvas.height-60,canvas.width/2 + 15, canvas.height-40);
				break;
			case 1: // Draw arm 1
				this.drawLine(canvas.width/2, canvas.height-80,canvas.width/2 + 15, canvas.height-90);
				break;
			case 0: // Draw arm 2
				this.drawLine(canvas.width/2, canvas.height-80,canvas.width/2 - 15, canvas.height-90);
				break;
		}
	},

	drawLine: function(startX, startY, endX, endY) {
		this.ctx.beginPath();
		this.ctx.moveTo(startX, startY);
		this.ctx.lineTo(endX, endY);
		this.ctx.stroke();
		this.ctx.closePath();
	}
}

//No replaceAt function built-in to strings, use this instead
String.prototype.replaceAt=function(index, char) {
	return this.substr(0, index) + char + this.substr(index+char.length);
}

//Listen for key ups
document.addEventListener('keyup', hangmanGame.handleInput.bind(hangmanGame));

//Subscribe to events from on screen button inputs
for (let i = 0; i < buttons.length; i++) {
	buttons[i].addEventListener('click', hangmanGame.handleInput.bind(hangmanGame));
}


