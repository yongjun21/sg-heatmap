import SgHeatmap from '../index'
import planningArea from '../../data/planning_area_2014.json'

export default class extends SgHeatmap {
  constructor () {
    super(planningArea)
  }
}
