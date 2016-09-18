import chroma from 'chroma-js'

export default function colorScale (colorArray, options = {}) {
  Object.assign({
    domain: [0, 1],
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
    const relativeValue = (value - options.domain[0]) /
      (options.domain[1] - options.domain[0])
    return scale(Math.pow(relativeValue, options.transform)).css()
  }
}

export function BuGn (domain, transform) {
  return colorScale('BuGn', {domain, transform, correctLightness: false})
}

export function BuPu (domain, transform) {
  return colorScale('BuPu', {domain, transform, correctLightness: false})
}

export function GnBu (domain, transform) {
  return colorScale('GnBu', {domain, transform, correctLightness: false})
}

export function OrRd (domain, transform) {
  return colorScale('OrRd', {domain, transform, correctLightness: false})
}

export function PuBu (domain, transform) {
  return colorScale('PuBu', {domain, transform, correctLightness: false})
}

export function PuBuGn (domain, transform) {
  return colorScale('PuBuGn', {domain, transform, correctLightness: false})
}

export function PuRd (domain, transform) {
  return colorScale('PuRd', {domain, transform, correctLightness: false})
}

export function RdPu (domain, transform) {
  return colorScale('RdPu', {domain, transform, correctLightness: false})
}

export function YlGn (domain, transform) {
  return colorScale('YlGn', {domain, transform, correctLightness: false})
}

export function YlGnBu (domain, transform) {
  return colorScale('YlGnBu', {domain, transform, correctLightness: false})
}

export function YlOrBr (domain, transform) {
  return colorScale('YlOrBr', {domain, transform, correctLightness: false})
}

export function YlOrRd (domain, transform) {
  return colorScale('YlOrRd', {domain, transform, correctLightness: false})
}

export function Blues (domain, transform) {
  return colorScale('Blues', {domain, transform, correctLightness: false})
}

export function Greens (domain, transform) {
  return colorScale('Greens', {domain, transform, correctLightness: false})
}

export function Greys (domain, transform) {
  return colorScale('Greys', {domain, transform, correctLightness: false})
}

export function Oranges (domain, transform) {
  return colorScale('Oranges', {domain, transform, correctLightness: false})
}

export function Purples (domain, transform) {
  return colorScale('Purples', {domain, transform, correctLightness: false})
}

export function Reds (domain, transform) {
  return colorScale('Reds', {domain, transform, correctLightness: false})
}

export function BrBG (domain, transform) {
  return colorScale('BrBG', {domain, transform, correctLightness: false})
}

export function PiYG (domain, transform) {
  return colorScale('PiYG', {domain, transform, correctLightness: false})
}

export function PRGn (domain, transform) {
  return colorScale('PRGn', {domain, transform, correctLightness: false})
}

export function PuOr (domain, transform) {
  return colorScale('PuOr', {domain, transform, correctLightness: false})
}

export function RdBu (domain, transform) {
  return colorScale('RdBu', {domain, transform, correctLightness: false})
}

export function RdGy (domain, transform) {
  return colorScale('RdGy', {domain, transform, correctLightness: false})
}

export function RdYlBu (domain, transform) {
  return colorScale('RdYlBu', {domain, transform, correctLightness: false})
}

export function RdYlGn (domain, transform) {
  return colorScale('RdYlGn', {domain, transform, correctLightness: false})
}

export function Spectral (domain, transform) {
  return colorScale('Spectral', {domain, transform, correctLightness: false})
}
