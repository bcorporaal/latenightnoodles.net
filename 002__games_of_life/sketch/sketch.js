p5.disableFriendlyErrors = true; // disables FES

function setup() {
  var sketchElementId = "sketch-canvas";

  toko = new Toko();
  toko.setup({
    showSaveButton: false, // adding custom button in this case
    showExportButton: false,
    sketchElementId: sketchElementId,
    useParameterPanel: true,
    hideParameterPanel: false,
    logFPS: false,
    captureFrames: true,
    captureFrameCount: 999,
  });

  //--------------------------------------------
  //
  //  base canvas size on div size
  //
  var canvasDiv = document.getElementById(sketchElementId);
  var canvasWidth = canvasDiv.offsetWidth;
  var canvasHeight = canvasDiv.offsetHeight;

  p5Canvas = createCanvas(canvasWidth, canvasHeight, P2D);
  p5Canvas.parent("sketch-canvas");

  //---------------------------------------------

  p = {
    static: false,
    flipScale: true,
    bgndDark: false,
    cellSize: 4,
    colors: 'fadedRainbow',
    ruleSet: Settings.rules.conway,
    colorBy: Cell.colorByOptions.fade,
    discrete: false,
    shades: 0,
  };

  seed = {
    dot: false,
    row: true,
    cross: false,
    diagCross: false,
    block: false,
    square: true,
    triangle: false,
    diamond: false,
    corners: false,
    grid: false,
    seCorner: false,
    sCross: false,
    random: false,
    density: 0,
  };

  var palettes = toko.getPaletteList('all', true);

  //
  //  build the controls
  //
  const fp = toko.pane.addFolder({
    expanded: true,
    title: 'Presets',
  }); 
  const f0 = toko.pane.addFolder({
    expanded: true,
    title: 'Rules',
  }); 
  const f1 = toko.pane.addFolder({
    expanded: true,
    title: 'Seed the grid',
  });
  const f2 = toko.pane.addFolder({
    expanded: true,
    title: 'Render',
  });
  const f4 = toko.pane.addFolder({
    expanded: true,
    title: 'Capture frames',
  });
  const f3 = toko.pane.addFolder({
    expanded: true,
    title: 'Controls',
  });

  fp.addInput(Settings.presetHidden, 'preset', {
      options:Settings.presetList
    }).on('change', (value) => {
      applyPreset(value);
    });

  f0.addInput(p, 'ruleSet', {
    options: Settings.rules
  }).on('change', (value) => {
      rulesField.refresh();
  });

  rulesField = f0.addInput(p, 'ruleSet' );

  f1.addInput(seed, 'dot', {})
  f1.addInput(seed, 'row', {})
  f1.addInput(seed, 'cross', {})
  f1.addInput(seed, 'diagCross', {})
  f1.addInput(seed, 'square', {})
  f1.addInput(seed, 'block', {})
  f1.addInput(seed, 'triangle', {})
  f1.addInput(seed, 'diamond', {})
  f1.addInput(seed, 'corners', {})
  f1.addInput(seed, 'grid', {})
  f1.addInput(seed, 'seCorner', {})
  f1.addInput(seed, 'sCross', {})
  f1.addInput(seed, 'random', {})
  f1.addInput(seed, 'density', {min: 0, max: 100, step: 1})

  f2.addInput(p, 'colors', {
    options:palettes
  })
  f2.addInput(p, 'colorBy', {
    options:Cell.colorByOptions
  })
  f2.addInput(p, 'flipScale', {})
  f2.addInput(p, 'bgndDark', {})

  f2.addInput(p, 'discrete',{})
  f2.addInput(p, 'shades', {min: 0, max: 50, step: 1})
  f2.addInput(p, 'cellSize', {min: 1, max: 10, step: 1})

  startCaptureButton = f4.addButton({
      title: 'Reset and start capture',
    }).on('click', (value) => {
      clickStartCapture();
  });

  stopCaptureButton = f4.addButton({
      title: 'Stop capture',
    }).on('click', (value) => {
      clickStopCapture();
  });
  stopCaptureButton.hidden = true;

  f4.addButton({
      title: 'Save image',
    }).on('click', (value) => {
      toko.downloadSketch();
  });

  pauseButton = f3.addButton({
      title: 'Pause',
    }).on('click', (value) => {
      clickPause();
  });

  playButton = f3.addButton({
      title: 'Play',
    }).on('click', (value) => {
      clickPlay();
  });
  playButton.hidden = true;
  

  f3.addButton({
      title: 'Reset',
    }).on('click', (value) => {
      clickReset();
  });

  grid = new GameOfLifeGrid();
  colorScale = {};
  colorLookup = [];
  bc = {};
  playing = true;
  capturingFrames = false;

  noStroke();
  frameRate(15);

  resetGrid();

  //--------------------------------------------

  toko.endSetup();
}

function resetGrid() {
  setColors();
  grid.reset(p, seed, colorLookup);
}

function clickReset() {
  clickPlay();
  resetGrid();
}

function applyPreset(presetID) {
  toko.pane.importPreset(Settings.presets[presetID]);
}

function clickPlay() {
  playing = true;
  playButton.hidden = true;
  pauseButton.hidden = false;
}

function clickPause() {
  playing = false;
  playButton.hidden = false;
  pauseButton.hidden = true;
}

function clickStartCapture() {
  toko.startCapture();
  capturingFrames = true;
  startCaptureButton.hidden = true;
  stopCaptureButton.hidden = false;
  clickReset();
  redraw(); // BUG: this should not be needed but for some reason it halts without it
}

function clickStopCapture() {
  toko.stopCapture();
  capturingFrames = false;
  startCaptureButton.hidden = false;
  stopCaptureButton.hidden = true;
}

function setColors() {
  //
  //  set the colors
  //
  var nrColors = 100;
  var colorScheme = toko.getColorPalette(
    p.colors,
    nrColors,
    p.flipScale,
    p.discrete,
    p.shades
  )

  colorLookup = colorScheme.colors;

  if (p.bgndDark) {
    bc = colorScheme.stroke;
  } else {
    bc = colorScheme.background;
  }
}

function draw() {
  toko.startDraw();

  //---------------------------------------------

  if (playing) {
    clear();
    //
    //  draw background
    //
    drawingContext.fillStyle = bc;
    drawingContext.fillRect(0, 0, width, height);
    //
    //  update and render grid
    //
    grid.tick();
    grid.render(drawingContext);

    if (capturingFrames) {
      toko.captureFrame();
    }
  }

  //---------------------------------------------

  toko.endDraw();
}

function canvasResized() {
  //
  //  called when the canvas was resized
  //
  console.log("canvasResized");
}

function windowResized() {
  //
  //  resize the canvas when the framing div was resized
  //
  console.log("windowResized");

  var newWidth = document.getElementById("sketch-canvas").offsetWidth;
  var newHeight = document.getElementById("sketch-canvas").offsetHeight;

  if (newWidth != width || newHeight != height) {
    canvasResized();
  }
}
