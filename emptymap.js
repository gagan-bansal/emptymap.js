var Matrix = require('transformatrix');

var em = function(viewportSize,options) {
  if(!viewportSize) return;
  this.vpSize = viewportSize; 
  this.opt = options || {};
  this.projExt = this.opt.projExt || {
    left: -20037508.342789244,
    right: 20037508.342789244,
    bottom: -20037508.342789244,
    top: 20037508.342789244
  };
  this.tSize = this.opt.tileSize || 256
  this.maxRes = Math.min(
    Math.abs(this.projExt.right - this.projExt.left)/this.tSize,
    Math.abs(this.projExt.top - this.projExt.bottom)/this.tSize);
  this.curScale = 1;
  this.curRotation = 0;
  this.matrix = new Matrix();
  this.tileMatrix = new Matrix();
  if(this.opt.view && this.opt.callback)
    this.setVeiw(this.opt.view,this.opt.callback,this.opt.scope);
};

em.prototype.setView = function(view, cb, scope) {
  if (typeof(cb) !== 'function') {
    cb.call(null,'callback is not function',null);
    return;
  }
  if(view ) {
    view.center = view.center || [0,0];
    view.scale = view.scale ? view.scale : view.zoom 
      ? Math.pow(2,view.zoom) : 1;
    view.rotation = view.rotation || 0;
  } else {
    cb.call(null,'view details are wrong',null);
    return;
  }
  this._setAt(view.center, view.scale, view.rotation);
  var scope = scope || null;
  cb.call(scope,null,this.matrix.m,this);
};

em.prototype._setAt = function(ctr, scale, rot) {
  var basePx = this._latLongToBasePx(ctr);
  this.matrix.reset();
  this.matrix.translate(basePx[0],basePx[1])
    .rotate(Math.PI/180*rot)
    .scale(scale,scale)
    .translate(-basePx[0],-basePx[1]);
  var baseCenter = this.matrix.inverse()
    .transformPoint(this.vpSize.width/2,this.vpSize.height/2);
  this.matrix.translate(baseCenter[0] - basePx[0], baseCenter[1] - basePx[1]);
  // for tile matrix
  this.tileMatrix.reset();
  this.tileMatrix.translate(this.vpSize.width/2,this.vpSize.height/2)
    .rotate(rot * Math.PI/180)
    .translate(-this.vpSize.width/2,-this.vpSize.height/2)
};

em.prototype._latLongToBasePx = function(latLong) {
  return [
    (latLong[0] - this.projExt.left)/this.maxRes,
    (this.projExt.top - latLong[1])/this.maxRes];
};
em.prototype._basePxToLatLong = function(px) {
  return [
    this.projExt.left + px[0]*this.maxRes,
    this.projExt.top - px[1]*this.maxRes];
}
em.prototype.moveByPixel = function(delta,cb,scope) {
  if (typeof cb !== 'function') {
    cb.call(null,'callback is not function',null);
    return;
  }
  var basePx = this.matrix.inverse().transformPoint(delta[0],delta[1]);
  var baseVPTopLeftPx = this.matrix.inverse().transformPoint(0,0);
  this.matrix.translate(basePx[0] - baseVPTopLeftPx[0], basePx[1] - baseVPTopLeftPx[1]);
  // apply for tile matrix
  basePx = this.tileMatrix.inverse().transformPoint(delta[0],delta[1]);
  baseVPTopLeftPx = this.tileMatrix.inverse().transformPoint(0,0);
  this.tileMatrix.translate(basePx[0] - baseVPTopLeftPx[0], basePx[1] - baseVPTopLeftPx[1]);
  
  cb.call(scope,null,this.matrix.m,this);
}
em.prototype.applyDeltaScaleRotation = function(vpPx,factor, rot, cb, scope) {
  var factor = factor || 1,
    rot = rot || 0,
    basePx = this.matrix.inverse().transformPoint(vpPx[0],vpPx[1]),
    destBasePx;
  this.matrix.translate(basePx[0],basePx[1])
    .rotate(Math.PI*rot/180)
    .scale(factor,factor)
    .translate(-basePx[0],-basePx[1])
  // for tile matrix
  basePx = this.tileMatrix.inverse().transformPoint(vpPx[0],vpPx[1]);
  this.tileMatrix.translate(basePx[0],basePx[1])
    .rotate(Math.PI*rot/180)
    .scale(factor,factor)
    .translate(-basePx[0],-basePx[1])
  cb.call(scope,null,this.matrix.m,this);
}
 
em.prototype.vpPxToLatLong = function(px) {
  var basePx = this.matrix.inverse().transformPoint(px[0],px[1]);
  return this._basePxToLatLong(basePx);
};

em.prototype.latLongToVPPx = function(latLong) {
  var basePx = this._latLongToBasePx(latLong);
  return this.matrix.transformPoint(basePx[0],basePx[1]);
};

em.prototype.zoomIn = function(cb, scope) {
  this.applyDeltaScaleRotation(
    [this.vpSize.width/2, this.vpSize.height/2],
    2,0, cb, scope
  );
};

em.prototype.zoomOut = function(cb, scope) {
  this.applyDeltaScaleRotation(
    [this.vpSize.width/2, this.vpSize.height/2],
    .5, 0, cb, scope 
  );
};

em.prototype.getExtent = function() {
  return {
    left: this.curTopLeft.long,
    top: this.curTopLeft.lat,
    right: this.curTopLeft.long + this.vpSize.width * (this.maxRes / this.curScale),
    bottom: this.curTopLeft.lat - this.vpSize.height * (this.maxRes / this.curScale)
  };
}
em.prototype.getCenter = function() {
  var ctrBasePx = this.matrix.inverse()
    .transformPoint(this.vpSize.width/2,this.vpSize.height/2);
  return [
    this.projExt.left + ctrBasePx[0]*this.maxRes,
    this.projExt.top - ctrBasePx[1] * this.maxRes ];
}
em.prototype.getZoom = function() {
  return Math.log(this.getScale()) / Math.log(2);
};
em.prototype.getNearestZoom = function() {
  return Math.round(this.getZoom());
};
em.prototype.getScale = function() {
  var m = this.matrix.m;
  return Math.sqrt(m[0] * m[0] + m[1] * m[1])
};
em.prototype.getRotation = function() {
  var m = this.matrix.m;
  return Math.atan2(m[1],m[0]) * 180/Math.PI;
};
em.prototype.getView = function() {
  return {
    center: this.getCenter(),
    zoom: this.getZoom(),
    rotation: this.getRotation()
  };
};
em.prototype.resetTileMatrix = function(cb, scope) {
  var rot = Math.atan2(this.tileMatrix.m[1],this.tileMatrix.m[0]);
  this.tileMatrix.reset();
  this.tileMatrix.translate(this.vpSize.width/2,this.vpSize.height/2)
    .rotate(rot)
    .translate(-this.vpSize.width/2,-this.vpSize.height/2);
  cb.call(scope,null,this.tileMatrix.m,this);
};

module.exports = em; 
