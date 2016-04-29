# Slope Graph
This is a slope graph that is built on [D3](https://d3js.org/). Its dependencies are D3 (obviously) and [jQuery](https://jquery.com/).

## Usage
There are a few ways to use this graph. The first way is to pass in all the data and specify the left values and right values. The next way is to define a function based on the aggregate values.
In index.html, the first example is the aggregate. It passes in a function that knows how to calculate the left value based on the measure that is added to the graph (via the setMeasure method). 
The second example defines the left and right values, but adds an additional left measure and right measure to tell the graph which value to use on the data.

## Style
Why use this graph if you can't make it your own?
When someone hovers over either a line or a label, the class "over" is applied to the group and "hovered" is applied to the svg. To see how to style it, look at styles/slopegraph.css for a super simple example. Those styles thicken the lines and change the opacity of the other lines. 

## Docs
To start using the slope graph, include d3 and jquery. Create an SVG via D3. Pass your SVG and data into a new SlopeGraph object:

```javascript
var data = [
		{
			'name': 'One',
			'left': 2,
			'right': 4
		},
		...
	],
	svg = d3.select(...).append('svg')
		.attr('width', __)
		.attr('height', ___);

var graph = new SlopeGraph(svg, data);
```

##### Set Main Measure
Next define a measure on your data. This is the attribute that will be the label in the end and the aggregating attribute if you are using Option 1 in the next step.

```javascript
graph.setMeasure('name');
```

##### Set Left and Right Values
From here, you have two options. Either set functions to define how to aggregate values on your data ( setLeftFunc(...) && setRightFunc(...) )or define the attribute on your data that is to be measured ( setLeftMeasure(...) && setRightMeasure('...') ).

###### Option 1
Let's define the left side to be the sum of all the values that have the same name (main measure). The right side will be the difference between the min and max values. This is used when your data is relative to each other based on the main measure.

```javascript
graph.setLeftFunc(
	function(data) {
		var sum = 0;
		data.forEach(function(d) { sum += d['left'] }; );
		return sum;
	}
);
graph.setRightFunc(
	function(data) {
		var min = 0, max = null;
		data.forEach(function(d) {
			if ( d['left'] < min ) min = d['left'];
			if ( max == null || d['left'] > max) max = d['left'];
		});
		return max - min;
	};
);
```

###### Option 2
Simply define the left measure and right measure. This is useful when your data is already formatted for you.

```javascript
graph.setLeftMeasure('left');
graph.setRightMeasure('right');
```

##### DRAW!
After all that, just draw the graph!
```javascript
graph.draw();
```
