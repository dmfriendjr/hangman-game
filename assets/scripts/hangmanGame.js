const canvas = document.querySelector('canvas');
canvas.width = document.getElementById('canvas-wrapper').offsetWidth;
canvas.height = document.getElementById('canvas-wrapper').offsetHeight;
const ctx = canvas.getContext('2d');

var hangmanGame = {
	word: '',
	guessedWord: '',
	guessesRemaining: 11,
	guessedLetters: [],
	score: 0,
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

		stickFigure.initialize();
	},

	chooseWord: function () {
		this.word = this.possibleWords[Math.floor(Math.random()*this.possibleWords.length)];
	},

	updateDisplay: function (gameState) {
		switch(gameState) {
			case 'won':
				document.getElementById('key-prompt-text').innerHTML = 'You win, partner!';
				//Display the 'word'
				this.guessedWord = this.word;
				break;
			case 'lost':
				document.getElementById('key-prompt-text').innerHTML = 'You hung him, hombre.';
				break;					
		}

		stickFigure.updateDrawing(this.guessesRemaining);
		
		document.getElementById('guesses-remaining-display').innerHTML = this.guessesRemaining;
		document.getElementById('score-display').innerHTML = this.score;
		document.getElementById('word-display').innerHTML = this.guessedWord;
		document.getElementById('guessed-display').innerHTML = this.guessedLetters.toString().toUpperCase();
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
				console.log(this.currentGameState);
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
	animationStateIndex: 0,

	initialize: function () {
		canvas.width = 300;
		canvas.height = 300;
		this.ctx.strokeStyle = 'black';
		this.ctx.lineWidth = 5;
		this.ctx.closePath();
	},

	updateDrawing: function (guessesRemaining) {
		//this.ctx.clearRect(0,0,canvas.width,canvas.height);

		switch (guessesRemaining) {
			case 9:
				this.ctx.beginPath();
				this.ctx.moveTo(canvas.width/8, canvas.height-25);
				this.ctx.lineTo(canvas.width/2,canvas.height-25);
				this.ctx.stroke();
				this.ctx.closePath();
				break;
			case 8:
				this.ctx.beginPath();
				this.ctx.moveTo(canvas.width/5, canvas.height-25);
				this.ctx.lineTo(canvas.width/5,canvas.height-250);
				this.ctx.stroke();
				break;
			case 7:
				this.ctx.lineTo(canvas.width/5 + 100, canvas.height-250);
				this.ctx.stroke();			
				break;
			case 6:
				this.ctx.lineTo(canvas.width/5 + 100, canvas.height-200);
				this.ctx.stroke();
				this.ctx.closePath();
				break;
			case 5:
				this.ctx.beginPath();
				this.ctx.arc(canvas.width/5 + 100, canvas.height-185, 15, 0, Math.PI * 2, false);
				this.ctx.stroke();
				this.ctx.closePath();
				break;
			case 4: 
				this.ctx.beginPath();
				this.ctx.moveTo(canvas.width/5 + 100, canvas.height-170);
				this.ctx.lineTo(canvas.width/5 + 100, canvas.height-105);
				this.ctx.stroke();
				break;
			case 3:
				this.ctx.lineTo(canvas.width/5 + 125, canvas.height-50);
				this.ctx.stroke();
				break;
			case 2: 
				this.ctx.moveTo(canvas.width/5 + 100, canvas.height-105);
				this.ctx.lineTo(canvas.width/5 + 75, canvas.height-50);
				this.ctx.stroke();
				break;
			case 1:
				this.ctx.moveTo(canvas.width/5 + 100, canvas.height-150);
				this.ctx.lineTo(canvas.width/5 + 125, canvas.height-100);
				this.ctx.stroke();
				break;
			case 0:
				this.ctx.moveTo(canvas.width/5 + 100, canvas.height-150);
				this.ctx.lineTo(canvas.width/5 + 75, canvas.height-100);
				this.ctx.stroke();
				break;

		}
	}
}


//No replaceAt function builtin to strings, use this instead
String.prototype.replaceAt=function(index, char) {
	return this.substr(0, index) + char + this.substr(index+char.length);
}

document.onkeyup = function(event) {
	let letter = String.fromCharCode(event.keyCode).toLowerCase();
	hangmanGame.handleInput(letter);
}


