import SgHeatmap from '../index'
import region from '../../data/region_mp98.json'

export default class extends SgHeatmap {
  constructor () {
    super(region)
  }
}
