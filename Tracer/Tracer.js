// Chelsea Yangnouvong
// Here are the two new routines that you should add to your ray tracer for Part B

var backR;
var backG;
var backB;
var amR;
var amG;
var amB;
var plights = [];
var materials = [];
var cylinders = [];
var spheres = [];
var k;
var close;
var hit;
var hitShape;
var isCyl = false;
var isCap = false;
var r = 0.0;
var g = 0.0;
var b = 0.0;
var numCyl = 0;
var numPlane = 0;
var numSph = 0;

function new_sphere (x, y, z, radius) {
  spheres.push(new Sphere(x, y, z, radius, materials[materials.length - 1]));
}

function ambient_light (r1, g1, b1) {
  amR = r1;
  amG = g1;
  amB = b1;
}

// You should swap in your routines from Part A for the placeholder routines below

function reset_scene() {
  close = Number.MAX_VALUE;
  hit = createVector(0, 0, 0);
  hitShape = 0;
  isCyl = false;
  isCap = false;
  r = 0.0;
  g = 0.0;
  b = 0.0;
  numCyl = 0;
  numPlane = 0;
  numSph = 0;
  backR = 0;
  backG = 0;
  backB = 0;  
  amR = 0;
  amG = 0;
  amB = 0;
  k = 0;
  plights = [];
  materials = [];
  spheres = [];
  cylinders = [];
}

function set_background (r, g, b) {
  backR = r;
  backG = g;
  backB = b;
}

function set_fov (angle) {
  k = tan(radians(angle) / 2.0);
}

function new_light (r, g, b, x, y, z) {
  plights.push(new Light(r, g, b, x, y, z));
}

function new_material (dr, dg, db, ar, ag, ab, sr, sg, sb, pow, k_refl) {
  materials.push(new Material(dr, dg, db, ar, ag, ab, sr, sg, sb, pow, k_refl));
}

function new_cylinder (x, y, z, radius, h) {
  cylinders.push(new Cylinder(x, y, z, radius, h, materials[materials.length - 1]));
}

function intersectionPlane(cyl, ray) {
  let n = p5.Vector.sub(createVector(0, ray.origin.y, 0), createVector(0, cyl.origin.y + cyl.h / 2, 0)).normalize();
  let top1 = p5.Vector.dot(n, p5.Vector.sub(ray.origin, createVector(cyl.origin.x, cyl.origin.y + cyl.h, cyl.origin.z)));
  let top2 = p5.Vector.dot(n, p5.Vector.sub(ray.origin, cyl.origin));
  let bottom = p5.Vector.dot(ray.direction, n);
  t1 = -1 * top1 / bottom;
  t2 = -1 * top2 / bottom;
  let hit1 = createVector(ray.origin.x + ray.direction.x * t1, ray.origin.y + ray.direction.y * t1, ray.origin.z + ray.direction.z * t1);
  let hit2 = createVector(ray.origin.x + ray.direction.x * t2, ray.origin.y + ray.direction.y * t2, ray.origin.z + ray.direction.z * t2);
  let underRadius1 = (sq(cyl.origin.x - hit1.x) + sq(cyl.origin.z - hit1.z)) <= sq(cyl.radius);
  let underRadius2 = (sq(cyl.origin.x - hit2.x) + sq(cyl.origin.z - hit2.z)) <= sq(cyl.radius);
  if (t1 > 0 && t2 > 0) {
    if (underRadius1 && underRadius2) {
      if (t1 < t2) {
        return t1;
      } else {
        return t2;
      }
    } else if (underRadius1) {
      return t1;
    } else if (underRadius2) {
      return t2;
    }
  }
  if (t1 > 0 && underRadius1) {
    return t1;
  } else if (t2 > 0 && underRadius2) {
    return t2;
  }
  return -1;
}

