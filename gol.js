// Creates a table with things placed according to the condition function
// passed as argument: fill the space if condition is true for this space.
function makeTable(m, n, condition) {
	var T = [];

	// For each row
	for (var i = 0; i < m; i++) {
		// Initialize each row with an empty array
		T[i] = [];

		// For each column
		for (var j = 0; j < n; j++) {
			T[i][j] = condition(m, n, i, j);
		}
	}

	return T;
}

// Empty table, always returns false
function emptyTable(m, n, i, j) {
	return false;
}

// Randomly return true or false
function randomTable(m, n, i, j) {
	return Math.floor(Math.random() * 2) == 1;
}

// Return true if we're horizontally in the middle
function hLineTable(m, n, i, j) {
	return j == Math.floor(n/2);
}

// Return true if we're vertically in the middle
function vLineTable(m, n, i, j) {
	return i == Math.floor(m/2);
}

// Return true if we're horizontally or vertically in the middle
function crossTable(m, n, i, j) {
	return hLineTable(m, n, i, j) || vLineTable(m, n, i, j);
}

// Return true if we're in a radius of 1/4th of the size of the table
// from the middle
function circularTable(m, n, i, j) {
	const a = Math.floor(i - m/2);
	const b = Math.floor(j - n/2);
	const r = Math.floor(n/4);
	const v = a**2 + b**2 - r**2;
	return v < n && v > -n;
}

// Returns the amount of neighbours that are active for position i, j
function countActiveNeighbours(T, i, j, m, n) {
	var c = 0;
	for (var k = -1; k <= 1; k++) {
		for (var l = -1; l <= 1; l++) {
			if (k == 0 && l == 0) {
				continue;
			}

			if (i + k > 0 && i + k < m &&
			    j + l > 0 && j + l < n) {
				c += T[i + k][j + l];
			}
		}
	}

	return c;
}

// Return a table of size n, m containing the amount of active neighbours
// for each position in the game of life's truth table
function activeNeighbours(T, m, n) {
	N = []
	for (var i = 0; i < m; i++) {
		N[i] = []
		for (var j = 0; j < n; j++) {
			N[i][j] = countActiveNeighbours(T, i, j, m, n);
		}
	}

	return N;
}

// Updates the table T according to the game of life's rules
// returns an array containing the coordinates of each position
// that's been changed, so that we can just redraw the changes
function updateTable(T, m, n) {
	const N = activeNeighbours(T, m, n);
	var changedPoints = [];

	for (var i = 0; i < m; i++) {
		for (var j = 0; j < n; j++) {
			var c = N[i][j];

			if (T[i][j]) {
				if (c < 2 || c > 3) {
					T[i][j] = false;
					changedPoints.push([i, j]);
				}
			} else {
				if (c == 3) {
					T[i][j] = true;
					changedPoints.push([i, j]);
				}
			}
		}
	}

	return changedPoints;
}

// Redraw each position in cp on the canvas whose context is ctx
function updateCanvas(ctx, T, cp) {
	for (var i = 0; i < cp.length; i++) {
		var x = cp[i][0];
		var y = cp[i][1];
		if (T[x][y]) {
			ctx.fillStyle = foreground;
		} else {
			ctx.fillStyle = background;
		}

		ctx.fillRect(factor*x, factor*y, factor, factor);
	}
}

// Draw the entire truth table T on the canvas whose context is ctx
function drawCanvas(ctx, T, m, n) {
	for (var i = 0; i < m; i++) {
		for (var j = 0; j < n; j++) {
			if (T[i][j]) {
				ctx.fillStyle = foreground;
			} else {
				ctx.fillStyle = background;
			}

			ctx.fillRect(factor*i, factor*j, factor, factor);
		}
	}
}

// A step updates the table and the canvas
function lifeStep(ctx, T, m, n) {
	const cp = updateTable(T, m, n);
	updateCanvas(ctx, T, cp);
}

// Initializes the canvas and the table
function initCanvas(f) {
	running = false;
	T = makeTable(w, h, f);
	drawCanvas(ctx, T, w, h);
}

// Step if we're defined as running
function step() {
	if (running) {
		lifeStep(ctx, T, w, h);
	}
}

function start() {
	running = true;
}

function stop() {
	running = false;
}

// Constants
const background = '#000000';	// Colour for inactive positions
const foreground = '#ffffff';	// Colour for active positions
const factor = 8;		// Size factor for each pixel
const w = 100;			// Width of the table
const h = 100;			// Height of the table

// Create the table
var T = makeTable(w, h, emptyTable);
var running = false;

// Create the canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = background;
ctx.fillRect(0, 0, factor*w, factor*h);

// Draw event on the canvas:
// Activate the position the event is on
function draw(e) {
	if (!isDrawing) {
		return;
	}

	const x = Math.floor(e.offsetX/factor);
	const y = Math.floor(e.offsetY/factor);
	T[x][y] = true;
	updateCanvas(ctx, T, [[x, y]], w, h);
}

// Add the events for the drawing function
var isDrawing = false;
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mousedown', () => isDrawing = true);
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

// Update interval
var ival = setInterval(step, 500);

// Slider to change the update interval
var slider = document.getElementById('speedSlider');
// Modify the interval when the slider's value changes
slider.oninput = function() {
	clearInterval(ival);
	ival = setInterval(step, 10*this.value);
}
