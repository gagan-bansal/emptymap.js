var Matrix = require('transformatrix')

var em = function(viewportSize,options) {
  if(!viewportSize) throw new Error('viewport size not defined')
  this.vpSize = viewportSize
  this.opt = options || {}
  this.projExt = this.opt.projExtent || {
    left: -20037508.342789244,
    right: 20037508.342789244,
    bottom: -20037508.342789244,
    top: 20037508.342789244
  }
  this.tSize = this.opt.tileSize || 256
  this.maxRes = Math.min(
    Math.abs(this.projExt.right - this.projExt.left)/this.tSize,
    Math.abs(this.projExt.top - this.projExt.bottom)/this.tSize)
  this.matrix = new Matrix()
  this.matrixNonScalable = new Matrix()
  if(this.opt.view && this.opt.callback) 
    this.setVeiw(this.opt.view,this.opt.callback,this.opt.scope)
}

em.prototype.setView = function(view, cb, scope) {
  view.center = view.center || [0,0]
  //TODO webscale to scale
  view.webScale = view.hasOwnProperty('webScale') ? view.webScale 
    : view.hasOwnProperty('zoom') ? Math.pow(2,view.zoom) 
    : view.hasOwnProperty('resolution') ? this.maxRes/view.resolution : 1
  view.rotation = view.rotation || 0
  this._setAt(view.center, view.webScale, view.rotation)
  if (cb) { 
    if (typeof(cb) !== 'function') 
      throw new TypeError('cb is not function')
    scope = scope || this
    cb.call(scope, null,{
      matrix: this.matrix.m,
      matrixNonScalable: this.matrixNonScalable.m,
      map:this})
  }
}

em.prototype.move = function(delta, cb, scope) {
  var deltaX = delta.deltaX || 0,
    deltaY = delta.deltaY || 0
  var basePx = this.matrix.inverse().transformPoint(deltaX,deltaY)
  var baseVPTopLeftPx = this.matrix.inverse().transformPoint(0,0)
  this.matrix.translate(
    basePx[0] - baseVPTopLeftPx[0], basePx[1] - baseVPTopLeftPx[1])
  // apply for tile matrix
  basePx = this.matrixNonScalable.inverse().transformPoint(deltaX,deltaY)
  baseVPTopLeftPx = this.matrixNonScalable.inverse().transformPoint(0,0)
  this.matrixNonScalable.translate(
    basePx[0] - baseVPTopLeftPx[0], basePx[1] - baseVPTopLeftPx[1])
  if (cb) { 
    if (typeof(cb) !== 'function') 
      throw new TypeError('callback is not function')
    scope = scope || this
    cb.call(scope, null,{
      matrix: this.matrix.m,
      matrixNonScalable: this.matrixNonScalable.m,
      map:this})
  }
}

em.prototype.scaleRotate = function(params, cb, scope) {
  var vpPx = params.center || [this.vpSize.width/2, this.vpSize.height/2], 
    factor = params.factor || 1,
    rot = params.rotation || params.rotate || 0,
    basePx, destBasePx
  basePx = this.matrix.inverse().transformPoint(vpPx[0],vpPx[1]),
  this.matrix.translate(basePx[0],basePx[1])
    .rotate(Math.PI*rot/180)
    .scale(factor,factor)
    .translate(-basePx[0],-basePx[1])
  // for tile matrix
  basePx = this.matrixNonScalable.inverse().transformPoint(vpPx[0],vpPx[1])
  this.matrixNonScalable.translate(basePx[0],basePx[1])
    .rotate(Math.PI*rot/180)
    .translate(-basePx[0],-basePx[1])
  if (cb) { 
    if (typeof(cb) !== 'function') 
      throw new TypeError('callback is not function')
    scope = scope || this
    cb.call(scope, null,{
      matrix: this.matrix.m,
      matrixNonScalable: this.matrixNonScalable.m,
      map:this})
  }
}

