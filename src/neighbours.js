import SgHeatmap from './index'
import fs from 'fs'

const filenames = [
  'npc.json',
  'planning_area_mp98.json',
  'planning_area_mp08.json',
  'planning_area_mp14.json',
  'subzone_mp98.json',
  'subzone_mp08.json',
  'subzone_mp14.json'
]

filenames.forEach(filename => {
  const geojson = require('../data/' + filename)
  const heatmap = new SgHeatmap(geojson)

  heatmap.children.forEach(c => {
    const linearRings = c.geometry.type === 'MultiPolygon' ? [].concat(...c.geometry.coordinates) : c.geometry.coordinates
    c.points = [].concat(...linearRings)
  })

  heatmap.children.forEach(c => {
    const target = geojson.find(g => g.id === c.id)
    target.properties.neighbours = heatmap.children.filter(neighbour => {
      if (c.id === neighbour.id) return false
      return neighbour.points.some(point =>
        c.points.findIndex(pt => point[0] === pt[0] && point[1] === pt[1]) > -1)
    }).map(c => c.id)
  })

  fs.writeFileSync('data/tmp/' + filename, JSON.stringify(geojson))
})
