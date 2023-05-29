function loadData() {
  const files = [d3.csv(`data/genre_attrs.csv`)];

  Promise.all(files)
    .then(function (files) {
      init(files);
    })
    .catch(function (err) {
      // handle error here
      console.log("Promise all error", err);
    });
}

loadData();

function init(files) {
  const data = files[0];
  console.log("data", data);

  const container = d3.select("#graph");

  data.forEach(genre => {
    container
      .append("p")
      .style("color", genre.hex_colour)
      .style("margin", 0)
      .text(genre.genre);
  });
}