function intersectionCyl(cyl, ray) {
  let a = sq(ray.direction.x) + sq(ray.direction.z);
  let b = 2.0 * ((ray.origin.x - cyl.origin.x) * ray.direction.x + (ray.origin.z - cyl.origin.z) * ray.direction.z);
  let c = sq(ray.origin.x - cyl.origin.x) + sq(ray.origin.z - cyl.origin.z) - sq(cyl.radius);
  let root = sq(b) - (4 * a * c);
  if (root >= 0) {
    let top1 = -1 * b + sqrt(root);
    let top2 = -1 * b - sqrt(root);
    let t1 = top1 / (2.0 * a);
    let t2 = top2 / (2.0 * a);
    let temp1 = createVector(ray.origin.x + ray.direction.x * t1, ray.origin.y + ray.direction.y * t1, ray.origin.z + ray.direction.z * t1);
    let temp2 = createVector(ray.origin.x + ray.direction.x * t2, ray.origin.y + ray.direction.y * t2, ray.origin.z + ray.direction.z * t2);
    if (temp1.y >= cyl.origin.y && (temp1.y <= cyl.origin.y + cyl.h) && temp2.y >= cyl.origin.y && (temp2.y <= cyl.origin.y + cyl.h)) {
      if (t1 > 0 && t2 > 0) {  
        if (t1 < t2) {
          return t1;
        } else {
          return t2;
        }
      } else if (t1 > 0) {
        return t1;
      } else if (t2 > 0) {
        return t2;
      }
    } else if (temp2.y >= cyl.origin.y && (temp2.y <= cyl.origin.y + cyl.h) && t2 > 0) {
      return t2;
    } else if (temp1.y >= cyl.origin.y && (temp1.y <= cyl.origin.y + cyl.h) && t1 > 0) {
      return t1;
    }
  }
  return -1;
}

function intersectionSph(sph, ray) {
  let a = p5.Vector.dot(ray.direction, ray.direction);
  let bVec = p5.Vector.sub(ray.origin, sph.origin);
  let b = 2.0 * p5.Vector.dot(bVec, ray.direction);
  let c = p5.Vector.dot(bVec, bVec) - sq(sph.radius);
  let root = sq(b) - (4 * a * c);
  if (root >= 0) {
    let top = min(-1 * b + sqrt(root), -1 * b - sqrt(root));
    let t = top / (2 * a);
    if (t > 0) {
      return t;
    }
  }
  return -1;
}

function findShadow(ray) {
  for (let i = 0; i < spheres.length; i++) {
     let t = intersectionSph(spheres[i], ray);
     if (t != -1 && i != numSph) {
       return 0;
     }
  }
  
  for (let i = 0; i < cylinders.length; i++) {
     let t = intersectionCyl(cylinders[i], ray);
     let t2 = intersectionPlane(cylinders[i], ray);
     if (t != -1 && i != numCyl) {
       return 0;
     } else if (t2 != -1 && i != numPlane) {
       return 0;
     }
  }
  return 1;
}

function eye_ray(x, y) {
  let yPrime = -1 * (y - (height / 2)) * (2 * k / height);
  let xPrime = (x - (width / 2)) * (2 * k / width);
  return new Ray(0, 0, 0, xPrime, yPrime, -1);
}

function findIntersection(ray) {
  close = Number.MAX_VALUE;
  hit = createVector(0, 0, 0);
  hitShape = 0;
  isCyl = false;
  isCap = false;
  r = 0.0;
  g = 0.0;
  b = 0.0;
  numCyl = 0;
  numPlane = 0;
  numSph = 0;
  
  for (let i = 0; i < cylinders.length; i++) {
    let t = intersectionCyl(cylinders[i], ray);
    if (t < close && t != -1) {
       hit = createVector(ray.origin.x + ray.direction.x * t, ray.origin.y + ray.direction.y * t, ray.origin.z + ray.direction.z * t);
       close = t;
       hitShape = cylinders[i];
       isCyl = true;
       isCap = false;
       numCyl = i;
    }
  }
  
  for (let i = 0; i < cylinders.length; i++) {
    let t = intersectionPlane(cylinders[i], ray);
    if (t < close && t != -1) {
       hit = createVector(ray.origin.x + ray.direction.x * t, ray.origin.y + ray.direction.y * t, ray.origin.z + ray.direction.z * t);
       close = t;
       hitShape = cylinders[i];
       isCyl = false;
       isCap = true;
       numPlane = i;
    }
  }
  
  for (let i = 0; i < spheres.length; i++) {
    let t = intersectionSph(spheres[i], ray);
    if (t < close && t != -1) {
       hit = createVector(ray.origin.x + ray.direction.x * t, ray.origin.y + ray.direction.y * t, ray.origin.z + ray.direction.z * t);
       close = t;
       hitShape = spheres[i];
       isCyl = false;
       isCap = false;
       numSph = i;
    }
  }
}

