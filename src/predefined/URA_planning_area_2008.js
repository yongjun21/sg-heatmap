import SgHeatmap from '../index'
import planningArea from '../../data/planning_area_2008.json'

export default class extends SgHeatmap {
  constructor () {
    super(planningArea)
  }
}
