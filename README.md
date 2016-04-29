# Slope Graph
This is a slope graph that is built on [D3](https://d3js.org/). Its dependencies are D3 (obviously) and [jQuery](https://jquery.com/).

## Usage
There are a few ways to use this graph. The first way is to pass in all the data and specify the left values and right values. The next way is to define a function based on the aggregate values.
In index.html, the first example is the aggregate. It passes in a function that knows how to calculate the left value based on the measure that is added to the graph (via the setMeasure method). 
The second example defines the left and right values, but adds an additional left measure and right measure to tell the graph which value to use on the data.
