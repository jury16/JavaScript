"use strict"

const canvas = document.getElementById('game'),
    canvasInfo = document.getElementById('info'),
    gameCanvas = document.getElementById('canvas'),
    optionsCanvas = document.getElementById('optionsInfoBlock'),
    buttons = document.getElementById('buttons'),
    newGame = document.getElementById('newGame'),
    pauseGame = document.getElementById('pause'),
    wrapper = document.getElementById('wrapper'),
    visible = document.getElementById('visible'),
    buttonLeft = document.getElementById('left'),
    buttonRight = document.getElementById('right'),
    buttonDown = document.getElementById('down'),
    buttonRotate = document.getElementById('rotate'),
    infoCanvas = document.getElementById('infoCanvas'),        
    contextLeft = buttonLeft.getContext('2d'),
    contextRight = buttonRight.getContext('2d'),
    contextDown = buttonDown.getContext('2d'),
    contextRotate = buttonRotate.getContext('2d'),
    context = canvas.getContext('2d'),
    contextOptions = optionsCanvas.getContext('2d'),
    contextInfo = canvasInfo.getContext('2d');
var playAnimation = null,
    gameOver = false,
    mobileDevice = false,
    figuresSequence = [],
    playZone = [], //array play zone (canvasWidth / grid) X (canvasHeight / grid)
    score = 0,
    record = 0,
    pauseFlag = false,
    optionsFlag = false,
    level = 1,
    bestPlayer = '',
    namePlayer = "Vasia",
    count = 0,
    textFont = '',
    canvasWidth ,
    canvasHeight,
    infoWidth,
    infoHeight,
    checkScreenWidth,
    checkScreenHeight,
    grid,
    //coords info
    infoLevelX,
    infoLevelY,
    infoRecordX,
    infoRecordY;
checkScreenWidth = document.body.clientWidth;
checkScreenHeight = document.body.clientHeight;
// make gabarits canvas depending on the screen
gabarits(visible.offsetWidth * 0.8);
function gabarits(width) {
        canvasWidth = width ,
        canvasHeight = canvasWidth * 2,
        infoWidth = canvasWidth * 0.9,
        infoHeight = canvasWidth * 0.3,
        grid = canvasWidth / 10,
        //coords info
        infoLevelX = 0.05 * canvasWidth,
        infoLevelY = 0.04 * canvasHeight,
        infoRecordX = 0.5 * canvasWidth,
        infoRecordY = 0.12 * canvasHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    optionsCanvas.width = canvasWidth;
    optionsCanvas.height = canvasHeight;
    canvasInfo.width = infoWidth;
    canvasInfo.height = infoHeight;
    buttonLeft.width = canvasWidth / 2;
    buttonLeft.height = canvasHeight / 8;
    buttonRight.width = canvasWidth / 2;
    buttonRight.height = canvasHeight / 8;
    buttonDown.width = canvasWidth / 2;
    buttonDown.height = canvasHeight / 8;
    buttonRotate.width = canvasWidth / 2;
    buttonRotate.height = canvasHeight / 8;
}
//console.log(canvasWidth);
//console.log(canvasHeight);

//create a media condition that checks the viewports to be at least 768 pixels wide.
const mediaQuery1 = window.matchMedia('(max-width: 749px)');
const mediaQuery2 = window.matchMedia('(min-width: 751px)');
var flag = false;
var flagGabarits = false;
//check if mobile device and landscape screen
function deviceType(){

    const ua = navigator.userAgent;
    if ((/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) ||
        (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua))) {
        return mobileDevice = true;
    }
    return mobileDevice = false;
};
deviceType();

