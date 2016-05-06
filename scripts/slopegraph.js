/**
 * Requirements:
 *  D3 - https://d3js.org/
 *  JQuery - https://jquery.com/
 */

(function ($) {
    "use strict";

    var defaultAxisOptions = {
        func: function(value) { return value; },
        measure: '',
        _min: 0,
        _max: null,
        format: function(value) { return value; }
    };
    var defaultOptions = {
        colorFunc: function(leftValue, rightValue) {
            return '#000';
        },
        lineStyles: {},
        labelStyles: {
            'font-size': '12px'
        },
        yPadding: 10,
        labelLength: 150
    };

    var SlopeGraph = function(svg, data, measure, leftOptions, rightOptions, options) {
        this.leftOptions = $.extend({}, defaultAxisOptions, leftOptions);
        this.rightOptions = $.extend({}, defaultAxisOptions, rightOptions);
        this.options = $.extend({}, defaultOptions, options);
        this.height = $(svg[0]).height();
        this.width = $(svg[0]).width();
        this.measure = measure;
        this.data = data;
        this.labelLength = this.options.labelLength;

        var graph = this;

        this.setMeasure = function(measure) {
            graph.measure = measure;
            return graph;
        };
        this.setLeftMeasure = function(measure) {
            graph.leftOptions.measure = measure;
            return graph;
        };
        this.setRightMeasure = function(measure) {
            graph.rightOptions.measure = measure;
            return graph;
        };
        this.setLeftFunc = function(func) {
            graph.leftOptions.func = func;
            return graph;
        };
        this.setRightFunc = function(func) {
            graph.rightOptions.func = func;
            return graph;
        };
        this.setLeftRange = function(min, max) {
            graph.leftOptions._min = min;
            graph.leftOptions._max = max;
            return graph;
        };
        this.setRightRange = function(min, max) {
            graph.rightOptions._min = min;
            graph.rightOptions._max = max;
            return graph;
        };
        this.setColorFunc = function(colorFunc) {
            graph.options.colorFunc = colorFunc;
            return graph;
        };
        this.setRightFormat = function(formatFunc) {
            graph.rightOptions.format = formatFunc;
            return graph;
        };
        this.setLeftFormat = function(formatFunc) {
            graph.leftOptions.format = formatFunc;
            return graph;
        };
        this.draw = function() {
            var points = graph._generatePoints();

            svg.attr('height', graph.height);
            graph.chart = svg.selectAll( 'g.' + graph.measure )
                .data( points )
                .enter()
                    .append('g')
                        .attr( 'class', graph.measure );

            graph.chart
                .on("mouseover", function(d,i) {
                    svg.classed("hovered", true);
                    return d3.select(this).classed("over", true);
                })
                .on("mouseout",  function(d,i) {
                    svg.classed("hovered", false);
                    return d3.select(this).classed("over", false);
                });

            var left_column = graph.chart
                          .selectAll("text.label.start")
                            .data( function(d) { return [d]; } );
            left_column
                .enter()
                .append("text")
                    .classed("label start", true)
                    .attr("xml:space", "preserve")
                    .style("text-anchor", "end")
                    .attr("x", graph.labelLength)
                    .attr("y", 0)
                    .style(graph.options.labelStyles);

            left_column
                .attr("y", function(d,i) { return d.left; })
                .text(function(d) { return d.label + "   " + d.leftValueFormatted; });

            var right_column = graph.chart
                .selectAll("text.label.end")
                .data( function(d) { return [d]; } );
            right_column
                .enter()
                    .append("text")
                    .classed("label end", true)
                    .attr("xml:space", "preserve")
                    .attr("x", graph.width - graph.labelLength - 50)
                    .attr("y", 0)
                    .style(graph.options.labelStyles);

            right_column
                .attr("y", function(d,i) { return d.right; })
                .text(function(d) { return d.rightValueFormatted + "   " + d.label; });

            var line = graph.chart
                .selectAll('line.slope')
                    .data(function(d) { return [d]; });

            line
                .enter()
                    .append('line')
                    .attr('x1', graph.labelLength + 5)
                    .attr('x2', graph.width - graph.labelLength - 55)
                    .attr('opacity', 0)
                    .attr('y1', 0)
                    .attr('y2', 0);

            line
                .classed('slope', function(d) { return d.left || d.right; })
                .attr('opacity', 1)
                .style('stroke', function(d,i) {  return graph.options.colorFunc(d.leftValue, d.rightValue); })
                .attr('y1', function(d,i) {  return d.left != undefined && d.right != undefined ? d.left - 5 : null; })
                .attr('y2', function(d,i) {  return d.left != undefined && d.right != undefined ? d.right - 5 : null; })
                .style(graph.options.lineStyles);
        };

        this._findRange = function(sortedData, options) {
            var min = options['_min'],
                max = options['_max'],
                func = options['func'];

            if ( options.measure ) {
                graph.data.forEach( function(d) {
                    var aggValue = d[options.measure];
                    if ( aggValue < min ) {
                        min = aggValue;
                    }
                    if ( aggValue > max ) {
                        max = aggValue;
                    }
                });
            } else {
                for (var key in sortedData) {
                    var _data = sortedData[key];
                    var aggValue = options.func(_data);
                    if ( aggValue < min ) {
                        min = aggValue;
                    }
                    if ( aggValue > max ) {
                        max = aggValue;
                    }
                }
            }

            // May not be necessary to reset; need to see if copy or reference
            options['_min'] = min;
            options['_max'] = max;
        };

        this._generatePoints = function() {
            var sortedData = graph._sortData();
            graph._findRange(sortedData, graph.leftOptions);
            graph._findRange(sortedData, graph.rightOptions);
            graph.leftScale = d3.scale.linear()
                .domain([graph.leftOptions['_min'], graph.leftOptions['_max']])
                .range([graph.height - graph.options.yPadding, 0]);
            graph.rightScale = d3.scale.linear()
                .domain([graph.rightOptions['_min'], graph.rightOptions['_max']])
                .range([graph.height - graph.options.yPadding, 0]);

            var points = [];
            if ( graph.leftOptions.measure && graph.rightOptions.measure ) {
                graph.data.forEach( function(d) {
                    var label = d[graph.measure],
                        leftValue = d[graph.leftOptions.measure],
                        rightValue = d[graph.rightOptions.measure];
                    points.push({
                        'label': label,
                        'left': graph.options.yPadding + graph.leftScale(leftValue),
                        'right': graph.options.yPadding + graph.rightScale(rightValue),
                        'leftValue': leftValue,
                        'leftValueFormatted': graph.leftOptions.format(leftValue),
                        'rightValue': rightValue,
                        'rightValueFormatted': graph.rightOptions.format(rightValue),
                        'stroke': graph.options.colorFunc(leftValue, rightValue)
                    });
                });
            } else {
                for (var key in sortedData) {
                    var _data = sortedData[key];
                    var leftValue = graph.leftOptions.func(_data);
                    var rightValue = graph.rightOptions.func(_data);

                    points.push({
                        'label': key,
                        'left': graph.options.yPadding + graph.leftScale(leftValue),
                        'right': graph.options.yPadding + graph.rightScale(rightValue),
                        'leftValue': leftValue,
                        'leftValueFormatted': graph.leftOptions.format(leftValue),
                        'rightValue': rightValue,
                        'rightValueFormatted': graph.rightOptions.format(rightValue),
                        'stroke': graph.options.colorFunc(leftValue, rightValue)
                    });
                }
            }
            graph._fixCollisions(points);
            return points;
        };

        this._fixCollisions = function(points) {
            var fontSize = parseInt(graph.options.labelStyles['font-size']),
                maxY = 0;

            points
                .sort(function(a,b) {
                    if (a.right == b.right) {
                        if ( a.left == b.left )
                            return 0;
                        return (a.left < b.left) ? -1 : +1
                    }
                    return (a.right > b.right) ? -1 : +1;
                })
                .forEach(function(d) {
                    points.forEach(function(dd) {
                        if ( d != dd ) {
                            if ( dd.right == d.right ) {
                                if ( dd.left > d.left) {
                                    dd.right += fontSize - (dd.right - d.right);
                                    if ( dd.right > maxY ) {
                                        maxY = dd.right;
                                    }
                                }
                            }
                            if ( Math.abs(dd.right - d.right) <= fontSize ) {
                                dd.right += fontSize - Math.abs(dd.right - d.right);
                                if ( dd.right > maxY ) {
                                    maxY = dd.right;
                                }
                            }
                        }
                    });
                });

            points
                .sort(function(a,b) {
                    if (a.left == b.left) {
                        if ( a.right == b.right )
                            return 0;
                        return (a.right < b.right) ? -1 : +1;
                    }
                    return (a.left < b.left) ? -1 : +1;
                })
                .forEach(function(d) {
                    points.forEach(function(dd) {
                        if ( d != dd && dd.left >= d.left ) {
                            if ( dd.left == d.left ) {
                                if ( dd.right > d.right) {
                                    dd.left += fontSize - (dd.left - d.left);
                                    if ( dd.left > maxY ) {
                                        maxY = dd.left;
                                    }
                                }
                            }
                            if ( dd.left - d.left <= fontSize ) {
                                dd.left += fontSize - (dd.left - d.left);
                                if ( dd.left > maxY ) {
                                    maxY = dd.left;
                                }
                            }
                        }
                    });
                });

            if ( maxY > graph.height ) {
                graph.height = maxY;
            }
        };

        this._sortData = function() {
            var sortedData = {};
            $.each(graph.data, function(i, d) {
                var lineAttr = d[graph.measure];
                if ( sortedData[lineAttr] == null ) {
                    sortedData[lineAttr] = [];
                }
                sortedData[lineAttr].push(d);
            });
            return sortedData;
        };

        return this;
    };

    window.SlopeGraph = SlopeGraph;
})(window.jQuery);
