import fs from 'fs'
import xml2js from 'xml2js'
import {html2json as htmlParser} from 'html2json'
import {maxBy, minBy} from 'lodash'
import {encodePolyline, fromSVY21} from './helpers/geometry'

const kmlParser = new xml2js.Parser({explicitArray: false})

const kmls = {
  region: 'MP14_REGION_NO_SEA_PL.kml',
  planning_area: 'MP14_PLNG_AREA_NO_SEA_PL.kml',
  subzone: 'MP14_SUBZONE_NO_SEA_PL.kml'
}

Object.keys(kmls).forEach(layer => {
  const data = fs.readFileSync(`data/raw/${kmls[layer]}`)

  kmlParser.parseString(data, (err, result) => {
    if (err) console.error(err)
    let parsed = result.kml.Document.Folder.Placemark
    fs.writeFileSync(`data/semi/${layer}_raw.json`, JSON.stringify(parsed))
    const cleaned = parsed.map(area => {
      let meta = area.description.replace(/\r?\n|\r/g, '')
      meta = htmlParser(meta)
        .child[0].child
        .find(({node, tag}) => node === 'element' && tag === 'body').child
        .find(({node, tag}) => node === 'element' && tag === 'table')
        .child[1].child[0].child[0].child
        .reduce((tb, tr) => {
          const key = tr.child[0].child[0].text.replace(/ /g, '_')
          const value = tr.child[1].child[0].text
          tb[key] = value
          return tb
        }, {})
      const center = fromSVY21(meta.X_ADDR, meta.Y_ADDR)
      const polygons = area.MultiGeometry.Polygon
      const boundary = polygons instanceof Array
        ? polygons.map(formatPolygon) : [formatPolygon(polygons)]
      const key = meta.Subzone_Code || meta.Planning_Area_Code || meta.Region_Code
      return {key, meta, center, boundary}
    })
    fs.writeFileSync(`data/${layer}.json`, JSON.stringify(cleaned))
  })
})

function formatPolygon (polygon) {
  const {outerBoundaryIs, innerBoundaryIs} = polygon
  const result = {}
  result.outer = formatLatLng(outerBoundaryIs.LinearRing.coordinates)
  result.bounds = {
    sw: [
      minBy(result.outer, (v) => v[0])[0],
      minBy(result.outer, (v) => v[1])[1]
    ],
    ne: [
      maxBy(result.outer, (v) => v[0])[0],
      maxBy(result.outer, (v) => v[1])[1]
    ]
  }
  result.outer = encodePolyline(result.outer)
  if (innerBoundaryIs) {
    result.inners = innerBoundaryIs instanceof Array
      ? innerBoundaryIs.map(b => formatLatLng(b.LinearRing.coordinates))
      : [formatLatLng(innerBoundaryIs.LinearRing.coordinates)]
    result.inners = result.inners.map((v) => encodePolyline(v))
  }
  return result
}

function formatLatLng (str) {
  return str.trim().split(' ').map(substr => {
    const xyz = substr.split(',')
    return [+xyz[1], +xyz[0]]
  })
}