em.prototype.resetMatrixNonScalable = function(cb,scope) {
  var rot = Math.atan2(this.matrixNonScalable.m[1],this.matrixNonScalable.m[0])
  this.matrixNonScalable.reset()
  this.matrixNonScalable.translate(this.vpSize.width/2,this.vpSize.height/2)
    .rotate(rot)
    .translate(-this.vpSize.width/2,-this.vpSize.height/2)
  if (cb) { 
    if (typeof(cb) !== 'function') 
      throw new TypeError('callback is not function')
    scope = scope || this
    cb.call(scope, null,{
      matrix: this.matrix.m,
      matrixNonScalable: this.matrixNonScalable.m,
      map:this})
  }
}

em.prototype.getCenter = function() {
  var ctrBasePx = this.matrix.inverse()
    .transformPoint(this.vpSize.width/2,this.vpSize.height/2)
  return [
    this.projExt.left + ctrBasePx[0]*this.maxRes,
    this.projExt.top - ctrBasePx[1] * this.maxRes ]
}
em.prototype.getZoom = function() {
  return Math.log(this._getWebScale()) / Math.log(2)
}
em.prototype.getNearestZoom = function() {
  return Math.round(this.getZoom())
}
em.prototype._getWebScale = function() {
  var m = this.matrix.m
  return Math.sqrt(m[0] * m[0] + m[1] * m[1])
}
em.prototype.getResolution = function() {
  return this.maxRes/this._getWebScale()
}
em.prototype.getRotation = function() {
  var m = this.matrix.m
  return Math.atan2(m[1],m[0]) * 180/Math.PI
}
em.prototype.getView = function() {
  return {
    center: this.getCenter(),
    zoom: this.getZoom(),
    resolution: this.maxRes/this._getWebScale(),
    rotation: this.getRotation()
  }
}
em.prototype.getExtent = function() {
  var inv = this.matrix.inverse()
  return {
    ll: this._basePxToLongLat(inv.transformPoint(0,this.vpSize.height)),
    lr: this._basePxToLongLat(inv.transformPoint(
      this.vpSize.width, 
      this.vpSize.height)),
    ur: this._basePxToLongLat(inv.transformPoint(this.vpSize.width, 0)),
    ul: this._basePxToLongLat(inv.transformPoint(0,0))}
}

em.prototype.toLongLat = function(px) {
  var basePx = this.matrix.inverse().transformPoint(px[0],px[1])
  return this._basePxToLongLat(basePx)
}
em.prototype.toViewportPx = function(longLat) {
  var basePx = this._longLatToBasePx(longLat)
  return this.matrix.transformPoint(basePx[0],basePx[1])
}

em.prototype.getViewportBBox = function() {
  var extent, xArray, yArray, left, right, top, bottom
  extent = this.getExtent()
  xArray = Object.keys(extent).map(function(key) {return extent[key][0]});
  yArray = Object.keys(extent).map(function(key) {return extent[key][1]});
  left = Math.min.apply(this,xArray)
  right = Math.max.apply(this,xArray)
  bottom = Math.min.apply(this,yArray)
  top = Math.max.apply(this,yArray)
  return {left: left, right: right, bottom: bottom, top: top}
}

em.prototype._setAt = function(ctr, webScale, rot) {
  var baseCtr = this._longLatToBasePx(ctr)
  this.matrix.reset()
  this.matrix.translate(baseCtr[0],baseCtr[1])
    .rotate(Math.PI/180*rot)
    .scale(webScale,webScale)
    .translate(-baseCtr[0],-baseCtr[1])
  var baseVPCenter = this.matrix.inverse()
    .transformPoint(this.vpSize.width/2,this.vpSize.height/2)
  this.matrix.translate(baseVPCenter[0] - baseCtr[0], baseVPCenter[1] - baseCtr[1])
  // for tile matrix
  this.matrixNonScalable.reset()
  this.matrixNonScalable.translate(this.vpSize.width/2,this.vpSize.height/2)
    .rotate(rot * Math.PI/180)
    .translate(-this.vpSize.width/2,-this.vpSize.height/2)
}
em.prototype._longLatToBasePx = function(longLat) {
  return [
    (longLat[0] - this.projExt.left)/this.maxRes,
    (this.projExt.top - longLat[1])/this.maxRes]
}
em.prototype._basePxToLongLat = function(px) {
  return [
    this.projExt.left + px[0]*this.maxRes,
    this.projExt.top - px[1]*this.maxRes]
}

module.exports = em