function draw_scene() {
  
  noStroke();

  // go through all the pixels in the image
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      
      // add your ray creation and scene intersection code here
      let ray = eye_ray(x, y);
      ray.direction.normalize();
      r = 0;
      g = 0;
      b = 0;
      
      let colors = colorShape(ray);
      
      r = colors.x;
      g = colors.y;
      b = colors.z;

      fill (r * 255, g * 255, b * 255);

      // draw a little rectangle to fill the pixel
      rect (x, y, 1, 1);
    }
  }
}

function colorShape(ray) {
  findIntersection(ray);
  let n;    
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  let reflections = createVector(0, 0, 0);
  if (close < Number.MAX_VALUE) {
    if (isCyl == false && isCap == false) { //sphere
      n = p5.Vector.sub(hit, hitShape.origin).normalize();
      numCyl = -1;
      numPlane = -1;
    } else if (isCap == true) { //cap
      n = p5.Vector.sub(createVector(0, hit.y, 0), createVector(0, hitShape.origin.y + hitShape.h / 2, 0)).normalize();
      numCyl = -1;
      numSph = -1;
    } else if (isCyl == true) { //cylinder
      n = p5.Vector.sub(hit, hitShape.origin);
      n.y = 0;
      n.normalize();
      numSph = -1;
      numPlane = -1;
    }  
    for (let i = 0; i < plights.length; i++) {
      let l = p5.Vector.sub(plights[i].position, hit);
      let shadowHit = new Ray(hit.x, hit.y, hit.z, l.x, l.y, l.z);
      let shadow = findShadow(shadowHit, numCyl, numPlane, numSph);
      l.normalize();
      let nl = p5.Vector.dot(n, l);
      
      r1 += (hitShape.m.dr * plights[i].r * max(0, nl) * shadow);
      g1 += (hitShape.m.dg * plights[i].g * max(0, nl) * shadow);
      b1 += (hitShape.m.db * plights[i].b * max(0, nl) * shadow);
      
      let e = createVector(-1 * ray.direction.x, -1 * ray.direction.y, -1 * ray.direction.z);
      let h = p5.Vector.add(l, e).normalize();
      
      hn = p5.Vector.dot(h, n);
     
      r1 += plights[i].r * hitShape.m.sr * pow(hn, hitShape.m.pow);
      g1 += plights[i].g * hitShape.m.sg * pow(hn, hitShape.m.pow);
      b1 += plights[i].b * hitShape.m.sb * pow(hn, hitShape.m.pow); 
    } 
    r1 += amR * hitShape.m.ar * hitShape.m.dr;
    g1 += amG * hitShape.m.ag * hitShape.m.dg;
    b1 += amB * hitShape.m.ab * hitShape.m.db;
    
    if (hitShape.m.k_refl != 0) {
      let nRay = p5.Vector.sub(ray.origin, hit).normalize();
      let temp = 2 * p5.Vector.dot(n, nRay);
      let temp2 = p5.Vector.sub(createVector(n.x * temp, n.y * temp, n.z * temp), nRay);
      let R = new Ray(hit.x, hit.y, hit.z, temp2.x, temp2.y, temp2.z);
      reflections = colorShape(R);
    }
  } else {
    r1 = backR;
    g1 = backG;
    b1 = backB;
  }
  return p5.Vector.add(createVector(r1, g1, b1), reflections);
}
