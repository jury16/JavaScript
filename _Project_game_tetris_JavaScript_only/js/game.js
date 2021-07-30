"use strict"

const canvas = document.getElementById('game'),
    menu = document.getElementById('menuBody'),
    iconMenu = document.getElementById('menuIcon'),
    namePlayerInput = document.getElementById('namePlayeR'),
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
    recordsMess = document.createElement('p'),
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
    target = {},
    audioClick = new Audio('sounds/button.mp3'),
    audioMouve = new Audio('sounds/mouve.mp3'),
    audioBoom = new Audio('sounds/boom.mp3'),
    audiogameOver = new Audio('sounds/gameOver.mp3'),
    pauseFlag = false,
    optionsFlag = false,
    newGamesFlag = false,
    rotateFlag = false,
    recordsFlag = false,
    gameFlag = true,
    recordsPlayers,
    result,
    messageRecords = '',
    zoomGame = 1.2,
    positionMessagesLeft,
    positionMessagesTop,
    level = 1,
    bestPlayer = '',
    namePlayer = "",
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
    buttonRight.style.width = width / 2 + 2 +'px';
    buttonLeft.style.width = width / 2 + 2 + 'px';
    rotateDisplay.style.display = 'none';
}
//check if mobile device and landscape screen
function deviceType() {
   
    const ua = navigator.userAgent;
    ((/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) ||
        (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua))) ? mobileDevice = true : mobileDevice = false;
    if (!mobileDevice) {
        if (document.body.clientWidth < 750) {
            positionMessagesLeft = `-${canvasWidth * 0.95}px`;
            positionMessagesTop = `${canvasHeight * 0.035}px`;
        }
        else {
            positionMessagesLeft = `-${canvasWidth * 1.23}px`;
            positionMessagesTop = `${canvasHeight * 0.0485}px`;
        }

    }
    else {
        positionMessagesLeft = `-${canvasWidth * 0.95}px`;
        positionMessagesTop = `${canvasHeight * 0.07}px`;
    }
};
deviceType();
//newGamE();
//checkNewPlayer(namePlayer);
function checkNewPlayer (){
    if (!namePlayer) {
        visible.style.display = 'none';
        blockStartGame.style.display = 'flex';

        //debugger;
    }
    else {
        visible.style.display = 'flex';
        blockStartGame.style.display = 'none';
        
    }
}
/*
function newGamE() {
    namePlayer = namePlayeR.value;
    checkNewPlayer(namePlayer);
    createMessageInfo(score, namePlayer, level);
}
*/
//blocks for animated messages

function createBlocksFunc(width, height, left = positionMessagesLeft, top = positionMessagesTop) {
    if (menuOptions.style.backgroundColor != 'black') {
        creatBlocks(menuOptions);
        creatBlocks(newGameBlock);
    }
    
    function creatBlocks(name) {
        name.style.width = `${width * 0.98}px`;
        name.style.height = `${height}px`;
        name.style.position = 'absolute';
        name.style.opacity = '0';
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
                audioMouve.play();;
            }
        }
    }
    //check the rows filled
    for (let row = playZone.length - 1; row >= 0;) {
        if (playZone[row].every(cell => !!cell)) {
            audioBoom.play();
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
        createMessageInfo(score, namePlayer, level)
    }
    figureCurrent = nextFigure();
}
//  Game Over
function showGameOver() {
    cancelAnimationFrame(playAnimation);
    gameOver = true;
    audiogameOver.play();
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
    audioClick.play();
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
        pause1();
    });
}


//listen buttons

buttonLeft.addEventListener('click', leftTouch, false);
buttonRight.addEventListener('click', rightTouch, false);
buttonRotate.addEventListener('click', rotateTouch, false);
buttonDown.addEventListener('click', downTouch, false);
function leftTouch() {
    audioClick.play();
    const col = figureCurrent.col - 1;
    if (isValidMove(figureCurrent.matrix, figureCurrent.row, col)) {
        figureCurrent.col = col;
    }
}
function rightTouch() {
    audioClick.play();
    const col = figureCurrent.col + 1;
    if (isValidMove(figureCurrent.matrix, figureCurrent.row, col)) {
        figureCurrent.col = col;
    }
}
function rotateTouch() {
    audioClick.play();
    const matrix = rotate(figureCurrent.matrix);
    if (isValidMove(matrix, figureCurrent.row, figureCurrent.col)) {
        figureCurrent.matrix = matrix;
    }
}

function downTouch() {
    audioClick.play();
    const row = figureCurrent.row + 1;
    if (!isValidMove(figureCurrent.matrix, row, figureCurrent.col)) {
        figureCurrent.row = row - 1;        
        placeFigure();
        return;
    }
    figureCurrent.row = row;
}
//swipe realisation(to the left)
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);
var xDown = null;
var yDown = null;

function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
};

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }
    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;
    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
        if (xDiff > 0) {
            /* left swipe */
                pause1(newGamesFlag);
        } 
    }
    /* reset values */
    xDown = null;
    yDown = null;
};
    //start New Game
    function gameStart() {
       //debugger;
        
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
    //console.log('yes');
}