//make figures formes
const figures = {
    'I': [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    'J': [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    'L': [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
    ],
    'O': [
        [1, 1],
        [1, 1],
    ],
    'S': [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
    ],
    'Z': [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ],
    'T': [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
    ]
};
//initialise figures colors
const colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange'
};
//random number
function randomDiap(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}
//generate figures sequence
function generateSequence() {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    while (sequence.length) {
        const rand = randomDiap(0, sequence.length - 1);
        const name = sequence.splice(rand, 1)[0];
        figuresSequence.push(name);
    }
}

//initialise playZone - fill up with 0
for (let row = -2; row < 20; row++) {
    playZone[row] = [];
    for (let col = 0; col < 10; col++) {
        playZone[row][col] = 0;
    }
}
// next figure
let figureCurrent = nextFigure(); //current figure in playZone
function nextFigure() {
    if (figuresSequence.length === 0) {
        generateSequence();
    }
    const name = figuresSequence.pop();
    const matrix = figures[name];
    const col = playZone[0].length / 2 - Math.ceil(matrix[0].length / 2);
    // I starts at row 21 (offset -1) and everyone else starts at row 22 (offset -2) 
    const row = name === 'I' ? -1 : -2;
    return {
        name: name,
        matrix: matrix,
        row: row,
        col: col
    };
}
//rotate matrix
function rotate(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
        row.map((val, j) => matrix[N - j][i])
    );
    return result;
}
// check, after appearing or rotating, whether the matrix (figure) can be in this place of the field 
function isValidMove(matrix, cellRow, cellCol) {
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] && (cellCol + col < 0 || cellCol + col >= playZone[0].length || cellRow + row >= playZone.length || playZone[cellRow + row][cellCol + col])) {
                return false;
            }
        }
    }
    return true;
}
//figure in place
function placeFigure() {
    //check if figure came out of the gameZone
    for (let row = 0; row < figureCurrent.matrix.length; row++) {
        for (let col = 0; col < figureCurrent.matrix[row].length; col++) {
            if (figureCurrent.matrix[row][col]) {
                if (figureCurrent.row + row < 0) {
                    return showGameOver();
                }
                playZone[figureCurrent.row + row][figureCurrent.col + col] = figureCurrent.name;
            }
        }
    }
    //check the rows filled
    for (let row = playZone.length - 1; row >= 0;) {
        if (playZone[row].every(cell => !!cell)) {
            score += 10;
            level = Math.floor(score / 100) + 1;
            for (let r = row; r >= 0; r--) {
                for (let c = 0; c < playZone[r].length; c++) {                    
                    playZone[r][c] = playZone[r - 1][c];
                }
            }
        }
        else {
            row--;
        }
    }
    figureCurrent = nextFigure();
}
//  Game Over
function showGameOver() {
    cancelAnimationFrame(playAnimation);
    gameOver = true;
    // message Game Over
    context.fillStyle = 'black';
    context.globalAlpha = 0.75;
    context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
    context.globalAlpha = 1;
    context.fillStyle = 'white';
    context.font = '36px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
}
//info start new game
// listen keys
window.addEventListener("keydown", function (EO) {
    EO = EO || window.event;
    EO.preventDefault();
    if (gameOver) return;

    if (EO.keyCode === 37 || EO.keyCode === 39) {
        const col = EO.keyCode === 37 ? figureCurrent.col - 1 : figureCurrent.col + 1;
        if (isValidMove(figureCurrent.matrix, figureCurrent.row, col)) {
            figureCurrent.col = col;
        }
    }
    if (EO.keyCode === 38) {
        // rotate 90 deg
        const matrix = rotate(figureCurrent.matrix);
        if (isValidMove(matrix, figureCurrent.row, figureCurrent.col)) {
            figureCurrent.matrix = matrix;
        }
    }
    if (EO.keyCode === 40) {
        const row = figureCurrent.row + 1;
        if (!isValidMove(figureCurrent.matrix, row, figureCurrent.col)) {
            figureCurrent.row = row - 1;
            placeFigure();
            return;
        }
        figureCurrent.row = row;
    }
});

//listen buttons

buttonLeft.addEventListener('touchstart', leftTouch, false);
buttonRight.addEventListener('touchstart', rightTouch, false);
buttonRotate.addEventListener('touchstart', rotateTouch, false);
buttonDown.addEventListener('touchstart', downTouch, false);
function leftTouch() {
    const col = figureCurrent.col - 1;
    if (isValidMove(figureCurrent.matrix, figureCurrent.row, col)) {
        figureCurrent.col = col;
    }
}
function rightTouch() {
    const col = figureCurrent.col + 1;
    if (isValidMove(figureCurrent.matrix, figureCurrent.row, col)) {
        figureCurrent.col = col;
    }
}
function rotateTouch() {
    const matrix = rotate(figureCurrent.matrix);
    if (isValidMove(matrix, figureCurrent.row, figureCurrent.col)) {
        figureCurrent.matrix = matrix;
    }
}

function downTouch() {
    const row = figureCurrent.row + 1;
    if (!isValidMove(figureCurrent.matrix, row, figureCurrent.col)) {
        figureCurrent.row = row - 1;        
        placeFigure();
        return;
    }
    figureCurrent.row = row;    
}
// game menu

