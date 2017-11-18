import polyline from '@mapbox/polyline'
import cloneDeep from 'lodash/cloneDeep'
import SVY21 from './svy21'

const PRECISION = 7

const svy21 = new SVY21()

/* eslint-disable camelcase */
export function inside ([lng, lat], polyline) {
  let isInside = false
  for (let i = 1; i < polyline.length; i++) {
    const deltaY_plus = polyline[i][1] - lat
    const deltaY_minus = lat - polyline[i - 1][1]
    if (deltaY_plus > 0 && deltaY_minus <= 0) continue
    if (deltaY_plus < 0 && deltaY_minus >= 0) continue
    const deltaX = (deltaY_plus * polyline[i - 1][0] + deltaY_minus * polyline[i][0]) /
      (deltaY_plus + deltaY_minus) - lng
    if (deltaX <= 0) continue
    isInside = !isInside
  }
  return isInside
}
/* eslint-enable camelcase */

export function encodePolyline (arr) {
  return polyline.encode(arr, PRECISION)
}

export function decodePolyline (str) {
  return polyline.decode(str, PRECISION).map(([lng, lat]) => ([
    Math.round(lng * Math.pow(10, PRECISION - 2)) / Math.pow(10, PRECISION - 2),
    Math.round(lat * Math.pow(10, PRECISION - 2)) / Math.pow(10, PRECISION - 2)
  ]))
}

export function fromSVY21 ([X, Y]) {
  const {lat, lon} = svy21.computeLatLon(Y, X)
  return [lon, lat]
}

export function toSVY21 ([lon, lat]) {
  const {N: Y, E: X} = svy21.computeSVY21(lat, lon)
  return [X, Y]
}

export function toLinearRing (polyline) {
  const linearRing = (typeof polyline === 'string')
    ? decodePolyline(polyline) : cloneDeep(polyline)
  const firstPoint = linearRing[0]
  const lastPoint = linearRing[linearRing.length - 1]
  if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
    linearRing.push(firstPoint)
  }
  return linearRing
}

export function disjointBbox (a, b) {
  if (a[0] < b[0] && a[2] < b[0]) return true
  if (a[0] > b[2] && a[2] > b[2]) return true
  if (a[1] < b[1] && a[3] < b[1]) return true
  if (a[1] > b[3] && a[3] > b[3]) return true
  return false
}
