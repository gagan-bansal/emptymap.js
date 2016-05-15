!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.EmptyMap=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Matrix = require('transformatrix');

var em = function(viewportSize,options) {
  if(!viewportSize) return;
  this.vpSize = viewportSize; 
  this.opt = options || {};
  this.projExt = this.opt.projExtent || {
    left: -20037508.342789244,
    right: 20037508.342789244,
    bottom: -20037508.342789244,
    top: 20037508.342789244
  };
  this.tSize = this.opt.tileSize || 256;
  this.maxRes = Math.min(
    Math.abs(this.projExt.right - this.projExt.left)/this.tSize,
    Math.abs(this.projExt.top - this.projExt.bottom)/this.tSize);
  this.matrix = new Matrix();
  this.tileMatrix = new Matrix();
  if(this.opt.view && this.opt.callback)
    this.setVeiw(this.opt.view,this.opt.callback,this.opt.scope);
};

em.prototype.setView = function(params) {
  var view = params.view, 
    cb = params.callback,
    scope = params.scope || this;
  if (typeof(cb) !== 'function') {
    throw new TypeError('callback is not function');
  }
  if(view ) {
    view.center = view.center || [0,0];
    view.webScale = view.webScale ? view.webScale : view.zoom
      ? Math.pow(2,view.zoom) : view.resolution
      ? this.maxRes/view.resolution : 0,
    view.rotation = view.rotation || 0;
  } else {
    cb.call(scope,new Error('view details are wrong'));
    return;
  }
  this._setAt(view.center, view.webScale, view.rotation);
  cb.call(scope, null,{
    matrix: this.matrix.m,
    tileMatrix: this.tileMatrix.m,
    map:this});
};

em.prototype.applyDeltaMove = function(params) {
  var deltaX = params.deltaX || 0,
    deltaY = params.deltaY || 0,
    cb = params.callback,
    scope = params.scope || this;
  if (typeof(cb) !== 'function') {
    throw new TypeError('callback is not function');
  }
  var basePx = this.matrix.inverse().transformPoint(deltaX,deltaY);
  var baseVPTopLeftPx = this.matrix.inverse().transformPoint(0,0);
  this.matrix.translate(
    basePx[0] - baseVPTopLeftPx[0], basePx[1] - baseVPTopLeftPx[1]);
  // apply for tile matrix
  basePx = this.tileMatrix.inverse().transformPoint(deltaX,deltaY);
  baseVPTopLeftPx = this.tileMatrix.inverse().transformPoint(0,0);
  this.tileMatrix.translate(
    basePx[0] - baseVPTopLeftPx[0], basePx[1] - baseVPTopLeftPx[1]);
  cb.call(scope, null,{
    matrix: this.matrix.m,
    tileMatrix: this.tileMatrix.m,
    map:this});
};

em.prototype.applyDeltaScaleRotation = function(params) {
  var vpPx = params.position || [this.vpSize.width/2, this.vpSize.height/2], 
    factor = params.factor || 1,
    rot = params.rotation || 0,
    cb = params.callback,
    scope = params.scope || this,
    basePx, destBasePx;
  if (typeof(cb) !== 'function') {
    throw new TypeError('callback is not function');
  }
  basePx = this.matrix.inverse().transformPoint(vpPx[0],vpPx[1]),
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
  cb.call(scope, null,{
    matrix: this.matrix.m,
    tileMatrix: this.tileMatrix.m,
    map:this});
};

em.prototype.resetTileMatrix = function(params) {
  var cb = params.callback,
    scope = params.scope || this;
  if (typeof(cb) !== 'function') {
    throw new TypeError('callback is not function');
  }
  var rot = Math.atan2(this.tileMatrix.m[1],this.tileMatrix.m[0]);
  this.tileMatrix.reset();
  this.tileMatrix.translate(this.vpSize.width/2,this.vpSize.height/2)
    .rotate(rot)
    .translate(-this.vpSize.width/2,-this.vpSize.height/2);
  cb.call(scope, null,{
    matrix: this.matrix.m,
    tileMatrix: this.tileMatrix.m,
    map:this});
};

em.prototype.getCenter = function() {
  var ctrBasePx = this.matrix.inverse()
    .transformPoint(this.vpSize.width/2,this.vpSize.height/2);
  return [
    this.projExt.left + ctrBasePx[0]*this.maxRes,
    this.projExt.top - ctrBasePx[1] * this.maxRes ];
}
em.prototype.getZoom = function() {
  return Math.log(this._getWebScale()) / Math.log(2);
};
em.prototype.getNearestZoom = function() {
  return Math.round(this.getZoom());
};
em.prototype._getWebScale = function() {
  var m = this.matrix.m;
  return Math.sqrt(m[0] * m[0] + m[1] * m[1])
};
em.prototype.getResolution = function() {
  return this.maxRes/this._getWebScale();
};
em.prototype.getRotation = function() {
  var m = this.matrix.m;
  return Math.atan2(m[1],m[0]) * 180/Math.PI;
};
em.prototype.getView = function() {
  return {
    center: this.getCenter(),
    zoom: this.getZoom(),
    resolution: this.maxRes/this._getWebScale(),
    rotation: this.getRotation()
  };
};
em.prototype.getExtent = function() {
  var inv = this.matrix.inverse();
  return [
    this._basePxToLongLat(inv.transformPoint(0,0)),
    this._basePxToLongLat(inv.transformPoint(0,this.vpSize.height)),
    this._basePxToLongLat(inv.transformPoint(
      this.vpSize.width, 
      this.vpSize.height)),
    this._basePxToLongLat(inv.transformPoint(this.vpSize.width, 0))]
};

