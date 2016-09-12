import SgHeatmap from '../index'
import subzone from '../../data/subzone.json'

export default class extends SgHeatmap {
  constructor () {
    super(subzone)
  }
}
