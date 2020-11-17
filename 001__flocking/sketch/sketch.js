p5.disableFriendlyErrors = true; // disables FES

let quadTree;

function setup() {

    var sketchElementId = 'sketch-canvas';

    toko = new Toko();
    toko.setup({ 
        showSaveButton: true,
        sketchElementId: sketchElementId,
        useParameterPanel: true,
        hideParameterPanel: false,
        logFPS: false,
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
    //
    //---------------------------------------------

    var maxItemsPerBin = 20

    boidIDCounter = 0;

    quadTree = new QuadTree(Infinity, maxItemsPerBin, new Rect(0, 0, width, height));

    p = {
        align: 0.9,
        cohesion: 1,
        separation: 1.2,
        width: 1,
        maxSpeed: 11,
        maxForce: 4.5,
        endless: false,
        trLength: 3,
        rotHue: false,
        showQuad: false,
        percepR: 50,
        percepC: 30,
        mass: 3,
        nrBoids: 250,
        boidBatch: 25,
    }

    const f0 = toko.pane.addFolder({
      expanded: true,
      title: 'behavior',
    }); 
    const f1 = toko.pane.addFolder({
      expanded: false,
      title: 'boid count',
    });
    const f2 = toko.pane.addFolder({
      expanded: false,
      title: 'display',
    });

    f0.addInput(p, 'align', { min: 0, max: 2, step: 0.1,})
    f0.addInput(p, 'cohesion', { min: 0, max: 2, step: 0.1,})
    f0.addInput(p, 'separation', { min: 0, max: 2, step: 0.1,})
    f0.addInput(p, 'maxSpeed', { min: 1, max: 20, step: 1,})
    f0.addInput(p, 'maxForce', { min: 0, max: 8, step: 0.5,})
    f0.addInput(p, 'percepR', { min: 5, max: 200, step: 5,})
    f0.addInput(p, 'percepC', { min: 1, max: 50, step: 1,})
    f0.addInput(p, 'mass', { min: 0.5, max: 10, step: 0.5,})

    f1.addMonitor(p, 'nrBoids', {
      interval: 500,
    });

    f1.addButton({
        title: `Add ${p.boidBatch} boids`, 
      }).on('click', (value) => {
        addBoids();
    });

    f1.addButton({
        title: `Remove ${p.boidBatch} boids`,
      }).on('click', (value) => {
        removeBoids();
    });

    f2.addInput(p, 'width', { min: 1, max: 30, step: 1,})
    f2.addInput(p, 'trLength', { min: 2, max: 30, step: 1,})
    f2.addInput(p, 'rotHue', {})
    f2.addInput(p, 'endless', {})
    f2.addInput(p, 'showQuad', {})

    f2.addButton({
        title: 'Clear screen',
      }).on('click', (value) => {
        clearScreen();
    });

    toko.pane.on('change', (value) => {
      refresh();
    });

    flock = [];

    for (let i = 0; i < p.nrBoids; i++) {
      var b = new Boid();
      b.setID(boidIDCounter);
      boidIDCounter++;
      flock.push(b);
    }

    fc = color('#EEE');
    clearScreen();

    //--------------------------------------------

    toko.endSetup();

}

function refresh() {

    for (let boid of flock) {
      boid.refresh();
    }
}

function addBoids() {

  n = flock.length

  for (let i = 0; i < p.boidBatch; i++) {
    var b = new Boid();
    boidIDCounter++;
    b.setID(boidIDCounter);
    flock.push(b);
  }

  p.nrBoids = flock.length

}

function removeBoids() {

  if (flock.length > p.boidBatch) {
  
    for (let i = 0; i < p.boidBatch; i++) {
      flock[i].destroy()
    }
    flock.splice(0, p.boidBatch)
    p.nrBoids = flock.length
  }
}

function clearScreen() {
    //clear();
    fill(fc);
    noStroke();
    rect(0,0,width,height);
}

function draw() {

    toko.startDraw();
    
    //---------------------------------------------

    if (!p.endless) {
      clearScreen();
    }

    quadTree.clear();
    for (const boid of flock) {
      quadTree.addItem(boid.position.x, boid.position.y, boid);
    }
    
    if (p.showQuad) {
      quadTree.debugRender();
    }
    
    for (const boid of flock) {
      boid.edges();
      boid.flock(flock);
      boid.update();
      boid.render();
    }

    //---------------------------------------------

    toko.endDraw();
}



function canvasResized() {
    //
    //  called when the canvas was resized
    //
    console.log('canvasResized');
}
    

function windowResized() {
	//
    //  resize the canvas when the framing div was resized
    //
    console.log('windowResized');

    var newWidth = document.getElementById("sketch-canvas").offsetWidth;
    var newHeight = document.getElementById("sketch-canvas").offsetHeight;

    if (newWidth != width || newHeight != height) {
        canvasResized();
    }
    
}

