import chroma from 'chroma-js'

export default function getColorScale (colorArray, options = {}) {
  Object.assign({
    bezierInterpolate: false,
    correctLightness: true,
    interpolationMode: 'lab'
  }, options)
  let scale = options.bezierInterpolate
    ? chroma.bezier(colorArray).scale()
    : chroma.scale(colorArray).mode(options.interpolationMode)
  if (options.correctLightness) scale = scale.correctLightness()
  return (value) => {
    return scale(value).css()
  }
}

export function optimizePointSpread (stat, options) {
  options = Object.assign({
    epsilon: 0.000001,
    gamma: 0.3,
    maxIteration: 300
  }, options)

  const {values, min, max} = stat
  const domain = options.domain || [min, max]
  const v = Object.keys(values).map(key => (values[key] - domain[0]) / (domain[1] - domain[0]))
  v.sort((a, b) => a - b)

  let k = 1
  const kHistory = []
  const scoreHistory = []

  while (kHistory.length < options.maxIteration) {
    const vk = v.map(item => Math.pow(item, k))
    const lnV = v.map(item => item ? Math.log(item) : 0)
    const deltaVk = []
    const deltalnVvk = []
    for (let i = 1; i < v.length; i++) {
      deltaVk.push(vk[i] - vk[i - 1])
      deltalnVvk.push(lnV[i] * vk[i] - lnV[i - 1] * vk[i - 1])
    }

    const beta = deltaVk.reduce((sum, dVk, i) => {
      return sum + 2 * dVk * deltalnVvk[i]
    }, 0)

    const score = deltaVk.reduce((sum, dVn) => {
      return sum + Math.pow(dVn, 2)
    }, 0)

    kHistory.push(k)
    scoreHistory.push(score)
    k = Math.exp(Math.log(k) - options.gamma * beta * k)

    if (scoreHistory.length >= 2) {
      const [prevScore, lastScore] = scoreHistory.slice(-2)
      if (Math.abs(lastScore - prevScore) < options.epsilon) break
    }
  }

  return {domain, transform: k, kHistory, scoreHistory}
}

export function BuGn () {
  return getColorScale('BuGn', {correctLightness: false})
}

export function BuPu () {
  return getColorScale('BuPu', {correctLightness: false})
}

export function GnBu () {
  return getColorScale('GnBu', {correctLightness: false})
}

export function OrRd () {
  return getColorScale('OrRd', {correctLightness: false})
}

export function PuBu () {
  return getColorScale('PuBu', {correctLightness: false})
}

export function PuBuGn () {
  return getColorScale('PuBuGn', {correctLightness: false})
}

export function PuRd () {
  return getColorScale('PuRd', {correctLightness: false})
}

export function RdPu () {
  return getColorScale('RdPu', {correctLightness: false})
}

export function YlGn () {
  return getColorScale('YlGn', {correctLightness: false})
}

export function YlGnBu () {
  return getColorScale('YlGnBu', {correctLightness: false})
}

export function YlOrBr () {
  return getColorScale('YlOrBr', {correctLightness: false})
}

export function YlOrRd () {
  return getColorScale('YlOrRd', {correctLightness: false})
}

export function Blues () {
  return getColorScale('Blues', {correctLightness: false})
}

export function Greens () {
  return getColorScale('Greens', {correctLightness: false})
}

export function Greys () {
  return getColorScale('Greys', {correctLightness: false})
}

export function Oranges () {
  return getColorScale('Oranges', {correctLightness: false})
}

export function Purples () {
  return getColorScale('Purples', {correctLightness: false})
}

export function Reds () {
  return getColorScale('Reds', {correctLightness: false})
}

export function BrBG () {
  return getColorScale('BrBG', {correctLightness: false})
}

export function PiYG () {
  return getColorScale('PiYG', {correctLightness: false})
}

export function PRGn () {
  return getColorScale('PRGn', {correctLightness: false})
}

export function PuOr () {
  return getColorScale('PuOr', {correctLightness: false})
}

export function RdBu () {
  return getColorScale('RdBu', {correctLightness: false})
}

export function RdGy () {
  return getColorScale('RdGy', {correctLightness: false})
}

export function RdYlBu () {
  return getColorScale('RdYlBu', {correctLightness: false})
}

export function RdYlGn () {
  return getColorScale('RdYlGn', {correctLightness: false})
}

export function Spectral () {
  return getColorScale('Spectral', {correctLightness: false})
}
