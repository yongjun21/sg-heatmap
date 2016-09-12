import SgHeatmap from '../index'
import planningArea from '../../data/planning_area.json'

export default class extends SgHeatmap {
  constructor () {
    super(planningArea)
  }
}
