import SgHeatmap from '../index'
import subzone from '../../data/subzone_mp98.json'

export default class extends SgHeatmap {
  constructor () {
    super(subzone)
  }
}
