const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

var hangmanGame = {
	word: '',
	guessedWord: '',
	guessesRemaining: 11,
	guessedLetters: [],
	score: 0,
	usedWords: [],
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
	currentGameState: 'preGame',
	validInput: /^[A-Za-z]+$/,

	initialize: function () {
		//Reset the game and variables
		this.guessesRemaining = 10;
		this.guessedLetters = [];
		this.guessedWord = '';
		document.getElementById('key-prompt-text').innerHTML = 'Guess the Word!';
		stickFigure.resetDrawing();
		//Choose random word
		this.chooseWord();

		//Set guessed word to correct number of blanks for word length
		for (let i = 0; i < this.word.length; i++) {
			this.guessedWord += '_';
		}

		//Initialize display
		this.updateDisplay();

		//Change game state
		this.currentGameState = 'inPlay';
	},

	chooseWord: function () {
		this.word = this.possibleWords[Math.floor(Math.random()*this.possibleWords.length)];

		//Don't use the same word twice until all have been used
		if (this.usedWords.indexOf(this.word) !== -1)
		{
			//Word has been used, see if all words have been used
			if (this.usedWords.length === this.possibleWords.length) {
				//Reset used words
				this.usedWords = [];
			}
			else
			{
				//Picked word already used, choose new one
				this.chooseWord();
			}
		} else {
			//Word hasn't been used yet, add to used words to track
			this.usedWords.push(this.word);
		}
	},

	updateDisplay: function (gameState) {
		switch(gameState) {
			case 'won':
				document.getElementById('key-prompt-text').innerHTML = 'You win, partner!';
				//Display the 'word'
				this.guessedWord = this.word;
				break;
			case 'lost':
				document.getElementById('key-prompt-text').innerHTML = 'You hung him.';
				//Display the 'word'
				this.guessedWord = this.word;
				break;					
		}

		stickFigure.updateDrawing(this.guessesRemaining);
		
		document.getElementById('guesses-remaining-display').innerHTML = this.guessesRemaining;
		document.getElementById('score-display').innerHTML = this.score;
		document.getElementById('word-display').innerHTML = this.guessedWord;
		//Convert array to string, to upper case, then remove commas. Display formatting is done by CSS
		document.getElementById('guessed-display').innerHTML = this.guessedLetters.toString().toUpperCase().replace(/,/g, '');
	},


	hasBeenGuessed: function(letter) {
		if (this.guessedLetters.indexOf(letter) !== -1) {
		 	return true;
		} else {	
			return false;
		}
	},

	checkGuess: function(letter) {
		//Check if letter has been guessed, that its actually a letter (not a number or symbol), 
		//and length is one (to catch input like Escape)
		if (this.hasBeenGuessed(letter) || !letter.match(this.validInput) || letter.length != 1) {
			return;
		}

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

	handleInput: function(letter) {
		switch(this.currentGameState) {
			case 'preGame':
				this.initialize();
				break;
			case 'inPlay':
				this.checkGuess(letter);
				if (this.isWordComplete()) {
					//Word is complete, have won the round
					this.currentGameState = 'won';
					this.score++;
				}
				else if (this.guessesRemaining <= 0) {
					//Out of guesses, word not complete, have lost
					this.currentGameState = 'lost';
				}
				break;	
			case 'won':
				//If input when won, go to next word
				this.initialize();
				break;
			case 'lost':
				//if input when lost, go to next word
				this.initialize();
				break;				
		}

		this.updateDisplay(this.currentGameState);
	}
};

var stickFigure = {
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

document.onkeyup = function(event) {
	let letter = String.fromCharCode(event.keyCode).toLowerCase();
	hangmanGame.handleInput(letter);
}

//Subscribe to events from on screen button inputs
const buttons = document.getElementsByClassName('letter-input');

for (var i = 0; i < buttons.length; i++) {
	buttons[i].addEventListener('click', function(event) {
		hangmanGame.handleInput(this.getAttribute('data-letter'));
	});
}


