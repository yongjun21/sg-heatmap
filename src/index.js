/* global google */
import minBy from 'lodash/minBy'
import maxBy from 'lodash/maxBy'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import partition from 'lodash/partition'
import {encodePolyline, decodePolyline, inside} from './helpers/geometry'

export default class SgHeatmap {
  constructor (mapRegions) {
    this.children = mapRegions.map(r => new MapRegion(r))
    this._defaultState = {}
    this._updaters = []
    this._stats = {}
  }

  setDefaultState (_key, value) {
    this._defaultState[_key] = value
    this.children.forEach(c => {
      if (_key in c.state) return
      c.state[_key] = cloneDeep(value)
    })
    return this
  }

  resetState () {
    this.children.forEach(c => {
      c.state = cloneDeep(this._defaultState)
    })
    return this
  }

  registerUpdater (fn) {
    this._updaters.push(fn)
    return this
  }

  inspectUpdaters () {
    this._updaters.map((fn, i) => {
      console.log(`Inspecting updater "${i + 1}"`)
      console.log(fn)
    })
  }

  registerStat (key, fn) {
    this._stats[key] = fn
    return this
  }

  inspectStats () {
    Object.keys(this._stats).forEach((key, i) => {
      console.log(`Inspecting stat "${key}"`)
      console.log(this._stats[key])
    })
  }

  bin (latlng) {
    return this.children.filter(c => c.inside(latlng))
  }

  update (latlng, weight) {
    this.bin(latlng).forEach(c => {
      c.state = this._updaters.reduce((nextState, fn) => {
        return Object.assign(nextState, fn(weight, c.state))
      }, {})
    })
    return this
  }

  getStat (stat) {
    const [changed, unchanged] = partition(this.children,
      c => !isEqual(this._defaultState, c.state))
    const listedValues = []
    const values = changed.reduce((stats, c) => {
      const value = this._stats[stat](c.state)
      listedValues.push(value)
      return Object.assign(stats, {[c.key]: value})
    }, {})
    return {
      stat,
      values,
      unchanged: unchanged.map(c => c.key),
      min: minBy(listedValues),
      max: maxBy(listedValues)
    }
  }

  initializeRenderer (defaultStyle = {}, addonStyle = {}) {
    if (!google) throw new Error('Google Maps not loaded')

    this.mapData = new google.maps.Data({
      style: feature => {
        const styleOptions = Object.assign({}, defaultStyle)
        const color = feature.getProperty('color')
        if (color) Object.assign(styleOptions, addonStyle, {fillColor: color})
        return styleOptions
      }
    })
    this.children.forEach(c => {
      this.mapData.add({
        id: c.key,
        geometry: c.getPolygon(),
        properties: {
          color: null,
          meta: c.meta,
          center: c.center
        }
      })
    })

    return this.mapData
  }

  render (stat, colorScale) {
    if (!this.mapData) throw new Error('Renderer has not been initialized')

    const {values: statValues, unchanged} = this.getStat(stat)
    Object.keys(statValues).forEach(key => {
      const color = colorScale(statValues[key])
      this.mapData.getFeatureById(key).setProperty('color', color)
    })
    unchanged.forEach(key => {
      this.mapData.getFeatureById(key).setProperty('color', null)
    })
  }

  clone (includeState = false) {
    const cloned = new SgHeatmap(this.children)
    cloned._updaters = [...this._updaters]
    cloned._stats = {...this._stats}
    if (includeState) {
      cloned._defaultState = this.defaultState
    } else {
      cloned.children.forEach(c => {
        c.state = {}
      })
    }
    return cloned
  }

  serialize (includeState = false) {
    return '[' + this.children.map(c => c.serialize(includeState)).join(',') + ']'
  }
}

export class MapRegion {
  constructor (data) {
    const _data = typeof data === 'string' ? JSON.parse(data) : data

    this.key = _data.key
    this.meta = cloneDeep(_data.meta)
    this.center = cloneDeep(_data.center)

    this.boundary = _data.boundary.map(b => {
      const boundary = {}
      boundary.outer = (typeof b.outer === 'string')
        ? decodePolyline(b.outer) : cloneDeep(b.outer)
      boundary.inners = b.inners && b.inners.map(inner => (
        (typeof inner === 'string') ? decodePolyline(inner) : cloneDeep(inner)
      ))
      boundary.bounds = b.bounds ? cloneDeep(b.bounds) : {
        sw: [
          minBy(boundary.outer, (v) => v[0])[0],
          minBy(boundary.outer, (v) => v[1])[1]
        ],
        ne: [
          maxBy(boundary.outer, (v) => v[0])[0],
          maxBy(boundary.outer, (v) => v[1])[1]
        ]
      }
      return boundary
    })

    this.state = _data.state ? cloneDeep(_data.state) : {}
  }

  inside (latlng) {
    const [lat, lng] = latlng
    if (this.boundary.every(b => (
      (lat < b.bounds.sw[0]) ||
      (lat > b.bounds.ne[0]) ||
      (lng < b.bounds.sw[1]) ||
      (lng > b.bounds.ne[1])
    ))) return false
    return this.boundary.some(b => inside([lat, lng], b.outer))
  }

  getPolygon () {
    if (this.polygon) return this.polygon
    this.polygon = new google.maps.Data.MultiPolygon(this.boundary.map(b => {
      const polygon = []
      polygon.push(b.outer.map(latlng => new google.maps.LatLng(...latlng)))
      if (b.inners) {
        b.inners.forEach(inner => {
          polygon.push(inner.map(latlng => new google.maps.LatLng(...latlng)))
        })
      }
      return polygon
    }))
    return this.polygon
  }

  serialize (includeState = false) {
    let {key, meta, center, boundary, state} = this
    boundary = boundary.map(b => {
      const _boundary = {}
      _boundary.outer = encodePolyline(b.outer)
      _boundary.inners = b.inners && b.inners.map(encodePolyline)
      _boundary.bounds = b.bounds
      return _boundary
    })
    if (!includeState) state = {}
    return JSON.stringify({key, meta, center, boundary, state})
  }
}
