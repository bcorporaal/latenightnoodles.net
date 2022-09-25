//
//  to do
//  x clean up code
//  x move all the hard coded parts to the parameters
//  x move to toko template
//  x automatically go between states
//  - move attractors between states instead directly switching
//  x shapes as markers instead of colors
//  x better distinction of seasons
//  x add gusty as a type
//  x refine design -> colors for cities, better typography
//  x random positioning so that dots don't line up perfectly
//  - hover action over a particular day -> show data
//  x comfortable as a category
//  x calculate and show totals for each day category
//  x add legend
//  x option to show all the years? ()
//  x hide particles with missing data


p5.disableFriendlyErrors = false; // disables FES to speed things up a little bit

let toko = new Toko();
let particles = [];
let attractors = [];
let attractorData = [];
let worldParticles;
let worldAttractors;
let collision;
let delayCounter;
let dailyData;
let dayTypeData;
let textColor;
let markerColor;
let lineColor;
let autoRefreshInterval;
let refreshOnlyYearNext;

let citiesList = {
  amsterdam: 'amsterdam',
  barcelona: 'barcelona',
  berlin: 'berlin',
  copenhagen: 'copenhagen',
  dublin: 'dublin',
  london: 'london',
  lugano: 'lugano',
}

let citiesListNumber = {
  amsterdam: 0,
  barcelona: 1,
  berlin: 2,
  copenhagen: 3,
  dublin: 4,
  london: 5,
  lugano: 6,
}

let citiesListNames = [
  'amsterdam',
  'barcelona',
  'berlin',
  'copenhagen',
  'dublin',
  'london',
  'lugano',
]

function preload() {
  //
  // All loading calls here
  //
  prepareData();
}

function setup() {

  //------------------------------------------------------
  //
  //  set base canvas
  //
  let sketchElementId = "sketch-canvas";
  let canvasWidth = 0;
  let canvasHeight = 0;

  //
  //  the size is set using the Toko setup options
  //
  p5Canvas = createCanvas(canvasWidth, canvasHeight, P2D);
  p5Canvas.parent(sketchElementId);

  //-------------------------------------------------------
  //
  //  start Toko
  //
  toko.setup({
    //
    //  basic options
    //
    title: "Prototype Day - Take 2",    //  title displayed
    sketchElementId: sketchElementId,   //  id used to create the p5 canvas
    canvasSize: toko.SIZE_DEFAULT,      //  canvas size to use
    //
    //  additional options
    //
    showSaveSketchButton: true,         //  show save image button in tweakpane
    saveSettingsWithSketch: true,       //  save json of settings together with the image
    acceptDroppedSettings: true,        //  accept dropped json files with settings
    useParameterPanel: true,            //  use the tweakpane panel for settings
    hideParameterPanel: true,           //  hide the parameter panel by default (show by pressing 'p')
    showAdvancedOptions: true,          //  show advanced settings in tweakpane, like size
    captureFrames: true,                //  add record option in tweakpane
    captureFrameCount: 999,             //  max number of frames captured (is this actually used?)
    captureFrameRate: 15,               //  basic frame rate for capture
    captureFormat: 'png',               //  default image format for capture
    logFPS: false,                      //  log the fps in tweakpane (not working properly)
  });

  //
  //-------------------------------------------------------
  //
  //  sketch parameters
  //
  p = {
    city: 'amsterdam',
    year: 2021,

    particleSize: 10,
    particleSpace: 6,
    radius: 0.31,
    attractorRadius: 190,
    verticalOffset: 30,
    attractorForce: 1,
    repulsionForce: 1,
    fontName: 'Rubik',

    autoRefresh: true,

    refreshInterval: 10*1000,

    forceDelay: 225,
    forceDelayDuration: 350,
    forceDecrease: 0.9925,
    
    colorReverse: false,
    colors: 'sprague',
    originalColors: false,
    mode: 'lab',
  }

  //
  //  set all the tweakpane controls
  //
  let fData = toko.pane.tab.addFolder({ title: "Data", expanded: true });
  fData.addInput(p, 'city', {
    options:citiesList
  })
  fData.addInput(p, 'year', { min:2009, max:2021, step:1 });
  fData.addInput(p, 'autoRefresh');

  toko.pane.events.on("change", (value) => {
    if (value.presetKey != 'autoRefresh') {
      p.autoRefresh = false;
      toko.pane.events.refresh();
    }

    refresh();
  });

  worldParticles = new c2.World(new c2.Rect(0, 0, width, height));

  for(let i = 0; i < 365; i++) {
    let par;
    let x = random(width);
    let y = random(height);
    par = new c2.Particle(x, y);
    par.radius = (p.particleSize + p.particleSpace)/2;  
    particles.push(par);
    worldParticles.addParticle(par);
  }

  collision = new c2.Collision();
  collision.strength = p.repulsionForce;
  worldParticles.addInteractionForce(collision);

  startAutoRefresh();
  refresh();

  //---------------------------------------------
  toko.endSetup();
  //---------------------------------------------
}

