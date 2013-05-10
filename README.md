TetrisJS
========
123




Usage
------




Terminology
------

##### Tetrimino Types


Examples
------








Event Listeners
------

All event listeners return the *tetris* object so that they can be chained.  For example `tetris.onLevelUp().onBlockOut();`


* **onMove(tetrimino, oldTetrimino)**
	* *Description* - Binds to move event of the falling tetrimino.  This event is fired when the tetrimino rotates, moves horizontally, or drops.  
	* Parameters
		* *tetrimino* - `{type:"Z",minos:[{row:1,col:5},...]}`
		* *oldTetrimino* - `{type:"Z",minos:[{row:1,col:5},...]}`

* **onMatrix(boardMatrix)**
	* *Description* - Binds to full matrix changes.  These occur when a tetrimino is added to the board or the board is cleared.
	* Parameters
		* *boardMatrix* - `[["Z","I","","",...],...]` - This is a 2D array ([rows][cols]) showing which mino is in every space of the board.  

* **onClearLines(lines,totalLines,boardMatrix)**
	* *Description* - Binds to the clear lines event.  This occurs after a tetrimino is placed on the board, and if a row is complete.
	* Parameters
		* *lines* - The number of lines currently cleared in this event (Range: 1-4)
		* *totalLines* - The total number of lines cleared throughout the game.
		* *boardMatrix* - Same parameter as onMatrix

* **onLevelUp(level)**
	* *Description* - Binds to the level up event.  This event occurs after a certain number of lines have been cleared.
	* Parameters
		* *level* - The new level (Range: 0-n)

* **onBlockOut()**
	* *Description* - Binds to the block off the board event.  When this event fires the game is over.
	* Parameters
		* *None*

* **onGhost(ghost, oldGhost)**
	* *Description* - Binds to the ghost change event.  This event first when a new tetrimino starts dropping or the current one is rotated or moved horizontally.
	* Parameters
		* *ghost* - `{type:"Z",minos:[{row:1,col:5},...]}`
		* *oldGhost* - `{type:"Z",minos:[{row:1,col:5},...]}`

* **onPause()**
	* *Description* - Binds the pause event.  This event is fired when togglePause method is called.
	* Parameters
		* *None*

* **onPlay()**
	* *Description* - Binds the play event.  This event is fired when togglePause method is called.
	* Parameters
		* *None*

* **onQueue(nextTetrimino)**
	* *Description* - Binds to the queue updated event.  This event is fired when the piece from the queue now becomes the active one.
	* Parameters
		* *nextTetrimino* - `{type:"Z",matrix:[[true,false,false,...],...]}` - The matrix represents a square (2x2, 3x3, or 4x4) of the shape of the piece.

* **onScore(score, oldScore)**
	* *Description* - Binds to the score changed event.  This event is fired when the score gets updated by completing lines or dropping pieces.
	* Parameters
		* *score* - The total new score
		* *oldScore* - The previous total score - used to determine the difference




Actions
------

##### .moveLeft()


##### .moveRight()


##### .hardDrop()


##### .softDrop()


##### .rotateRight()


##### .rotateLeft()


##### .togglePause()


##### .toggleHold()


##### .newGame()





Helpers
------

##### .getScore()

##### .getLevel()

##### .getLines()

##### .getBoard()

##### .getTetriminoType()

##### .isOnHold()

##### .getTimer()


