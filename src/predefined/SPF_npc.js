import SgHeatmap from '../index'
import npcBoundary from '../../data/npc.json'

export default class extends SgHeatmap {
  constructor () {
    super(npcBoundary)
  }
}
