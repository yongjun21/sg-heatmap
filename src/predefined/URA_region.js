import SgHeatmap from '../index'
import region from '../../data/region_2014.json'

export default class extends SgHeatmap {
  constructor () {
    super(region)
  }
}
