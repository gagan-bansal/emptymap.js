# emptymap.js
A module that helps in navigation of map like pan, zoom and rotation but does nothing itself.

emptymap.js takes advantage of CSS/SVG transform property. If you render your geojson data (spatial data) on HTML page in form of SVG then this module can easily help in pan, zoom and rotate the SVG map. On SVG drag, pinch and rotate this module calculate the transformation matrix value to be applied to SVG to take effect of the events. The module also calculate the transformation matrix for div that contains map tiles as img tag.  

## installation
```
npm install emptymap.js
```
 
## usage & API
To initiate the instance we need to pass the map SVG/div size and projection extent. In case of spherical (web) mercator projection no need to pass the extent as this is default projection.
```javascript 
var EmptyMap = require('emptymap.js');
  size = {width: 714, height: 400},
  view = {
    "center":[-9655821.34064295,4238014.557249293],
    "zoom":4,
    "rotation":-15
  }, 
  em;
em = new EmptyMap(size); 
//set the initial view
em.setView(veiw, function(err,state) {
  // state has the transformation matrices
  if(err) {
    console.log(err);
    return;
  }
  //get SVG map layer (where id='svgmap')
  var svgLayer = document.getElemetnById('svgmap');
  svgLayer.setAttribute('transform', 'matrix('+state.matrix.join(', ')+')');
  //get map tile layer (where id='tilemap')
  var tileLayer = document.getElementById('tilemap');
  tileLayer.style.transform = 'matrix('+ state.tileMatrix.join(',') + ')';
  // and of course you need to load the tiles for this view
});

// now lets pinch and rotate the map
em.scaleRotate(
  {
    center: [300, 200],
    rotation: 30, // in degree clock wise positive 
    factor: 2, // scale (pinch) factor
  },
  function(err,state) {
    if(err) {
      console.log(err);
      return;
    }
    //get SVG map layer (where id='svgmap')
    var svgLayer = document.getElemetnById('svgmap');
    svgLayer.setAttribute('transform', 'matrix('+state.matrix.join(', ')+')');
    //get map tile layer (where id='tilemap')
    var tileLayer = document.getElementById('tilemap');
    tileLayer.style.transform = 'matrix('+ state.tileMatrix.join(',') + ')';
    // and again you need to load the tiles for the changed view
  }
);
```
#### API

#####constructor(viewportSize [,options])

Creates emptymap.js instance with maps div's `viewportSize` and other `otpions`

`viewportSize` is object with maps div width and height in pixel
```
{ 
  width: number
  height: number
}
```

`options:` different options are as follows: 
* projExtent: projection extent
* tileSize: map tile size
* view: initial map view i.e. center, zoom/resolution and rotation
* callback: callback function that handle the matrix values after view is set

`projExtent` projection extent default spherical mercator extent
```
  projExt: { 
    left: number 
    right: number
    bottom: number
    top: number
  }
```
`tileSize`  i.e. whole projection extent should fit into one square tile, default is 256

`view` object with center, zoom/resolution and rotation
```
view: {
  cneter: [x,y], // default [0,0]
  zoom: integer, // default is 0
  resolution: numbe, // zoom takes precedence over resolution 
                     // if both are present
  rotation: number, // in degree default is 0
}
```
`callback` function that should accept `error` and current map `state`
while state has following values:
```
{
  matrix: array of 6 transformation coefficients for svg map
  tileMatrix: array of 6 transformation coefficient for tile map
  map: reference the map itself
}
```

callback usage:
```javascript
callback: function(error , state) {
  if(error) {
    consol.log(error);
    return;
  }
  // map state can be set as
  //get SVG map layer (where id='svgmap')
  var svgLayer = document.getElemetnById('svgmap');
  svgLayer.setAttribute('transform', 'matrix('+state.matrix.join(', ')+')');
  //get map tile layer (where id='tilemap')
  var tileLayer = document.getElementById('tilemap');
  tileLayer.style.transform = 'matrix('+ state.tileMatrix.join(',') + ')';
}
```

**.setView(view [, callback, scope])** 

Sets a view to the map whereas parameters are:
* view: as explained above
* callback: callback function as explained in constructor 
* scope: `this` for callback function

**.move(delta [, callback, scope])**

Pans the map by given viewport's delta pixel values for x and y direction. `parameters` are:
* delta: {deltaX: number, deltaY: number}
  * deltaX: viewport pixels in x direction
  * deltaY: viewport pixels in y direction
* callback: callback function as explained in constructor 
* scope: `this` for callback function

**.scaleRotate(params [, callback, scope])**

Scale and rotate the map, `params` are:
* center: [x, y] center position for scale/rotation on viewport in pixels. Default value is center of viewport.
* factor: float scale factor to zoom in/out the map. Default is 1.
* rotation: float in degrees, clockwise positive. This is delta rotation to be applied to the map. Default value is 0 degree.
* callback: callback function as explained in constructor 
* scope: `this` for callback function

**.resetTileMatrix([callback, scope])**

Reset tile map matrix so that only rotation transformation is applied, as scale and pan would be null for tile map. This function can be called after every transition/event pan, pinch (scale) and rotatation. During transition/event tileMatrix can be applied to tile layer. Generally callback of this function should also check if tiles need to be loaded for current map state.
* callback: callback function as explained in constructor 
* scope: `this` for callback function

**.getCenter**

Returns viewport center coordinates as an array of x and y in projected coordinate system.

**.getResolution**

Returns current resolution of the map.

**.getRotation**

Returns current rotation of the map in degree (clockwise positive)

**.getZoom**

Returns current zoom level of the map.

**.getNearestZoom**

When map state is at fractional zoom it returns the nearest non-fractional zoom value. 

**.getView**

Return current map state object as:
```
{
  cetner: array of [x,y]
  resolution: float
  zoom: float
  rotation: float in degrees (clockwise positive)
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
**.toLongLat([x,y])**

Converts viewport pixel coordinates to maps projected coordinates ([x,y]).

**.toViewport([x,y])**

Converts maps projected coordinates to viewport pixel coordinates ([x,y]).

**Note:** To set center, resolution/zoom and rotation use setView as:
````javascript
var view = em.getView();
view.rotation = 25;
em.setView(view,function(error, state) {
  if(error) {
    console.log(errro);
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
