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

All event listeners return the *tetris* object so that they can be chained.  For example `tetris.onLevelUp(function(){}).onBlockOut();`


##### .onMove(tetrimino, oldTetrimino)
	```
	Binds to move event of the falling tetrimino.  This event is fired when the tetrimino rotates, moves horizontally, or drops.  
	```
	###### Parameters
	* **tetrimino** - *Format:* `{type:"Z",minos:[{row:1,col:5},...]}`
	* **oldTetrimino** - *Format:* `{type:"Z",minos:[{row:1,col:5},...]}`


##### .onMatrix()
> This is the **first** line
> This is another line?

##### .onClearLines()
> This is the **first** line

> This is another line?

##### .onLevelUp()


##### .onBlockOut()



##### .onGhost()



##### .onPause()



##### .onPlay()


##### .onQueue()



##### .onScore()




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


