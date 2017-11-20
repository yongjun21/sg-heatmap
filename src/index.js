import minBy from 'lodash/minBy'
import maxBy from 'lodash/maxBy'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import partition from 'lodash/partition'
import {encodePolyline, inside, toLinearRing} from './helpers/geometry'

export default class SgHeatmap {
  constructor (data) {
    const _data = typeof data === 'string' ? JSON.parse(data) : data
    if (!(_data instanceof Array)) throw new Error('Expects an array of feature objects')
    this.children = _data.map(f => new Feature(f))
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

  bin (lnglat) {
    return this.children.filter(c => c.inside(lnglat))
  }

  update (lnglat, weight) {
    this.bin(lnglat).forEach(c => {
      c.state = this._updaters.reduce((nextState, fn) => {
        return Object.assign(nextState, fn(weight, c.state))
      }, {})
    })
    return this
  }

  getStat (stat) {
    const fn = typeof stat === 'function' ? stat : this._stats[stat]
    const [changed, unchanged] = partition(this.children,
      c => !isEqual(this._defaultState, c.state))
    const listedValues = []
    const values = changed.reduce((stats, c) => {
      const value = fn(c.state, c.properties)
      listedValues.push(value)
      return Object.assign(stats, {[c.id]: value})
    }, {})
    return {
      stat,
      values,
      unchanged: unchanged.map(c => c.id),
      min: minBy(listedValues),
      max: maxBy(listedValues)
    }
  }

  initializeRenderer (colorScale, defaultStyle = {}, addonStyle = {}) {
    if (!window) throw new Error('Method initializeRenderer should only be called browser-side')
    if (!window.google) throw new Error('Google Maps not loaded')
    if ('renderer' in this) {
      console.log('Existing renderer replaced')
      this.renderer.setMap(null)
    }

    this.colorScale = colorScale

    this.renderer = new window.google.maps.Data({
      style: feature => {
        const styleOptions = Object.assign({}, defaultStyle)
        const color = feature.getProperty('color')
        if (color) Object.assign(styleOptions, addonStyle, {fillColor: color})
        return styleOptions
      }
    })
    this.children.forEach(c => {
      this.renderer.addGeoJson({
        id: c.id,
        type: 'Feature',
        geometry: c.geometry,
        properties: Object.assign({color: null}, c.properties)
      })
    })

    return this.renderer
  }

  render (stat, options = {}) {
    if (!this.renderer) throw new Error('Renderer has not been initialized')

    const {values: statValues, unchanged, min, max} = this.getStat(stat)

    const domain = options.domain || [min, max]
    function normalize (value) {
      return (value - domain[0]) / (domain[1] - domain[0])
    }

    Object.keys(statValues).forEach(key => {
      const normalized = normalize(statValues[key])
      const transformed = Math.pow(normalized, options.transform || 1)
      const color = this.colorScale(transformed)
      this.renderer.getFeatureById(key).setProperty('color', color)
    })
    unchanged.forEach(key => {
      this.renderer.getFeatureById(key).setProperty('color', null)
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

export class Feature {
  constructor (data) {
    if (!('id' in data)) throw new Error('Feature object requires id')
    if (!('geometry' in data)) throw new Error('Geometry not specified in feature object')
    this.type = 'Feature'
    this.id = data.id
    this.properties = data.properties ? cloneDeep(data.properties) : {}

    this.geometry = {}
    this.geometry.type = data.geometry.type
    if (this.geometry.type === 'Polygon') {
      this.geometry.coordinates = data.geometry.coordinates.map(toLinearRing)
      this.geometry.bbox = ('bbox' in data.geometry) ? cloneDeep(data.geometry.bbox) : [
        minBy(this.geometry.coordinates[0], (v) => v[0])[0],
        minBy(this.geometry.coordinates[0], (v) => v[1])[1],
        maxBy(this.geometry.coordinates[0], (v) => v[0])[0],
        maxBy(this.geometry.coordinates[0], (v) => v[1])[1]
      ]
    } else if (this.geometry.type === 'MultiPolygon') {
      this.geometry.coordinates = data.geometry.coordinates
        .map(polygon => polygon.map(toLinearRing))
      if ('bbox' in data.geometry) {
        this.geometry.bbox = cloneDeep(data.geometry.bbox)
      } else {
        const bboxs = this.geometry.coordinates.map(polygon => ([
          minBy(polygon[0], (v) => v[0])[0],
          minBy(polygon[0], (v) => v[1])[1],
          maxBy(polygon[0], (v) => v[0])[0],
          maxBy(polygon[0], (v) => v[1])[1]
        ]))
        this.geometry.bbox = [
          minBy(bboxs, (v) => v[0])[0],
          minBy(bboxs, (v) => v[1])[1],
          maxBy(bboxs, (v) => v[2])[2],
          maxBy(bboxs, (v) => v[3])[3]
        ]
      }
    } else {
      throw new Error('Feature geometry must be of type Polygon or MultiPolygon')
    }

    this.state = ('state' in data) ? cloneDeep(data.state) : {}
  }

  inside (location) {
    const [lng, lat] = location

    if (lng < this.geometry.bbox[0]) return false
    if (lat < this.geometry.bbox[1]) return false
    if (lng > this.geometry.bbox[2]) return false
    if (lat > this.geometry.bbox[3]) return false

    if (this.geometry.type === 'Polygon') {
      return inside([lng, lat], this.geometry.coordinates[0])
    } else {
      return this.geometry.coordinates
        .some(polygon => inside([lng, lat], polygon[0]))
    }
  }

  serialize (includeState = false) {
    const {id, properties, geometry, state} = this
    const _geometry = {
      type: geometry.type,
      bbox: geometry.bbox,
      coordinates: geometry.type === 'Polygon'
        ? geometry.coordinates.map(encodePolyline)
        : geometry.coordinates.map(polygon => polygon.map(encodePolyline))
    }
    const _state = includeState ? state : {}
    return JSON.stringify({id, properties, geometry: _geometry, state: _state})
  }
}
