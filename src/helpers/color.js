import chroma from 'chroma-js'

export default function getColorScale (colorArray, options = {}) {
  Object.assign({
    transform: 1,
    bezierInterpolate: false,
    correctLightness: true,
    interpolationMode: 'lab'
  }, options)
  let scale = options.bezierInterpolate
    ? chroma.bezier(colorArray).scale()
    : chroma.scale(colorArray).mode(options.interpolationMode)
  if (options.correctLightness) scale = scale.correctLightness()
  return (value) => {
    return scale(Math.pow(value, options.transform)).css()
  }
}

export function BuGn (transform = 1) {
  return getColorScale('BuGn', {transform, correctLightness: false})
}

export function BuPu (transform = 1) {
  return getColorScale('BuPu', {transform, correctLightness: false})
}

export function GnBu (transform = 1) {
  return getColorScale('GnBu', {transform, correctLightness: false})
}

export function OrRd (transform = 1) {
  return getColorScale('OrRd', {transform, correctLightness: false})
}

export function PuBu (transform = 1) {
  return getColorScale('PuBu', {transform, correctLightness: false})
}

export function PuBuGn (transform = 1) {
  return getColorScale('PuBuGn', {transform, correctLightness: false})
}

export function PuRd (transform = 1) {
  return getColorScale('PuRd', {transform, correctLightness: false})
}

export function RdPu (transform = 1) {
  return getColorScale('RdPu', {transform, correctLightness: false})
}

export function YlGn (transform = 1) {
  return getColorScale('YlGn', {transform, correctLightness: false})
}

export function YlGnBu (transform = 1) {
  return getColorScale('YlGnBu', {transform, correctLightness: false})
}

export function YlOrBr (transform = 1) {
  return getColorScale('YlOrBr', {transform, correctLightness: false})
}

export function YlOrRd (transform = 1) {
  return getColorScale('YlOrRd', {transform, correctLightness: false})
}

export function Blues (transform = 1) {
  return getColorScale('Blues', {transform, correctLightness: false})
}

export function Greens (transform = 1) {
  return getColorScale('Greens', {transform, correctLightness: false})
}

export function Greys (transform = 1) {
  return getColorScale('Greys', {transform, correctLightness: false})
}

export function Oranges (transform = 1) {
  return getColorScale('Oranges', {transform, correctLightness: false})
}

export function Purples (transform = 1) {
  return getColorScale('Purples', {transform, correctLightness: false})
}

export function Reds (transform = 1) {
  return getColorScale('Reds', {transform, correctLightness: false})
}

export function BrBG (transform = 1) {
  return getColorScale('BrBG', {transform, correctLightness: false})
}

export function PiYG (transform = 1) {
  return getColorScale('PiYG', {transform, correctLightness: false})
}

export function PRGn (transform = 1) {
  return getColorScale('PRGn', {transform, correctLightness: false})
}

export function PuOr (transform = 1) {
  return getColorScale('PuOr', {transform, correctLightness: false})
}

export function RdBu (transform = 1) {
  return getColorScale('RdBu', {transform, correctLightness: false})
}

export function RdGy (transform = 1) {
  return getColorScale('RdGy', {transform, correctLightness: false})
}

export function RdYlBu (transform = 1) {
  return getColorScale('RdYlBu', {transform, correctLightness: false})
}

export function RdYlGn (transform = 1) {
  return getColorScale('RdYlGn', {transform, correctLightness: false})
}

export function Spectral (transform = 1) {
  return getColorScale('Spectral', {transform, correctLightness: false})
}
