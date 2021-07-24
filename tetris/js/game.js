"use strict"

const canvas = document.getElementById('game'),
    menu = document.getElementById('menuBody'),
    iconMenu = document.getElementById('menuIcon'),
    commun = document.getElementById('canvasOptionsBlock'),
    gameCanvas = document.getElementById('canvas'),
    statistique = document.getElementById('statistique'),
    rotateDisplay = document.getElementById('rotateDisplay'),
    gameInfoS = document.getElementById('gameInfo'),
    buttons = document.getElementById('buttons'),
    menuOptions = document.getElementById('optionsBlock'),
    newGameBlock = document.getElementById('newGameBlock'),
    newGame = document.getElementById('newGame'),
    textOptions = document.createElement('p'),
    infoGame = document.createElement('p'),
    pauseGame = document.getElementById('pause'),
    wrapper = document.getElementById('wrapper'),
    visible = document.getElementById('visible'),
    buttonLeft = document.getElementById('left'),
    buttonRight = document.getElementById('right'),
    buttonDown = document.getElementById('down'),
    buttonRotate = document.getElementById('rotate'),
    infoCanvas = document.getElementById('infoCanvas'),
    context = canvas.getContext('2d');

var playAnimation = null,
    gameOver = false,
    mobileDevice = false,
    figuresSequence = [],
    playZone = [], //array play zone (canvasWidth / grid) X (canvasHeight / grid)
    score = 0,
    record = 0,
    pauseFlag = false,
    optionsFlag = false,
    newGamesFlag = false,
    rotateFlag = false,
    zoomGame = 1.2,
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
menuOptions.appendChild(textOptions);
console.log(canvas.getBoundingClientRect().left);

statistique.appendChild(infoGame);
// make gabarits canvas depending on the screen
gabarits(visible.offsetWidth * 0.8);
function gabarits(width) {
        canvasWidth = width,
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
    menuOptions.style.opacity = '0';
    newGameBlock.style.opacity = '0';
    buttons.style.width = width + 'px';

}
//blocks for animated messages
var positionMessagesLeft = `-${canvasWidth * 1.35}px`,
    positionMessagesTop = `${canvasHeight * 0.0485}px`;
function createBlocksFunc(width, height, left = positionMessagesLeft, top = positionMessagesTop){
    creatBlocks(menuOptions);
    creatBlocks(newGameBlock);
    function creatBlocks(name) {
        name.style.width = `${width * 0.98}px`;
        name.style.height = `${height}px`;
        name.style.position = 'absolute';
        name.style.left = left;
        name.style.top = top;
        name.style.backgroundColor = 'black';
    }
}
createBlocksFunc(canvasWidth, canvasHeight);

//create a media condition that checks the viewports to be at least 768 pixels wide.
const mediaQuery1 = window.matchMedia('(max-width: 749px)');
const mediaQuery2 = window.matchMedia('(min-width: 751px)');
var flag = false;
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
            gameInfo(score);
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
    context.fillRect(0, canvas.height / 2 - 30, canvas.width - 10, 60);
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
//console.log(iconMenu);
if (iconMenu) {
    //const menu = document.getElementById('menu');
    iconMenu.addEventListener('click', function (e) {
        iconMenu.classList.toggle('_active');
        menu.classList.toggle('_active');
    });
}


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
       // debugger;
        if (pauseFlag) { pause1(newGamesFlag) };
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
        }
    }
}
//size of text
function textFonts(){
    if (document.body.clientWidth > 900) {
        textFont = 16;
    }
    else if (document.body.clientWidth < 600) {
        textFont = 12;
    }
    else {
        textFont = 14;
    }
    return textFont;
}

// text options block
function createMessages(name, message, text = textFonts(), align = 'center') {
    name.style.fontSize = `${text}px`;
    name.style.textTransform = 'uppercase';
    name.style.color = 'white';
    name.style.textAlign = align;
    name.innerHTML = message;
    //name.style.width = canvasWidth * 1.5;
    //name.style.height = canvasHeight * 0.75;
}
var messageOptionsBlock;
if (!messageOptionsBlock) {
    messageOptionsBlock = '<div class="optionsMessage"><p>LEFT&emsp;&emsp;&larr;</p><p>RIGHT&emsp;&thinsp;&thinsp;&rarr;</p><p>DOWN&emsp;&thinsp;&thinsp;&thinsp;&thinsp;&darr;</p><p>ROTATE&emsp;&thinsp;&uarr;</p></div>';
    var messageNewGame = `<div class="messageNewGame"><p>start new game?</p><p><button id="yes" href="#" onclick="newGames()">YES</button><p><button id="no"href="#" onclick="gameStart()">NO</button></div>`;
    var messageGameInfo = `<div class="infoGame"><p>level:&emsp;&thinsp; ${level}&emsp;points:&emsp; ${score}</p><p>name:&emsp;${namePlayer}&emsp;</p><p>record:&emsp;${record} </a></div>`;
    var messageRotateInfo = '<div class=""><p>rotate display</p></div>';
    createMessages(textOptions, messageOptionsBlock);
    createMessages(newGameBlock, messageNewGame);
    createMessages(infoGame, messageGameInfo, 14, 'left');
    createMessages(rotateDisplay, messageRotateInfo, 14, 'left');
    console.log('yes');
}

