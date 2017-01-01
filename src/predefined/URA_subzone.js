import SgHeatmap from '../index'
import subzone from '../../data/subzone_mp14.json'

export default class extends SgHeatmap {
  constructor () {
    super(subzone)
  }
}
