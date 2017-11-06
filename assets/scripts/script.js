let score = 0;
let activeWord;
let stickFigure;
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = document.getElementById('canvas-wrapper').offsetWidth;
canvas.height = document.getElementById('canvas-wrapper').offsetHeight;

let possibleWords = 
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
	];

//I'm sure there's a better way to do this but I'm not sure how
function StickFigure() {
	//Set stroke style and clear canvas
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.strokeStyle = '#000000';
	ctx.lineWidth = 5;

	//Set up draw functions for each 'part'
	this.drawBody = () => {
		ctx.moveTo(canvas.width/2-25, canvas.height/2-75);
		ctx.lineTo(canvas.width/2-25, canvas.height/2)
		ctx.stroke();
	}

	this.drawRightLeg = () => {
		ctx.lineTo(canvas.width/2+25, canvas.height/2+50);
		ctx.stroke();
	}

	this.drawLeftLeg = () => {
		ctx.moveTo(canvas.width/2-25, canvas.height/2);
		ctx.lineTo(canvas.width/2-75, canvas.height/2+50);
		ctx.stroke();
		ctx.closePath();
	}

	this.drawRightArm = () => {
		ctx.moveTo(canvas.width/2-25, canvas.height/2-50);
		ctx.lineTo(canvas.width/2+25, canvas.height/2-75);
		ctx.stroke();
	}

	this.drawLeftArm = () => {
		ctx.moveTo(canvas.width/2-25, canvas.height/2-50);
		ctx.lineTo(canvas.width/2-75, canvas.height/2-75);
		ctx.stroke();
	}

	this.drawHead = () => {
		ctx.beginPath();
		ctx.arc(canvas.width/2-25, canvas.height/2-100, 25, 0, Math.PI * 2, false);	
		ctx.stroke();
		ctx.closePath();
	}

	this.drawRope = () => {
		ctx.beginPath();
		ctx.moveTo(canvas.width/2-25, canvas.height/2-125);
		ctx.lineTo(canvas.width/2-25, canvas.height/2-200);
		ctx.stroke();
	}

	this.drawGallowsPart1 = () => {
		ctx.lineTo(canvas.width/2-150, canvas.height/2-200);
		ctx.stroke();
	}

	this.drawGallowsPart2 = () => {
		ctx.lineTo(canvas.width/2-150, canvas.height/2);
		ctx.stroke();
	}

	this.drawGallowsPart3 = () => {
		ctx.moveTo(canvas.width/2-200, canvas.height/2);
		ctx.lineTo(canvas.width/2-100, canvas.height/2);
		ctx.stroke();
	}

	let animationArray = 
	[
		this.drawHead,
		this.drawBody,
		this.drawRightLeg,
		this.drawLeftLeg,
		this.drawRightArm,
		this.drawLeftArm,
		this.drawHead,
		this.drawRope,
		this.drawGallowsPart1,
		this.drawGallowsPart2,
		this.drawGallowsPart3
	]

	let animationState = 0;

	this.advanceDrawing = () => {
		//Clear canvas and draw active parts
		ctx.clearRect(0,0,canvas.width,canvas.height);

		for (let i = 0; i <= Math.min(animationState,animationArray.length-1); i++)
		{
			animationArray[i]();
		}

		animationState++;
	}

	this.redraw = () => {
		//Clear canvas and draw active parts
		ctx.clearRect(0,0,canvas.width,canvas.height);

		for (let i = 0; i <= Math.min(animationState-1,animationArray.length-1); i++)
		{
			animationArray[i]();
		}
	}

	this.resetDrawing = () => {
		animationState = 0;

		this.redraw();
	}
}