var messageOptionsBlock = '<div class="optionsMessage"><p><p></p>LEFT&emsp;&emsp;&larr;</p><p>RIGHT&emsp;&thinsp;&thinsp;&rarr;</p><p>DOWN&emsp;&thinsp;&thinsp;&thinsp;&thinsp;&darr;</p><p>ROTATE&emsp;&thinsp;&uarr;</p><p>ROTATE&emsp;&thinsp;&uarr;</p><button id="continue "href="#" onclick="pause1()">continue</button></p></div>';
var messageNewGame = `<div class="messageNewGame"><p>start new game?</p><p><button id="yes" href="#" onclick="gameStart()">YES</button></p><p><button id="no"href="#" onclick="pause1()">NO</button></p></div>`;    
var messageRotateInfo = '<div class=""><p>rotate display</p></div>';

createMessages(textOptions, messageOptionsBlock);
createMessages(newGameBlock, messageNewGame);    
createMessages(rotateDisplay, messageRotateInfo, 14, 'left', score = 0);


function createMessageInfo(score, Name, level){
    var messageGameInfo = `<div class="infoGame"><p>level:&emsp;&thinsp; ${level}&emsp;points:&emsp; ${score}</p></a></div>`;
    createMessages(infoGame, messageGameInfo, 14, 'left');
}
createMessageInfo(score, namePlayer, level)

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
            pause1(transitionsFlag);
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
    if (mobileDevice || document.body.clientWidth < 750) {
       // menu.style.display = 'none';
        menu.className = 'menuBody';
    }
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
    if (mobileDevice || document.body.clientWidth < 750) {
        // menu.style.display = 'none';
        menu.className = 'menuBody';
    }
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
        if (menu.class = 'menuBody _active') {
            menu.className = 'menuBody';
        }
        transitionOff(menuOptions);
        transitionOff(newGameBlock);
    }

}


function records() {
    checkPause(menuOptions);
    checkPause(newGameBlock);
    transitions(recordsBlock, recordsFlag);
    if (mobileDevice || document.body.clientWidth < 750) {
        // menu.style.display = 'none';
        menu.className = 'menuBody';
    }
    function func(target) {
        //var a = target;
        var out = [];
        var k;
        for (var i in target) {
            var tmp = {
                key: i,
                value: target[i]
            };
            tmp[i] = tmp.value;
            tmp.toString = function () { return '"' + this.key + '": "' + this.value + '"' }
            out.push(tmp);
        };

        out.sort(function (a, b) { return (-parseInt(a.value) + parseInt(b.value)) });
        //recordsPlayers = ('result: \n', out.join(',\n'));
        //recordsPlayers = out;
        recordsPlayers = (out.join("\r\n"));
        return recordsPlayers;
    }
    var texT = func(target);
    texT.replace(' ', '');
    console.log(texT);
    recordsMess.innerText = `${texT}`;
    createMessages(recordsBlock, texT);
    console.log(recordsBlock);
}

// storage data in server
storeDataAjax(namePlayer, score);
function storeDataAjax(namePlayer, scorePlayer) {
    var a = document.getElementsByTagName('div');
    var ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php";
    var updatePassword;
    var stringName = 'Potrebchuk_TEST_INFO';
    var info, arr;
    var name, score, record, result;
    var infoPlayer = {};

    readData();
    function readData() {
        result = storeInfo();
        function storeInfo() {
            name = `${namePlayer}`;
            score = scorePlayer;
            infoPlayer[`${name}`] = score;
            //console.log(infoPlayer);
            updatePassword = Math.random();
            $.ajax({
                url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
                data: { f: 'LOCKGET', n: stringName, p: updatePassword },
                success: restoreInfo, error: errorHandler
            }
            );
        }
        function restoreInfo() {
            $.ajax(
                {
                    url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
                    data: { f: 'READ', n: stringName, p: updatePassword },
                    success: readReady, error: errorHandler
                }
            );
        }
        function readReady(callresult) {
            if (callresult.error != undefined)
                alert(callresult.error);
            else if (callresult.result != "") {
                info = JSON.parse(callresult.result);
                target = Object.assign(info, infoPlayer);
                storeInfO();

            }
        }
    }
    function storeInfO() {
        $.ajax({
            url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
            data: { f: 'UPDATE', n: stringName, v: JSON.stringify(target), p: updatePassword },
            success: updateReady, error: errorHandler
        }
           
        );
        result = target;
    }

    function updateReady(callresult) {
        if (callresult.error != undefined)
            alert(callresult.error);
    }

    function errorHandler(jqXHR, statusStr, errorStr) {
        alert(statusStr + ' ' + errorStr);
    }

        if (count > 59) {
            return records(result);
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
    if ((mobileDevice && (document.body.clientWidth > document.body.clientHeight)) || pauseFlag) {
        if ((mobileDevice && (document.body.clientWidth > document.body.clientHeight))) {
            rotateFlag = true;
            pauseFlag = true;
            rotateDispleY();
            gameFlag = false;
            //console.log('yes');        
        }
        else if (!gameFlag){
            rotateFlag = false;
            rotateDisplay.style.display = 'none';
            visible.style.display = 'flex';
            pauseFlag = false;
             gameFlag = false;
        }
        figureCurrent.row;
       
    }

    else if (figureCurrent) {      
        //console.log('yes');
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