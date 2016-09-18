# sg-heatmap

Open-source all-in-one Swiss Army knife tool for creating Choropleth maps

![Sample](static/sample.png)

### Motivation

How do you generate a Choropleth map?

##### Step 1:
First get a bunch of polygons

![Areas](static/areas.png)

##### Step 2:
Then get a ton of location data points

![Points](static/points.png)

##### Step 3:
Assign each data point to an area (i.e. binning)

##### Step 4:
Aggregate the data points in each bin (area) with an aggregating function (eg. count, mean, median)

##### Step 5:
Map each bin's aggregated value to a color using a color scale

##### Step 6:
Render the colored polygons onto Google map

##### Step 7:
Received a new set of data points? Repeat Step 3 to Step 6

Clearly generating a Choropleth is not an easy task. Our goal is to provide a simple yet highly customizable JavaScript tool for data enthusiast to spend less time engineering and more time building beautiful visualizations.

### A basic example
```javascript
import SgHeatmap from 'sg-heatmap/dist/predefined/URA_subzone'
import {register_MEAN} from 'sg-heatmap/dist/helpers'
import {Spectral} from 'sg-heatmap/dist/helpers/color'

import dataPoints from './dataPoints.json'

// initialize heatmap
var heatmap = new SgHeatmap()

// set up heatmap to use MEAN for aggregating
register_MEAN(heatmap)

// pass in the data points
// binning and aggregating is done in one step
dataPoints.forEach(pt => {
  heatmap.update([pt.lat, pt.lng], pt.wt)
})

// retrieve aggregated values
var stat = heatmap.getStat('mean')

// initialize color scale
// supply domain min and max endpoints for linear mapping
var colorScale = Spectral([stat.min, stat.max])

// initialize renderer
var renderer = heatmap.initializeRenderer({
  strokeWeight: 1,
  strokeColor: 'black',
  strokeOpacity: 1,
  fillColor: 'white',
  fillOpacity: 0.7
})
renderer.setMap(googleMap)

// render
heatmap.render('mean', colorScale)
```

### Binning by key / Working with pre-aggregated data
Sometimes we might be working with pre-aggregated data.
Instead of binning and updating with the location (latlng),
you want to bin directly to each polygon using keys.
In this case we provides a helper function to modify your *SgHeatmap* object

```javascript
import {insideByKey} from 'sg-heatmap/dist/helpers'
import aggregatedData from './aggregatedData.json'

insideByKey(heatmap)
aggregatedData.forEach(pt => {
  heatmap.update(pt.keys, pt.wt)
})
```

One potential use case is doing the
(relatively time-consuming) binning and aggregating server-side
and send only the aggregated values to the client for rendering

```javascript
// Server-side
import SgHeatmap from 'sg-heatmap/dist/predefined/URA_subzone'
import {register_MEAN} from 'sg-heatmap/dist/helpers'
import dataPoints from './dataPoints'

var heatmap = new SgHeatmap()
register_MEAN(heatmap)

dataPoints.forEach(pt => {
  heatmap.update([pt.lat, pt.lng], pt.wt)
})

var stat = heatmap.getStat('mean')
// Send 'stat' object to client
```

```javascript
// Client-side
import SgHeatmap from 'sg-heatmap/dist/predefined/URA_subzone'
import {register_LATEST} from 'sg-heatmap/dist/helpers'

var heatmap = new SgHeatmap()
register_LATEST(heatmap)

// Receive 'stat' object from server
Object.keys(stat.values).forEach(key => {
  heatmap.update([key], stat.values[key])
})

// initialize renderer
// initialize colorScale...

// call render on stat 'latest'
heatmap.render('latest', colorScale)
```

### API Documentation

##### Installing
```
npm install --save sg-heatmap
```

##### Importing to project
```javascript
import SgHeatmap from 'sg-heatmap'
// OR in ES5
var SgHeatmap = require('sg-heatmap')
```

##### Using predefined maps with polygon data loaded
```javascript
import SgHeatmap from 'sg-heatmap/dist/predefined/URA_region'
// OR
import SgHeatmap from 'sg-heatmap/dist/predefined/URA_planning_area'
// OR
import SgHeatmap from 'sg-heatmap/dist/predefined/URA_subzone'

// initialize
var heatmap = new SgHeatmap()
```

##### Defining map with your own polygon data
```javascript
import polygons from './polygons.json'

var heatmap = new SgHeatmap(polygons)
```

##### *polygon* object expected data type
```javascript
// latlng object is a two members array
// first element is latitude, second element is longitude
var Latlng = [Number, Number]

// polyline object is an array of latlng
// last element to match first element
var polyline = [latlng]

// shape object is used for specifying the polygon's shape and limits
// only outer is used to determine whether a point falls inside polygon boundary
// inners are used for rendering purpose only
// for detail explanation refer to #inside function
var shape = {
  outer: polyline, // required
  inners: [polyline] // optional
}

// polygon object
var polygon = {
  key: String, // required, unique
  boundary: [shape], // required, accepts only array
  meta: String|Number|Object // optional field, accepts all data type
  center: latlng // optional
}
// note the reason for making boundary property an array
// is so polygon can include multiple shapes,
// even if only one shape is needed
// user should still wrap shape in an array
```

##### Defining the aggregating function
```javascript
import {register_MEAN} from 'sg-heatmap/dist/helpers'

// this step is required before passing in any data
register_MEAN(heatmap)
```

##### List of predefined aggregating function
- register_HISTORY
- register_LATEST
- register_COUNT
- register_SUM
- register_MEAN
- register_VARIANCE
- register_STDEV
- register_MIN
- register_MAX
- register_MEDIAN