function Word(wordToUse) {
	//Initialize variables
	const word = wordToUse;
	const validInput = /^[A-Za-z]+$/;

	let guessedWord = '';
	let guessedLetters = [];
	let guessesRemaining = 11;

	stickFigure.resetDrawing();

	//Set guessed word to correct number of blanks for word length
	for (let i = 0; i < word.length; i++) {
		guessedWord += '_';
	}

	//Replace press any key prompt
	document.getElementById('key-prompt-text').innerHTML = 'Guess The Word!';

	this.updateDisplay = () => {
		document.getElementById('guesses-remaining-display').innerHTML = guessesRemaining;
		document.getElementById('score-display').innerHTML = score;
		document.getElementById('word-display').innerHTML = guessedWord;
		document.getElementById('guessed-display').innerHTML = guessedLetters.toString().toUpperCase();
	}

	//Do an initial update to display after method has been declared to populate the HTML page
	this.updateDisplay();

	this.hasBeenGuessed = (letter) => {
		if (guessedLetters.indexOf(letter) !== -1) {
		 	return true;
		} else {	
			return false;
		}
	}

	this.isWordComplete = () => {
		if (guessedWord.indexOf('_') === -1) {
			//No blanks left
			return true;
		} else {
			return false;
		}
	}

	this.checkInput = (inputEvent) => {
		//Get letter, set to lower case to prevent interference from capitals
		let letter = inputEvent.key.toLowerCase();
		let validGuess = false;
		//Check if letter has been guessed, that its actually a letter (not a number or symbol), and length is one (to catch input like Escape)
		if (this.hasBeenGuessed(letter) || !letter.match(validInput) || letter.length != 1) {
			return;
		}

		//Need to iterate over each character in word in case there are duplicates, indexOf won't work here
		for (let i = 0; i < word.length; i++) {
			if (word[i] === letter){
				//Guess was valid, replace blank with correct letter
				guessedWord = guessedWord.replaceAt(i, letter);
				validGuess = true;
			}
		}

		//Store letter as guessed
		guessedLetters.push(letter);

		if (!validGuess) {
			//Guess was invalid, lose a chance
			guessesRemaining--;
			stickFigure.advanceDrawing();
		}

		//Check if word is complete or out of guesses, if not update display
		if (this.isWordComplete()) {
			score++;
			//this.generateNewWord();
			//Word is complete, we want to display the 'finished' word
			this.updateDisplay();
			//No longer need to listen to key press to check for input, but await keypress to move to next word
			document.removeEventListener('keyup', this.checkInput);
			document.addEventListener('keyup', this.generateNewWord);
			//Set key prompt text to alert user to press key to continue
			document.getElementById('key-prompt-text').innerHTML = 'Any Key For New Word';
			document.getElementById('modal-text').innerHTML = "You win, partner!";
			$('#winLoseModal').modal();
		}
		else if (!this.isWordComplete() && guessesRemaining <= 0){
			this.generateNewWord();
			//this.generateNewWord();
			//Word failed, update display just in case
			this.updateDisplay();
			//No longer need to listen to key press to check for input, but await keypress to move to next word
			document.removeEventListener('keyup', this.checkInput);
			document.addEventListener('keyup', this.generateNewWord);
			//Set key prompt text to alert user to press key to continue
			document.getElementById('key-prompt-text').innerHTML = 'Any Key For New Word';
			document.getElementById('modal-text').innerHTML = "You hung him.";
			$('#winLoseModal').modal();
		}
		else
		{
			this.updateDisplay();
		}

	}

	this.generateNewWord = () => {
		//Remove listen for button press for generate new word
		document.removeEventListener('keyup', this.generateNewWord);
		//Pick random word
		activeWord = new Word(possibleWords[Math.floor(Math.random() * possibleWords.length)]);
	}

	// AddEvent listeners
	document.addEventListener('keyup', this.checkInput);
}

//No replaceAt function builtin to strings, use this instead
String.prototype.replaceAt=function(index, char) {
	return this.substr(0, index) + char + this.substr(index+char.length);
}


function initialize() {
	stickFigure = new StickFigure();
	activeWord = new Word('world');
	document.removeEventListener('keyup', initialize);
}

document.addEventListener('keyup', initialize);

addEventListener('resize', () => {
	canvas.width = document.getElementById('canvas-wrapper').offsetWidth;
	canvas.height = document.getElementById('canvas-wrapper').offsetHeight;
	stickFigure.redraw();
});

