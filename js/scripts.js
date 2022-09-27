/*!
* Start Bootstrap - Bare v5.0.5 (https://startbootstrap.com/template/bare)
* Copyright 2013-2021 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-bare/blob/master/LICENSE)
*/
// This file is intentionally blank
// Use this file to add JavaScript to your project

// set the dimensions and margins of the graph
var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
var rect_cluster_size = 15;

var selected = 0;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    // .attr("width", width )
    // .attr("height", height)
    .style("margin", "auto")
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")
    .style("display", "block")
    .style("margin", "auto");

var svg_attention_1 = d3.select("#attention_1")
    .append("svg")
    .attr("viewBox", [0, 0, width / 2, height / 2])
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")
    .style("margin", "auto");
var svg_attention_2 = d3.select("#attention_2")
    .append("svg")
    .attr("viewBox", [0, 0, width / 2, height / 2])
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
var svg_attention_3 = d3.select("#attention_3")
    .append("svg")
    .attr("viewBox", [0, 0, width / 2, height / 2])
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
var svg_attention_4 = d3.select("#attention_4")
    .append("svg")
    .attr("viewBox", [0, 0, width / 2, height / 2])
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Initialize the X axis
var x_scale = d3.scaleLinear().range([0, width])
var x_scale_attention = d3.scaleLinear().range([0, width / 2])

// Initialize the Y axis
var y_scale = d3.scaleLinear().range([height, 0]);
var y_scale_attention = d3.scaleLinear().range([height / 2, 0]);


x_scale.domain([-3, 3]);
y_scale.domain([-1.6, 1.6]);

x_scale_attention.domain([-3, 3]);
y_scale_attention.domain([-2, 1.5]);

// var spinner=svg.append("text")
//     .attr("x", width/2)
//     .attr("y", height / 2)
//     .attr("dy", ".35em")
//     .text('LOADING...');

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

// Returns a tween for a transition’s "d" attribute, transitioning any selected
// arcs from their current angle to the specified new angle.
function arcTween(newAngle, angle) {
    return function (d) {
        var interpolate = d3.interpolate(d[angle], newAngle);
        return function (t) {
            d[angle] = interpolate(t);
            return arc(d);
        };
    };
}

const animationTime = 1200;
const loaderRadius = 100;
const loaderColor = '#ccc';

var arc = d3.arc()
    .innerRadius(0)
    .outerRadius(loaderRadius);

var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
var loader = g.append("path")
    .datum({endAngle: 0, startAngle: 0})
    .style("fill", loaderColor)
    .attr("d", arc);

d3.interval(function () {
    loader.datum({endAngle: 0, startAngle: 0})

    loader.transition()
        .duration(animationTime)
        .attrTween("d", arcTween(degToRad(360), 'endAngle'));

    loader.transition()
        .delay(animationTime)
        .duration(animationTime)
        .attrTween("d", arcTween(degToRad(360), 'startAngle'));
}, animationTime * 2);

