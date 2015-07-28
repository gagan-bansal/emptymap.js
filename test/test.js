var chai = require('chai'),
  Matrix = require('transformatrix'),
  expect = chai.expect,
  chaiAsPromised = require("chai-as-promised"),
  EmptyMap = require('../emptymap.js');
  size = {width: 714, height: 400},
  view = {
    "center":[-9655821.34064295,4238014.557249293],
    "zoom":4,
    "rotation":-15
  };
  mercExt = {
    left: -20037508.342789244,
    right: 20037508.342789244,
    bottom: -20037508.342789244,
    top: 20037508.342789244};
  precision = 1e-6;
chai.use(chaiAsPromised);

describe('Test diffrent operations on emptymap.js', function() {
  it('initiate emptymap.js object', function() {
    var emap = new EmptyMap(size);
    expect(emap).to.be.an.instanceOf(EmptyMap);
    expect(emap).to.have.property('vpSize')
      .that.is.an('object');
    expect(emap.vpSize).to.have.property('width',size.width);
    expect(emap.vpSize).to.have.property('height',size.height);
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
    expect(emap).to.have.property('tileMatrix')
      .that.is.instanceOf(Matrix);
  });
  it('callback is not function', function() {
    var emap = new EmptyMap(size);
    expect(function() {
      emap.setView({
        view: view,
        callback: 'i am not function'
      })
    }).to.throw(Error);
  });
  it('set view to the map: .setView', function() {
    var emap = new EmptyMap(size);
    emap.setView({
      view: view,
      callback: function(err,state) {
        expect(err).to.be.null;
        expect(arguments).to.be.arguments;
        var matrix = [15.454813220625093,-4.141104721640332,4.141104721640332,15.454813220625093,-1085.890087027557,-1085.183807445864];
        var tileMatrix = [0.9659258262890683,-0.25881904510252074,0.25881904510252074,0.9659258262890683,-39.59932900570152,99.21323384378626];
        validateState(state, matrix, tileMatrix);
      }
    });
  });

  it('.getCenter', function() {
    var emap = new EmptyMap(size);
    emap.setView({
      view: view,
      callback: function() {}
    });
    var center = emap.getCenter();
    expect(center).to.be.an('array')
      .that.to.have.length(2);
    expect(center[0]).to.be.closeTo(view.center[0],precision);
    expect(center[1]).to.be.closeTo(view.center[1],precision);
  });

  it('._getWebScale', function() {
    var emap = new EmptyMap(size);
    emap.setView({
      view: view,
      callback: function() {}
    });
    expect(emap._getWebScale()).to.be.equal(Math.pow(2,view.zoom));
  });

  it('.getResolution', function() {
    var emap = new EmptyMap(size);
    emap.setView({
      view: view,
      callback: function() {}
    });
    expect(emap.getResolution()).to.be.closeTo(9783.93962050256,precision);
  });

  it('.getRotation', function() {
    var emap = new EmptyMap(size);
    emap.setView({
      view: view,
      callback: function() {}
    });
    expect(emap.getRotation()).to.be.closeTo(view.rotation,precision);
  });

  it('.getZoom', function() {
    var emap = new EmptyMap(size);
    emap.setView({
      view: view,
      callback: function() {}
    });
    expect(emap.getZoom()).to.be.equal(view.zoom);
  });

  it('.getNearestZoom', function() {
    var emap = new EmptyMap(size);
    emap.setView({
      view: view,
      callback: function() {}
    });
    emap.applyDeltaScaleRotation({
      factor: .9,
      callback: function() {}
    });
    expect(emap.getZoom()).to.not.closeTo(view.zoom,precision);
    expect(emap.getNearestZoom()).to.be.equal(view.zoom);
  });

  it('.getView', function() {
    var emap = new EmptyMap(size);
    emap.setView({
      view: view,
      callback: function() {}
    });
    var setView = emap.getView();
    expect(setView).to.be.an('object')
      .that.to.have.property('center')
      .that.to.have.length(2);
    expect(setView.center[0]).to.be.closeTo(view.center[0],precision);
    expect(setView.center[1]).to.be.closeTo(view.center[1],precision);
    expect(setView).to.have.property('zoom')
      .that.to.be.closeTo(view.zoom,precision);
    expect(setView).to.have.property('rotation')
      .that.to.be.closeTo(view.rotation,precision);
    expect(setView).to.have.property('resolution')
      .that.to.be.closeTo(9783.93962050256,precision);
  });
  it('Get extend i.e.four viewport corners coordinates: .getExtent', function() {
    var emap = new EmptyMap(size);
    emap.setView({
      view: view,
      callback: function() {}
    });
    var ext = emap.getExtent();
    expect(ext).to.be.an('array')
      .that.to.have.length(4);
    expect(ext).to.be.deep.equal([[-12523217.265198885,7032146.9075497],[-13536125.22916656,3251922.9226311855],[-6788425.416087011,1443882.20694888],[-5775517.452119334,5224106.191867396]]);
  });

  it('convert viewport pixel to long lat: .toLongLat', function() {
    var emap = new EmptyMap(size);
    emap.setView({
      view: view,
      callback: function() {}
    });
    var longLat = emap.toLongLat([size.width/2,size.height/2]);
    expect(longLat).to.be.an('array')
      .that.to.have.length(2);
    expect(longLat[0]).to.be.closeTo(view.center[0], precision);
    expect(longLat[1]).to.be.closeTo(view.center[1], precision);
  });

  it('convert long lat to viewport pixel: .toViewportPx', function() {
    var emap = new EmptyMap(size);
    emap.setView({
      view: view,
      callback: function() {}
    });
    var px = emap.toViewportPx(view.center);
    expect(px).to.be.an('array')
      .that.to.have.length(2);
    expect(px[0]).to.be.closeTo(size.width/2, precision);
    expect(px[1]).to.be.closeTo(size.height/2, precision);
  });


  it('pan the map: .applyDeltaMove', function() {
    var emap = new EmptyMap(size);
    emap.setView({
      view: view,
      callback: function() {}
    });
    emap.applyDeltaMove({
      deltaX: 200,
      deltaY: 100,
      callback: function(err,state) {
        expect(err).to.be.null;
        expect(arguments).to.be.arguments;
        var matrix = [15.454813220625093,-4.141104721640332,4.141104721640332,15.454813220625093,-885.890087027557,-985.1838074458641];
        var tileMatrix = [0.9659258262890683,-0.25881904510252074,0.25881904510252074,0.9659258262890683,160.40067099429848,199.21323384378627];
        validateState(state, matrix, tileMatrix);
      }
    });
  });
    
  it('rotate the map: .applyDeltaScaleRotateion', function() {
    var emap = new EmptyMap(size);
    emap.setView({
      view: view,
      callback: function() {}
    });
    emap.applyDeltaScaleRotation({
      position: [300,200],
      rotation: 30,
      callback: function(err,state) {
        expect(err).to.be.null;
        expect(arguments).to.be.arguments;
        var matrix = [15.454813220625093,4.141104721640332,-4.141104721640332,15.454813220625093,-257.624118495959,-1605.9468692943049];
        var tileMatrix = [0.9659258262890683,0.25881904510252074,-0.25881904510252074,0.9659258262890683,56.291737051019794,-57.08356435941357];
        validateState(state, matrix, tileMatrix);
      }
    });
  });

  it('pinch the map: .applyDeltaScaleRotateion', function() {
    var emap = new EmptyMap(size);
    emap.setView({
      view: view,
      callback: function() {}
    });
    emap.applyDeltaScaleRotation({
      position: [300,200],
      rotation: 0,
      factor: 1.8,
      callback: function(err,state) {
        expect(err).to.be.null;
        expect(arguments).to.be.arguments;
        var matrix = [27.81866379712517,-7.453988498952597,7.453988498952597,27.81866379712517,-2194.602156649603,-2113.3308534025555];
        var tileMatrix = [1.738666487320323,-0.46587428118453733,0.46587428118453733,1.738666487320323,-311.27879221026274,18.583820918815263];
        validateState(state, matrix, tileMatrix);
      }
    });
  });

  it('pinch and rotate the map: .applyDeltaScaleRotateion', function() {
    var emap = new EmptyMap(size);
    emap.setView({
      view: view,
      callback: function() {}
    });
    emap.applyDeltaScaleRotation({
      position: [300,200],
      rotation: 30,
      factor: .4,
      callback: function(err,state) {
        expect(err).to.be.null;
        expect(arguments).to.be.arguments;
        var matrix = [6.181925288250038,1.6564418886561327,-1.6564418886561327,6.181925288250038,76.95035260161637,-522.3787477177219];
        var tileMatrix = [0.38637033051562736,0.1035276180410083,-0.1035276180410083,0.38637033051562736,202.5166948204079,97.16657425623458];
  //console.log('matrix: '+ state.matrix);
  //console.log('tileMatrix: '+ state.tileMatrix);
        validateState(state, matrix, tileMatrix);
      }
    });
  });

  it('on event (pan, pinch or scale) end tile matrix should be reset: .resetTileMatrix', function() {
    var emap = new EmptyMap(size);
    emap.setView({
      view: view,
      callback: function() {}
    });
    emap.applyDeltaScaleRotation({
      position: [300,200],
      rotation: 30,
      factor: .4,
      callback: function(err,state) {
        expect(err).to.be.null;
        expect(arguments).to.be.arguments;
        var matrix = [6.181925288250038,1.6564418886561327,-1.6564418886561327,6.181925288250038,76.95035260161637,-522.3787477177219];
        var tileMatrix = [0.38637033051562736,0.1035276180410083,-0.1035276180410083,0.38637033051562736,202.5166948204079,97.16657425623458];
        validateState(state, matrix, tileMatrix);
        state.map.resetTileMatrix({callback: function(err,state) {
          expect(err).to.be.null;
          expect(arguments).to.be.arguments;
          var matrix = [6.181925288250038,1.6564418886561327,-1.6564418886561327,6.181925288250038,76.95035260161637,-522.3787477177219];
          var tileMatrix = [0.9659258262890683,0.25881904510252074,-0.25881904510252074,0.9659258262890683,63.92828903530676,-85.58356435941357];
          validateState(state, matrix, tileMatrix);
        }});
      }
    });
  });
});

function validateState(state,m,tm) {
  expect(state).to.have.property('matrix')
    .that.is.an('array')
    .that.to.have.length(6)
    .that.to.be.deep.equal(m);
  expect(state).to.have.property('tileMatrix')
    .that.is.an('array')
    .that.to.have.length(6)
    .that.to.be.deep.equal(tm);
  expect(state).to.have.property('map')
    .that.to.be.instanceOf(EmptyMap);
}
