import sortBy from 'lodash/sortBy'

// UPDATERS

/* eslint-disable camelcase */
export function updater_HISTORY (newValue, state) {
  return {_history: state._history.concat([newValue])}
}

export function updater_LATEST (newValue, state) {
  return {_latest: newValue}
}

export function updater_COUNT (newValue, state) {
  return {_count: state._count + 1}
}

export function updater_SUM (newValue, state) {
  return {_sum: state._sum + newValue}
}

export function updater_SUMSQ (newValue, state) {
  return {_sumsq: state._sumsq + newValue * newValue}
}

export function updater_MIN (newValue, state) {
  return {_min: Math.min(state._min, newValue)}
}

export function updater_MAX (newValue, state) {
  return {_max: Math.max(state._max, newValue)}
}

// STAT functions

export function stat_HISTORY (state) {
  return state._history
}

export function stat_LATEST (state) {
  return state._latest
}

export function stat_COUNT (state) {
  return state._count
}

export function stat_SUM (state) {
  return state._sum
}

export function stat_MEAN (state) {
  if (state._count < 1) return null
  return state._sum / state._count
}

export function stat_VARIANCE (state) {
  if (state._count < 2) return null
  return (state._sumsq - state._sum * state._sum / state._count) / (state._count - 1)
}

export function stat_STDEV (state) {
  if (state._count < 2) return null
  return Math.sqrt(stat_VARIANCE(state))
}

export function stat_MIN (state) {
  return state._min
}

export function stat_MAX (state) {
  return state._max
}

export function stat_MEDIAN (state) {
  if (state._history.length < 1) return null
  const sorted = sortBy(state._history)
  const midpoint = sorted.length / 2
  if (sorted.length % 2 === 1) return sorted[midpoint - 0.5]
  else return (sorted[midpoint - 1] + sorted[midpoint]) / 2
}

export function stat_PERCENTILE (state, payload) {
  if (payload <= 0 || payload > 1) return null
  if (state._history.length < 1) return null
  const sorted = sortBy(state._history)
  const index = Math.ceil(state._history.length * payload)
  return sorted[index - 1]
}

// REGISTER functions

export function register_HISTORY (heatmap) {
  return heatmap
    .setDefaultState('_history', [])
    .registerUpdater(updater_HISTORY)
    .registerStat('history', stat_LATEST)
}

export function register_LATEST (heatmap) {
  return heatmap
    .setDefaultState('_latest', null)
    .registerUpdater(updater_LATEST)
    .registerStat('latest', stat_LATEST)
}

export function register_COUNT (heatmap) {
  return heatmap
    .setDefaultState('_count', 0)
    .registerUpdater(updater_COUNT)
    .registerStat('count', stat_COUNT)
}

export function register_SUM (heatmap) {
  return heatmap
    .setDefaultState('_sum', 0)
    .registerUpdater(updater_SUM)
    .registerStat('sum', stat_SUM)
}

export function register_MEAN (heatmap) {
  return heatmap
    .setDefaultState('_sum', 0)
    .setDefaultState('_count', 0)
    .registerUpdater(updater_SUM)
    .registerUpdater(updater_COUNT)
    .registerStat('mean', stat_MEAN)
}

export function register_VARIANCE (heatmap) {
  return heatmap
    .setDefaultState('_sumsq', 0)
    .setDefaultState('_sum', 0)
    .setDefaultState('_count', 0)
    .registerUpdater(updater_SUMSQ)
    .registerUpdater(updater_SUM)
    .registerUpdater(updater_COUNT)
    .registerStat('variance', stat_VARIANCE)
}

export function register_STDEV (heatmap) {
  return heatmap
    .setDefaultState('_sumsq', 0)
    .setDefaultState('_sum', 0)
    .setDefaultState('_count', 0)
    .registerUpdater(updater_SUMSQ)
    .registerUpdater(updater_SUM)
    .registerUpdater(updater_COUNT)
    .registerStat('stdev', stat_STDEV)
}

export function register_MIN (heatmap) {
  return heatmap
    .setDefaultState('_min', Number.MAX_VALUE)
    .registerUpdater(updater_MIN)
    .registerStat('min', stat_MIN)
}

export function register_MAX (heatmap) {
  return heatmap
    .setDefaultState('_max', Number.MIN_VALUE)
    .registerUpdater(updater_MAX)
    .registerStat('max', stat_MAX)
}

export function register_MEDIAN (heatmap) {
  return heatmap
    .setDefaultState('_history', [])
    .registerUpdater(updater_HISTORY)
    .registerStat('median', stat_MEDIAN)
}

export function register_PERCENTILEd (heatmap) {
  return heatmap
    .setDefaultState('_history', [])
    .registerUpdater(updater_HISTORY)
    .registerStat('percentile', stat_PERCENTILE)
}
/* eslint-enable camelcase */

// INSIDE overrides

export function insideByKey (heatmap) {
  function inside (keys) {
    return keys.indexOf(this.id) >= 0
  }
  heatmap.bin = function (keys) {
    return heatmap.children.filter(c => inside.call(c, keys))
  }
}