/*
var yes = document.getElementById('yes');
console.log(yes);
var no = document.getElementById('no');
*/

//createMessages(wrapper, messageRotateInfo);
//console.log(infoGame);
/*
yes.addEventListener('click', function (e) {
    newGames();
});
no.addEventListener('click', function (e) {
    gameStart();
});
*/

//show animation messages
function transitionON(name) {
    name.style.opacity = '1';
    name.style.transform = `translate(${canvasWidth * 1}px, 0px)`;
    name.style.transition = 'all 1.0s ease';
    //debugger;
}
function transitionOff(name) {
    name.style.opacity = '0';
    name.style.transform = `translate(${0}px, 0px)`;
    name.style.transition = 'all 1.0s ease';
}
function transitions(name,transitionsFlag) {
    if (!transitionsFlag) {
        transitionsFlag = true;
        if (!pauseFlag) {
            pause1();
            pauseFlag = true;
            transitionON(name);
        }
        else if (pauseFlag) {
            pauseFlag = false;
            transitionsFlag = false;
            pauseGame.innerText = 'pause';
            transitionOff(name);
        }       
    }
    else if (transitionsFlag) {
        pauseFlag = false;
        transitionsFlag = false;
        transitionOff(name);
        pauseGame.innerText = 'continue';
    }
}
function newGames() {
    checkPause(menuOptions);
    transitions(newGameBlock, newGamesFlag);
}

function checkPause(name) {
    if (pauseFlag) {
        pauseFlag = false;
        transitionOff(name);
    }
}
function options() {
    checkPause(newGameBlock);
    transitions(menuOptions, optionsFlag);
}
function rotateDispleY() {
    if (rotateFlag) {
        rotateDisplay.style.display = 'flex';
        visible.style.display = 'none';
    }
    
}
function pause1(transitionsFlag) {
    if (!pauseFlag) {
        pauseFlag = true;
        pauseGame.innerText = 'continue';
    }
    else if (pauseFlag) {
        pauseFlag = false;
        transitionsFlag = false;
        pauseGame.innerText = 'pause';
        transitionOff(menuOptions);
        transitionOff(newGameBlock);
    }

}
//check device
function device() {
    if ((mediaQuery1.matches)) {
        if (mobileDevice) {

        }
        visible.style.flexDirection = 'column';
        gameInfoS.style.order = '2';
        commun.style.order = '3';
        visible.style.width = 34 + 'vh';
        var positionMessagesLeft = `-${canvasWidth * 0.96}px`,
            positionMessagesTop = `${canvasHeight * 0.049 - statistique.offsetHeight * 0.33}px`;
        createBlocksFunc(canvasWidth, canvasHeight, positionMessagesLeft, positionMessagesTop);
        buttons.style.display = 'flex';
    }
    else if ((mediaQuery2.matches)) {
        buttons.style.display = 'none';
        visible.style.flexDirection = 'row';
        gameInfoS.style.order = '3';
        commun.style.order = '2';
        visible.style.width = 40 + 'vh';        
        createBlocksFunc(canvasWidth, canvasHeight);
    }
    createMessages(textOptions, messageOptionsBlock);
    createMessages(newGameBlock, messageNewGame);
    createMessages(infoGame, messageGameInfo, 14, 'left');
    //gabarits(visible.offsetWidth * 0.8);
}
device();
//game
function game() {
    device();//check this!
    deviceType();
    //console.log(canvasWidth);
   // debugger;

    playAnimation = requestAnimationFrame(game);
    context.clearRect(0, 0, canvas.width, canvas.height);
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
    if ((mobileDevice && (document.body.clientWidth > document.body.clientHeight))) {
        rotateFlag = true;
        pauseFlag = true;
        rotateDispleY();
        //console.log('yes');        
    }
    else {
        rotateFlag = false;
        rotateDisplay.style.display = 'none';
        visible.style.display = 'flex';
        
    }
    if (figureCurrent) {      
        
        if (++count > 60) {
            
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