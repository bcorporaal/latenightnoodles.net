//
// tokoColor
//
class TokoColor {

	constructor() {
		this._preprocessPalettes();
	}
	
	//
	//	from 
	//	https://observablehq.com/@mbostock/cosine-color-schemes
	//	http://iquilezles.org/www/articles/palettes/palettes.htm
	//	
	_interpolateCosine([ar, ag, ab], [br, bg, bb], [cr, cg, cb], [dr, dg, db]) {
	  return t => `rgb(${[
	    ar + br * Math.cos(2 * Math.PI * (cr * t + dr)),
	    ag + bg * Math.cos(2 * Math.PI * (cg * t + dg)),
	    ab + bb * Math.cos(2 * Math.PI * (cb * t + db))
	  ].map(v => Math.floor(Math.max(0, Math.min(1, v)) * 255))})`;
	}

	interpolateCosineV1 = this._interpolateCosine([0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [1.0, 1.0, 1.0], [0.00, 0.10, 0.20]);
	interpolateCosineV2 = this._interpolateCosine([0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [1.0, 1.0, 1.0], [0.30, 0.20, 0.20]);
	interpolateCosineV3 = this._interpolateCosine([0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [1.0, 1.0, 0.5], [0.80, 0.90, 0.30]);
	interpolateCosineV4 = this._interpolateCosine([0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [1.0, 0.7, 0.4], [0.00, 0.15, 0.20]);
	interpolateCosineV5 = this._interpolateCosine([0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [2.0, 1.0, 0.0], [0.50, 0.20, 0.25]);
	interpolateCosineV6 = this._interpolateCosine([0.8, 0.5, 0.4], [0.2, 0.4, 0.2], [2.0, 1.0, 1.0], [0.00, 0.25, 0.25]);
	interpolateCosineV7 = this._interpolateCosine([1.000, 0.500, 0.500], [0.500, 0.500, 0.500], [0.750, 1.000, 0.667], [0.800, 1.000, 0.333]);
	interpolateCosineV8 = this._interpolateCosine([0.093, 0.629, 0.825], [0.800, 0.269, 0.087], [0.906, 1.470, 1.544], [5.345, 4.080, 0.694]);
	
	getColorPalette(inPalette, nrColors = 100, invert = false, discrete = false, shades = 10) {
		var o = {};
		var low = 0;
		var high = nrColors-1;
		var defaultBgnd = "#eee";
		var defaultStroke = "#333";

		var scale = this._createColorPalette(inPalette, low, high, discrete, shades);
		var palette = this.findPaletteByName(inPalette);

		o.name = inPalette;

		//
		//	include the original colors
		//	(or palette of 10 if no original colors, like for D3)
		//
		if(palette.colors !== undefined) {
			o.originalColors = palette.colors;
		} else {
			o.originalColors = this._createColorArray(scale, low, high, 10);
		}

		o.colors = this._createColorArray(scale, low, high, nrColors);
		
		if (invert) {
			o.originalColors.reverse();
			o.colors.reverse();
		}

		o.scale = scale;
		o.background = (palette.background !== undefined) ? palette.background : defaultBgnd;
		o.stroke = (palette.stroke !== undefined) ? palette.stroke : defaultStroke;

		return o;
	}


	_createColorPalette(inScale, low = 0, high = 100, quantize = false, steps = 10) {

		var scale = this.findPaletteByName(inScale);

		if (!quantize) {
			switch (scale.type) {
				case this.D3_SCALE:
					return this._d3ColorScale(scale, low, high, quantize);
					break;
				case this.COSINE_SCALE:
					return this._cosineScale(scale, low, high, quantize);
					break;
				case this.REGULAR_SCALE:
				case this.CHROMOTOME_SCALE:
					return this._createLinearScale(scale, low, high, quantize);
					break;
				default:
					console.log('ERROR color scale not found: '+scale.id);
					return null;
			}
		} else {
			return this._createDiscreteColorScale(inScale,low,high,quantize,steps);
		}

	}

	_createDiscreteColorScale(inScale, low = 0, high = 100, quantize = true, steps = 10) {

		var tempColorScale = this._createColorPalette(inScale,low,high,false);

		//
		//	if steps is 0 then we use the number of colors defined in the scheme
		//	extra check for scale that don't have colors defined
		//
		if (steps == 0) {
			var scale = this.findPaletteByName(inScale);
			if ( typeof scale.colors === 'undefined' || scale.colors === null) {
				steps = 10;
			} else {
				steps = scale.colors.length;
			}
		}

		var colors = this._createColorArray(tempColorScale,low,high,steps);

		return d3.scaleQuantize()
		  .domain([low, high])
		  .range(colors);
	}

	_createColorArray(scale, low, high, steps) {
		var colors = [];
		var s = (high-low)/(steps-1);
		for (var i = 0; i < steps; i++) {
			var r = low + s*i;
			var c = scale(r);
			if (c.startsWith('rgb')) {
				c = this._rgbToHex(c);
			}
			colors.push(c)
		}
		return colors;
	}

	_rgbToHex(inRGB) {
		var a = inRGB.split("(")[1].split(")")[0];
		a = a.split(",");
		var b = a.map(function(x){           // For each array element
    	x = parseInt(x).toString(16);      // Convert to a base16 string
    	return (x.length==1) ? "0"+x : x;  // Add zero if we get only one character
		})
		b = "#"+b.join("");
		return b;
	}

	_cosineScale(scale,low,high, quantize) {
		return d3
	    .scaleSequential()
	    .domain([low, high])
	    .interpolator(this[scale.id]);
	}

	_d3ColorScale(scale,low,high, quantize) {
   		return d3
		    .scaleSequential()
		    .domain([low, high])
		    .interpolator(d3[scale.id]);
	}

	_createLinearScale(scale, low, high, quantize) {
		var colors = scale.colors;
		var n = colors.length;
		var s = (high - low)/(n-1);
		var d = [];
		for (var i = 0; i < n; i++) {
			d.push(low+i*s);
		}

		if (quantize) {
			return d3.scaleQuantize()
		    .domain([low, high])
		    .range(colors);
   	} else {
   		return d3.scaleLinear()
				.domain(d)
				.range(colors)
				.interpolate(d3.interpolateHcl);
   	}
	}

	REGULAR_SCALE = 'regular';
	COSINE_SCALE = 'cosine';
	D3_SCALE = 'd3';
	CHROMOTOME_SCALE = 'chromotome';
	ALL_SCALE = 'all';

	_preprocessPalettes() {
		//
		//	combine the chromotome palettes
		//
		this.chromotome_complete = this.misc.concat(
	    this.ranganath,
	    this.roygbivs,
	    this.tundra,
	    this.colourscafe,
	    this.rohlfs,
	    this.ducci,
	    this.judson,
	    this.iivonen,
	    this.kovecses,
	    this.tsuchimochi,
	    this.duotone,
	    this.hilda,
	    this.spatial,
	    this.jung,
	    this.system,
	    this.flourish
	  );

		//
		//	id the palettes
		//
		this.colorSchemes = this.colorSchemes.map(p => ({...p, type: this.REGULAR_SCALE}));
		this.d3Scales = this.d3Scales.map(p => ({ ...p, type: this.D3_SCALE }));
		this.cosineScales = this.cosineScales.map(p => ({ ...p, type: this.COSINE_SCALE }));
		this.chromotome_complete = this.chromotome_complete.map(p => ({ ...p, type: this.CHROMOTOME_SCALE }));
		//
		//	combine
		//
		this.palettes = [
			...this.colorSchemes,
			...this.d3Scales,
			...this.cosineScales,
			...this.chromotome_complete
		];
	}

	findPaletteByName(paletteName) {
		var p = this.palettes.filter(p => p.name === paletteName)[0];
		if (p === undefined) { console.log('palette not found: '+paletteName)}
		return p
	}

	getPaletteList(paletteType, justPrimary = true) {
		if (paletteType !== 'all') {
			var filtered = this.palettes.filter(p => (p.type === paletteType));
		} else {
			var filtered = this.palettes;
		}
		if (justPrimary) {
			filtered = filtered.filter(p => (p.isPrimary))
		}

		//
		//	create list that is easy for TweakPane to use
		//
		var o = {};
		filtered.forEach(function (p) {
  		o[p.name] = p.name;
		});

		return o;
	}

//
//	Beyond here are only color palettes
//
//---------------------------------------------------------------

	d3Scales = [
    {name:'brownGreen',id:"interpolateBrBG",isPrimary:true,},
    {name:'greys',id:"interpolateGreys",isPrimary:false,},
    {name:'inferno',id:"interpolateInferno",isPrimary:false,},
    {name:'magma',id:"interpolateMagma",isPrimary:true,},
    {name:'plasma',id:"interpolatePlasma",isPrimary:false,},
    {name:'puBuGn',id:"interpolatePuBuGn",isPrimary:false,},
    {name:'rainbow',id:"interpolateRainbow",isPrimary:false,},
    {name:'RedPurple',id:"interpolateRdPu",isPrimary:true,},
    {name:'sinebow',id:"interpolateSinebow",isPrimary:false,},
    {name:'spectral',id:"interpolateSpectral",isPrimary:true,},
    {name:'turbo',id:"interpolateTurbo",isPrimary:true,},
    {name:'viridis',id:"interpolateViridis",isPrimary:true,},
    {name:'YlGnBu',id:"interpolateYlGnBu",isPrimary:false,},
    {name:'YlOrBr',id:"interpolateYlOrBr",isPrimary:true,},
    {name:'YlOrRd',id:"interpolateYlOrRd",isPrimary:false,},
    {name:'blueGreen',id:"interpolateBuGn", isPrimary:false,},
    {name:'bluePurple',id:"interpolateBuPu", isPrimary:false,},
    {name:'cividis',id:"interpolateCividis", isPrimary:false,},
    {name:'cool',id:"interpolateCool", isPrimary:false,},
    {name:'cubeHelix',id:"interpolateCubehelixDefault", isPrimary:false,},
    {name:'greenBlue',id:"interpolateGnBu", isPrimary:false,},
    {name:'orangeRed',id:"interpolateOrRd", isPrimary:false,},
    {name:'plasma',id:"interpolatePlasma", isPrimary:false,},
    {name:'purpleBlue',id:"interpolatePuBu", isPrimary:false,},
    {name:'purpleRed',id:"interpolatePuRd", isPrimary:false,},
    {name:'RdBu',id:"interpolateRdBu",  isPrimary:false,}, 
    {name:'warm',id:"interpolateWarm", isPrimary:false,},
    {name:'YlGn',id:"interpolateYlGn", isPrimary:false,},
	];
	//
	//	cosine scales, see _interpolateCosine
	//
	cosineScales = [
		{name:'cosinev1',id:"interpolateCosineV1",isPrimary:true,},
		{name:'cosinev2',id:"interpolateCosineV2",isPrimary:false,},
		{name:'cosinev3',id:"interpolateCosineV3",isPrimary:true,},
		{name:'cosinev4',id:"interpolateCosineV4",isPrimary:true,},
		{name:'cosinev5',id:"interpolateCosineV5",isPrimary:false,},
		{name:'cosinev6',id:"interpolateCosineV6",isPrimary:false,},
		{name:'cosinev7',id:"interpolateCosineV7",isPrimary:false,},
		{name:'cosinev8',id:"interpolateCosineV8",isPrimary:false,},
	];
	//
	//	toko
	//
	colorSchemes = [

		{
			name: 'darkSands',
			colors: ["#f2e9e4", "#c9ada7","#9a8c98","#4a4e69","#22223b"],
			background:"#fbfbfb",
			stroke: "#0c0a1c",
			isPrimary: true,
		},
		{
			name: 'indianSummer',
			colors: ["#3c2706","#7A5649","#CC3904","#e5cf0a"],
			background: "#f5efe5",
			stroke: "#2c1c04",
			isPrimary: false,
		},
		{
			name: 'summer',
			colors: ["#f5f02b", "#19AAD1"],
			background: "#ffffff",
			stroke: "#1d2133",
			isPrimary: true,
		},
		{
			name: 'fadedRainbow',
			colors: ["#ef476f", "#f78c6b","#ffd166","#06d6a0","#118ab2", "#073b4c"],
			background: "#fbfbf9",
			stroke: "#030433",
			isPrimary: true,
		},
		{
			name: 'mellowGreen',
			colors: ["#c6dabf", "#88d498", "#1a936f","#114b5f"],
			background: "#fff",
			stroke: "#202749",
			isPrimary: false,
		},
		{
			name: 'sunsetBeach',
			colors: ["#ea7317", "#fec601","#73bfb8","#3da5d9","#2364aa"],
			background: "#fff",
			stroke: "#000",
			isPrimary: false,
		},
		{
			name: 'justBlack',
			colors: ["#000", "#000"],
			background: "#fff",
			stroke: "#000",
			isPrimary: false,
		},
		{
			name: 'almostBlack',
			colors: ["#101010", "#303030"],
			background: "#333",
			stroke: "#000",
			isPrimary: true,
		},
		{
			name: 'blackWhite',
			colors: ["#FFF", "#000"],
			background: "#FFF",
			stroke: "#000",
			isPrimary: false,
		},
		{
			name: 'fullRainbow',
			colors: ["#1B1334","#262A4A","#00545A","#027350","#08C383","#AAD962","#FBBF46","#EF6A32","#ED0445","#A12A5E","#710262","#110141"],
			background: "#fff",
			stroke: "#000",
			isPrimary: true,
		},
		{
			name: 'pastel',
			colors: ["#F7884B","#E87A7A","#B8609A","#8F64B0","#7171C4","#5381E3","#41ADD4","#5CB592"],
			background: "#fff",
			stroke: "#000",
			isPrimary: false,
		},
		{
			name: 'brightBeach',
			colors: ["#1873D3","#1237A1","#00017A","#FFDE00","#FFB900"],
			background: "#fff",
			stroke: "#000",
			isPrimary: false,
		},
		// colors from d3
		{
			name: 'paired',
			colors: ["#A6CEE3","#1F78B4","#B2DF8A","#33A02C","#FB9A99","#E31A1C","#FDBF6F","#FF7F00","#CAB2D6","#6A3D9A","#FFFF99","#B15928"],
			background: "#FFF",
			stroke: "#000",
			isPrimary: false,
		},
		{
			name: 'sand',
			colors: ["#FCE29C","#FCD67A","#F0B46C","#D59262","#B47457","#81514B","#4C3C45"],
			background: "#f8f8f8",
			stroke: "#231a09",
			isPrimary: true,
		},
		{
			name: 'natural',
			colors: ["#F5C41E","#F3B607","#EC8E1E","#8D9655","#3E7D58","#13404E"],
			background: "#F3F0B2",
			stroke: "#0c0f29",
			isPrimary: false,
		},
		{
			name: 'sweet',
			colors: ["#10BBB1","#398A9B","#DF1260","#9D246F","#401469"],
			background: "#DCF3EF",
			stroke: "#19012f",
			isPrimary: false,
		},
		{
			name: 'westCoast',
			colors: ["#D9CCC0","#F19D1A","#DC306A","#7E245A","#398589","#093578","#0F1A5E"],
			background: "#F3EFE8",
			stroke: "#130148",
			isPrimary: true,
		},
		{
			name: 'mountain',
			colors: ["#8BBDD3","#5396BA","#D55F32","#8D0805"],
			background: "#F3EFE8",
			stroke: "#0d0133",
			isPrimary: false,
		},
		{
			name: 'freshCut',
			colors: ["#00B7D0","#51CBD5","#BCE849","#A0CA00"],
			background: "#FAF5EC",
			stroke: "#0d0133",
			isPrimary: false,
		},
		{
			name: 'mintHoney',
			colors: ["#434635","#526D51","#A5B17F","#F0BF20","#5F2A00"],
			background: "#efefef",
			stroke: "#1f0e00",
			isPrimary: true,
		},
		{
			name: 'fluor',
			colors: ["#beeb00","#D7F654","#D3E0EA","#8FABC1","#507089","#2a465c"],
			background: "#fff",
			stroke: "#1f0e00",
			isPrimary: false,
		},
		{
			name: 'district2',
			colors: ["#2A2955","#382855","#762754","#E12955","#FC2956"],
			background: "#F6D9E0",
			stroke: "#13122F",
			isPrimary: true,
		},
		{
			name: 'lemonade',
			colors: ["#C51645","#C3144C","#D34C53","#F0AA64","#F7C265"],
			background: "#FFF0D5",
			stroke: "#2D0B14",
			isPrimary: true,
		},
		{
			name: 'soft',
			colors: ["#F2F5E7","#EBDED1","#E5B5B7","#D68097","#B06683","#705771","#294353","#0B3039"],
			background: "#FCFFF2",
			stroke: "#001115",
			isPrimary: false,
		},
		{
			name: 'donut',
			colors: ["#FFB7BC","#FF5181","#FFCF49","#FFA43F","#5CCAEF"],
			background: "#FFEDEE",
			stroke: "#32083F",
			isPrimary: true,
		}
	]

	//---------------------------------------------------------------------
	// palettes collected by Kjetil Midtgarden Golid
	// https://github.com/kgolid/chromotome
	// modified with stroke https://s0pub0dev.icopy.site/documentation/chromotome/latest/chromotome/Chromotomes-constant.html

misc = [
    {
      name: 'frozen-rose',
      colors: ['#29368f', '#e9697b', '#1b164d', '#f7d996'],
      background: '#f2e8e4',
			isPrimary: true,
    },
    {
      name: 'winter-night',
      colors: ['#122438', '#dd672e', '#87c7ca', '#ebebeb'],
      background: '#ebebeb',
			isPrimary: true,
    },
    {
      name: 'saami',
      colors: ['#eab700', '#e64818', '#2c6393', '#eecfca'],
      background: '#e7e6e4',
			isPrimary: true,
    },
    {
      name: 'knotberry1',
      colors: ['#20342a', '#f74713', '#686d2c', '#e9b4a6'],
      background: '#e5ded8',
			isPrimary: false,
    },
    {
      name: 'knotberry2',
      colors: ['#1d3b1a', '#eb4b11', '#e5bc00', '#f29881'],
      background: '#eae2d0',
			isPrimary: false,
    },
    {
      name: 'tricolor',
      colors: ['#ec643b', '#56b7ab', '#f8cb57', '#1f1e43'],
      background: '#f7f2df',
			isPrimary: true,
    },
    {
      name: 'foxshelter',
      colors: ['#ff3931', '#007861', '#311f27', '#bab9a4'],
      background: '#dddddd',
			isPrimary: false,
    },
    {
      name: 'hermes',
      colors: ['#253852', '#51222f', '#b53435', '#ecbb51'],
      background: '#eeccc2',
			isPrimary: true,
    },
    {
      name: 'olympia',
      colors: ['#ff3250', '#ffb33a', '#008c36', '#0085c6', '#4c4c4c'],
      stroke: '#0b0b0b',
      background: '#faf2e5',
			isPrimary: false,
    },
    {
      name: 'byrnes',
      colors: ['#c54514', '#dca215', '#23507f'],
      stroke: '#0b0b0b',
      background: '#e8e7d4',
			isPrimary: false,
    },
    {
      name: 'butterfly',
      colors: ['#f40104', '#f6c0b3', '#99673a', '#f0f1f4'],
      stroke: '#191e36',
      background: '#191e36',
			isPrimary: true,
    },
    {
      name: 'floratopia',
      colors: ['#bf4a2b', '#cd902a', '#4e4973', '#f5d4bc'],
      stroke: '#1e1a43',
      background: '#1e1a43',
			isPrimary: false,
    },
    {
      name: 'verena',
      colors: ['#f1594a', '#f5b50e', '#14a160', '#2969de', '#885fa4'],
      stroke: '#1a1a1a',
      background: '#e2e6e8',
			isPrimary: false,
    },
    {
      name: 'florida_citrus',
      colors: ['#ea7251', '#ebf7f0', '#02aca5'],
      stroke: '#050100',
      background: '#9ae2d3',
			isPrimary: true,
    },
    {
      name: 'lemon_citrus',
      colors: ['#e2d574', '#f1f4f7', '#69c5ab'],
      stroke: '#463231',
      background: '#f79eac',
			isPrimary: true,
    },
    {
      name: 'yuma_punk',
      colors: ['#f05e3b', '#ebdec4', '#ffdb00'],
      stroke: '#ebdec4',
      background: '#161616',
			isPrimary: false,
    },
    {
      name: 'moir',
      colors: ['#a49f4f', '#d4501e', '#f7c558', '#ebbaa6'],
      stroke: '#161716',
      background: '#f7f4ef',
			isPrimary: false,
    },
    {
      name: 'sprague',
      colors: ['#ec2f28', '#f8cd28', '#1e95bb', '#fbaab3', '#fcefdf'],
      stroke: '#221e1f',
      background: '#fcefdf',
			isPrimary: true,
    },
    {
      name: 'bloomberg',
      colors: ['#ff5500', '#f4c145', '#144714', '#2f04fc', '#e276af'],
      stroke: '#000',
      background: '#fff3dd',
			isPrimary: false,
    },
    {
      name: 'revolucion',
      colors: ['#ed555d', '#fffcc9', '#41b797', '#eda126', '#7b5770'],
      stroke: '#fffcc9',
      background: '#2d1922',
			isPrimary: true,
    },
    {
      name: 'sneaker',
      colors: ['#e8165b', '#401e38', '#66c3b4', '#ee7724', '#584098'],
      stroke: '#401e38',
      background: '#ffffff',
			isPrimary: true,
    },
    {
      name: 'miradors',
      colors: ['#ff6936', '#fddc3f', '#0075ca', '#00bb70'],
      stroke: '#ffffff',
      background: '#020202',
			isPrimary: false,
    },
    {
      name: 'kaffeprat',
      colors: ['#BCAA8C', '#D8CDBE', '#484A42', '#746B58', '#9A8C73'],
      stroke: '#000',
      background: '#fff',
			isPrimary: false,
    },
  ];

colourscafe = [
    {
      name: 'cc239',
      colors: ['#e3dd34', '#78496b', '#f0527f', '#a7e0e2'],
      background: '#e0eff0',
			isPrimary: true,
    },
    {
      name: 'cc234',
      colors: ['#ffce49', '#ede8dc', '#ff5736', '#ff99b4'],
      background: '#f7f4ed',
			isPrimary: false,
    },
    {
      name: 'cc232',
      colors: ['#5c5f46', '#ff7044', '#ffce39', '#66aeaa'],
      background: '#e9ecde',
			isPrimary: false,
    },
    {
      name: 'cc238',
      colors: ['#553c60', '#ffb0a0', '#ff6749', '#fbe090'],
      background: '#f5e9de',
			isPrimary: true,
    },
    {
      name: 'cc242',
      colors: ['#bbd444', '#fcd744', '#fa7b53', '#423c6f'],
      background: '#faf4e4',
			isPrimary: false,
    },
    {
      name: 'cc245',
      colors: ['#0d4a4e', '#ff947b', '#ead3a2', '#5284ab'],
      background: '#f6f4ed',
			isPrimary: false,
    },
    {
      name: 'cc273',
      colors: ['#363d4a', '#7b8a56', '#ff9369', '#f4c172'],
      background: '#f0efe2',
			isPrimary: false,
    }
  ];

ranganath = [
    {
      name: 'rag-mysore',
      colors: ['#ec6c26', '#613a53', '#e8ac52', '#639aa0'],
      background: '#d5cda1',
			isPrimary: false,
    },
    {
      name: 'rag-gol',
      colors: ['#d3693e', '#803528', '#f1b156', '#90a798'],
      background: '#f0e0a4',
			isPrimary: false,
    },
    {
      name: 'rag-belur',
      colors: ['#f46e26', '#68485f', '#3d273a', '#535d55'],
      background: '#dcd4a6',
			isPrimary: false,
    },
    {
      name: 'rag-bangalore',
      colors: ['#ea720e', '#ca5130', '#e9c25a', '#52534f'],
      background: '#f9ecd3',
			isPrimary: false,
    },
    {
      name: 'rag-taj',
      colors: ['#ce565e', '#8e1752', '#f8a100', '#3ac1a6'],
      background: '#efdea2',
			isPrimary: true,
    },
    {
      name: 'rag-virupaksha',
      colors: ['#f5736a', '#925951', '#feba4c', '#9d9b9d'],
      background: '#eedfa2',
			isPrimary: false,
    }
  ];

roygbivs = [
    {
      name: 'retro',
      colors: [
        '#69766f',
        '#9ed6cb',
        '#f7e5cc',
        '#9d8f7f',
        '#936454',
        '#bf5c32',
        '#efad57'
      ],
			isPrimary: true,
    },
    {
      name: 'retro-washedout',
      colors: [
        '#878a87',
        '#cbdbc8',
        '#e8e0d4',
        '#b29e91',
        '#9f736c',
        '#b76254',
        '#dfa372'
      ],
			isPrimary: true,
    },
    {
      name: 'roygbiv-warm',
      colors: [
        '#705f84',
        '#687d99',
        '#6c843e',
        '#fc9a1a',
        '#dc383a',
        '#aa3a33',
        '#9c4257'
      ],
			isPrimary: false,
    },
    {
      name: 'roygbiv-toned',
      colors: [
        '#817c77',
        '#396c68',
        '#89e3b7',
        '#f59647',
        '#d63644',
        '#893f49',
        '#4d3240'
      ],
			isPrimary: true,
    },
    {
      name: 'present-correct',
      colors: [
        '#fd3741',
        '#fe4f11',
        '#ff6800',
        '#ffa61a',
        '#ffc219',
        '#ffd114',
        '#fcd82e',
        '#f4d730',
        '#ced562',
        '#8ac38f',
        '#79b7a0',
        '#72b5b1',
        '#5b9bae',
        '#6ba1b7',
        '#49619d',
        '#604791',
        '#721e7f',
        '#9b2b77',
        '#ab2562',
        '#ca2847'
      ],
			isPrimary: false,
    }
  ];

tundra = [
    {
      name: 'tundra1',
      colors: ['#40708c', '#8e998c', '#5d3f37', '#ed6954', '#f2e9e2'],
			isPrimary: false,
    },
    {
      name: 'tundra2',
      colors: ['#5f9e93', '#3d3638', '#733632', '#b66239', '#b0a1a4', '#e3dad2'],
			isPrimary: true,
    },
    {
      name: 'tundra3',
      colors: [
        '#87c3ca',
        '#7b7377',
        '#b2475d',
        '#7d3e3e',
        '#eb7f64',
        '#d9c67a',
        '#f3f2f2'
      ],
			isPrimary: false,
    },
    {
      name: 'tundra4',
      colors: [
        '#d53939',
        '#b6754d',
        '#a88d5f',
        '#524643',
        '#3c5a53',
        '#7d8c7c',
        '#dad6cd'
      ],
			isPrimary: false,
    }
  ];

rohlfs = [
    {
      name: 'rohlfs_1R',
      colors: ['#004996', '#567bae', '#ff4c48', '#ffbcb3'],
      stroke: '#004996',
      background: '#fff8e7',
			isPrimary: false,
    },
    {
      name: 'rohlfs_1Y',
      colors: ['#004996', '#567bae', '#ffc000', '#ffdca4'],
      stroke: '#004996',
      background: '#fff8e7',
			isPrimary: false,
    },
    {
      name: 'rohlfs_1G',
      colors: ['#004996', '#567bae', '#60bf3c', '#d2deb1'],
      stroke: '#004996',
      background: '#fff8e7',
			isPrimary: false,
    },
    {
      name: 'rohlfs_2',
      colors: ['#4d3d9a', '#f76975', '#ffffff', '#eff0dd'],
      stroke: '#211029',
      background: '#58bdbc',
			isPrimary: false,
    },
    {
      name: 'rohlfs_3',
      colors: ['#abdfdf', '#fde500', '#58bdbc', '#eff0dd'],
      stroke: '#211029',
      background: '#f76975',
			isPrimary: true,
    },
    {
      name: 'rohlfs_4',
      colors: ['#fde500', '#2f2043', '#f76975', '#eff0dd'],
      stroke: '#211029',
      background: '#fbbeca',
			isPrimary: false,
    }
  ];

ducci = [
    {
      name: 'ducci_jb',
      colors: ['#395e54', '#e77b4d', '#050006', '#e55486'],
      stroke: '#050006',
      background: '#efe0bc',
			isPrimary: false,
    },
    {
      name: 'ducci_a',
      colors: ['#809498', '#d3990e', '#000000', '#ecddc5'],
      stroke: '#ecddc5',
      background: '#863f52',
			isPrimary: false,
    },
    {
      name: 'ducci_b',
      colors: ['#ecddc5', '#79b27b', '#000000', '#ac6548'],
      stroke: '#ac6548',
      background: '#d5c08e',
			isPrimary: true,
    },
    {
      name: 'ducci_d',
      colors: ['#f3cb4d', '#f2f5e3', '#20191b', '#67875c'],
      stroke: '#67875c',
      background: '#433d5f',
			isPrimary: false,
    },
    {
      name: 'ducci_e',
      colors: ['#c37c2b', '#f6ecce', '#000000', '#386a7a'],
      stroke: '#386a7a',
      background: '#e3cd98',
			isPrimary: false,
    },
    {
      name: 'ducci_f',
      colors: ['#596f7e', '#eae6c7', '#463c21', '#f4cb4c'],
      stroke: '#f4cb4c',
      background: '#e67300',
			isPrimary: false,
    },
    {
      name: 'ducci_g',
      colors: ['#c75669', '#000000', '#11706a'],
      stroke: '#11706a',
      background: '#ecddc5',
			isPrimary: false,
    },
    {
      name: 'ducci_h',
      colors: ['#6b5c6e', '#4a2839', '#d9574a'],
      stroke: '#d9574a',
      background: '#ffc34b',
			isPrimary: true,
    },
    {
      name: 'ducci_i',
      colors: ['#e9dcad', '#143331', '#ffc000'],
      stroke: '#ffc000',
      background: '#a74c02',
			isPrimary: true,
    },
    {
      name: 'ducci_j',
      colors: ['#c47c2b', '#5f5726', '#000000', '#7e8a84'],
      stroke: '#7e8a84',
      background: '#ecddc5',
			isPrimary: false,
    },
    {
      name: 'ducci_o',
      colors: ['#c15e1f', '#e4a13a', '#000000', '#4d545a'],
      stroke: '#4d545a',
      background: '#dfc79b',
			isPrimary: false,
    },
    {
      name: 'ducci_q',
      colors: ['#4bae8c', '#d0c1a0', '#2d3538'],
      stroke: '#2d3538',
      background: '#d06440',
			isPrimary: false,
    },
    {
      name: 'ducci_u',
      colors: ['#f6d700', '#f2d692', '#000000', '#5d3552'],
      stroke: '#5d3552',
      background: '#ff7426',
			isPrimary: false,
    },
    {
      name: 'ducci_v',
      colors: ['#c65f75', '#d3990e', '#000000', '#597e7a'],
      stroke: '#597e7a',
      background: '#f6eccb',
			isPrimary: false,
    },
    {
      name: 'ducci_x',
      colors: ['#dd614a', '#f5cedb', '#1a1e4f'],
      stroke: '#1a1e4f',
      background: '#fbb900',
			isPrimary: false,
    }
  ];

judson = [
    {
      name: 'jud_playground',
      colors: ['#f04924', '#fcce09', '#408ac9'],
      stroke: '#2e2925',
      background: '#ffffff',
			isPrimary: false,
    },
    {
      name: 'jud_horizon',
      colors: ['#f8c3df', '#f2e420', '#28b3d0', '#648731', '#ef6a7d'],
      stroke: '#030305',
      background: '#f2f0e1',
			isPrimary: false,
    },
    {
      name: 'jud_mural',
      colors: ['#ca3122', '#e5af16', '#4a93a2', '#0e7e39', '#e2b9bd'],
      stroke: '#1c1616',
      background: '#e3ded8',
			isPrimary: false,
    },
    {
      name: 'jud_cabinet',
      colors: ['#f0afb7', '#f6bc12', '#1477bb', '#41bb9b'],
      stroke: '#020508',
      background: '#e3ded8',
			isPrimary: false,
    }
  ];

iivonen = [
    {
      name: 'iiso_zeitung',
      colors: ['#ee8067', '#f3df76', '#00a9c0', '#f7ab76'],
      stroke: '#111a17',
      background: '#f5efcb',
			isPrimary: false,
    },
    {
      name: 'iiso_curcuit',
      colors: ['#f0865c', '#f2b07b', '#6bc4d2', '#1a3643'],
      stroke: '#0f1417',
      background: '#f0f0e8',
			isPrimary: false,
    },
    {
      name: 'iiso_airlines',
      colors: ['#fe765a', '#ffb468', '#4b588f', '#faf1e0'],
      stroke: '#1c1616',
      background: '#fae5c8',
			isPrimary: true,
    },
    {
      name: 'iiso_daily',
      colors: ['#e76c4a', '#f0d967', '#7f8cb6', '#1daeb1', '#ef9640'],
      stroke: '#000100',
      background: '#e2ded2',
			isPrimary: false,
    }
  ];

kovecses = [
    {
      name: 'kov_01',
      colors: ['#d24c23', '#7ba6bc', '#f0c667', '#ede2b3', '#672b35', '#142a36'],
      stroke: '#132a37',
      background: '#108266',
			isPrimary: false,
    },
    {
      name: 'kov_02',
      colors: ['#e8dccc', '#e94641', '#eeaeae'],
      stroke: '#e8dccc',
      background: '#6c96be',
			isPrimary: false,
    },
    {
      name: 'kov_03',
      colors: ['#e3937b', '#d93f1d', '#090d15', '#e6cca7'],
      stroke: '#090d15',
      background: '#558947',
			isPrimary: false,
    },
    {
      name: 'kov_04',
      colors: ['#d03718', '#292b36', '#33762f', '#ead7c9', '#ce7028', '#689d8d'],
      stroke: '#292b36',
      background: '#deb330',
			isPrimary: false,
    },
    {
      name: 'kov_05',
      colors: ['#de3f1a', '#de9232', '#007158', '#e6cdaf', '#869679'],
      stroke: '#010006',
      background: '#7aa5a6',
			isPrimary: false,
    },
    {
      name: 'kov_06',
      colors: [
        '#a87c2a',
        '#bdc9b1',
        '#f14616',
        '#ecbfaf',
        '#017724',
        '#0e2733',
        '#2b9ae9'
      ],
      stroke: '#292319',
      background: '#dfd4c1',
			isPrimary: false,
    },
    {
      name: 'kov_06b',
      colors: [
        '#d57846',
        '#dfe0cc',
        '#de442f',
        '#e7d3c5',
        '#5ec227',
        '#302f35',
        '#63bdb3'
      ],
      stroke: '#292319',
      background: '#dfd4c1',
			isPrimary: false,
    },
    {
      name: 'kov_07',
      colors: ['#c91619', '#fdecd2', '#f4a000', '#4c2653'],
      stroke: '#111',
      background: '#89c2cd',
			isPrimary: true,
    }
  ];

tsuchimochi = [
    {
      name: 'tsu_arcade',
      colors: ['#4aad8b', '#e15147', '#f3b551', '#cec8b8', '#d1af84', '#544e47'],
      stroke: '#251c12',
      background: '#cfc7b9',
			isPrimary: true,
    },
    {
      name: 'tsu_harutan',
      colors: ['#75974a', '#c83e3c', '#f39140', '#e4ded2', '#f8c5a4', '#434f55'],
      stroke: '#251c12',
      background: '#cfc7b9',
			isPrimary: false,
    },
    {
      name: 'tsu_akasaka',
      colors: ['#687f72', '#cc7d6c', '#dec36f', '#dec7af', '#ad8470', '#424637'],
      stroke: '#251c12',
      background: '#cfc7b9',
			isPrimary: false,
    }
  ];

duotone = [
    {
      name: 'dt01',
      colors: ['#172a89', '#f7f7f3'],
      stroke: '#172a89',
      background: '#f3abb0',
			isPrimary: false,
    },
    {
      name: 'dt02',
      colors: ['#302956', '#f3c507'],
      stroke: '#302956',
      background: '#eee3d3',
			isPrimary: false,
    },
    {
      name: 'dt03',
      colors: ['#000000', '#a7a7a7'],
      stroke: '#000000',
      background: '#0a5e78',
			isPrimary: false,
    },
    {
      name: 'dt04',
      colors: ['#50978e', '#f7f0df'],
      stroke: '#000000',
      background: '#f7f0df',
			isPrimary: false,
    },
    {
      name: 'dt05',
      colors: ['#ee5d65', '#f0e5cb'],
      stroke: '#080708',
      background: '#f0e5cb',
			isPrimary: false,
    },
    {
      name: 'dt06',
      colors: ['#271f47', '#e7ceb5'],
      stroke: '#271f47',
      background: '#cc2b1c',
			isPrimary: false,
    },
    {
      name: 'dt07',
      colors: ['#6a98a5', '#d24c18'],
      stroke: '#efebda',
      background: '#efebda',
			isPrimary: false,
    },
    {
      name: 'dt08',
      colors: ['#5d9d88', '#ebb43b'],
      stroke: '#efebda',
      background: '#efebda',
			isPrimary: false,
    },
    {
      name: 'dt09',
      colors: ['#052e57', '#de8d80'],
      stroke: '#efebda',
      background: '#efebda',
			isPrimary: false,
    }
  ];

hilda = [
    {
      name: 'hilda01',
      colors: ['#ec5526', '#f4ac12', '#9ebbc1', '#f7f4e2'],
      stroke: '#1e1b1e',
      background: '#e7e8d4',
			isPrimary: true,
    },
    {
      name: 'hilda02',
      colors: ['#eb5627', '#eebb20', '#4e9eb8', '#f7f5d0'],
      stroke: '#201d13',
      background: '#77c1c0',
			isPrimary: false,
    },
    {
      name: 'hilda03',
      colors: ['#e95145', '#f8b917', '#b8bdc1', '#ffb2a2'],
      stroke: '#010101',
      background: '#6b7752',
			isPrimary: false,
    },
    {
      name: 'hilda04',
      colors: ['#e95145', '#f6bf7a', '#589da1', '#f5d9bc'],
      stroke: '#000001',
      background: '#f5ede1',
			isPrimary: false,
    },
    {
      name: 'hilda05',
      colors: ['#ff6555', '#ffb58f', '#d8eecf', '#8c4b47', '#bf7f93'],
      stroke: '#2b0404',
      background: '#ffda82',
			isPrimary: true,
    },
    {
      name: 'hilda06',
      colors: ['#f75952', '#ffce84', '#74b7b2', '#f6f6f6', '#b17d71'],
      stroke: '#0e0603',
      background: '#f6ecd4',
			isPrimary: false,
    }
  ];

spatial = [
    {
      name: 'spatial01',
      colors: ['#ff5937', '#f6f6f4', '#4169ff'],
      stroke: '#ff5937',
      background: '#f6f6f4',
			isPrimary: false,
    },
    {
      name: 'spatial02',
      colors: ['#ff5937', '#f6f6f4', '#f6f6f4'],
      stroke: '#ff5937',
      background: '#f6f6f4',
			isPrimary: false,
    },
    {
      name: 'spatial02i',
      colors: ['#f6f6f4', '#ff5937', '#ff5937'],
      stroke: '#f6f6f4',
      background: '#ff5937',
			isPrimary: false,
    },

    {
      name: 'spatial03',
      colors: ['#4169ff', '#f6f6f4', '#f6f6f4'],
      stroke: '#4169ff',
      background: '#f6f6f4',
			isPrimary: false,
    },
    {
      name: 'spatial03i',
      colors: ['#f6f6f4', '#4169ff', '#4169ff'],
      stroke: '#f6f6f4',
      background: '#4169ff',
			isPrimary: false,
    }
  ];

jung = [
    {
      name: 'jung_bird',
      colors: ['#fc3032', '#fed530', '#33c3fb', '#ff7bac', '#fda929'],
      stroke: '#000000',
      background: '#ffffff',
			isPrimary: false,
    },
    {
      name: 'jung_horse',
      colors: ['#e72e81', '#f0bf36', '#3056a2'],
      stroke: '#000000',
      background: '#ffffff',
			isPrimary: false,
    },
    {
      name: 'jung_croc',
      colors: ['#f13274', '#eed03e', '#405e7f', '#19a198'],
      stroke: '#000000',
      background: '#ffffff',
			isPrimary: true,
    },
    {
      name: 'jung_hippo',
      colors: ['#ff7bac', '#ff921e', '#3ea8f5', '#7ac943'],
      stroke: '#000000',
      background: '#ffffff',
			isPrimary: false,
    },
    {
      name: 'jung_wolf',
      colors: ['#e51c39', '#f1b844', '#36c4b7', '#666666'],
      stroke: '#000000',
      background: '#ffffff',
			isPrimary: false,
    }
  ];

system = [
    {
      name: 'system.#01',
      colors: ['#ff4242', '#fec101', '#1841fe', '#fcbdcc', '#82e9b5'],
      stroke: '#000',
      background: '#fff',
			isPrimary: false,
    },
    {
      name: 'system.#02',
      colors: ['#ff4242', '#ffd480', '#1e365d', '#edb14c', '#418dcd'],
      stroke: '#000',
      background: '#fff',
			isPrimary: true,
    },
    {
      name: 'system.#03',
      colors: ['#f73f4a', '#d3e5eb', '#002c3e', '#1aa1b1', '#ec6675'],
      stroke: '#110b09',
      background: '#fff',
			isPrimary: true,
    },
    {
      name: 'system.#04',
      colors: ['#e31f4f', '#f0ac3f', '#18acab', '#26265a', '#ea7d81', '#dcd9d0'],
      stroke: '#26265a',
      backgrund: '#dcd9d0',
			isPrimary: true,
    },
    {
      name: 'system.#05',
      colors: ['#db4549', '#d1e1e1', '#3e6a90', '#2e3853', '#a3c9d3'],
      stroke: '#000',
      background: '#fff',
			isPrimary: true,
    },
    {
      name: 'system.#06',
      colors: ['#e5475c', '#95b394', '#28343b', '#f7c6a3', '#eb8078'],
      stroke: '#000',
      background: '#fff',
			isPrimary: false,
    },
    {
      name: 'system.#07',
      colors: ['#d75c49', '#f0efea', '#509da4'],
      stroke: '#000',
      background: '#fff',
			isPrimary: false,
    },
    {
      name: 'system.#08',
      colors: ['#f6625a', '#92b29f', '#272c3f'],
      stroke: '#000',
      background: '#fff',
			isPrimary: false,
    }
  ];

flourish = [
    {
      name: 'empusa',
      colors: ['#c92a28', '#e69301', '#1f8793', '#13652b', '#e7d8b0', '#48233b', '#e3b3ac'],
      stroke: '#1a1a1a',
      background: '#f0f0f2',
			isPrimary: false,
    },
    {
      name: 'delphi',
      colors: ['#475b62', '#7a999c', '#2a1f1d', '#fbaf3c', '#df4a33', '#f0e0c6', '#af592c'],
      stroke: '#2a1f1d',
      background: '#f0e0c6',
			isPrimary: true,
    },
    {
      name: 'mably',
      colors: [
        '#13477b',
        '#2f1b10',
        '#d18529',
        '#d72a25',
        '#e42184',
        '#138898',
        '#9d2787',
        '#7f311b',
      ],
      stroke: '#2a1f1d',
      background: '#dfc792',
			isPrimary: false,
    },
    {
      name: 'nowak',
      colors: ['#e85b30', '#ef9e28', '#c6ac71', '#e0c191', '#3f6279', '#ee854e', '#180305'],
      stroke: '#180305',
      background: '#ede4cb',
			isPrimary: false,
    },
    {
      name: 'jupiter',
      colors: ['#c03a53', '#edd09e', '#aab5af', '#023629', '#eba735', '#8e9380', '#6c4127'],
      stroke: '#12110f',
      background: '#e6e2d6',
			isPrimary: true,
    },
    {
      name: 'hersche',
      colors: [
        '#df9f00',
        '#1f6f50',
        '#8e6d7f',
        '#da0607',
        '#a4a5a7',
        '#d3d1c3',
        '#42064f',
        '#25393a',
      ],
      stroke: '#0a0a0a',
      background: '#f0f5f6',
			isPrimary: false,
    },
    {
      name: 'cherfi',
      colors: ['#99cb9f', '#cfb610', '#d00701', '#dba78d', '#2e2c1d', '#bfbea2', '#d2cfaf'],
      stroke: '#332e22',
      background: '#e3e2c5',
			isPrimary: false,
    },
  	{
			name: 'jungle',
			colors: [
			  '#adb100',
			  '#e5f4e9',
			  '#f4650f',
			  '#4d6838',
			  '#cb9e00',
			  '#689c7d',
			  '#e2a1a8',
			  '#151c2e',
			],
			stroke: '#0e0f27',
			background: '#cecaa9',
			isPrimary: false,
	  },
	  {
			name: 'skyspider',
			colors: ['#f4b232', '#f2dbbd', '#01799c', '#e93e48', '#0b1952', '#006748', '#ed817d'],
			stroke: '#050505',
			background: '#f0dbbc',
			isPrimary: false,
	  },
	  {
	    name: 'atlas',
	    colors: ['#5399b1', '#f4e9d5', '#de4037', '#ed942f', '#4e9e48', '#7a6e62'],
	    stroke: '#3d352b',
	    background: '#f0c328',
	  },
    {
      name: 'harvest',
      colors: [
        '#313a42',
        '#9aad2e',
        '#f0ae3c',
        '#df4822',
        '#8eac9b',
        '#cc3d3f',
        '#ec8b1c',
        '#1b9268',
      ],
      stroke: '#463930',
      background: '#e5e2cf',
			isPrimary: true,
    },
  ];

	//---------------------------------------------------------------------

	
	

}
