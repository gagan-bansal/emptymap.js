var chai = require('chai'),
  Matrix = require('transformatrix'),
  expect = chai.expect,
  EmptyMap = require('../emptymap.js');
var chaiDeepCloseTo = require('chai-deep-closeto');
chai.use(chaiDeepCloseTo);
var size = {width: 100, height: 100},
  view = {
    "center": [ 200, 200],
    "zoom": 2,
    "rotation": 45
  };
  precision = 1e-6;

describe('Test diffrent operations on emptymap.js \n', function() {
  it('initiate emptymap.js, viewport size is must', function() {
    expect(function() {
      var emap = new EmptyMap();
    }).to.throw(Error);
  })
  it('initiate emptymap.js object', function() {
    var mercExt = {
      left: -20037508.342789244,
      right: 20037508.342789244,
      bottom: -20037508.342789244,
      top: 20037508.342789244};
    var emap = new EmptyMap({width: 200, height: 100});
    expect(emap).to.be.an.instanceOf(EmptyMap);
    expect(emap).to.have.property('vpSize')
      .that.is.an('object');
    expect(emap.vpSize).to.have.property('width', 200);
    expect(emap.vpSize).to.have.property('height', 100);
    expect(emap).to.have.property('projExt')
      .that.is.an('object');
    expect(emap.projExt).to.have.property('left',mercExt.left);
    expect(emap.projExt).to.have.property('right',mercExt.right);
    expect(emap.projExt).to.have.property('top',mercExt.top);
    expect(emap.projExt).to.have.property('bottom',mercExt.bottom);
    expect(emap).to.have.property('tSize')
      .that.to.be.equal(256);
    expect(emap).to.have.property('maxRes')
      .that.to.be.closeTo(156543.03392804097, precision);
    expect(emap).to.have.property('matrix')
      .that.is.instanceOf(Matrix);
    expect(emap).to.have.property('matrixNonScalable')
      .that.is.instanceOf(Matrix);
  });
  it('callback is not function', function() {
    var emap = new EmptyMap(size);
    expect(function() {
      emap.setView(view,'i am not function');
    }).to.throw(Error);
  });

  it('set view to the map: .setView', function() {
    var emap = new EmptyMap(
      {width: 100, height: 100},
      {
        tileSize: 100, 
        projExtent: {left: -500, right: 500, top: 500, bottom: -500}
      }
    );
    emap.setView(
      {
        center: [0,0],
        zoom: 1,
        rotation: 45
      },
      function(err,state) {
        expect(err).to.be.null;
        expect(arguments).to.be.arguments;
        var matrix = [
          1.4142135623730951, 1.414213562373095,
          -1.414213562373095, 1.4142135623730951,
          49.999999999999986, -91.42135623730951
        ];
        var matrixNonScalable = [
          0.7071067811865476, 0.7071067811865475,
          -0.7071067811865475, 0.7071067811865476,
          49.99999999999999, -20.710678118654755
        ];
        validateState(state, matrix, matrixNonScalable);
      }
    );
  });
  
  it('.getCenter', function() {
    var emap = new EmptyMap(
      {width: 100, height: 100},
      {
        tileSize: 100, 
        projExtent: {left: -500, right: 500, top: 500, bottom: -500}
      }
    );
    emap.setView({center: [100,100], zoom: 1, rotation: 45})
    var center = emap.getCenter();
    expect(center, 'center as array').to.be.an('array')
      .that.to.have.length(2);
    expect(center, 'center value').to.be.deep.closeTo([100, 100] ,precision);
  });

  it('._getWebScale', function() {
    var emap = new EmptyMap(
      {width: 100, height: 100},
      {
        tileSize: 100, 
        projExtent: {left: -500, right: 500, top: 500, bottom: -500}
      }
    );
    emap.setView({center: [100,100], zoom: 2, rotation: 45})
    expect(emap._getWebScale()).to.be.equal(Math.pow(2,2));
  });

  it('.getResolution', function() {
    var emap = new EmptyMap(
      {width: 100, height: 100},
      {
        tileSize: 100, 
        projExtent: {left: -500, right: 500, top: 500, bottom: -500}
      }
    );
    emap.setView({center: [100,100], zoom: 2, rotation: 45})
    expect(emap.getResolution()).to.be.closeTo(2.5,precision);
  });

  it('.getRotation', function() {
    var emap = new EmptyMap(
      {width: 100, height: 100},
      {
        tileSize: 100, 
        projExtent: {left: -500, right: 500, top: 500, bottom: -500}
      }
    );
    emap.setView({center: [100,100], zoom: 2, rotation: 45})
    expect(emap.getRotation()).to.be.closeTo(45,precision);
  });

  it('.getZoom', function() {
    var emap = new EmptyMap(
      {width: 100, height: 100},
      {
        tileSize: 100, 
        projExtent: {left: -500, right: 500, top: 500, bottom: -500}
      }
    );
    emap.setView({center: [100,100], zoom: 2, rotation: 45})
    expect(emap.getZoom()).to.be.equal(2);
  });

  it('.getNearestZoom', function() {
    var emap = new EmptyMap(
      {width: 100, height: 100},
      {
        tileSize: 100, 
        projExtent: {left: -500, right: 500, top: 500, bottom: -500}
      }
    );
    emap.setView({center: [100,100], zoom: 2, rotation: 45})
    expect(emap.getNearestZoom()).to.be.equal(2);
  });

  it('.getView', function() {
    var emap = new EmptyMap(
      {width: 100, height: 100},
      {
        tileSize: 100, 
        projExtent: {left: -500, right: 500, top: 500, bottom: -500}
      }
    );
    emap.setView({center: [100,100], zoom: 2, rotation: 45})
    var curView = emap.getView();
    expect(curView).to.be.an('object')
      .that.to.have.property('center')
      .that.to.have.length(2);
    expect(curView.center).to.be.deep.closeTo([100, 100], precision);
    expect(curView).to.have.property('zoom')
      .that.to.be.closeTo(2,precision);
    expect(curView).to.have.property('rotation')
      .that.to.be.closeTo(45,precision);
    expect(curView).to.have.property('resolution')
      .that.to.be.closeTo(2.5,precision);
  });

  it('Get extent i.e. four viewport corners coordinates: .getExtent', function() {
    var emap = new EmptyMap(
      {width: 100, height: 100},
      {
        tileSize: 100, 
        projExtent: {left: -500, right: 500, top: 500, bottom: -500}
      }
    );
    emap.setView({center: [0,0], zoom: 1, rotation: 45})
    var ext = emap.getExtent();
    expect(ext).to.deep.equal({
      ll: [ 0, -353.5533905932738 ],
      lr: [ 353.5533905932738, -5.684341886080802e-14 ],
      ur: [ 0, 353.5533905932737 ],
      ul: [ -353.5533905932738, 0 ]
    });
  });

  it('Get viewport BBox/MBR i.e. minimum bounding rectangle: .getViewportBBox',
      function () {
      var emap = new EmptyMap(
        {width: 100, height: 100},
        {
          tileSize: 100, 
          projExtent: {left: -500, right: 500, top: 500, bottom: -500}
        }
      );
      emap.setView({center: [0,0], zoom: 1, rotation: 45})
      expect(emap.getViewportBBox()).to.deep.equal({
				"bottom": -353.5533905932738,
				"left": -353.5533905932738,
				"right": 353.5533905932738,
				"top": 353.5533905932737
     })
  });
   
  it('when rotation is 0 both extent and bbox of viewport should be equal',
    function () {   
      var emap = new EmptyMap(
        {width: 100, height: 100},
        {
          tileSize: 100, 
          projExtent: {left: -500, right: 500, top: 500, bottom: -500}
        }
      );
      emap.setView({center: [0,0], zoom: 1, rotation: 45})
      var extent = emap.getExtent();
      var bbox = emap.getViewportBBox();
      expect(bbox.left, 'left').to.be.equal(extent.ul[0]);
      expect(bbox.top, 'top').to.be.equal(extent.ur[1]);
      expect(bbox.bottom, 'bottom').to.be.equal(extent.ll[1]);
      expect(bbox.right, 'right').to.be.equal(extent.lr[0]);
    }
  );

  it('convert viewport pixel to long lat: .toLongLat', function() {
    var emap = new EmptyMap(
      {width: 100, height: 100},
      {
        tileSize: 100, 
        projExtent: {left: -500, right: 500, top: 500, bottom: -500}
      }
    );
    emap.setView({center: [0,0], zoom: 1, rotation: 45})
    var longLat = emap.toLongLat([50, 50]);
    expect(longLat, 'longLat is array').to.be.an('array')
      .that.to.have.length(2);
    expect(longLat, 'longLat value').to.be.deep.closeTo([0, 0], precision);
  });

  it('convert long lat to viewport pixel: .toViewportPx', function() {
    var emap = new EmptyMap(
      {width: 100, height: 100},
      {
        tileSize: 100, 
        projExtent: {left: -500, right: 500, top: 500, bottom: -500}
      }
    );
    emap.setView({center: [0,0], zoom: 1, rotation: 45})
    var px = emap.toViewportPx([0, 0]);
    expect(px, 'px as array').to.be.an('array')
      .that.to.have.length(2);
    expect(px, 'px value').to.be.deep.closeTo([50, 50] , precision);
  });

  it('pan the map: .move', function() {
    var emap = new EmptyMap(
      {width: 100, height: 100},
      {
        tileSize: 100, 
        projExtent: {left: -500, right: 500, top: 500, bottom: -500}
      }
    );
    emap.setView({center: [0,0], zoom: 1, rotation: 45})
    //emap.move({deltaX: -10, deltaY: -10})
    emap.move(
      {deltaX: 10, deltaY: 10},
      function(err,state) {
        expect(err).to.be.null;
        expect(arguments).to.be.arguments;
        var matrix = [
          1.4142135623730951, 1.414213562373095,
          -1.414213562373095, 1.4142135623730951,
          59.999999999999986, -81.42135623730951
        ];
        var matrixNonScalable = [
          0.7071067811865476, 0.7071067811865475,
          -0.7071067811865475, 0.7071067811865476,
          59.99999999999999, -10.710678118654755
        ];
        validateState(state, matrix, matrixNonScalable);
      }
    );
  });
    
  it('rotate the map: .scaleRotate', function() {
    var emap = new EmptyMap(
      {width: 100, height: 100},
      {
        tileSize: 100, 
        projExtent: {left: -500, right: 500, top: 500, bottom: -500}
      }
    );
    // view so that map center is at viewport top-left
    var long = 250/Math.cos(45*Math.PI/180)
    var lat = 0
    emap.setView({
        center: [long, lat],
        zoom: 1,
        rotation: 45
      });
    emap.scaleRotate({rotation: 45, center: [50, 50]},
      function(err,state) {
        expect(err).to.be.null;
        expect(arguments).to.be.arguments;
				var matrix = 	
		      [ 0, 2,
					  -2, 0,
					  150,-120.71067812]
		    var matrixNonScalable =
					[ 0, 1,
					  -1, 0,
					  100, 0]
        validateState(state, matrix, matrixNonScalable, precision);
      }
    );

    // viewport map coordinates should not change as center of rotation is same
    var curMapCtr = emap.getCenter();
    expect(curMapCtr, 'coord of vp center')
      .to.be.deep.closeTo([long, lat], 1e-6)
    var curRes = (1000/100)/2;
    var px = [50,(250 - 353.553391)/curRes]
    var longLat = emap.toLongLat(px)
    
    expect(longLat,'coord of a pixel').to.be.deep.closeTo([0,0], 1e-6)
  });
    
  it('pinch the map: .scaleRotate', function() {
    var emap = new EmptyMap(
      {width: 100, height: 100},
      {
        tileSize: 100, 
        projExtent: {left: -500, right: 500, top: 500, bottom: -500}
      }
    );
    emap.setView({
        center: [0, 0],
        zoom: 0,
        rotation: 45
      });
    emap.scaleRotate({factor:2 , center: [75, 75]},
      function(err,state) {
        expect(err).to.be.null;
        expect(arguments).to.be.arguments;
				var matrix =
					[ 1.4142135623730951, 1.414213562373095,
					  -1.414213562373095, 1.4142135623730951,
					  24.99999999999997, -116.42135623730948 ]
		    var matrixNonScalable =
          [ 0.7071067812, 0.7071067812,
            -0.7071067812, 0.7071067812,
            50, -20.71067812 ]
        validateState(state, matrix, matrixNonScalable, precision);
      }
    )
    expect(emap.getZoom(), 'zoom').to.be.equal(1)
    expect(emap.toViewportPx([0, 0]), 'map center')
      .to.be.deep.closeTo([25, 25], 1e-6)
  });

  it('pinch and rotate the map together: .scaleRotate', function() {
    var emap = new EmptyMap(
      {width: 100, height: 100},
      {
        tileSize: 100, 
        projExtent: {left: -500, right: 500, top: 500, bottom: -500}
      }
    );
    emap.setView({
        center: [0, 0],
        zoom: 0,
        rotation: 45
      });
    emap.scaleRotate({rotation: 45, factor:2 , center: [75, 75]},
      function(err,state) {
        expect(err).to.be.null;
        expect(arguments).to.be.arguments;
				var matrix =
          [ 0, 2,
            -2, 0,
            175, -95.7106781186 ]
		    var matrixNonScalable =
          [ 0, 1,
            -1, 0,
            125, -10.355339059 ]
        validateState(state, matrix, matrixNonScalable, precision);
      }
    )
    expect(emap.getZoom(), 'zoom').to.be.equal(1)
    expect(emap.toViewportPx([0, 0]), 'map center')
      .to.be.deep.closeTo([75, 75 - 2*Math.sqrt(25*25 + 25*25)], 1e-6)
  });
  
  it('on event (pan, pinch or scale) end non scalable matrix should be reset'
    + ' .resetMatrixNonScalable', function() {
    var emap = new EmptyMap(
      {width: 100, height: 100},
      {
        tileSize: 100, 
        projExtent: {left: -500, right: 500, top: 500, bottom: -500}
      }
    );
    emap.setView({
        center: [0, 0],
        zoom: 0,
        rotation: 45
      });
    var delta = Math.sqrt(25*25* + 25*25)
    emap.move({deltaX: delta, deltaY:delta})
    
    emap.resetMatrixNonScalable(
      function(err,state) {
        expect(err).to.be.null;
        expect(arguments).to.be.arguments;
		    var matrixNonScalable =
          [ 0.7071067812, 0.7071067812,
            -0.7071067812, 0.7071067812,
            50, -20.71067812 ]
        validateState(state, null, matrixNonScalable, precision);
      }
    )

    emap.scaleRotate({rotation: 45, factor:2 , center: [75, 75]})
    emap.resetMatrixNonScalable(
      function(err,state) {
        expect(err).to.be.null;
        expect(arguments).to.be.arguments;
		    var matrixNonScalable =
          [ 0, 1,
            -1, 0,
            100, 0 ]
        validateState(state, null, matrixNonScalable, precision);
      }
    )
  });
/*

  it('on event (pan, pinch or scale) end tile matrix should be reset: .resetMatrixNonScalable', function() {
    var emap = new EmptyMap(size);
    emap.setView(view);
    emap.scaleRotate(
      {
        position: [300,200],
        rotation: 30,
        factor: .4
      },
      function(err,state) {
        expect(err).to.be.null;
        expect(arguments).to.be.arguments;
        var matrix = [6.181925288250038,1.6564418886561327,-1.6564418886561327,6.181925288250038,76.95035260161637,-522.3787477177219];
        var matrixNonScalable = [0.38637033051562736,0.1035276180410083,-0.1035276180410083,0.38637033051562736,202.5166948204079,97.16657425623458];
        validateState(state, matrix, matrixNonScalable);
        state.map.resetMatrixNonScalable({callback: function(err,state) {
          expect(err).to.be.null;
          expect(arguments).to.be.arguments;
          var matrix = [6.181925288250038,1.6564418886561327,-1.6564418886561327,6.181925288250038,76.95035260161637,-522.3787477177219];
          var matrixNonScalable = [0.9659258262890683,0.25881904510252074,-0.25881904510252074,0.9659258262890683,63.92828903530676,-85.58356435941357];
          validateState(state, matrix, matrixNonScalable);
        }});
      }
    );
  });
  */
});

function validateState(state,m,tm,p) {
  var p = p || 0
  expect(state,'matrix').to.have.property('matrix')
    .that.is.an('array')
    .that.to.have.length(6)
  if(m) expect(state.matrix, 'matrix values').to.be.deep.closeTo(m,p)
  expect(state,'matrixNonScalable').to.have.property('matrixNonScalable')
    .that.is.an('array')
    .that.to.have.length(6)
  if(tm) expect(state.matrixNonScalable, 'matrixNonScalable values')
    .to.be.deep.closeTo(tm,p)
  expect(state,'map').to.have.property('map')
    .that.to.be.instanceOf(EmptyMap);
}
