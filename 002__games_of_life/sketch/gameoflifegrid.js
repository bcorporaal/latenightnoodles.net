class GameOfLifeGrid {
	constructor() {
	  this._sn = [];
	  this._bn = [];

	  this._columns = 0;
	  this._rows = 0;
	  this._cells = [];
	  this._newCells = [];
	  this._p = {};
	  this._seed = {};
	  this._colorLookup = [];
	  this._drawSize = 0;
	}

	reset(inP, inSeed, inColorLookup) {
		this._p = inP;
		this._seed = inSeed;
		this._colorLookup = inColorLookup;

		this._parseRules(this._p.ruleSet);
		this._buildGrid();
		this._seedInitial();

	}

	tick() {
	  //
	  //  calculate new state
	  //
	  var count = 0;
	  var ct = this._columns;
	  var rt = this._rows;
	  var cs = 0;
	  for (var c = 0; c < ct; c++) {
	    for (var r = 0; r < rt; r++) {
	      //
	      //  count living cells in all 8 directions
	      //
	      count = 0;
	      // N
	      if (r > 0) {
	        count += this._cells[c][r - 1].state;
	      }
	      // NE
	      if (r > 0 && c < ct - 1) {
	        count += this._cells[c + 1][r - 1].state;
	      }
	      // E
	      if (c < ct - 1) {
	        count += this._cells[c + 1][r].state;
	      }
	      // SE
	      if (r < rt - 1 && c < ct - 1) {
	        count += this._cells[c + 1][r + 1].state;
	      }
	      // S
	      if (r < rt - 1) {
	        count += this._cells[c][r + 1].state;
	      }
	      // SW
	      if (r < rt - 1 && c > 0) {
	        count += this._cells[c - 1][r + 1].state;
	      }
	      // W
	      if (c > 0) {
	        count += this._cells[c - 1][r].state;
	      }
	      // NW
	      if (r > 0 && c > 0) {
	        count += this._cells[c - 1][r - 1].state;
	      }
    
	      cs = this._cells[c][r].state;
	      //
	      //  determine state based on the rules
	      //
	      this._newCells[c][r].state = cs * this._sn[count] + (1 - cs) * this._bn[count];
	      //
	      //  count = number of living neighbors (in previous generation)
	      //
	      this._newCells[c][r].count = count;
	    }
	  }
	}

	render(inDrawingContext) {
		for (var c = 0; c < this._columns; c++) {
	    for (var r = 0; r < this._rows; r++) {
	      var cell = this._cells[c][r];
	      var newCell = this._newCells[c][r];
	      if (newCell.state == 0) {
	        cell.state = 0;
	      } else {
	        cell.state = 1;
	      }

	      cell.age++;
	      cell.count = newCell.count;

	      if (cell.render) {
	        inDrawingContext.fillStyle = this._colorLookup[cell.energy];
	        inDrawingContext.fillRect(cell.x, cell.y, this._drawSize, this._drawSize);
	      }
	    }
	  }
	}

	//--------------------------------------

	_buildGrid() {
		
		this._rows = 2 * floor(height / (2 * this._p.cellSize)) - 1;
  	this._columns = 2 * floor(width / (2 * this._p.cellSize)) - 1;
    this._drawSize = this._p.cellSize;

	  var i = 0;
	  for (var c = 0; c < this._columns; c++) {
	    this._cells[c] = [];
	    this._newCells[c] = [];
	    for (var r = 0; r < this._rows; r++) {
	      this._cells[c][r] = new Cell();
	      this._newCells[c][r] = {state: 0, count: 0};

	      this._cells[c][r].state = 0;
	      this._cells[c][r].colorBy = this._p.colorBy;
	      this._cells[c][r].x = c * this._p.cellSize + this._drawSize / 2;
	      this._cells[c][r].y = r * this._p.cellSize + this._drawSize / 2;
	    }
	  }

	}

	_getCell(c, r) {
		var id = c * this._rows + r;
	  return this._cells[c][r];
	}

	_parseRules() {
	  //
	  //  no error checking!
	  //  this assumes rules are formatted properly
	  //  like B234/S67

	  // reset rules - bn = born - sn = survive
	  this._bn = [0, 0, 0, 0, 0, 0, 0, 0, 0];
	  this._sn = [0, 0, 0, 0, 0, 0, 0, 0, 0];

	  var a = this._p.ruleSet.split("/");

	  var br = a[0].slice(1);
	  var sr = a[1].slice(1);

	  for (var i = 0; i < br.length; i++) {
	    this._bn[parseInt(br[i])] = 1;
	  }

	  for (var i = 0; i < sr.length; i++) {
	    this._sn[parseInt(sr[i])] = 1;
	  }
	}

	//--------------------------------------

	_seedInitial() {

		//
		//	refactor this
		//
		if(this._seed.dot) {
			this._seedSingleDot();
		}
		if(this._seed.row) {
			this._seedSingleRow();
		}
		if(this._seed.cross) {
			this._seedSingleCross();
		}
		if(this._seed.block) {
			this._seedBlock();
		}
		if(this._seed.triangle) {
			this._seedTriangle();
		}
		if(this._seed.corners) {
			this._seedCornerPockets();
		}
		if(this._seed.grid) {
			this._seedGrid();
		}
		if(this._seed.seCorner) {
			this._seedBottomRightCross();
		}
		if(this._seed.sCross) {
			this._seedSmallCross();
		}
		if(this._seed.square) {
			this._seedSquare();
		}
		if(this._seed.diagCross) {
			this._seedDiagonalCross();
		}
		if(this._seed.diamond) {
			this._seedDiamond();
		}
		if(this._seed.random) {
			this._seedRandom(this._seed.density);
		}
	}

	_seedSingleDot() {
	  var r = floor(this._rows / 2);
	  var c = floor(this._columns / 2);
	  this._getCell(c, r).state = 1;
	}

	_seedSingleRow() {
	  var r = floor(this._rows / 2);
	  for (var i = 0; i < this._columns; i++) {
	    this._getCell(i, r).state = 1;
	  }
	}

	_seedSingleCross() {
	  var r = floor(this._rows / 2);
	  var c = floor(this._columns / 2);
	  for (var i = 0; i < this._columns; i++) {
	    this._getCell(i, r).state = 1;
	  }
	  for (var i = 0; i < this._rows; i++) {
	    this._getCell(c, i).state = 1;
	  }
	}

	_seedDiagonalCross() {
		//
		//	assumes a square grid
		//
	  var w = this._rows-1;
	  var r1 = floor(this._rows / 2 - w / 2);
	  var r2 = floor(this._rows / 2 + w / 2);
	  var c1 = floor(this._columns / 2 - w / 2);
	  var c2 = floor(this._columns / 2 + w / 2);

	  for (var i = 0; i < w; i++) {
	  	this._getCell(i,i).state = 1;
	  	this._getCell(w-i,i).state = 1;
	  }
	}

	_seedSmallCross() {
	  var w = 21;
	  var r = floor(this._rows / 2);
	  var c = floor(this._columns / 2);
	  var r1 = floor(this._rows / 2 - w / 2);
	  var r2 = floor(this._rows / 2 + w / 2);
	  var c1 = floor(this._columns / 2 - w / 2);
	  var c2 = floor(this._columns / 2 + w / 2);

	  for (var i = 0; i < w; i++) {
	    this._getCell(c, r1 + i).state = 1;
	    this._getCell(c1 + i, r).state = 1;
	  }
	}

	_seedBottomRightCross() {
	  var w = Math.round(this._columns / 6);
	  var r1 = floor(this._rows - w);
	  var r2 = floor(this._rows);
	  var c1 = floor(this._columns - w);
	  var c2 = floor(this._columns);

	  for (var i = 1; i < w - 1; i++) {
	    this._getCell(c1 + i, r1 + i).state = 1;
	    this._getCell(c2 - i, r1 + i).state = 1;
	  }
	}

	_seedSquare() {
	  var w = Math.round(this._columns / 4); //100
	  var r1 = floor(this._rows / 2 - w / 2);
	  var r2 = floor(this._rows / 2 + w / 2);
	  var c1 = floor(this._columns / 2 - w / 2);
	  var c2 = floor(this._columns / 2 + w / 2);
	  for (var i = c1; i < c2; i++) {
	    this._getCell(i, r1).state = 1;
	    this._getCell(i, r2).state = 1;
	  }
	  for (var i = r1; i < r2; i++) {
	    this._getCell(c1, i).state = 1;
	    this._getCell(c2, i).state = 1;
	  }
	  this._getCell(c2, r2).state = 1;
	}

	_seedTriangle() {
	  var w = Math.round(this._columns / 6);
	  var r1 = floor(this._rows / 2 - w / 3);
	  var r2 = floor(this._rows / 2 + w / 3);
	  var c = floor(this._columns / 2);
	  var n = 0;

	  for (var j = r1; j < r2; j++) {
	    var c1 = floor(c - n);
	    var c2 = floor(c + n);
	    n++;

	    for (var i = c1; i < c2; i++) {
	      this._getCell(i, j).state = 1;
	    }
	  }
	}

	_seedDiamond() {
	  var h = Math.round(this._columns / 8);
	  var r1 = floor(this._rows / 2 - h);
	  var r2 = floor(this._rows / 2 + h);
	  var r0 = floor(this._rows / 2);
	  var c = floor(this._columns / 2);
	  var n = 0;

	  for (var j = r1; j < r0; j++) {
	    var c1 = floor(c - n);
	    var c2 = floor(c + n);
	    n++;

	    for (var i = c1; i < c2; i++) {
	      this._getCell(i, j).state = 1;
	    }
	  }
	  for (var j = r0; j < r2; j++) {
	    var c1 = floor(c - n);
	    var c2 = floor(c + n);
	    n--;

	    for (var i = c1; i < c2; i++) {
	      this._getCell(i, j).state = 1;
	    }
	  }
	}

	_seedBlock() {
	  var w = Math.round(this._columns / 4);
	  var r1 = floor(this._rows / 2 - w / 2);
	  var r2 = floor(this._rows / 2 + w / 2);
	  var c1 = floor(this._columns / 2 - w / 2);
	  var c2 = floor(this._columns / 2 + w / 2);

	  for (var i = c1; i < c2; i++) {
	    for (var j = r1; j < r2; j++) {
	      this._getCell(i, j).state = 1;
	    }
	  }
	}

	_seedGrid() {
	  var sg = 80;
	  var sc = Math.floor(this._columns / sg);
	  var c1 = Math.floor((this._columns - sc * sg) / 2);
	  var c2 = c1 + sc * sg;

	  var sr = Math.floor(this._rows / sg);
	  var r1 = Math.floor((this._rows - sr * sg) / 2);
	  var r2 = r1 + sr * sg;

	  for (var c = c1; c < c2 + 1; c += sg) {
	    for (var r = r1; r < r2 + 1; r++) {
	      this._getCell(c, r).state = 1;
	    }
	  }
	  for (var c = c1; c < c2 + 1; c++) {
	    for (var r = r1; r < r2 + 1; r += sg) {
	      this._getCell(c, r).state = 1;
	    }
	  }
	}

	_seedCornerPockets() {
	  var l = 20;

	  for (var r = 0; r < l; r++) {
	    for (var c = 0; c < l; c++) {
	      this._getCell(c, r).state = 1;
	      this._getCell(this._columns - c - 1, r).state = 1;
	      this._getCell(c, this._rows - r - 1).state = 1;
	      this._getCell(this._columns - c - 1, this._rows - r - 1).state = 1;
	    }
	  }
	}

	_seedRandom(density) {
		var d = density/100;
		var f = 0.05; // factor to further reduce the density
		var n = Math.floor(this._columns * this._rows * f * d*d);
		var c = 0;
		var r = 0;
		for (var i = 0; i < n; i++) {
			c = Math.floor(Math.random()*this._columns);
			r = Math.floor(Math.random()*this._rows);
			this._getCell(c, r).state = 1;
		}
	}

}