function startAutoRefresh() {
  refreshOnlyYearNext = true;
  autoRefreshInterval = setInterval(autoRefresh, p.refreshInterval);
}

function autoRefresh() {
  if(p.autoRefresh) {
    goRandom();
    refresh();
  }
}

function refresh() {

  //
  //  get the data
  //
  dailyData = getData(
    p.city,
    new Date(p.year, 0, 1),
    new Date(p.year, 11, 31),
    "day"
  );

  //
  //  look up the number of the current city
  //
  p.cityNumber = citiesListNumber[p.city];

  //
  //  set the season for the particles
  //
  for (let i = 0; i < particles.length; i++) {
    particles[i].season = dayToSeason(i);
  }

  dayTypeData = [];
  preprocessDays();
  createAttractors();

  delayCounter = 0;
  //
  //  set color parameters
  //
  const o = {
    domain: [0, 7],
    mode: this.p.mode,
    reverse: p.colorReverse,
  }
  //
  //  get colors
  //
  colors = toko.getColorScale(this.p.colors,o);
  textColor = colors.contrastColors[0];
  markerColor = color('white');
  
  lineColor = colors.contrastColors[0];
  
  //
  //  redraw with updated parameters
  //
  redraw();
}

function draw() {
  //---------------------------------------------
  toko.startDraw();
  //---------------------------------------------
  
  clear();

  if (p.originalColors) {
    background(colors.originalScale(p.cityNumber));
  } else {
    background(colors.scale(p.cityNumber));
  }
  
  
  let lc = color('white');
  lc.setAlpha(80)
  stroke(lc);
  strokeWeight(30);
  noFill();
  noStroke();

  let pCount = particles.length;
  let aCount = attractors.length;

  //
  //  fade out forces after a little while
  //
  delayCounter++;
  if (delayCounter > p.forceDelay && (delayCounter-p.forceDelay) < p.forceDelayDuration) {
    for (let i = 0; i < aCount; i++) {
      attractors[i].strength *= p.forceDecrease;
    }
  }

  //
  //  plot attractors
  //
  for (let i = 0; i < aCount; i++) {
    let atr = attractors[i];
    let c = color(lineColor);
    c.setAlpha(6);
    fill(c);
    noStroke();
    circle(atr.point.x,atr.point.y,p.attractorRadius-10);

    c.setAlpha(20);
    stroke(c);
    noFill();
    strokeWeight(10);
    circle(atr.point.x,atr.point.y,p.attractorRadius);
  }

  //
  //  apply forces
  //
  for (let i = 0; i < pCount; i++) {
    let par = particles[i];
    for (let j = 0; j < aCount; j++) {
      if(dayTypeData[i][attractorData[j].type]) {
          attractors[j].apply(par);
      }
    }
  }

  //
  //  update
  //
  worldParticles.update();

  //
  //  display the particles
  //
  for (let i = 0; i < pCount; i++) {
    let par = particles[i];
    let x = par.position.x;
    let y = par.position.y;
    let size = p.particleSize;
    noStroke();
    fill(markerColor);
    plotMarker(x,y,par.season);
  }

  plotLabels();
  plotLegend();

  //---------------------------------------------
  toko.endDraw();
  //---------------------------------------------
}

preprocessDays = function() {
  let days = dailyData.length;
  dayTypeData = [];
  for (let i = 0; i < days; i++) {
    dayTypeData[i] = {};

    let dd = dailyData[i];
    let dtd = dayTypeData[i];
    dtd.isSnowy = false;
    dtd.isWet = false;
    dtd.isWindy = false;
    dtd.isSunny = false;
    dtd.isHot = false;
    dtd.isCold = false;
    dtd.isCloudy = false;
    dtd.isHumid = false;
    dtd.isAverage = false;

    let c = 0;
    if (dd.snowDepth > 3) {
      dtd.isSnowy = true;
      c++;
    }
    if (dd.precipitationAmount > 5) {
      dtd.isWet = true;
      c++;
    }
    if (dd.averageWindSpeed > 8 || dd.maxWindGustSpeed > 17) {
      dtd.isWindy = true;
      c++;
    }
    if (dd.sunshine > 5) {
      dtd.isSunny = true;
      c++;
    }
    if (dd.maxTemperature > 26) {
      dtd.isHot = true;
      c++;
    }
    if (dd.minTemperature < 2) {
      dtd.isCold = true;
      c++;
    }
    if (dd.meanCloudCover > 5) {
      dtd.isCloudy = true;
      c++;
    }
    if (c == 0) {
      dtd.isAverage = true;
    }
  }
}

goRandom = function() {
  let newCity;
  let newYear;

  do {
    newYear = floor(random(2009,2022));
  } while (newYear == p.year);
  p.year = newYear;

  if (refreshOnlyYearNext) {
    refreshOnlyYearNext = false;
  } else {
    refreshOnlyYearNext = true;
    do {
      newCity = random(citiesListNames);
    } while (newCity == p.city);
    p.city = newCity;
  }
  
  
}

