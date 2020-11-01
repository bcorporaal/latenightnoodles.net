//
//	Toko
//

class Toko {



	constructor() {

    this.tokoVersionString = "Toko v0.0.0";

		/* 	
      Wordlists adapted from Haikunator by Atrox
			https://github.com/Atrox/haikunatorjs
		*/

		this.randomAdjectives = [
		  'aged', 'ancient', 'autumn', 'billowing', 'shining', 'black', 'blue', 'bold',
		  'broad', 'bright', 'calm', 'carbon', 'cool', 'crimson', 'curly', 'damp',
		  'dark', 'dawn', 'delicate', 'divine', 'dry', 'empty', 'falling', 'fancy', 'fabulous',
		  'flat', 'floral', 'fragrant', 'frosty', 'gentle', 'green', 'hidden', 'holy', 'imaginary',
		  'icy', 'jolly', 'late', 'lingering', 'little', 'lively', 'long', 'lucky',
		  'misty', 'morning', 'grunge', 'mute', 'nameless', 'noisy', 'odd', 'old',
		  'orange', 'patient', 'plain', 'polished', 'proud', 'purple', 'quiet', 'rapid',
		  'raspy', 'red', 'restless', 'rough', 'round', 'royal', 'shiny', 'super',
		  'shy', 'silent', 'small', 'snowy', 'soft', 'solitary', 'sparkling', 'spring',
		  'square', 'steep', 'still', 'summer', 'shining', 'super', 'sweet', 'throbbing', 'tight',
		  'tiny', 'twilight', 'wandering', 'weathered', 'white', 'wild', 'winter', 'wispy',
		  'withered', 'yellow', 'young', 'marvelous', 'epic', 'impressive', 'lively', 'elegant'
		]

		this.randomNouns = [
		  'art', 'statue', 'bar', 'base', 'bird', 'block', 'boat', 'bonus',
		  'bread', 'breeze', 'brook', 'bush', 'butterfly', 'cake', 'cell', 'cherry',
		  'cloud', 'credit', 'darkness', 'dawn', 'dew', 'disk', 'dream', 'duck', 'dust',
		  'feather', 'field', 'fire', 'firefly', 'flower', 'fog', 'forest', 'frog',
		  'frost', 'glade', 'glitter', 'grass', 'penguin', 'hat', 'haze', 'heart',
		  'hill', 'king', 'lab', 'lake', 'leaf', 'limit', 'math', 'meadow', 'toy',
		  'mode', 'moon', 'morning', 'mountain', 'mouse', 'mud', 'night', 'paper',
		  'pine', 'poetry', 'pond', 'queen', 'rain', 'recipe', 'resonance', 'rice',
		  'river', 'salad', 'scene', 'sea', 'shadow', 'shape', 'silence', 'sky',
		  'smoke', 'snow', 'snowflake', 'sound', 'star', 'sun', 'sun', 'sunset',
		  'surf', 'term', 'thunder', 'tooth', 'tree', 'truth', 'union', 'unit',
		  'violet', 'voice', 'water', 'waterfall', 'wave', 'wildflower', 'wind', 'wood',
		  'dinosaur', 'pirate', 'crocodile', 'shark', 'bunny', 'plank', 'bottle', 'experience',
      'weasel','trumpet','woodpecker'
		]

		//
		//	Default options
		//
		this.options = {
			showSaveButton: false,
			showExportButtons: false,
			sketchElementId: 'sketch-canvas',
      useParameterPanel: true,
      hideParameterPanel: true,
      logFPS: false,
      captureFrames: false,
      captureFrameCount: 500,
      captureFrameRate: 15,
		};

		this._fpsFilterStrength = 20;
		this._currentFPS = 0;
		this._frameTime = 16;
		this._captureStarted = false;

		this.pt = {
			fps: 0,
			graph: 0,
		}

		this._tokoColor = new TokoColor();

	}



	setup(inputOptions) {

    console.log(this.tokoVersionString);

    //  todo: add a check here that p5 is available
    //  todo: add a check here that two.js is available if required
    //  take input object with canvas ID and reference, renderer, other things
    //	make text on bottom right customizable through the sketch
		//	
		//	merge incoming options with the defaults
		//	
		this.options = Object.assign({}, this.options, inputOptions);

    if (this.options.useParameterPanel) {
	    this.pane = new Tweakpane();
	    //
	    //	use (p) to show or hide the panel
	    //
	    document.onkeydown = function(event) {
	      switch (event.keyCode) {
	        case 80:
	          var e = document.getElementsByClassName('tp-dfwv')[0];
            if(e.style.display == 'block')
              e.style.display = 'none';
            else
              e.style.display = 'block';
	          break;
	      }
	    }
    }

    // this._preprocessColorScales();

	}

