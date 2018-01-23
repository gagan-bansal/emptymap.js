# emptymap.js
A module that helps with navigation of a map, like pan, zoom and rotation, but does nothing itself.

emptymap.js takes advantage of CSS/SVG transform property. If you render your geojson data (spatial data) on a HTML page in form of SVG then this module can easily help with panning, zooming and rotating the SVG map. On SVG drag, pinch and rotate this module calculates the transformation matrix needed for the events to take effect. The module also calculates the transformation matrix for a `<div>` that contains map tiles as img tag.  

## installation
```
npm install emptymap.js
```
 
## usage & API
To initiate the instance we need to pass the map SVG/DIV size and projection extent. In case of spherical (web) mercator projection there no need to pass the extent as this is the default projection.
```javascript 
var EmptyMap = require('emptymap.js'),
  size = { width: 714, height: 400 },
  view = {
    center: [-9655821.34064295, 4238014.557249293],
    zoom: 4,
    rotation: -15
  }, 
  em = new EmptyMap(size);

function updateMap (err, state) {
  // state has the transformation matrices
  if(err) {
    console.log(err);
    return;
  }

  //get SVG map layer (where id='svgmap')
  var svgLayer = document.getElementById('svgmap'),
    matrix = state.matrix.join(', ');
  svgLayer.setAttribute('transform', 'matrix(' + matrix + ')');

  //get map tile layer (where id='tilemap')
  var tileLayer = document.getElementById('tilemap'),
    tileMatrix = state.tileMatrix.join(',');
  tileLayer.style.transform = 'matrix(' + tileMatrix + ')';
  
  // TODO: of course you need to load the tiles for this view
}

//set the initial view
em.setView(view, updateMap);

// now lets pinch and rotate the map
em.scaleRotate(
  {
    center: [300, 200],
    rotation: 30, // in degree clock wise positive 
    factor: 2, // scale (pinch) factor
  },
  updateMap
);
```

#### API

#####constructor(viewportSize [,options])

Creates emptymap.js instance with map div's `viewportSize` and other `options`

`viewportSize` is the object with map div's width and height in pixel
```
{ 
  width: Number
  height: Number
}
```

`options:` different options are as follows: 
* projExtent: projection extent
* tileSize: map tile size
* view: initial map view i.e. center, zoom/resolution and rotation
* callback: callback function that handle the matrix values after view is set

`projExtent` projection extent, default spherical mercator extent
```
  projExt: { 
    left: Number,
    right: Number,
    bottom: Number,
    top: Number
  }
```
`tileSize`  i.e. whole projection extent should fit into one square tile, default is 256

`view` object with center, zoom/resolution and rotation
```
view: {
  center: [x, y], // default [0, 0]
  zoom: Integer, // default is 0
  resolution: Number, // zoom takes precedence over resolution if both are present
  rotation: Number // in degree default is 0
}
```
`callback` function that should accept `error` and current map `state`
while state has following values:
```
{
  matrix: array of 6 transformation coefficients for svg map
  tileMatrix: array of 6 transformation coefficients for tile map
  map: reference of the map itself
}
```

callback usage:
```javascript
function (err, state) {
  // state has the transformation matrices
  if(err) {
    console.log(err);
    return;
  }

  //get SVG map layer (where id='svgmap')
  var svgLayer = document.getElementById('svgmap'),
    matrix = state.matrix.join(', ');
  svgLayer.setAttribute('transform', 'matrix(' + matrix + ')');

  //get map tile layer (where id='tilemap')
  var tileLayer = document.getElementById('tilemap'),
    tileMatrix = state.tileMatrix.join(',');
  tileLayer.style.transform = 'matrix(' + tileMatrix + ')';
  
  // load tiles for new zoom level
}
```

**.setView(view [, callback, scope])** 

Sets a view to the map with parameters:
* view: As explained above.
* callback: Callback function as explained in constructor.
* scope: `this` for callback function.

**.move(delta [, callback, scope])**

Pans the map by given viewport's delta pixel values for x and y direction. Parameters are:
* delta:
  * `{deltaX: Number, deltaY: Number}`
  * deltaX: Viewport pixels in x direction.
  * deltaY: Viewport pixels in y direction.
* callback: Callback function as explained in constructor.
* scope: `this` for callback function

**.scaleRotate(params [, callback, scope])**

Scale and rotate the map. Parameters are:
* center: [x, y] center position for scale/rotation on viewport in pixels. Default value is center of viewport.
* factor: Float scale factor to zoom in/out the map. Default is 1.
* rotation: Float in degrees, clockwise positive. This is the delta rotation to be applied to the map. Default value is 0 degrees.
* callback: Callback function as explained in constructor. 
* scope: `this` for callback function.

**.resetTileMatrix([callback, scope])**

Reset tile map matrix so that only the rotation transformation is applied, as scale and pan would be null for tile map. This function can be called after every transition/event pan, pinch (scale) and rotatation. During transition/event the tile matrix can be applied to the tile layer. Generally the callback of this function should also check if tiles are needed to be loaded for current map state.
* callback: Callback function as explained in constructor. 
* scope: `this` for callback function.

**.getCenter**

Returns viewport center coordinates as an array of x and y in projected coordinate system.

**.getResolution**

Returns current resolution of the map.

**.getRotation**

Returns current rotation of the map in degree (clockwise positive).

**.getZoom**

Returns current zoom level of the map.

**.getNearestZoom**

When map state is at fractional zoom it returns the closest non-fractional zoom value.

**.getView**

Return current map state object as:
```
{
  center: Array of [x, y],
  resolution: Float,
  zoom: Float,
  rotation: Float in degrees (clockwise positive)
}
```

**.getExtent**

Returns viewport corner coordinates as an object:
```
{
  ul: upper left projected coordinates,
  ll: lower left projected coordinates,
  lr: lower right projected coordinates,
  ur: upper right projected coordinates
}
```

**.getVewportBBox**

Retruns viewport's BBox/MBR in projected coordinate system. Its different from map extent. Once map is rotated the viewport is not aligned to coordinate axis. Viewport's BBox should be aligned to coordinate axis. 

```
{
  left: projeceted x,
  right: projected x,
  bottom: projected y,
  top: projected y
}
``` 
**.toLongLat([x, y])**

Converts viewport pixel coordinates to maps projected coordinates ([x, y]).

**.toViewport([x, y])**

Converts maps projected coordinates to viewport pixel coordinates ([x, y]).

**Note:** To set center, resolution/zoom and rotation use setView as followed:
````javascript
var view = em.getView();
view.rotation = 25;

em.setView(view, function (err, state) {
  if (err) {
    console.log(err);
    return;
  }
  // set matrices to  required layers
});
```

## developing
Once you run
 
```npm install```

then for running test 

```npm run test```

and to create build

```npm run build```



## license
This project is licensed under the terms of the MIT license.
