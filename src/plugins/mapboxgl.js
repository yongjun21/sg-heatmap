import _pick from 'lodash/pick'

export default function supportMapboxGL (heatmap) {
  function initializeRenderer (map, colorScale, defaultStyle = {}, addonStyle = {}) {
    if (!window) throw new Error('Method initializeRenderer should only be called browser-side')
    if (!window.mapboxgl) throw new Error('MapboxGL not loaded')
    if ('renderer' in this) {
      console.log('Existing renderer replaced')
      this.renderer.remove()
    }

    this.colorScale = colorScale

    let id
    do {
      id = randomHash(8)
    } while (map.getSource(id) || map.getLayer(id + '-default') || map.getLayer(id))

    const data = {
      type: 'FeatureCollection',
      features: this.children.map(c => ({
        id: c.id,
        type: 'Feature',
        geometry: c.geometry,
        properties: Object.assign({}, c.properties)
      }))
    }

    map.addSource(id, {type: 'geojson', data})

    map.addLayer({
      id: id + '-fill-default',
      source: id,
      type: 'fill',
      filter: ['!has', 'color'],
      paint: Object.assign(
        _pick(defaultStyle, ['fill-color', 'fill-opacity'])
      )
    })

    map.addLayer({
      id: id + '-line-default',
      source: id,
      type: 'line',
      filter: ['!has', 'color'],
      paint: Object.assign(
        _pick(defaultStyle, ['line-width', 'line-color', 'line-opacity'])
      )
    })

    map.addLayer({
      id: id + '-fill',
      source: id,
      type: 'fill',
      filter: ['has', 'color'],
      paint: Object.assign(
        _pick(defaultStyle, ['fill-color', 'fill-opacity']),
        _pick(addonStyle, ['fill-opacity']),
        {'fill-color': ['get', 'color']}
      )
    })

    map.addLayer({
      id: id + '-line',
      source: id,
      type: 'line',
      filter: ['has', 'color'],
      paint: Object.assign(
        _pick(defaultStyle, ['line-width', 'line-color', 'line-opacity']),
        _pick(addonStyle, ['line-width', 'line-color', 'line-opacity'])
      )
    })

    this.renderer = {
      layer: id,
      layers: [id + '-fill-default', id + '-line-default', id + '-fill', id + '-line'],
      get source () {
        return map.getSource(id)
      },
      remove () {
        this.layers.forEach(layer => {
          if (map.getLayer(layer)) map.removeLayer(layer)
        })
        if (map.getSource(id)) map.removeSource(id)
      }
    }
    return this.renderer
  }

  function render (stat, options = {}) {
    if (!this.renderer) throw new Error('Renderer has not been initialized')

    const colorScale = options.colorScale || this.colorScale

    const {values: statValues, min, max} = this.getStat(stat)

    const domain = options.domain || [min, max]
    function normalize (value) {
      return (value - domain[0]) / (domain[1] - domain[0])
    }

    const data = {
      type: 'FeatureCollection',
      features: this.children.map(c => {
        const key = c.id
        const properties = Object.assign({}, c.properties)
        if (key in statValues) {
          const normalized = normalize(statValues[key])
          const transformed = Math.pow(normalized, options.transform || 1)
          properties.color = colorScale(transformed)
        } else {
          delete properties.color
        }
        return {
          id: c.id,
          type: 'Feature',
          geometry: c.geometry,
          properties: properties
        }
      })
    }

    this.renderer.source.setData(data)
  }

  heatmap.initializeRenderer = initializeRenderer.bind(heatmap)
  heatmap.render = render.bind(heatmap)
}

function randomHash (len) {
  const zeroPad = '0'.repeat(len)
  return (Math.random().toString(36) + zeroPad).slice(2, len + 2)
}
