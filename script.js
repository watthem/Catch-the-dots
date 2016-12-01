var active, canvas, circumference, context, diameter, dots, elapsed, fpsInterval, gradient, height, mouseX, mouseY, now, offset, radius, startTime, then, viewMin;

canvas = document.getElementById('canvas');
context = canvas.getContext('2d');
viewMin = document.getElementById('viewMin');

active = false;

const fps = 15;
const color1 = '#5887FF';
const color2 = '#69DEFE';
const color3 = '#7AFDD6';
const timeold = 10 * 1000; /* ms */

function Dot(x, y, color, time) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.color = color;
  this.birth = time || new Date();
  this.update = function(newX, newY) {
    this.x = newX;
    this.y = newY;

    this.checkBounds();
    this.color = getDotColor(x);
  };
  this.checkBounds = function() {
    if (this.x <= diameter) this.x = diameter;
    if (this.y < diameter) this.y = diameter;
    if (this.x >= width - diameter) this.x = width - diameter;
    if (this.y >= height - diameter) this.y = height - diameter;
  }

  this.isNearMouse = function(sensitivity) {
    if (Math.abs(this.x - mouseX) < sensitivity &&
      Math.abs(this.y - mouseY) < sensitivity) {
      return true;
    }
  }
}

// rendering
var drawLines = function(dot, next) {
  context.globalAlpha = .25;

  if (next) {
    context.lineTo(next.x, next.y);  
    if (dot.isNearMouse(circumference)) {
      context.strokeStyle = gradient;
      dot.birth = new Date();
    } else if (next.isNearMouse(circumference)) {
      context.strokeStyle = gradient;
      next.color = 'white';
      next.birth = new Date();

    } else {
      context.shadowBlur = 0;
      context.strokeStyle = 'rgba(0,0,0,0.25)';
    }
  }

  context.lineWidth = radius;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.stroke();
};

var drawDots = function(dot, next) {
  var lastDot = null;
  if (active) {
    context.globalAlpha = .9;
  } 
  context.shadowBlur = diameter * Math.PI;

  if (mouseY || mouseX) {
    context.shadowColor = dot.color;
  }
  context.beginPath();
  context.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2, true);
  context.fillStyle = dot.color;
  context.fill();
  drawLines(dot, next);
  context.closePath();
};

var render = function() {
  if (!dots) {
    reset();
  }
  requestAnimationFrame(render);
  now = Date.now();
  elapsed = now - then;
  if (elapsed > fpsInterval) {
    then = now - (elapsed % fpsInterval);
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i <= dots.length - 1; i++) {
      var dot = dots[i];
      var next = dots[i + 1];
      drawDots(dot, next);
    }
  }

  now = Date.now();
  elapsed = now - then;

};

//events
var updateDotLocation = function() {
  if (!dots) {
    reset();
    return;
  }
  var offset = 1;
  var t = new Date();
  for (var i = dots.length; i >= 0; i--) {
    if (!dots[i]) {
      continue;
    }
    var diff = (t - dots[i].birth);

    if (diff > timeold * 1.5) {
      dots.splice(i, i);
      break;
    }

    if (diff > timeold) {
      if (dots[i]) {
        dots[i].color = 'gray';
        continue;
      }
    }
    var x = getRandomOffset(-offset, offset);
    var y = getRandomOffset(-offset, offset);
    dots[i].update(dots[i].x + x, dots[i].y + y);
  }

};

var handleMouseMove = function(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;
  active = true;
  dots.splice(dots.length - 1, dots.length - 1);
  dots.push(new Dot(mouseX, mouseY, 'white'));

  canvas.style.backgroundImage = 'radial-gradient(' + circumference + 'px at ' + mouseX + 'px ' + mouseY + 'px, #333 0%, #191919 100%)';
}

var handleMouseDown = function(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;

  dots.push(new Dot(mouseX, mouseY, 'white'));

}

var reset = function() {
  active = false;
  context.shadowBlur = 0;
  canvas.style.backgroundImage = "";
  context.canvas.width = window.innerWidth;
  context.canvas.height = window.innerHeight;
  width = canvas.width;
  height = canvas.height;
  dots = [];

   
  radius =  Math.min(viewMin.clientWidth / 2, 10);

  diameter = radius * 2;
  circumference = diameter * Math.PI;
  ratio = (canvas.height / canvas.width) * radius;
  offset = circumference / radius;
  gradient = context.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop("0", color1);
  gradient.addColorStop("0.5", color2);
  gradient.addColorStop("1.0", color3);
  setDots();

  fpsInterval = 1000 / fps;
  then = Date.now();
  startTime = then;
  render();
};

// helpers
function getRandomOffset(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPosition(value) {
  return Math.floor((Math.random() * value));
}

function getDotColor(x) {
  if (x <= width * .25) {
    return tmpColor = color1;
  } else if (x >= width * .25 && x <= width * .75) {
    return tmpColor = color2;
  } else {
    return tmpColor = color3;
  }
}

function setDots() {
  for (var i = 0; i < offset; i++) {
    var randY = getRandomPosition(height);
    var randX = getRandomPosition(width);
    var tmpColor = getDotColor(randX);
    var time = new Date().getTime() + (i * 1000);     
    var dot = new Dot(randX, randY, tmpColor, time);
    dots.push(dot);
  }
};

setInterval(updateDotLocation, fps / 2);

// bindings
window.onresize = reset;
window.onload = render;
window.onmousemove = handleMouseMove;
window.onmousedown = handleMouseDown;