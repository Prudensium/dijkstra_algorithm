const graphData = {
  nodes: [],
  links: []
};

const width = 400;
const height = 400;

const svg = d3.select("#graph")
  .attr("width", width)
  .attr("height", height);

const simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(d => d.id).distance(100))
  .force("charge", d3.forceManyBody().strength(-200))
  .force("center", d3.forceCenter(width / 2, height / 2));

document.getElementById("add-edge").addEventListener("click", () => {
  const node1 = document.getElementById("node1").value.trim();
  const node2 = document.getElementById("node2").value.trim();
  const weight = +document.getElementById("weight").value;

  if (!node1 || !node2 || isNaN(weight)) return;

  if (!graphData.nodes.find(node => node.id === node1)) {
    graphData.nodes.push({ id: node1 });
  }
  if (!graphData.nodes.find(node => node.id === node2)) {
    graphData.nodes.push({ id: node2 });
  }
  graphData.links.push({ source: node1, target: node2, weight });

  updateGraph();
});

document.getElementById("find-path").addEventListener("click", () => {
  const start = document.getElementById("start-node").value.trim();
  const end = document.getElementById("end-node").value.trim();
  const result = dijkstra(graphData, start, end);
  document.getElementById("path-result").textContent = result;
});

function updateGraph() {
  const link = svg.selectAll(".link")
    .data(graphData.links)
    .join("line")
    .attr("class", "link")
    .attr("stroke", "#000");

  const node = svg.selectAll(".node")
    .data(graphData.nodes)
    .join("circle")
    .attr("class", "node")
    .attr("r", 10)
    .attr("fill", "#6200EA");

  const text = svg.selectAll(".text")
    .data(graphData.nodes)
    .join("text")
    .attr("class", "text")
    .attr("dx", 12)
    .attr("dy", 4)
    .text(d => d.id);

  simulation.nodes(graphData.nodes).on("tick", () => {
    node.attr("cx", d => d.x).attr("cy", d => d.y);
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);
    text.attr("x", d => d.x).attr("y", d => d.y);
  });

  simulation.force("link").links(graphData.links);
  simulation.alpha(1).restart();
}

function dijkstra(graph, start, end) {
  const nodes = new Set(graph.nodes.map(n => n.id));
  const distances = {};
  const previous = {};

  nodes.forEach(node => {
    distances[node] = Infinity;
    previous[node] = null;
  });
  distances[start] = 0;

  while (nodes.size) {
    const current = Array.from(nodes).reduce((minNode, node) =>
      distances[node] < distances[minNode] ? node : minNode
    );

    nodes.delete(current);

    if (current === end) {
      const path = [];
      let temp = end;
      while (temp) {
        path.unshift(temp);
        temp = previous[temp];
      }
      return `Кратчайший путь: ${path.join(" -> ")}, Длина: ${distances[end]}`;
    }

    graph.links
      .filter(link => link.source.id === current || link.target.id === current)
      .forEach(link => {
        const neighbor = link.source.id === current ? link.target.id : link.source.id;
        const newDist = distances[current] + link.weight;

        if (newDist < distances[neighbor]) {
          distances[neighbor] = newDist;
          previous[neighbor] = current;
        }
      });
  }

  return "Путь не найден";
}
