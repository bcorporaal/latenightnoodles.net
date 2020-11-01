class Cell {

	static colorByOptions = {
    alive: "alive",
    cycle: "cycle",
    cycleAll: "cycleAll",
    generation: "generation",
    relativeAge: "relativeAge",
    life: "life",
    neighbors: "neighbors",
    fade: "fade",
  }

	constructor() {
		this._state = 0;
		this._oldState = 0;
		this._energy = 0;
		this._render = false;
		this._x = 0;
		this._y = 0;
		this._inert = false; // when set to true the cell always remains in its current state
		this._count = 0;
		this._age = 0;
		this._beenAlive = false;
		this._reincarnation = 0;
		this._birthAge = 0;
	  this._colorBy = "";
	}

	_colorByAlive() {
		//
		//	basic on/off
		//
		if (this._state == 1) {
			this._energy = 99
			this._render = true
		} else {
			this._energy = 0
			this._render = false
		}
	}

	_colorByCycle() {
		//
		//	cycle colors - alive only
		//
		if (this._state == 1) {
			this._energy += 0.5
			this._render = true
		} else {
			this._render = false
		}

		if (this._energy < 0) { this._energy = 99}
		if (this._energy > 99) {this._energy = 0}
	}

	_colorByCycleAll() {
		//
		//	cycle colors - alive and dead
		//
		if (this._state == 1) {
			this._energy += 5
			this._render = true
		} else {
			this._energy -= 5
		}

		if (this._energy < 0) { this._energy = 99}
		if (this._energy > 99) {this._energy = 0}
	}

	_colorByGeneration() {
		//
		// color based on generation of first birth
		//
		if (this._state == 1) {
			this._beenAlive = true;
		}

		if (!this._beenAlive) {
			this._energy = this._age % 99;
		}

		if (this._state == 1) {
			this._render = true;
		} else {
			this._render = false;
		}
	}

	_colorByRelativeAge() {
		//
		// color based on generation relative to age of grid
		//
		if (this._state == 1 && !this._beenAlive) {
			this._beenAlive = true;
			this._birthAge = this._age;
		}

		if (this._state == 1) {
			this._energy = Math.floor(99*this._birthAge/this._age);
			this._render = true;
		} else {
			this._render = false;
		}
	}

	_colorByLife() {
		//
		//	color based on life / reincarnation of the cell
		//
		if (this._state == 1 && this._oldState == 0) {
			this._energy += 4
		}

		if (this._state == 1) {
			this._render = true
		} else {
			this._render = false
		}

		if (this._energy > 99) { this._energy -= 99}

		this._oldState = this._state;
	}

	_colorByNeighbors() {
		//
		//	color based on number of neighbors
		//
		if (this._state == 1) {
			this._energy = 12*this._count
			this._render = true
		} else {
			this._render = false
		}
	}

	_colorByFade() {
		//
		//	fade cell colors
		//
		var fadeSpeedIn = 6;
		var fadeSpeedOut = 3;

		if (this._state == 1) {
			this._energy += fadeSpeedIn;
			this._render = true
		} else {
			this._energy -= fadeSpeedOut;
		}

		if (this._energy < 0) {
			this._energy = 0
			this._render = false
		} else if (this._energy > 99) {
			this._energy = 99;
		}
	}

	_adjustEnergy() {

		switch (this._colorBy) {
  		case Cell.colorByOptions.alive:
				this._colorByAlive();
	    	break;
	    case Cell.colorByOptions.cycle:
	    	this._colorByCycle();
	    	break;
	    case Cell.colorByOptions.cycleAll:
	    	this._colorByCycleAll();
	    	break;
	    case Cell.colorByOptions.generation:
	    	this._colorByGeneration();
	    	break;
	    case Cell.colorByOptions.life:
	    	this._colorByLife();
	    	break;
	    case Cell.colorByOptions.neighbors:
	    	this._colorByNeighbors();
	    	break;
	    case Cell.colorByOptions.fade:
	    	this._colorByFade();
	    	break;
	    case Cell.colorByOptions.relativeAge:
	    	this._colorByRelativeAge();
	    	break;
	    default:
	    	console.log('ERROR: colorByOption not found: '+this._colorBy);
	    	break;

	    // this._oldState = this._state;
		}
	}

	//
	//	Getters and Setters
	//

	get state() {
		return this._state;
	}

	set state(newState) {
		if (!this._inert) {
			this._state = newState;
		}
	}

	get energy() {
		return this._energy;
	}

	get render() {
		return this._render;
	}

	set render(newRender) {
		this._render = newRender;
	}

	get x() {
		return this._x;
	}

	set x(newX) {
		this._x = newX;
	}

	get y() {
		return this._y;
	}

	set y(newY) {
		this._y = newY;
	}

	get inert() {
		return this._inert;
	}

	set inert(newInert) {
		this._inert = newInert;
	}

	get count() {
		return this._count;
	}

	set count(newCount) {
		this._count = newCount;
		this._adjustEnergy();
	}

	get age() {
		return this._age;
	}

	set age(newAge) {
		this._age = newAge;
	}

	get colorBy() {
		return this._colorBy;
	}

	set colorBy(newColorBy) {
		this._colorBy = newColorBy;
	}
}
