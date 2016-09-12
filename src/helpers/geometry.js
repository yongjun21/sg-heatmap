/* eslint-disable camelcase */
import polyline from 'polyline'
import proj4 from 'proj4'

const PRECISION = 7

const SVY21 = '+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs'
const SVY21proj = proj4('WGS84', SVY21)

export function inside ([lat, lng], polyline) {
  let isInside = false
  for (let i = 1; i < polyline.length; i++) {
    const deltaY_plus = polyline[i][0] - lat
    const deltaY_minus = lat - polyline[i - 1][0]
    if (deltaY_plus > 0 && deltaY_minus <= 0) continue
    if (deltaY_plus <= 0 && deltaY_minus > 0) continue
    const deltaX = (deltaY_plus * polyline[i - 1][1] + deltaY_minus * polyline[i][1]) /
      (deltaY_plus + deltaY_minus) - lng
    if (deltaX <= 0) continue
    isInside = !isInside
  }
  return isInside
}

export function encodePolyline (arr) {
  return polyline.encode(arr, PRECISION)
}

export function decodePolyline (str) {
  return polyline.decode(str, PRECISION).map(([lat, lng]) => ([
    Math.round(lat * 100000) / 100000,
    Math.round(lng * 100000) / 100000
  ]))
}

export function fromSVY21 (x, y) {
  const [lng, lat] = SVY21proj.inverse([x, y])
  return [lat, lng]
}

/* eslint-enable camelcase */