d3.json("data/mesh.json").then(function (json) {
    svg.selectAll('g').remove()

    function getdata(t) {

        var vmin = d3.min(json.velocity[t]);
        var vmax = d3.max(json.velocity[t]);
        var myColor = d3.scaleSequential().interpolator(d3.interpolateViridis).domain([vmin, vmax]);

        var color_attention_1 = d3.scaleSequential().interpolator(d3.interpolateViridis).domain([d3.min(json.attention_one[0][0]), d3.max(json.attention_one[0][0])]);
        var color_attention_2 = d3.scaleSequential().interpolator(d3.interpolateViridis).domain([d3.min(json.attention_two[0][0]), d3.max(json.attention_two[0][0])]);
        var color_attention_3 = d3.scaleSequential().interpolator(d3.interpolateViridis).domain([d3.min(json.attention_three[0][0]), d3.max(json.attention_three[0][0])]);
        var color_attention_4 = d3.scaleSequential().interpolator(d3.interpolateViridis).domain([d3.min(json.attention_four[0][0]), d3.max(json.attention_four[0][0])]);

        var dataset_mesh = []
        for (var i = 0; i < json.X[t].length; i++) {
            dataset_mesh.push({"x": json.X[t][i], "y": json.Y[t][i], "v": json.velocity[t][i]});
        }

        var dataset_cluster = []
        for (var i = 0; i < json.cluster_X[t].length; i++) {
            dataset_cluster.push({
                'x': json.cluster_X[t][i], 'y': json.cluster_Y[t][i],
                'attention_one': json.attention_one[t][selected][i],
                'attention_two': json.attention_two[t][selected][i],
                'attention_three': json.attention_three[t][selected][i],
                'attention_four': json.attention_four[t][selected][i]
            })
        }

        var u = svg.selectAll("circle").data(dataset_mesh);
        u.enter().append("circle").merge(u)
            .attr("r", 4)
            .attr("cx", function (d) {
                return x_scale(d.x);
            })
            .attr("cy", function (d) {
                return y_scale(d.y);
            })
            .style('fill', function (d) {
                return myColor(d.v)
            });

        var u = svg.selectAll("rect").data(dataset_cluster);
        u.enter().append("rect").merge(u)
            .attr("x", function (d) {
                return x_scale(d.x) - rect_cluster_size / 2;
            })
            .attr("y", function (d) {
                return y_scale(d.y) - rect_cluster_size / 2;
            })
            .attr("width", rect_cluster_size).attr("height", rect_cluster_size)
            .attr("fill", function (d, i) {
                if (i === selected) {
                    return "#FF0000";
                } else {
                    return "#270a56"
                }
            })
            .attr('stroke', '#FFFFFF')
            .attr('stroke-width', '2')
            .attr("fill-opacity", function (d, i) {
                if (i === selected) {
                    return 1;
                } else {
                    return 0.5;
                }
            })
            .on('click', function (d, i) {
                selected = i;
                getdata(t)
            });

        // ATTENTION 1
        var u = svg_attention_1.selectAll("rect").data(dataset_cluster);
        u.enter().append("rect").merge(u)
            .attr("x", function (d) {
                return x_scale_attention(d.x) - rect_cluster_size / 4;
            })
            .attr("y", function (d) {
                return y_scale_attention(d.y) - rect_cluster_size / 4;
            })
            .attr("width", rect_cluster_size / 2).attr("height", rect_cluster_size / 2)
            .attr("fill", function (d) {
                return color_attention_1(d.attention_one);
            })
        // ATTENTION 2
        var u = svg_attention_2.selectAll("rect").data(dataset_cluster);
        u.enter().append("rect").merge(u)
            .attr("x", function (d) {
                return x_scale_attention(d.x) - rect_cluster_size / 4;
            })
            .attr("y", function (d) {
                return y_scale_attention(d.y) - rect_cluster_size / 4;
            })
            .attr("width", rect_cluster_size / 2).attr("height", rect_cluster_size / 2)
            .attr("fill", function (d) {
                return color_attention_2(d.attention_two);
            })
        // ATTENTION 1
        var u = svg_attention_3.selectAll("rect").data(dataset_cluster);
        u.enter().append("rect").merge(u)
            .attr("x", function (d) {
                return x_scale_attention(d.x) - rect_cluster_size / 4;
            })
            .attr("y", function (d) {
                return y_scale_attention(d.y) - rect_cluster_size / 4;
            })
            .attr("width", rect_cluster_size / 2).attr("height", rect_cluster_size / 2)
            .attr("fill", function (d) {
                return color_attention_3(d.attention_three);
            })
        // ATTENTION 1
        var u = svg_attention_4.selectAll("rect").data(dataset_cluster);
        u.enter().append("rect").merge(u)
            .attr("x", function (d) {
                return x_scale_attention(d.x) - rect_cluster_size / 4;
            })
            .attr("y", function (d) {
                return y_scale_attention(d.y) - rect_cluster_size / 4;
            })
            .attr("width", rect_cluster_size / 2).attr("height", rect_cluster_size / 2)
            .attr("fill", function (d) {
                return color_attention_4(d.attention_four);
            })

    }

    getdata(1);
    var sliderStep = d3
        .sliderBottom()
        .min(1)
        .max(json.velocity.length)
        .width(width - 15)
        .ticks(5)
        .step(0.005)
        .default(0.015)
        .on('onchange', val => {
            getdata(parseInt(val))
        });

    var gStep = d3
        .select('div#slider-step')
        .append('svg')
        .attr("viewBox", [0, 0, width + 15, 100])
        // .attr("width", width + 15)
        // .attr("height", 100)
        .append("g")
        .attr("transform",
            "translate(" + 15 + "," + 15 + ")");
    gStep.call(sliderStep);
    d3.select('p#value-step').text(d3.format('.2%')(sliderStep.value()));
})

var svg2 = d3.select("#svg_container_model").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", [0, 0, width, 150]);