*register_HISTORY* and *register_LATEST* does not do any actual aggregating

*register_HISTORY* simply push data point to an array in the update order while

*register_LATEST* replaces old value with each update and keeps only the latest data point

##### *.update()* method
```javascript
import dataPoints from './dataPoints.json'

// push one data point
var pt = dataPoints[0]
heatmap.update([pt.lat, pt.lng], pt.wt)

// push another data point
pt = dataPoints[1]
heatmap.update([pt.lat, pt.lng], pt.wt)

// push the remaining data points
dataPoints.slice(2).forEach(pt => {
  heatmap.update([pt.lat, pt.lng], pt.wt)
})
```

This design supports streaming data.
Each time *.update()* is called,
binning and aggregating is performed on the single data point.
Therefore *.getStat()* and *.render()* can be called even without all data points loaded

```javascript
// eg.
heatmap.resetState()

dataPoints.slice(0, 100).forEach(pt => {
  heatmap.update([pt.lat, pt.lng], pt.wt)
})
heatmap.getStat('mean') // returns aggregated values for first 100 data points

dataPoints.slice(100, 200).forEach(pt => {
  heatmap.update([pt.lat, pt.lng], pt.wt)
})
heatmap.getStat('mean') // returns aggregated values for first 200 data points

dataPoints.slice(200, 300).forEach(pt => {
  heatmap.update([pt.lat, pt.lng], pt.wt)
})
heatmap.getStat('mean') // returns aggregated values for first 300 data points


// say you only want to check which bin data point falls into
// i.e. bin but don't update
pt = dataPoints[0]
heatmap.bin([pt.lat, pt.lng])
// this returns filtered list of heatmap.children where inside function evaluates true
// to get their respective key
var matchingKeys = heatmap.bin([pt.lat, pt.lng]).map(child => child.key)
```

##### *.getStat()* method
```javascript
// returns
var stat = getStat('mean') = {
  stat: String, // name of statistic queried (in this case 'mean')
  values: Object, // key/value map of aggregated stat for each child that has been matched to at least one data point
  unchanged: [String], // keys of children where no update (i.e. not matched to any data point)
  min: Number, // minimum among the set of values in stat.values
  max: Number // maximum among the set of values in stat.values
}
```

Each data point only needs to be passed in once and
any number of statistics can be called on the SgHeatmap Object

```javascript
// eg.
import {register_MEAN, register_MAX, register_MIN} from 'sg-heatmap/dist/helpers'

register_MEAN(heatmap)
register_MAX(heatmap)
register_MIN(heatmap)

dataPoints.forEach(pt => {
  heatmap.update([pt.lat, pt.lng], pt.weight)
})

heatmap.getStat('mean') // return MEAN
heatmap.getStat('max') // return MAX
heatmap.getStat('min') // return MIN
```

##### *.render()* method
```javascript
// initialize renderer
heatmap.initializeRenderer(defaultStyle, addonStyle)

// initialize colorScale by providing domain min/max endpoints
heatmap.render(key, colorScale) // key is the name of the statistic to render
```

- *defaultStyle* and *addonStyle* are optional style options to be applied onto map polygons
- refer to [https://developers.google.com/maps/documentation/javascript/3.exp/reference#Data.StyleOptions](https://developers.google.com/maps/documentation/javascript/3.exp/reference#Data.StyleOptions)
- *defaultStyle* applies to every polygon (including those in the unchanged group)
- *addonStyle* applies to those polygons that has been assigned at least one data point
- do not set 'fillColor' in *addonStyle* as it will be overridden by the fillColor *colorScale* specify
- refer to next section for detail on the *colorScale* object

##### *colorScale* function
- *.render()* method requires a colorScale function to be passed in as its second parameter.
- *colorScale* is any function that maps numeric values to CSS colors
```javascript
// example
colorScale(5) // returns 'orange'
colorScale(10) // returns '#ff0000'
```

##### Using predefined colorScale
```javascript
import {Spectral} from 'sg-heatmap/dist/helpers/color'

// hard coded domain
var colorScale = Spectral([5, 10])

// OR let data decides domain
var stat = getStat('mean')
var colorScale = Spectral([stat.min, stat.max])
```

Sometimes linear mapping of value to color
may not visibly separate the different values sufficiently
(eg. majority of values are clustered in the lower range)
In this case, we may want to apply a power transformation
to accentuate difference within certain part of the domain
All predefined colorScale accepts a second parameter for specifying power transformation

```javascript
// to accentuate difference in the lower range, set transformation < 1
var colorScale = Spectral([stat.min, stat.max], 0.5)

// to accentuate difference in the upper range, set transformation > 1
var colorScale = Spectral([stat.min, stat.max], 2)
```

##### List of predefined colorScale
- eg. Spectral, YlOrRd, Purples
- Refer to [COLORBREWER 2.0](http://colorbrewer2.org/) for the full set of color schemes available

##### Using colorScale helper function to generate customized colorScale
```javascript
import generateColorScale from 'sg-heatmap/dist/helpers/color'

var colorArray = ['white', 'yellow', 'orange', 'red', 'black']

var colorScaleOptions = {
  domain: [0, 1],
  transform: 1,
  bezierInterpolate: false,
  correctLightness: true,
  interpolationMode: 'lab'
}

var customColorScale = generateColorScale(colorArray, colorScaleOptions)
```

Refer to [chroma.js](https://gka.github.io/chroma.js/) docs for detail explanation of the different colorScaleOptions
