export default function supportLeaflet (heatmap) {
  function initializeRenderer (defaultStyle = {}, addonStyle = {}) {
    if (!window) throw new Error('Method initializeRenderer should only be called browser-side')
    if (!window.L) throw new Error('Leaflet not loaded')
    if ('renderer' in this) {
      console.log('Existing renderer replaced')
      this.renderer.setMap(null)
    }

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

  function render (stat, colorScale) {
    if (!this.renderer) throw new Error('Renderer has not been initialized')

    const statValues = this.getStat(stat).values
    this.renderer.eachLayer(layer => {
      const value = statValues[layer.feature.id] || null
      const color = colorScale(value)
      layer.feature.properties.color = color
      this.renderer.resetStyle(layer)
    })
  }

  heatmap.initializeRenderer = initializeRenderer.bind(heatmap)
  heatmap.render = render.bind(heatmap)
}