em.prototype.toLongLat = function(px) {
  var basePx = this.matrix.inverse().transformPoint(px[0],px[1]);
  return this._basePxToLongLat(basePx);
};
em.prototype.toViewportPx = function(longLat) {
  var basePx = this._longLatToBasePx(longLat);
  return this.matrix.transformPoint(basePx[0],basePx[1]);
};

em.prototype.getViewportBBox = function() {
  var extent, xArray, yArray, left, right, top, bottom;
  extent = this.getExtent();
  xArray = extent.map(function(pt) {return pt[0];});
  yArray = extent.map(function(pt) {return pt[1];});
  left = Math.min.apply(this,xArray);
  right = Math.max.apply(this,xArray);
  bottom = Math.min.apply(this,yArray);
  top = Math.max.apply(this,yArray);
  return {left: left, right: right, bottom: bottom, top: top};
};

em.prototype._setAt = function(ctr, webScale, rot) {
  var basePx = this._longLatToBasePx(ctr);
  this.matrix.reset();
  this.matrix.translate(basePx[0],basePx[1])
    .rotate(Math.PI/180*rot)
    .scale(webScale,webScale)
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
em.prototype._longLatToBasePx = function(longLat) {
  return [
    (longLat[0] - this.projExt.left)/this.maxRes,
    (this.projExt.top - longLat[1])/this.maxRes];
};
em.prototype._basePxToLongLat = function(px) {
  return [
    this.projExt.left + px[0]*this.maxRes,
    this.projExt.top - px[1]*this.maxRes];
}

module.exports = em; 

},{"transformatrix":2}],2:[function(require,module,exports){
var Matrix = function() {
    this.reset();
};
Matrix.prototype.reset = function() {
    this.m = [1, 0, 0, 1, 0, 0];
    return this;
};
Matrix.prototype.multiply = function(matrix) {
    var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1],
        m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1],
        m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3],
        m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];

    var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4],
        dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];
    this.m[0] = m11;
    this.m[1] = m12;
    this.m[2] = m21;
    this.m[3] = m22;
    this.m[4] = dx;
    this.m[5] = dy;
    return this;
};
Matrix.prototype.inverse = function() {
    var inv = new Matrix();
    inv.m = this.m.slice(0);
    var d = 1 / (inv.m[0] * inv.m[3] - inv.m[1] * inv.m[2]),
        m0 = inv.m[3] * d,
        m1 = -inv.m[1] * d,
        m2 = -inv.m[2] * d,
        m3 = inv.m[0] * d,
        m4 = d * (inv.m[2] * inv.m[5] - inv.m[3] * inv.m[4]),
        m5 = d * (inv.m[1] * inv.m[4] - inv.m[0] * inv.m[5]);
    inv.m[0] = m0;
    inv.m[1] = m1;
    inv.m[2] = m2;
    inv.m[3] = m3;
    inv.m[4] = m4;
    inv.m[5] = m5;
    return inv;
};
Matrix.prototype.rotate = function(rad) {
    var c = Math.cos(rad),
        s = Math.sin(rad),
        m11 = this.m[0] * c + this.m[2] * s,
        m12 = this.m[1] * c + this.m[3] * s,
        m21 = this.m[0] * -s + this.m[2] * c,
        m22 = this.m[1] * -s + this.m[3] * c;
    this.m[0] = m11;
    this.m[1] = m12;
    this.m[2] = m21;
    this.m[3] = m22;
    return this;
};
Matrix.prototype.translate = function(x, y) {
    this.m[4] += this.m[0] * x + this.m[2] * y;
    this.m[5] += this.m[1] * x + this.m[3] * y;
    return this;
};
Matrix.prototype.scale = function(sx, sy) {
    this.m[0] *= sx;
    this.m[1] *= sx;
    this.m[2] *= sy;
    this.m[3] *= sy;
    return this;
};
Matrix.prototype.transformPoint = function(px, py) {
    var x = px,
        y = py;
    px = x * this.m[0] + y * this.m[2] + this.m[4];
    py = x * this.m[1] + y * this.m[3] + this.m[5];
    return [px, py];
};
Matrix.prototype.transformVector = function(px, py) {
    var x = px,
        y = py;
    px = x * this.m[0] + y * this.m[2];
    py = x * this.m[1] + y * this.m[3];
    return [px, py];
};
if(typeof module !== "undefined") {
    module.exports = Matrix;
}
else {
    window.Matrix = Matrix;
}

},{}]},{},[1])(1)
});


//# sourceMappingURL=emptymap.js.map