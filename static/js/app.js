var svgWidth = 800;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 50
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold the chart,
// and shift the chart by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


d3.csv("/static/data/data.csv", function (error, stateData) {
  if (error) throw error;

  stateData.forEach(function (data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
  });

  // Create scale functions
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d.poverty)-1, d3.max(stateData, d => d.poverty)+1])
    .range([0, width]);

  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d.healthcare)-1, d3.max(stateData, d => d.healthcare)+2])
    .range([height, 0]);

  // Create axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Append Axes to the chart
  chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  chartGroup.append("g")
    .call(leftAxis);

  // Create Circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(stateData)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", "13")
    .attr("opacity", ".5");

  /* Create the text for each circle */
  var circleText = chartGroup.selectAll("text.values")
  .data(stateData)
  .enter()
  .append("text")
  .text(d => d.abbr)
  .attr("dx", d => xLinearScale(d.poverty))
  .attr("dy", d => yLinearScale(d.healthcare)+4)
  .classed("stateText", true);

  // Initialize tool tip
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([0,0])
    .html(function (d) {
      return (`${d.state}<br>Poverty: ${d.poverty}<br>Healthcare: ${d.healthcare}`);
    });

  // Create tooltip in the chart
  circleText.call(toolTip);

  // Create event listeners to display and hide the tooltip
  circleText.on("mouseover", function (data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  // Create axes labels
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", "aText")
    .text("Lacks Healthcare (%)");

  chartGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 25})`)
    .attr("class", "aText")
    .text("In Poverty (%)");

});
