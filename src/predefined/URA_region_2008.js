import SgHeatmap from '../index'
import region from '../../data/region_2008.json'

export default class extends SgHeatmap {
  constructor () {
    super(region)
  }
}
