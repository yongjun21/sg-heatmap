import SgHeatmap from '../index'
import subzone from '../../data/subzone_mp08.json'

export default class extends SgHeatmap {
  constructor () {
    super(subzone)
  }
}
