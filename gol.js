const MAX_BOARD_SIDE_PX = 720;
const LIVE_RANGE_MIN = 2;
const LIVE_RANGE_MAX = 3;
const REPRO_MIN = 3;

/* Draw functions */
function toPixelString (ival) {
    return ival.toString()+"px";
}

function toggleState() {
    if (this.classList.contains("living")) {
        this.className = "";
    } else {
        this.className = "living";
    }
}

function drawBoard () {
    if (boardSize == 0 || boardSize == "") {
        return;
    }
    var numSquares = boardSize * boardSize;
    var boardRoot = document.getElementById("board");
    var body = document.getElementsByTagName("body")[0];
    var divSizePx = Math.floor(MAX_BOARD_SIDE_PX / boardSize);
    var boardSidePx = divSizePx * boardSize;

    if (boardRoot != null) {
        body.removeChild(boardRoot);
    }
    boardRoot = document.createElement("div");
    boardRoot.id = "board";
    body.appendChild(boardRoot);
    boardRoot.style.width = toPixelString(boardSidePx);
    boardRoot.style.height = toPixelString(boardSidePx);

    var divSizePx = Math.floor(boardSidePx / boardSize);
    for (var i = 0; i < numSquares; i++) {
        var childDiv = document.createElement("div");
        childDiv.addEventListener("click", toggleState);
        childDiv.style.width = toPixelString(divSizePx);
        childDiv.style.height = toPixelString(divSizePx);
        childDiv.id = i;
        boardRoot.appendChild(childDiv);
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

document.getElementsByName("redraw")[0].addEventListener("click", function () {
    boardSize = parseInt(document.getElementsByName("boardSize")[0].value);
    drawBoard();
});

document.getElementsByName("iterate")[0].addEventListener("click", function () {
    updateCells();
});

var boardSize = 32;
drawBoard();

/* Game of Life logic */
function getNeighbors(cell) {
    var id = parseInt(cell.id);
    var numCells = boardSize * boardSize;

    var leftNode = (id%boardSize)-1 >= 0 ? document.getElementById(id-1) : null;
    var rightNode = (id%boardSize)+1 < boardSize ? document.getElementById(id+1) : null;
    var topNode = (id-boardSize) >= 0 ? document.getElementById(id-boardSize) : null;
    var bottomNode = (id+boardSize) < numCells 
        ? document.getElementById(id+boardSize) : null;
    var topLeftNode = (leftNode != null && (id-boardSize) >= 0)
        ? document.getElementById(id-boardSize-1) : null;
    var topRightNode = (rightNode != null && (id-boardSize) >= 0)
        ? document.getElementById(id-boardSize+1) : null;
    var bottomLeftNode = (leftNode != null && (id+boardSize) < numCells)
        ? document.getElementById(id+boardSize-1) : null;
    var bottomRightNode = (rightNode != null && (id+boardSize) < numCells)
        ? document.getElementById(id+boardSize+1) : null;

    /* We don't really care about which node is which, but in case we do,
     * the order returned is clockwise starting from the top left.
     */
    return [topLeftNode, topNode, topRightNode, 
            leftNode, rightNode, 
            bottomLeftNode, bottomNode, bottomRightNode];
}

function markCellForUpdate(cell) {
    var neighbors = getNeighbors(cell);
    var numNeighbors = neighbors.filter(function (e) {
        return (e != null) && e.classList.contains("living");
    }).length ;

    if (cell.classList.contains("living") && (numNeighbors < LIVE_RANGE_MIN ||
                                               numNeighbors > LIVE_RANGE_MAX))
    {
        cell.classList.add("marked_dead");
    }
    else if ((cell.className == "") && (numNeighbors >= REPRO_MIN)) {
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
}
