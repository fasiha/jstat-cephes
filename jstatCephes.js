function gammaUpperJStat(x, a) {
    return Math.exp(jStat.gammaln(x)) * (1 - jStat.lowRegGamma(x, a));
}
function gammaUpperCephes(x, a) { return cephes.gamma(x) * cephes.igamc(x, a); }

function gammaUpperUnregJStat(x, a) { return 1 - jStat.lowRegGamma(x, a); }
function gammaUpperUnregCephes(x, a) { return cephes.igamc(x, a); }

// Adapted from http://bl.ocks.org/mbostock/3202354
function imagesc(buckets, xStep, yStep) {
    var margin = {top : 20, right : 90, bottom : 30, left : 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.linear().range([ 0, width ]),
        y = d3.scale.linear().range([ height, 0 ]),
        z = d3.scale.linear().range([ "saddlebrown", "white" ]);

    var svg = d3.select("body")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

    // Compute the scale domains.
    x.domain(d3.extent(buckets, function(d) { return d.x; }));
    y.domain(d3.extent(buckets, function(d) { return d.y; }));
    z.domain(d3.extent(buckets, function(d) { return d.z; }));

    // Extend the x- and y-domain to fit the last bucket.
    // For example, the y-bucket 3200 corresponds to values [3200, 3300].
    x.domain([ x.domain()[0], +x.domain()[1] + xStep ]);
    y.domain([ y.domain()[0], y.domain()[1] + yStep ]);

    // Display the tiles for each non-zero bucket.
    svg.selectAll(".tile")
        .data(buckets)
        .enter()
        .append("rect")
        .attr("class", "tile")
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y + yStep); })
        .attr("width", x(xStep) - x(0))
        .attr("height", y(0) - y(yStep))
        .style("fill", function(d) { return z(d.z); });

    // Add a legend for the color values.
    var legend =
        svg.selectAll(".legend")
            .data(z.ticks(6).reverse())
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) {
                return "translate(" + (width + 20) + "," + (20 + i * 20) + ")";
            });

    legend.append("rect").attr("width", 20).attr("height", 20).style("fill", z);

    legend.append("text").attr("x", 26).attr("y", 10).attr("dy", ".35em").text(
        String);

    svg.append("text")
        .attr("class", "label")
        .attr("x", width + 20)
        .attr("y", 10)
        .attr("dy", ".35em")
        .text("log10(err)");

    // Add an x-axis with label.
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.svg.axis().scale(x).orient("bottom"))
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .attr("text-anchor", "end")
        .text("x");

    // Add a y-axis with label.
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.svg.axis().scale(y).orient("left"))
        .append("text")
        .attr("class", "label")
        .attr("y", 6)
        .attr("dy", ".71em")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .text("a");
}

function compareAndPlot(actualFn, expectedFn, title) {
    if (typeof actualFn === 'undefined') {
        actualFn = gammaUpperUnregJStat;
    }
    if (typeof expectedFn === 'undefined') {
        expectedFn = gammaUpperUnregCephes;
    }
    if (typeof title !== 'undefined') {
        d3.select('body').append('h1').text(title);
    }
    var dx = .25*2, dy = .25*2;
    var Nx = 150/2, Ny = 150/2;
    var x = _.range(Nx).map(x => x * dx + dx);
    var y = _.range(Ny).map(y => y * dy + dy);
    var xygrid = x.map(x => y.map(y => { return {x : x, y : y}; }))
                     .reduce((memo, curr) => memo.concat(curr), []);

    var relErr = (dirt, gold) => Math.abs((dirt - gold) / gold);
    var bucketsFull = xygrid.map(({x, y}) => {
        return {
            x : x,
            y : y,
            z : Math.log10(relErr(actualFn(x, y), expectedFn(x, y)))
        };
    });
    var buckets = bucketsFull.map(({x, y, z}) => {
        return {x : x, y : y, z : Math.min(0, Math.max(-16, z))};
    });

    imagesc(buckets, dx, dy);
}

compareAndPlot(gammaUpperUnregJStat, gammaUpperUnregCephes, 'Not regularized');
compareAndPlot(gammaUpperJStat, gammaUpperCephes, 'Regularized');