//game info
function textFonts(){
    if (document.body.clientWidth > 900) {
        textFont = 36;
    }
    else if (document.body.clientWidth < 400) {
        textFont = 22;
    }
    else {
        textFont = 28;
    }
}
function info() {
    textFonts();
    contextInfo.clearRect(0, 0, canvasInfo.width, canvasInfo.height);
    contextInfo.globalAlpha = 1;
    contextInfo.fillStyle = 'white';
    contextInfo.font = `${textFont}px Arial New`;
    contextInfo.fillText('Level:' + level, infoLevelX, infoLevelY);
    contextInfo.fillText('Points:' + score, infoRecordX, infoLevelY);
    //contextInfo.fillText('Best player: ' + bestPlayer, infoRecordX, infoRecordY);
    contextInfo.fillText('Record:  ' + record, infoLevelX, infoRecordY);

    //info buttons
    function infoButtons(name, textButton, x, y) {
        name.clearRect(0, 0, buttonLeft.width, buttonLeft.height);
        name.globalAlpha = 1;
        name.fillStyle = 'red';
        name.font = `${textFont}px Arial New`;
        name.fillText(`${textButton}`, x * canvasWidth * 0.12, y * canvasHeight * 0.075);
    }
    infoButtons(contextLeft, "LEFT", 1.1, 1);
    infoButtons(contextRight, "RIGHT", 1, 1);
    infoButtons(contextDown, "DOWN", 0.9, 1.1);
    infoButtons(contextRotate, "ROTATE", 0.75, 1.1);
}
// check record
if (score > record) {
    record = score;
    localStorage.record = record;
    bestPlayer = namePlayer;
    localStorage.recordName = recordName;
}
//storage
var Storage_size = localStorage.length;
if (Storage_size > 0) {
    record = localStorage.record;
    bestPlayer = localStorage.bestPlayer;
}
//start New Game
function gameStart() {
    level = 1;
    score = 0;    
    for (let row = -2; row < 20; row++) {
        playZone[row] = [];
        for (let col = 0; col < 10; col++) {
            playZone[row][col] = 0;
        }
    }
    figureCurrent = nextFigure();
    if (gameOver) {
        game();
        gameOver = false;
        console.log('yes');
    }
    
  
}
function options() {    
    if (optionsFlag == false) {
        optionsFlag = true;
        if (!pauseFlag) {
            pause1();
        }  
        
    }

    else if (pauseFlag == true) {
        pauseFlag = false;
        pauseGame.innerText = 'pause';

    }
}
function pause1() {
    if (pauseFlag == false) {
        pauseFlag = true;
        pauseGame.innerText = 'continue';
    }
    else if(pauseFlag == true) {
        pauseFlag = false;
        optionsFlag = false;
        pauseGame.innerText = 'pause';

    }
}
//game
function game() {

    if (!mobileDevice) {
        buttons.style.display = 'none'
    }

    if ((mediaQuery1.matches  && !flag)) {
        visible.style.flexDirection = 'column';
        gameCanvas.style.order = '2';
        infoCanvas.style.order = '1';
        flag = true;
    }
    else if ((mediaQuery2.matches && flag)) {
        visible.style.flexDirection = 'row';
        gameCanvas.style.order = '1';
        infoCanvas.style.order = '2';
        flag = false;
    }

    playAnimation = requestAnimationFrame(game);
    context.clearRect(0, 0, canvas.width, canvas.height);
    info();
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            if (playZone[row][col]) {
                const name = playZone[row][col];
                context.fillStyle = colors[name];
                context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
            }
        }
    }
    // check if screen changed
    if (figureCurrent) {      
        if ((mobileDevice && (document.body.clientWidth > document.body.clientHeight && document.body.clientWidth < 800)) || pauseFlag == true) {
            figureCurrent.row;
            //pauseFlag = false;
        }
        else if (++count > 60) {
            figureCurrent.row++;
            count = 0;
            if (!isValidMove(figureCurrent.matrix, figureCurrent.row, figureCurrent.col)) {
                figureCurrent.row--;
                placeFigure();
            }
        }
        
        context.fillStyle = colors[figureCurrent.name];
        for (let row = 0; row < figureCurrent.matrix.length; row++) {
            for (let col = 0; col < figureCurrent.matrix[row].length; col++) {
                if (figureCurrent.matrix[row][col]) {
                    context.fillRect((figureCurrent.col + col) * grid, (figureCurrent.row + row) * grid, grid - 1, grid - 1);
                }
            }
        }
    }
}
playAnimation = requestAnimationFrame(game);