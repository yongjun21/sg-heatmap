import {encodePolyline, fromSVY21} from './helpers/geometry'
import fs from 'fs'

const filenames = {
  region_np14: 'mp14-region-no-sea-pl',
  planning_area_mp14: 'mp14-plng-area-no-sea-pl',
  subzone_mp14: 'mp14-subzone-no-sea-pl',
  region_mp08: 'mp08-region-no-sea-pl',
  planning_area_mp08: 'mp08-plng-area-no-sea-pl',
  subzone_mp08: 'mp08-subzone-no-sea-pl',
  region_mp98: 'mp98-region-no-sea-pl',
  // planning_area_mp98: 'mp98-plng-area-no-sea-pl',
  // subzone_mp98: 'mp98-subzone-no-sea-pl',
  npc: 'npc-boundary'
}

const propertiesMap = {
  'OBJECTID': 'OBJECTID',
  'SUBZONE_NO': 'Subzone_Number',
  'SUBZONE_N': 'Subzone_Name',
  'SUBZONE_C': 'Subzone_Code',
  'CA_IND': 'Central_Area_Indicator',
  'PLN_AREA_N': 'Planning_Area_Name',
  'PLN_AREA_C': 'Planning_Area_Code',
  'REGION_N': 'Region_Name',
  'REGION_C': 'Region_Code',
  'DIVISION': 'Division_Name',
  'DIV': 'Division_Code',
  'NPC_NAME': 'NPC_Name',
  'INC_CRC': 'INC_CRC',
  'FMEL_UPD_D': 'FMEL_UPD_D',
  'X_ADDR': 'X_ADDR',
  'Y_ADDR': 'Y_ADDR',
  'SHAPE_Leng': 'Shape_Length',
  'SHAPE_Area': 'Shape_Area'
}

Object.keys(filenames).forEach(layer => {
  const {features} = JSON.parse(fs.readFileSync(`data/raw/${filenames[layer]}.json`))
  features.forEach(f => {
    const properties = {}
    Object.keys(propertiesMap).forEach(prop => {
      if (prop in f.properties) {
        properties[propertiesMap[prop]] = f.properties[prop]
      }
    })
    properties.Address = layer === 'npc' ? [properties.X_ADDR, properties.Y_ADDR]
      : fromSVY21([properties.X_ADDR, properties.Y_ADDR])
    f.properties = properties
    f.id = properties.Subzone_Code ||
           properties.Planning_Area_Code ||
           properties.Region_Code ||
           (properties.NPC_Name && shortenNPC(properties.NPC_Name))

    if (f.geometry.type === 'Polygon') {
      f.geometry.coordinates = f.geometry.coordinates
        .map(encodePolyline)
    } else if (f.geometry.type === 'MultiPolygon') {
      f.geometry.coordinates = f.geometry.coordinates
        .map(polygon => polygon.map(encodePolyline))
    }
  })
  fs.writeFileSync(`data/${layer}.json`, JSON.stringify(features))
})

function shortenNPC (npcName) {
  return npcName.replace(/Neighbourhood Police Centre$/, 'NPC')
}
