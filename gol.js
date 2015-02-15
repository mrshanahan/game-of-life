"use strict";

/* Global constants */
var MAX_BOARD_SIDE_PX = 720;
var LIVE_RANGE_MIN = 2;
var LIVE_RANGE_MAX = 3;
var REPRO_NUM = 3;

/* Global variables */
var boardSize;
var cachedNeighbors;
var timeVar;
var isGameRunning = false;

/* Draw functions */
function toPixelString (ival) {
    return ival.toString()+"px";
}

function toggleCellState() {
    if (this.classList.contains("living")) {
        this.className = "";
    } else {
        this.className = "living";
    }
}

function drawBoard (ignoreInputIfInvalid) {
    var oldBoardSize = boardSize;
    var newBoardSize = parseInt(document.getElementsByName("boardSize")[0].value);
    if (ignoreInputIfInvalid != true && isNaN(newBoardSize))
        return;
    boardSize = isNaN(newBoardSize) ? boardSize : newBoardSize;
    var boardRoot = document.getElementById("board");
    var body = document.getElementsByTagName("body")[0];
    var divSizePx = Math.floor(MAX_BOARD_SIDE_PX / boardSize);
    var boardSidePx = divSizePx * boardSize;
    var numSquares = boardSize * boardSize;

    if (boardRoot != null) {
        body.removeChild(boardRoot);
    }
    boardRoot = document.createElement("div");
    boardRoot.id = "board";
    body.appendChild(boardRoot);
    boardRoot.style.width = toPixelString(boardSidePx);
    boardRoot.style.height = toPixelString(boardSidePx);

    var divSizePx = Math.floor(boardSidePx / boardSize);
    var divSizePxString = toPixelString(divSizePx);
    for (var i = 0; i < numSquares; i++) {
        var childDiv = document.createElement("div");
        childDiv.addEventListener("click", toggleCellState);
        childDiv.style.width = divSizePxString;
        childDiv.style.height = divSizePxString;
        childDiv.id = i;
        boardRoot.appendChild(childDiv);
    }
    resetCounter();

    /* We don't want to go through a relatively expensive operation if we get
     * the same results, so we only cache on change in board size.
     */
    if ((ignoreInputIfInvalid == true && isNaN(newBoardSize)) || oldBoardSize != boardSize) {
        cacheNeighbors();
    }
}

function updateBoard() {
    var boardRoot = document.getElementById("board");
    for (var i = 0; i < boardRoot.children.length; i++) {
        var child = boardRoot.children[i];
        if (child.classList.contains("marked_dead")) {
            child.className = "";
        } else if (child.classList.contains("marked_live")) {
            child.className = "living";
        }

    }
}

function getNeighborIdsOf(cell) {
    var id = parseInt(cell.id);
    var numCells = boardSize * boardSize;

    var leftId = (id%boardSize)-1 >= 0 ? id-1 : -1;
    var rightId = (id%boardSize)+1 < boardSize ? id+1 : -1;
    var topId = (id-boardSize) >= 0 ? id-boardSize : -1;
    var bottomId = (id+boardSize) < numCells ? id+boardSize : -1;
    var topLeftId = (leftId >= 0 && topId >= 0) ? id-boardSize-1 : -1;
    var topRightId = (rightId >= 0 && topId >= 0) ? id-boardSize+1 : -1;
    var bottomLeftId = (leftId >= 0 && bottomId >= 0) ? id+boardSize-1 : -1;
    var bottomRightId = (rightId >= 0 && bottomId >= 0) ? id+boardSize+1 : -1;

    /* We don't really care about which node is which, but in case we do,
     * the order returned is clockwise starting from the top left.
     */
    return [topLeftId, topId, topRightId, leftId, rightId, 
            bottomLeftId, bottomId, bottomRightId].filter(function(e) {
                return e >= 0;
            });
}

function cacheNeighbors() {
    var boardRoot = document.getElementById("board");
    var cache = [];
    for (var i = 0; i < boardRoot.children.length; i++) {
        var child = boardRoot.children[i];
        cache.push(getNeighborIdsOf(child));
    }
    cachedNeighbors = cache;
}

function toggleGame(turnOn) {
    if (turnOn == true) {
        /*var intervalMs = parseInt(document.getElementsByName("intervalMs")[0].value);*/
        var intervalMs = parseInt(document.getElementById("intervalMs").value);
        if (intervalMs > 0) {
            updateCells();
            document.getElementsByName("start")[0].disabled = true;
            document.getElementsByName("stop")[0].disabled = false;
            timeVar = window.setInterval(updateCells, intervalMs);
            isGameRunning = true;
        }
    } else {
        isGameRunning = false;
        clearInterval(timeVar);
        document.getElementsByName("stop")[0].disabled = true;
        document.getElementsByName("start")[0].disabled = false;
    }
}

/* Counter functions */
function getCounter() {
    return document.getElementById("counter");
}

function setCounterValueTo(val) {
    getCounter().textContent = val;
}

function resetCounter() {
    setCounterValueTo(0);
}

function incrementCounter() {
    var counterNode = getCounter();
    var counterValue = parseInt(counterNode.textContent);
    if (isNaN(counterValue)) {
        resetCounter();
    } else {
        counterNode.textContent = counterValue+1;
    }
}

/* Game of Life logic */
function markCellForUpdate(cell) {
    var neighbors = cachedNeighbors[parseInt(cell.id)].map(function (i) {
        return document.getElementById(i);
    });
    var numNeighbors = neighbors.filter(function (e) {
        return (e != null) && e.classList.contains("living");
    }).length ;

    if (cell.classList.contains("living") && (numNeighbors < LIVE_RANGE_MIN ||
                                               numNeighbors > LIVE_RANGE_MAX))
    {
        cell.classList.add("marked_dead");
    }
    else if ((cell.className == "") && (numNeighbors == REPRO_NUM)) {
        cell.classList.add("marked_live");
    }
}

function updateCells() {
    var boardRoot = document.getElementById("board");
    for (var i = 0; i < boardRoot.children.length; i++) {
        var child = boardRoot.children[i];
        markCellForUpdate(child);
    }
    updateBoard();
    incrementCounter();
}

/* Setup */
document.getElementsByName("stop")[0].disabled = true;
document.getElementsByName("start")[0].addEventListener("click", function () {
    toggleGame(true);
});
document.getElementsByName("stop")[0].addEventListener("click", function () {
    toggleGame(false);
});
document.getElementsByName("redraw")[0].addEventListener("click", function () {
    if (isGameRunning) {
        toggleGame(false);
    }
    drawBoard();
});
document.getElementById("live_range_min").value = LIVE_RANGE_MIN
document.getElementById("live_range_max").value = LIVE_RANGE_MAX
document.getElementById("repro_num").value = REPRO_NUM

boardSize = 32;
drawBoard(true);