d3.xml("assets/model.svg")
    .then(data => {
        svg2.node().append(data.documentElement);

        svg2.selectAll("#Input")
            .on('mouseover', (d, i, e) => {
                d3.select("#model_content_title").text("State Input");
                d3.select("#model_content_text").text("The physical state inputted to the network is a set of four-dimensional " +
                    "vectors for each points in the mesh containing the velocity field in both direction, as well as the static and" +
                    "dynamic pressure field. The static pressure field represents the pressure exerced by the stationnary part of the fluid" +
                    "while the dynamic pressure field model the pressure due to the movement of the drone and the fluid. ")
                d3.select("#model_content_equation1").html(function (d) {
                    setTimeout(function () {
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                    }, 10);
                    return "\\(v(t), p(t) = \\{v_i(t)\\}, \\{p_i(t)\\} \\quad \\forall i \\in \\mathcal{V}(t)\\)";
                })
                d3.select("#model_content_equation2").html(function (d) {
                    setTimeout(function () {
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                    }, 10);
                    return "";
                });
            });
        svg2.selectAll("#Mesh")
            .on('mouseover', (d, i, e) => {
                d3.select("#model_content_title").text("Mesh Input");
                d3.select("#model_content_text").text("Our model also requires the mesh structure at the given time step, " +
                    "that is, the 2D positions of each nodes associated with the set of edges defining the triangular mesh.")
                d3.select("#model_content_equation1").html(function (d) {
                    setTimeout(function () {
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                    }, 10);
                    return "\\(x(t) = \\{x_i(t)\\}_{i \\in \\mathcal{V}(t)} \\quad e(t) = \\{e_{ij}(t)\\}_{(i,j) \\in \\mathcal{E}(t)}\\)";
                })
                d3.select("#model_content_equation2").html(function (d) {
                    setTimeout(function () {
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                    }, 10);
                    return "";
                });
            });
        svg2.selectAll("#Clustering")
            .on('mouseover', (d, i, e) => {
                d3.select("#model_content_title").text("Clustering");
                d3.select("#model_content_text").text("We down-scale mesh resolution through geometric clustering, which " +
                    "is  independent of the forecasting operations and therefore pre-computed offline. A modified " +
                    "k-means clustering is applied to the vertices of each time step and creates clusters with a " +
                    "constant number of nodes. The advantages are twofold: (a) the irregularity and adaptive resolution " +
                    "of the original mesh is preserved, as high density region will require more clusters, and (b) " +
                    "constant cluster sizes facilitate parallelization and allow to speed up computations.")
                d3.select("#model_content_equation1").html(function (d) {
                    setTimeout(function () {
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                    }, 10);
                    return "(\\ \\)";
                })
                d3.select("#model_content_equation2").html(function (d) {
                    setTimeout(function () {
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                    }, 10);
                    return "";
                });
            });
        svg2.selectAll("#Encoder")
            .on('mouseover', (d, i, e) => {
                d3.select("#model_content_title").text("Encoder");
                d3.select("#model_content_text").text("The physical state is projected onto a higher dimensional space using a" +
                    "simple encoder composed of two MLPs followed by graph neural networks. This step allows to compute " +
                    "rich embeddings of the local situation for each nodes.")
                d3.select("#model_content_equation1").html(function (d) {
                    setTimeout(function () {
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                    }, 10);
                    return "\\(\\eta_i = \\phi_\\eta(v_i, p_i, n_i), \\quad e_{ij} = \\phi_e(x_i -x_j, \\|x_i - x_j\\|).\\)";
                })
                d3.select("#model_content_equation2").html(function (d) {
                    setTimeout(function () {
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                    }, 10);
                    return "\\( e_{ij}' = \\psi_e^l\\left(\\left[\\begin{array}{cc}\\eta_i^{l} \\\\ f_i \\end{array}\\right] , \\left[\\begin{array}{cc}\\eta_j^{l} \\\\ f_j \\end{array}\\right] , e_{ij}^{l} \\right), \\quad \\eta_i' = \\psi_\\eta^l\\left(\\left[\\begin{array}{cc}\\eta_i^{l} \\\\ f_i \\end{array}\\right], \\sum_j e_{ij}'\\right) \\text{ and } \\left\\{\\begin{array}{l}\n" +
                        "         e_{ij}^{l+1} = e_{ij}^l + e_{ij}'  \\\\\n" +
                        "         \\eta_i^{l+1} = \\eta_i^l + \\eta_i'\n" +
                        "    \\end{array}\\right.\\)";
                });
            });
        svg2.selectAll("#Output")
            .on('mouseover', (d, i, e) => {
                d3.select("#model_content_title").text("Output");
                d3.select("#model_content_equation1").html(function (d) {
                    setTimeout(function () {
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                    }, 10);
                    return "\\(x_1 = 132\\)";
                })
                console.log("OK");
            });
    });


// // add the X Axis
// svg.append("g")
//     .attr("transform", "translate(0," + height + ")")
//     .call(d3.axisBottom(x_scale));
//
// // add the Y Axis
// svg.append("g")
//     .call(d3.axisLeft(y_scale));
