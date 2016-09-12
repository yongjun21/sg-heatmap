import SgHeatmap from '../index'
import region from '../../data/region.json'

export default class extends SgHeatmap {
  constructor () {
    super(region)
  }
}