	endSetup() {

		if (this.options.logFPS) {
			var f = toko.pane.addFolder({
	      expanded: true,
	      title: 'FPS',
	    });

	    f.addMonitor(this.pt, 'fps', {
			  interval: 200,
			});

	    f.addMonitor(this.pt, 'graph', {
  			view: 'graph',
  			interval: 100,
  			min: 0,
  			max: 70,
			});
		}

		if (this.options.useParameterPanel) {
			if (this.options.showSaveButton) {
				this.pane.addButton({
		      title: 'Save image',
		    }).on('click', (value) => {
		      this.downloadSketch();
		    });
		  }
		  if (this.options.showExportButton) {
				this.pane.addButton({
		      title: 'Export settings',
		    }).on('click', (value) => {
		      this.exportSettings();
		    });
		  }
	    if (this.options.hideParameterPanel) {
	    	var e = document.getElementsByClassName('tp-dfwv')[0];
        e.style.display = 'none';
	    }
	  }

	  if (this.options.captureFrames) {
	  	this.capturer = new CCapture({ 
	  		format: 'png',
	  		framerate: this.options.captureFrameRate,
	  		name:this.generateFilename('none'),
	  		display: false,
	  	});
	  	// this.capturer = new CCapture({ 
	  	// 	format: 'gif',
	  	// 	framerate: this.options.captureFrameRate,
	  	// 	name:this.generateFilename('none'),
	  	// 	workersPath: '../assets/vendors/jnordberg/',
	  	// 	verbose: true,
	  	// });
	  }

	}

	startDraw() {
		//
		//	will be called at the start of the draw loop
		//
	}

	endDraw() {
		//
		//	will be called at the end of the draw loop
		//
		//
		//	track fps with a simple filter to dampen any short spikes
		//
		if (this.options.logFPS) {
			this._frameTime += (deltaTime - this._frameTime) / this._fpsFilterStrength;
			this.pt.fps = this.pt.graph = Math.round(1000/this._frameTime);
		}
	}

	//
	//	start frame capture
	//
	startCapture() {
		if (this._captureStarted == false && this.options.captureFrames) {
			this._captureStarted = true;
			console.log('starting frame capture')
	    this.capturer.start();
		}
	}

	stopCapture() {
		if (this.options.captureFrames) {
		    console.log('finished capture');
		    this.capturer.stop();
		    this.capturer.save();
		    return;
		 }
	}

	captureFrame() {
		if (this.options.captureFrames) {
		  	
		  	// capture a frame

  			//console.log('capturing frame '+frameCount+' of '+this.options.captureFrameCount);
  			this.capturer.capture(document.getElementById('defaultCanvas0'));
		} else {
			this.stopCapture()
		}	
	}

	exportSettings() {
		var settings = this.pane.exportPreset();
		var str = JSON.stringify(settings, null, 4)
		console.log(str);
	}

	downloadSketch() {
		//
		//	detect if the sketch is in canvas or svg
		//
		var sketchElement = document.getElementById(this.options.sketchElementId).firstChild;
		var isCanvas = sketchElement instanceof HTMLCanvasElement;
		var isSVG = (sketchElement.nodeName == "svg");
		
		if(isCanvas) {
      var filename = this.generateFilename('png');
			var url = document.getElementById(this.options.sketchElementId).firstChild.toDataURL("image/png;base64");
		} else if(isSVG) {
			//
			//	add attributes to ensure proper preview of the SVG file in the Finder
			//
			var svgTemp = document.getElementById('sketch-canvas').children[0];
			svgTemp.setAttribute('xmlns:xlink','http://www.w3.org/1999/xlink');
			svgTemp.setAttribute('xmlns','http://www.w3.org/2000/svg');

      var filename = this.generateFilename('svg');
			var svgString = document.getElementById(this.options.sketchElementId).innerHTML;

      var blob = new Blob([svgString], {'type': 'image/svg+xml'})
      var url = window.URL.createObjectURL(blob);
		} else {
			console.log("downloadGraphic: unkown type");
      return;
		}
    //
    //  create a hidden url with the image and click it
    //
    var a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
	}

	generateFilename(extension = 'svg') {
		var adj1 = this.randomAdjectives[Math.floor(this.randomAdjectives.length*Math.random())];
		var adj2 = this.randomAdjectives[Math.floor(this.randomAdjectives.length*Math.random())];
		var noun = this.randomNouns[Math.floor(this.randomNouns.length*Math.random())];

		var filename = this._getTimeStamp()+'_';

		if (extension != '' && extension != 'none') {
			filename = filename+'sketched_the'+'_'+adj1+'_'+adj2+'_'+noun+'.'+extension;
		} else {
			filename = filename+'sketched_the'+'_'+adj1+'_'+adj2+'_'+noun;
		}
		return filename;
	}

	_getTimeStamp() {
		//
		//	create a yyyymmdd string
		//
		var d = new Date();
		var day = ("0" + d.getDate()).slice(-2);
    var month = ("0" + (d.getMonth() + 1)).slice(-2)
    var year = d.getFullYear();

    return year+month+day;
	}

	steppedRandom(min = 0, max = 1, step = 0.1) {
		var n = Math.floor((max - min)/step);
		var r = Math.round(Math.random()*n);
		return min+r*step;
	}

	wrap(value, min = 0, max = 100) {
		var vw = value;

		if (value < min) {
			vw = max + (value - min)
		} else if (value > max) {
			vw = min + (value - max)
		}

		return vw
	}

	//-------------------------------------
	//
	// TO DO: make this more less hacky
	//
	//-------------------------------------

	getColorPalette(inScale, nrColors = 100, invert = false, discrete = false, shades = 10) {
		return this._tokoColor.getColorPalette(inScale, nrColors, invert, discrete, shades);
	}

	createColorScale(inScale, low = 0, high = 100, quantize = false, steps = 10) {
			return this._tokoColor.createColorScale(inScale,low,high,quantize,steps);
	}

	getPaletteList(paletteType, justPrimary = true) {
		return this._tokoColor.getPaletteList(paletteType, justPrimary);
	}


	get colorScales() {
		return this._tokoColor.colorScales;
	}

}