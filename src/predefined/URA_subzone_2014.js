import SgHeatmap from '../index'
import subzone from '../../data/subzone_2014.json'

export default class extends SgHeatmap {
  constructor () {
    super(subzone)
  }
}
