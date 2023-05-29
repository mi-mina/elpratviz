const radii = Array.from({length: 1000}, d3.randomUniform(4, 18))
console.log("radii", radii)

const height = 1152
const width = height

const context = d3.select("#viz").context2d(width, height);
const nodes = radii.map(r => ({r}));

const simulation = d3.forceSimulation(nodes)
    .velocityDecay(0.2)
    .force("x", d3.forceX().strength(0.002))
    .force("y", d3.forceY().strength(0.002))
    .force("collide", d3.forceCollide().radius(d => d.r + 0.5).iterations(2))
    .on("tick", ticked);

function ticked() {
  context.clearRect(0, 0, width, height);
  context.save();
  context.translate(width / 2, height / 2);
  context.beginPath();
  for (const d of nodes) {
    context.moveTo(d.x + d.r, d.y);
    context.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
  }
  context.fillStyle = "#ddd";
  context.fill();
  context.strokeStyle = "#333";
  context.stroke();
  context.restore();
}