import SgHeatmap from '../index'
import region from '../../data/region_mp14.json'

export default class extends SgHeatmap {
  constructor () {
    super(region)
  }
}
