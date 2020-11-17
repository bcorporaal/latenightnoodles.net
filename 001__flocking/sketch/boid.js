//  Flocking system
//  Based on chapter 6 of Nature of Code by Daniel Shiffman
//  http://natureofcode.com/book/chapter-6-autonomous-agents/
//
//  Rewritten for PaperJS and optimized by Bob Corporaal - https://reefscape.net

//
//  Ideas for features and optimization

//  IDEA 1 - DONE
//  Preprocess all the boids and store the distances in a matrix
//  -> this reduces the number of calculations
//  -> give each boid an id to easily find itself in the matrix

//  IDEA 2 - DONE
//  do all calculations in one loop, reduce duplication

//  IDEA 3
//  use a quadtree or similar to find the nearest neighbour

//  IDEA 4 - DONE
//  let the boids react to the mouse cursor

//  IDEA 5 - DONE and removed again - it is not beneficial
//  give the boids a limited field of view

//  IDEA 6
//  show the different vectors on one of the boids

//  IDEA 7
//  add wander behavior if boid is not close to anybody else

//  IDEA 8
//  confine to screen instead of wrapping around

//  IDEA 9
//  convert to p5.js

//  IDEA 10
//  limit acceleration (probably allowing for collisions)

//  IDEA 11
//  convert to sketchbook css and navigation

//  IDEA 12
//  add controls for the parameters

//  IDEA 13
//  add visual performance monitoring - https://github.com/mrdoob/stats.js

//  INSPIRATION FOR OPTIMIZATION
//  https://github.com/hughsk/boids
//  https://github.com/jrhdoty/SwarmJS

// Flocking
// Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/124-flocking-boids.html
// https://youtu.be/mhjuuHl6qHM
// https://editor.p5js.org/codingtrain/sketches/ry4XZ8OkN

class Boid {
  constructor() {
    this.position = createVector(random(width),height/2);
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector();
    this.maxForce = p.maxForce;
    this.maxSpeed = p.maxSpeed;
    this.currentColor = Math.random()*255;
    this.colorSpeed = 1;
    this.oldPosition = this.position.copy();
    this.mass = p.mass;
    this.showTrails = p.showTrails;
    this.trailLength = p.trLength;
    this.trail = [];
    this.rotHue = p.rotHue;

    this.colorPalette = toko.getColorPalette('fadedRainbow',256);

  }

  setID(id) {
    this.boidID = id;
  }

  //
  //  wrap around
  //
  edges() {
    var wrapped = false;
    if (this.position.x > width) {
      this.position.x = 0;
      wrapped = true;
    } else if (this.position.x < 0) {
      this.position.x = width;
      wrapped = true;
    }
    if (this.position.y > height) {
      this.position.y = 0;
      wrapped = true;
    } else if (this.position.y < 0) {
      this.position.y = height;
      wrapped = true;
    }
    if (wrapped) {
      this.trail =[{x:this.position.x,y:this.position.y}]
    }
  }

  align(boids,quadTreeSlice) {
    let steering = createVector();
    let alignTotal = 0;
    for (const other of quadTreeSlice) {
      steering.add(other.velocity);
      alignTotal++;
    }
    if (alignTotal > 0) {
      steering.div(alignTotal);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  separation(boids, quadTreeSlice) {
    let steering = createVector();
    let sepTotal = 0;
    for (const other of quadTreeSlice) {
      const diff = p5.Vector.sub(this.position, other.position);
      const d = diff.mag();
      if (d === 0) continue;
      diff.div(d);
      steering.add(diff);
      sepTotal++;
    }
    if (sepTotal > 0) {
      steering.div(sepTotal);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  cohesion(boids, quadTreeSlice) {
    let steering = createVector();
    let percepTotal = 0;
    for (const other of quadTreeSlice) {
      steering.add(other.position);
      percepTotal++;
    }
    if (percepTotal > 0) {
      steering.div(percepTotal);
      steering.sub(this.position);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  flock(boids) {
    let quadTreeSlice = quadTree.getItemsInRadius(this.position.x, this.position.y, p.percepR, p.percepC);
    let alignment = this.align(boids, quadTreeSlice);
    let cohesion = this.cohesion(boids, quadTreeSlice);
    let separation = this.separation(boids, quadTreeSlice);

    alignment.mult(p.align)
    cohesion.mult(p.cohesion)
    separation.mult(p.separation)

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation)
    this.acceleration.div(this.mass);
  }

  //
  //  update position
  //
  update() {
    this.oldPosition = this.position.copy();
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0);
  }

  //
  //  parameters have been updated
  //
  refresh() {
    this.maxForce = p.maxForce;
    this.maxSpeed = p.maxSpeed;
    this.mass = p.mass;
    this.showTrails = p.showTrails;
    if (!this.showTrails) {
      this.currentColor = Math.random()*255;
    }
    this.trailLength = p.trLength;
    this.rotHue = p.rotHue;
  }

  render() {

    var lc = color(this.colorPalette.scale(this.currentColor));

    strokeWeight(p.width);
    stroke(lc);

    //
    //  add latest position to the trail
    //
    this.trail.unshift({x:this.position.x, y:this.position.y});
    var l = this.trail.length
    if (l > this.trailLength) {
      this.trail.pop();
      l--;
    }

        
    //
    //  draw the trail
    //
    for (var i = 1; i < l; i++) {
        line(this.trail[i-1].x, this.trail[i-1].y,this.trail[i].x,this.trail[i].y);
    }
    
    if (this.rotHue) {
      this.currentColor += this.colorSpeed;
    
      if (this.currentColor > 255 || this.currentColor < 0) {
        this.currentColor = constrain(this.currentColor,0,255);
        this.colorSpeed *= -1;
      }
    }
  }

  destroy() {
    //
    //  called when boid is removed. Nothing to do here yet.
    //
  }
}


