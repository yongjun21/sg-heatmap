export default function supportLeaflet (heatmap) {
  function initializeRenderer (colorScale, defaultStyle = {}, addonStyle = {}) {
    if (!window) throw new Error('Method initializeRenderer should only be called browser-side')
    if (!window.L) throw new Error('Leaflet not loaded')
    if ('renderer' in this) {
      console.log('Existing renderer replaced')
      this.renderer.remove()
    }

    this.colorScale = colorScale

    this.renderer = window.L.geoJSON(null, {
      style: feature => {
        const styleOptions = Object.assign({}, defaultStyle)
        const color = feature.properties.color
        if (color) Object.assign(styleOptions, addonStyle, {fillColor: color})
        return styleOptions
      }
    }).addData(this.children.map(c => ({
      id: c.id,
      type: 'Feature',
      geometry: c.geometry,
      properties: Object.assign({color: null}, c.properties)
    })))

    return this.renderer
  }

  function render (stat, options = {}) {
    if (!this.renderer) throw new Error('Renderer has not been initialized')

    const {values: statValues, min, max} = this.getStat(stat)
    const domain = options.domain || [min, max]
    function normalize (value) {
      return (value - domain[0]) / (domain[1] - domain[0])
    }

    this.renderer.eachLayer(layer => {
      const key = layer.feature.id
      if (key in statValues) {
        const normalized = normalize(statValues[key])
        const transformed = Math.pow(normalized, options.transform || 1)
        layer.feature.properties.color = this.colorScale(transformed)
      } else {
        layer.feature.properties.color = null
      }
      this.renderer.resetStyle(layer)
    })
  }

  heatmap.initializeRenderer = initializeRenderer.bind(heatmap)
  heatmap.render = render.bind(heatmap)
}
