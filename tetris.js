/*!
 * tetris JavaScript Framework
 * http://tetrisjs.com/
 *
 * Copyright 2013 The Jeffries Company and other contributors
 * Released under the MIT license
 * https://github.com/JeffriesCo/TetrisJS/blob/master/LICENSE
 */

(function(undefined){
	

var tetris = {};
var board = null; //[][] - can be a tetrimino type or false
var score = 0;
var lines = 0;
var level = 0;
var rows = 20;
var cols = 10;
var isOnHold = false;
var lineValues = [40,100,300,1200];
var levelSpeeds = [800,720,640,560,480,420,360,300,240,200,180,160,140,120,100,90,80,70,60,50];
var position = {row:0,col:0};
var ghostPosition = {row:0,col:0};
var nextTetrimino = null; //{type:"Z",matrix:[][]} 
var tetrimino = null; //{type:"Z",matrix:[][]}
var tetriminos = {
	I:[[false,false,false,false],[false,false,false,false],[true,true,true,true],[false,false,false,false]],
	T:[[false,false,false],[true,true,true],[false,true,false]],
	O:[[true,true],[true,true]],
	L:[[false,false,false],[true,true,true],[true,false,false]],
	J:[[false,false,false],[true,true,true],[false,false,true]],
	S:[[false,false,false],[false,true,true],[true,true,false]],
	Z:[[false,false,false],[true,true,false],[false,true,true]]
};
	




//-----------------------------------------------------------------------------
//									TIMER
//-----------------------------------------------------------------------------
var timer = (function(){	
	var timer = {};
	
	var interval = null;
	var actions = {};
	var actionCounter = 0;
	var runTime = 0;
	
	timer.start = function(){
		var that=this;
		var lastTime = (new Date()).getTime();
		
		if(interval){ return; }
		
		interval = setInterval(function(){
			var curTime = (new Date()).getTime();
			var milliOffset = curTime - lastTime;
			runTime += milliOffset;
			for(var a in actions){
				actions[a].duration -= milliOffset;
				if(actions[a].duration <= 0){
					if(actions[a].maxCycles && actions[a].maxCycles <= actions[a].cycles){  
						actions[a].action(actions[a].maxCycles);
						timer.removeAction(a);
						continue;
					}
					actions[a].duration += actions[a].milli;
					actions[a].action(actions[a].cycles++);
				}
			}					
			lastTime = curTime;
		},5);
		return timer;
	};

	timer.stop = function(){
		clearInterval(interval);
		interval = null;
		return timer;
	};
	
	timer.isRunning = function(){
		return (interval ? true : false);
	};
	
	timer.addAction = function(actionName,func,delay,maxCycles){
		actions[actionName] = {
			action:func,
			milli:delay,
			duration:delay,
			cycles:0,
			maxCycles:maxCycles ? maxCycles : false
		};
		return tetris;
	};
	
	timer.removeAction = function(actionName){
		delete actions[actionName];
	};
	
	timer.reset = function(){
		for(var a in actions){
			timer.removeAction(a);
		}
		timer.stop();
	};

	return timer;
})();//End timer






//-----------------------------------------------------------------------------
//									EVENTS
//-----------------------------------------------------------------------------
var eventsStorage = {};
var tetrisEvent = function(eventName,eventAction){
	eventsStorage[eventName] = [];
	//Internal call events
	tetrisEvent[eventName] = function(){
		var rtnVal = eventAction ? eventAction.apply(this,Array.prototype.slice.call(arguments)) : Array.prototype.slice.call(arguments);
		for(var i=0; i<eventsStorage[eventName].length; i++){
			eventsStorage[eventName][i].apply(this,rtnVal);
		}
	};
	//Public bind onEvent methods
	tetris["on" + eventName.charAt(0).toUpperCase() + eventName.slice(1)] = function(func){
		eventsStorage[eventName].push(func);
		return tetris;	
	};	
};

//On Move
var previousOnMoveReturn = {type:"",minos:[]};
tetrisEvent("move",function(){
	var minos = [];
	for(var r=0; r<tetrimino.matrix.length; r++){
		for(var c=0; c<tetrimino.matrix[r].length; c++){
			if(tetrimino.matrix[r][c] && r+position.row >= 0 && r+position.row < rows && c+position.col >= 0 && c+position.col < cols){
				minos.push({row:r+position.row,col:c+position.col});
			}
		}
	}	
	var rtn = {type:tetrimino.type,minos:minos,prevType:previousOnMoveReturn.type,prevMinos:previousOnMoveReturn.minos};
	previousOnMoveReturn = {type:tetrimino.type,minos:minos};
	return [rtn];
});

//On Matrix Update
tetrisEvent("matrix",function(){
	return [board];
});

//On Clear
tetrisEvent("clearLines");

//On Level Change
tetrisEvent("levelUp");

//On Block Out
tetrisEvent("blockOut");

//On Ghost
var previousOnGhostReturn = {type:"",minos:[]};
tetrisEvent("ghost",function(){
	var minos = [];
	for(var r=0; r<tetrimino.matrix.length; r++){
		for(var c=0; c<tetrimino.matrix[r].length; c++){
			if(tetrimino.matrix[r][c] && r+ghostPosition.row >= 0 && r+ghostPosition.row < rows && c+ghostPosition.col >= 0 && c+ghostPosition.col < cols){
				minos.push({row:r+ghostPosition.row,col:c+ghostPosition.col});
			}
		}
	}
	var rtn = {type:tetrimino.type,minos:minos,prevType:previousOnGhostReturn.type,prevMinos:previousOnGhostReturn.minos};
	previousOnGhostReturn = {type:tetrimino.type,minos:minos};
	return [rtn];
});

//On Pause
tetrisEvent("pause");

//On Play
tetrisEvent("play");

//On Queue
tetrisEvent("queue",function(){
	return [nextTetrimino];
});

//On Score Change
var oldScore = null;
tetrisEvent("score",function(){
	var rtn = [score,oldScore];
	oldScore = score;
	return rtn;
});


//-----------------------------------------------------------------------------
//									MECHANICS
//-----------------------------------------------------------------------------
var randomTetrimino = function(){
	var types = ["I","T","O","L","J","S","Z"];
	var i = types.length, temp, rand;
	while(--i){
		rand = Math.floor(Math.random()*(i + 1));
		temp = types[i];
		types[i] = types[rand];
		types[rand] = temp;
	}
	return types[0];
};

var cloneMatrix = function(matrix){
	var newMatrix = [];
	for(var r=0; r<matrix.length; r++){
		newMatrix[r] = [];
		for(var c=0; c<matrix[r].length; c++){
			newMatrix[r][c] = matrix[r][c];
		}
	}
	return newMatrix;
};

var rotateMatrix = function(matrix,clockwise){
	var newMatrix = [];
	if(clockwise){
		for(var i=0; i<matrix.length; i++){
			newMatrix[i] = [];
			for(var j=0; j<matrix.length; j++){
				newMatrix[i][j] = matrix[matrix.length-j-1][i];
			}
		}
	} else {
		for(var i=0; i<matrix.length; i++){
			newMatrix[i] = [];
			for(var j=0; j<matrix.length; j++){
				newMatrix[i][j] = matrix[j][matrix.length-i-1];
			}
		}
	}	
	return newMatrix;
};

var isMinoAvailable = function(row,col){
	if(col >= 0 && col < cols && row < rows && (row < 0 || board[row][col]=="")){
		return true;
	}
	return false;
};

var checkMatrixPosition = function(checkMatrix,checkPosition){
	for(var r=0; r<checkMatrix.length; r++){
		for(var c=0; c<checkMatrix[r].length; c++){
			if(checkMatrix[r][c] && !isMinoAvailable(r+checkPosition.row,c+checkPosition.col)){
				return false;
			}
		}
	}
	return true;
};

var addTetriminoToBoard = function(){
	for(var r=0; r<tetrimino.matrix.length; r++){
		for(var c=0; c<tetrimino.matrix[r].length; c++){
			if(tetrimino.matrix[r][c] && r+position.row >=0 && r+position.row < rows && c+position.col >= 0 && c+position.col < cols && isMinoAvailable(r+position.row,c+position.col)){
				board[r+position.row][c+position.col] = tetrimino.type;
			}
		}
	}
	tetrisEvent.matrix();
};

var isBlockOut = function(){
	for(var r=0; r<tetrimino.matrix.length; r++){
		for(var c=0; c<tetrimino.matrix[r].length; c++){
			if(tetrimino.matrix[r][c] && r+position.row < 0 ){
				return true;
			}
		}
	}
	return false;
};


var getBottomRow = function(){
	var prevRow = position.row;
	var testRow = prevRow+1;
	while(checkMatrixPosition(tetrimino.matrix,{row:testRow,col:position.col})){
		prevRow = testRow;
		testRow++;
	}
	return prevRow;
};


var updateGhost = function(){	
	var bottomRow = getBottomRow();
	if(bottomRow > position.row){
		ghostPosition = {row:bottomRow,col:position.col};
		tetrisEvent.ghost();
	}	
};

var removeLine = function(lineNum){
	board.splice(lineNum,1);
	board.unshift([]);
	for(var c=0; c<cols; c++){
		board[0][c] = "";
	}
};

var getCurrentLevel = function(){
	var total = 0;
	for(var i=0; i<100; i++){
		total += Math.min(i*10,100);
		if(total > lines){
			return i-1;
		}
	}
};

var clearLines = function(){
	var clearLines = [];
	for(var r=0, colCheck; r<board.length; r++){
		colCheck = true;
		for(var c=0; c<board[r].length; c++){			
			if(board[r][c]==""){
				colCheck = false;
			}
		}
		if(colCheck){
			clearLines.push(r);
		}
	}
	if(clearLines.length > 0){
		for(var i=0; i<clearLines.length; i++){
			removeLine(clearLines[i]);
		}		
		score += lineValues[clearLines.length-1]*(level+1);
		lines += clearLines.length;
		tetrisEvent.score();
		tetrisEvent.clearLines(clearLines,lines,board);
		
		var curLevel = getCurrentLevel();
		if(curLevel > level){
			nextLevel();			
		}
	}
};


var loadNextTetrimino = function(){	
	var type = randomTetrimino();
	var newTetrimino = {type:type,matrix:cloneMatrix(tetriminos[type])};
	previousOnMoveReturn = {type:"",minos:[]};
	previousOnGhostReturn = {type:"",minos:[]};

	if(isOnHold){
		tetrimino = newTetrimino;
	} else {
		tetrimino = nextTetrimino;
		nextTetrimino = newTetrimino;
		tetrisEvent.queue();
	}
	
	position = {row:tetrimino.matrix.length*-1,col:Math.floor((cols-tetrimino.matrix.length)/2)};
	updateGhost();
	tetrisEvent.move();
};


var moveTetriminoDown = function(){
	var newPosition = {row:position.row+1,col:position.col};
	if(checkMatrixPosition(tetrimino.matrix,newPosition)){
		position = newPosition;
		tetrisEvent.move();
		score += (level+1);
	} else if(isBlockOut()){
		tetrisEvent.blockOut();
		timer.reset();
	} else {
		tetrisEvent.score();
		addTetriminoToBoard();
		clearLines();
		loadNextTetrimino();
	}
};


var nextLevel = function(){
	timer.removeAction("level"+level);
	level++;
	tetrisEvent.levelUp(level);
	timer.addAction("level"+level,function(){
		moveTetriminoDown();			
	},(levelSpeeds[level] || 50));	
};




//-----------------------------------------------------------------------------
//									ACTIONS
//-----------------------------------------------------------------------------
var tetrisAction = function(actionName,action){
	
	tetris[actionName] = function(){
		action.apply(this,Array.prototype.slice.call(arguments));
		return tetris;
	};
	
};





//Move Left
tetrisAction("moveLeft",function(){
	if(!timer.isRunning()){ return; }
	var newPosition = {row:position.row,col:position.col-1};
	if(checkMatrixPosition(tetrimino.matrix,newPosition)){
		position = newPosition;
		updateGhost();
		tetrisEvent.move();
	}
});


//Move Right
tetrisAction("moveRight",function(){
	if(!timer.isRunning()){ return; }
	var newPosition = {row:position.row,col:position.col+1};
	if(checkMatrixPosition(tetrimino.matrix,newPosition)){
		position = newPosition;
		updateGhost();
		tetrisEvent.move();
	}
});


//Hard Drop
tetrisAction("hardDrop",function(){
	if(!timer.isRunning()){ return; }
	var bottomRow = getBottomRow();
	var rowDiff = bottomRow - position.row;
	position = {row:bottomRow,col:position.col};
	if(rowDiff > 0){
		score += rowDiff*(level+1);
		tetrisEvent.score();
	}
	addTetriminoToBoard();
	clearLines();
	loadNextTetrimino();
});


//Soft Drop
tetrisAction("softDrop",function(){
	if(!timer.isRunning()){ return; }
	moveTetriminoDown();
});


//Rotate Right
tetrisAction("rotateRight",function(){	
	if(!timer.isRunning()){ return; }
	var rotateRightMatrix = rotateMatrix(tetrimino.matrix,true);
	if(checkMatrixPosition(rotateRightMatrix,position)){
		tetrimino.matrix = rotateRightMatrix;
		updateGhost();
		tetrisEvent.move();
	}	
});


//Rotate Left
tetrisAction("rotateLeft",function(){
	if(!timer.isRunning()){ return; }
	var rotateRightMatrix = rotateMatrix(tetrimino.matrix,false);
	if(checkMatrixPosition(rotateRightMatrix,position)){
		tetrimino.matrix = rotateRightMatrix;
		updateGhost();
		tetrisEvent.move();
	}	
});


//Pause
tetrisAction("togglePause",function(){
	if(timer.isRunning()){
		timer.stop();
		tetrisEvent.pause();
	} else {
		timer.start();
		tetrisEvent.play();
	}
});


//Hold
tetrisAction("toggleHold",function(){
	if(!timer.isRunning()){ return; }
	isOnHold = !isOnHold;
});


//Play
tetrisAction("newGame",function(newLevel){
	timer.reset();
	score = 0;
	lines = 0;
	level = newLevel ? newLevel-1 : -1;
	
	//Initialize Board
	board = [];
	for(var r=0; r<rows; r++){
		board[r] = [];
		for(var c=0; c<cols; c++){
			board[r][c] = "";
		}
	}
	tetrisEvent.matrix();
	
	var type = randomTetrimino();
	nextTetrimino = {type:type,matrix:cloneMatrix(tetriminos[type])};
	
	nextLevel();
	loadNextTetrimino();
	
	timer.start();
});




//-----------------------------------------------------------------------------
//									PUBLIC GETTERS
//-----------------------------------------------------------------------------
tetris.getScore = function(){
	return score;
};

tetris.getLevel = function(){
	return level;
};

tetris.getLines = function(){
	return lines;
};

tetris.getBoard = function(){
	return board;
};

tetris.getTetriminoType = function(){
	return tetrimino.type;
};

tetris.isOnHold = function(){
	return isOnHold;
};

tetris.getTimer = function(){
	return timer;
};




window.tetris = tetris;
	
})();