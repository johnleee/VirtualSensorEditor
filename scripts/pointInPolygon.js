function pointInPolygon() {
  var x = $("#x").val();
  var y = $("#y").val();
  
  //create array for ray casting algorithm
  var polygons = new Array();
  polygons[0] = {x:0,y:0};
  polygons[1] = {x:100,y:50};
  polygons[2] = {x:50,y:100};
  polygons[3] = {x:0,y:90};

  inside = insidePolyJordan(polygons, x, y);  

  var c2 = document.getElementById('c').getContext('2d');
  c2.fillStyle = 'blue';
  c2.fillRect(x,y,3,3);
  $("#result1").val(inside);

  //create array for jordan curve theorem
  var polygonNumbers = [new Point(0,0),new Point(100,50),new Point(50,100),new Point(0,90)];
  rayInside = pointInPoly(new Point(x,y),polygonNumbers);
  $("#result2").val(rayInside);
}

//Jordan Curve Theorem
//http://stackoverflow.com/questions/217578/point-in-polygon-aka-hit-test
//http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
//I run a semi-infinite ray horizontally (increasing x, fixed y) out from the test point, and count how many edges it crosses. At each crossing, the ray switches between inside and outside. This is called the Jordan curve theorem.

function insidePolyJordan(poly, pointx, pointy) {
  var i, j;
  var inside = false;
  for (i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      if(((poly[i].y > pointy) != (poly[j].y > pointy)) && (pointx < (poly[j].x-poly[i].x) * (pointy-poly[i].y) / (poly[j].y-poly[i].y) + poly[i].x) ) inside = !inside;
  }
  return inside;
}

//Ray-Casting Algorithm
//http://rosettacode.org/wiki/Ray-casting_algorithm#CoffeeScript
//coffeescript.org and converted from coffeescript to javascript
var Point, pointInPoly, rayIntesectsSegment;

Point = function(x, y) {
  this.x = x;
  this.y = y;
};

function pointInPoly(point, poly) {
  var index, intesected, pointA, pointB, segment, segments;
  segments = (function() {
    var _i, _len, _results;
    _results = [];
    for (index = _i = 0, _len = poly.length; _i < _len; index = ++_i) {
      pointA = poly[index];
      pointB = poly[(index + 1) % poly.length];
      _results.push([pointA, pointB]);
    }
    return _results;
  })();
  intesected = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = segments.length; _i < _len; _i++) {
      segment = segments[_i];
      if (rayIntesectsSegment(point, segment)) {
        _results.push(segment);
      }
    }
    return _results;
  })();
  return intesected.length % 2 !== 0;
};

rayIntesectsSegment = function(p, segment) {
  var a, b, mAB, mAP, p1, p2, _ref;
  p1 = segment[0], p2 = segment[1];
  _ref = p1.y < p2.y ? [p1, p2] : [p2, p1], a = _ref[0], b = _ref[1];
  if (p.y === b.y || p.y === a.y) {
    p.y += Number.MIN_VALUE;
  }
  if (p.y > b.y || p.y < a.y) {
    return false;
  } else if (p.x > a.x && p.x > b.x) {
    return false;
  } else if (p.x < a.x && p.x < b.x) {
    return true;
  } else {
    mAB = (b.y - a.y) / (b.x - a.x);
    mAP = (p.y - a.y) / (p.x - a.x);
    return mAP > mAB;
  }
};