createAttractors = function() {

  attractors = [];
  attractorData = [];
  attractorData.push({
    label: 'Average',
    type:'isAverage'
  })
  
  if(dailyData[0].sunshine != undefined) {
    attractorData.push({
      label: 'Sunny',
      type:'isSunny'
    })
  }
  if(dailyData[0].meanCloudCover != undefined) {
    attractorData.push({
      label: 'Cloudy',
      type:'isCloudy'
    })
  }
  if(dailyData[0].precipitationAmount != undefined) {
    attractorData.push({
      label: 'Wet',
      type:'isWet'
    })
  }
  if(dailyData[0].minTemperature != undefined) {
    attractorData.push({
      label: 'Cold',
      type:'isCold'
    })
  }
  if(dailyData[0].snowDepth != undefined) {
    attractorData.push({
      label: 'Snowy',
      type:'isSnowy'
    })
  }
  if(dailyData[0].averageWindSpeed != undefined) {
    attractorData.push({
      label: 'Windy',
      type:'isWindy'
    })
  }
  if(dailyData[0].maxTemperature != undefined) {
    attractorData.push({
      label: 'Hot',
      type:'isHot'
    })
  }
  
  let cx = width/2;
  let cy = height/2;
  let nn = attractorData.length-1;
  let r = min(width,height)*p.radius;

  attractors = [];
  //
  //  average goes to the center
  //
  let dy = p.verticalOffset;
  let pf = new c2.PointField(new c2.Point(width/2, height/2+dy), p.attractorForce);
  attractors.push(pf);

  //
  //  add the other attractors in a circle
  //
  for (let i = 1; i < nn+1; i++) {
    a = i * TWO_PI/nn - PI/2;
    let y = cy + r*sin(a) + dy;
    let x = cx + r*cos(a);
    pf = new c2.PointField(new c2.Point(x,y), 1);
    attractors.push(pf);
  }

}

plotLabels = function() {
  let aCount = attractors.length;
  textStyle(BOLD); 
  textFont(p.fontName);
  textAlign(CENTER);
  textSize(16);

  noStroke();
  fill(textColor);

  for (let i = 0; i < aCount; i++) {
    let attr = attractors[i];
    let x = attr.point.x;
    let y = attr.point.y + p.attractorRadius/2 - 25;    
    text(attractorData[i].label.toUpperCase(), x, y);
  }

  let cn = p.city.toUpperCase();
  textSize(64);
  textStyle(BOLD); 
  textFont(p.fontName);
  textAlign(LEFT, TOP);
  text(cn, 15,10);
  textAlign(RIGHT, TOP);
  text(p.year, width-15, 10);

}

plotLegend = function() {
  let xBase = width - 80;
  let yBase = height - 85;
  let lineHeight = 22;
  let seasons = ['winter', 'spring', 'summer', 'autumn'];

  noStroke();
  fill(textColor);
  textSize(11);
  textStyle(NORMAL); 
  textFont(p.fontName);
  textAlign(LEFT, CENTER);

  for (let i = 0; i < 4; i++) {
    plotMarker(xBase,yBase+i*lineHeight, i, p.particleSize);
    text(seasons[i].toUpperCase(), xBase+15, yBase+i*lineHeight+1);
  }
}

plotMarker = function(x,y,type, size) {
  if (size == undefined) {
    size = p.particleSize;
  }
  switch (type) {
    case 0:
      circle(x,y,size);
      break;
    case 1:
      let s = size*0.8;
      rect(x-s/2, y-s/2, s);
      break;
    case 2:
      triangle(x-size/2, y+size/2, x+size/2, y+size/2, x, y-size/2);
      break;
    case 3:
      quad(x-size/2, y, x, y-size/2, x+size/2, y, x, y+size/2);
      break;
    default:
      break;
  }
}

function dayToSeason(day) {
  //
  //  meteorological seasons
  //
  let m = Number(dailyData[day].date.slice(4,6));
  m = Math.floor((m / 12 * 4)) % 4;
  return m;
}

//---------------------------------------------
//
//  EVENTS
//
//---------------------------------------------

function captureStarted() {
  //
  //  called when capture has started, use to reset visuals
  //
  console.log("Toko - captureStarted");
}

function captureStopped() {
  //
  //  called when capture is stopped, use to reset visuals
  //
  console.log("Toko - captureStopped");
}

function canvasResized() {
  //
  //  called when the canvas was resized
  //
  console.log("Toko - canvasResized");
}

function windowResized() {
  //
  //  resize the canvas when the framing div was resized
  //
  console.log("Toko - windowResized");

  var newWidth = document.getElementById("sketch-canvas").offsetWidth;
  var newHeight = document.getElementById("sketch-canvas").offsetHeight;

  if (newWidth != width || newHeight != height) {
    canvasResized();
  }
}

function receivedFile(file) {
  //
  //  called when a JSON file is dropped on the sketch
  //  tweakpane settings are automatically updated
  //
  console.log("Toko - receivedFile")
}