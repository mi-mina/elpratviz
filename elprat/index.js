function loadData() {
  const files = [d3.csv(`data/el_prat_song_data.csv`)];

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

// Constants ////////////////////////////////////////////////////////////////
const windowWidth = document.getElementById("graph").clientWidth;
const svgWidth = 1500 > windowWidth ? windowWidth : 1500;
const svgHeight = svgWidth / 1.8;
const songR = 4;
const minStarR = windowWidth * 0.02;
const paddingR = 6;
const paddingH = 8;
const coord = {
  1: { x: svgWidth / 6, y: svgHeight / 4 },
  2: { x: (svgWidth / 6) * 3, y: svgHeight / 4 },
  3: { x: (svgWidth / 6) * 5, y: svgHeight / 4 },
  4: { x: svgWidth / 3, y: (svgHeight / 4) * 2.8 },
  5: { x: (svgWidth / 3) * 2, y: (svgHeight / 4) * 2.8 },
};
const center = { x: svgWidth / 2, y: svgHeight / 2 };
const duration = 1500;
let state = "All";

function init(files) {
  const dataRaw = files[0];
  // console.log("dataRaw", dataRaw);

  const musicGenres = getDistinctElements(dataRaw, d => d.music_genre);
  // console.log("musicGenres", musicGenres);

  const data = formatData(dataRaw, musicGenres);
  console.log("data", data);

  const dataByIESID = getDataByIESID(data, musicGenres);
  // console.log("dataByIESID", dataByIESID);

  // Scales ////////////////////////////////////////////////////////////////
  const musicGenreColorScale = d3
    .scaleOrdinal()
    .domain(musicGenres)
    .range([
      "#5cecb5",
      "#008c6c",
      "#02a3f9",
      "#00539c",
      "#027feb",
      "#a9b4ff",
      "#002e76",
      "#9985ff",
      "#2e0e69",
      "#d097ff",
      "#954abd",
      "#dea9ec",
      "#f2a9ff",
      "#e16edd",
      "#86007a",
      "#ffa5e2",
      "#ff6ecf",
      "#9e216f",
      "#952b36",
      "#eb4557",
      "#8c0021",
      "#ff8a7c",
      "#914135",
      "#f9634e",
      "#990005",
      "#6a1f00",
      "#b74108",
      "#ff9c5e",
      "#824700",
      "#ffb246",
      "#fbce6e",
      "#e3b82f",
      "#7d7700",
      "#92b72a",
      "#7e9048",
      "#558f00",
      "#a2e676",
      "#aee296",
      "#006604",
      "#69eb84",
      "#01bc69",
      "#01b37d",
      "#008a61",
    ]);

  // Containers ////////////////////////////////////////////////////////////////
  const svg = d3
    .select("#graph")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Glow ////////////////////////////////////////////////////////////////

  const defs = svg.append("defs");

  const filter = defs
    .append("filter")
    .attr("width", "300%")
    .attr("x", "-100%")
    .attr("height", "300%")
    .attr("y", "-100%")
    .attr("id", "glow");

  filter
    .append("feGaussianBlur")
    .attr("class", "blur")
    .attr("stdDeviation", "5")
    .attr("result", "coloredBlur");

  const feMerge = filter.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "coloredBlur");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  // Draw /////////////////////////////////////////////////////////////////////
  drawStars(dataByIESID);

  d3.select("body").on("click", () => update());

  function update() {
    if (state === "IES") {
      state = "All";

      d3.selectAll(".IESContainer")
        .transition()
        .duration(duration)
        .attr(
          "transform",
          d => `translate(${d.allCoords.x}, ${d.allCoords.y})`
        );

      d3.selectAll(".IESCircle")
        .transition()
        .duration(duration)
        .attr("r", d => d.allStarR);

      d3.selectAll(".IESName")
        .transition()
        .duration(duration)
        .style("opacity", 0);

      d3.select("#elPratName")
        .transition()
        .duration(duration)
        .style("opacity", 1);

      d3.selectAll(".IESContainer")
        .selectAll(".rays")
        .selectAll(".songs")
        .transition()
        .duration(duration)
        .attr("cx", d => {
          const r =
            d.allStarR + paddingR + songR + (paddingR + songR * 2) * d.allIndex;
          const cx = r * Math.cos(d.allAngle);
          return cx;
        })
        .attr("cy", d => {
          const r =
            d.allStarR + paddingR + songR + (paddingR + songR * 2) * d.allIndex;
          const cy = r * Math.sin(d.allAngle);
          return cy;
        });
    } else if (state === "All") {
      state = "IES";

      d3.selectAll(".IESContainer")
        .transition()
        .duration(duration)
        .attr(
          "transform",
          d => `translate(${d.IESCoords.x}, ${d.IESCoords.y})`
        );

      d3.selectAll(".IESCircle")
        .transition()
        .duration(duration)
        .attr("r", d => d.IESStarR);

      d3.selectAll(".IESName")
        .transition()
        .duration(duration)
        .style("opacity", 1);

      d3.select("#elPratName")
        .transition()
        .duration(duration)
        .style("opacity", 0);

      d3.selectAll(".IESContainer")
        .selectAll(".rays")
        .selectAll(".songs")
        .transition()
        .duration(duration)
        .attr("cx", d => {
          const r =
            d.IESStarR + paddingR + songR + (paddingR + songR * 2) * d.IESIndex;
          const cx = r * Math.cos(d.IESAngle);
          return cx;
        })
        .attr("cy", d => {
          const r =
            d.IESStarR + paddingR + songR + (paddingR + songR * 2) * d.IESIndex;
          const cy = r * Math.sin(d.IESAngle);
          return cy;
        });
    }
  }

  function drawStars(data) {
    const IESArray = Object.values(data);

    const chartContainer = svg
      .selectAll(".IESContainer")
      .data(IESArray)
      .enter()
      .append("g")
      .attr("class", "IESContainer")
      .attr("transform", d => `translate(${d.allCoords.x}, ${d.allCoords.y})`);

    // Inner circle
    chartContainer
      .append("circle")
      .attr("class", "IESCircle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", d => d.allStarR)
      .style("fill", "none")
      .style("stroke", "lightGrey")
      .style("stroke-width", "2px")
      .style("stroke-dasharray", "3, 3");

    // IES Name
    chartContainer
      .append("text")
      .attr("class", "IESName")
      .attr("x", 0)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("font", `${svgWidth * 0.01}px Arial`)
      .style("fill", "#fff")
      .style("opacity", 0)
      .text(d => d.name)
      .call(text => {
        text.each(function (d) {
          wrap(d3.select(this), d.IESStarR * 2 - paddingH, "middle");
        });
      });

    // El Prat Name
    svg
      .append("text")
      .attr("id", "elPratName")
      .attr("x", svgWidth / 2)
      .attr("y", svgHeight / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("font", "14px Arial")
      .style("fill", "#fff")
      .style("opacity", 1)
      .text(d => "El Prat");

    const rays = chartContainer
      .selectAll(".rays")
      .data(d => d.songs)
      .enter()
      .append("g")
      .attr("class", "rays");

    rays
      .selectAll(".songs")
      .data(d => d)
      .enter()
      .append("circle")
      .attr("class", "songs")
      .style("filter", "url(#glow)")
      .attr("id", d => `${d.music_genre}-IES${d.IES_ID}-${d.loop_name}`)
      .attr("cx", d => {
        const r =
          d.allStarR + paddingR + songR + (paddingR + songR * 2) * d.allIndex;
        const cx = r * Math.cos(d.allAngle);
        return cx;
      })
      .attr("cy", d => {
        const r =
          d.allStarR + paddingR + songR + (paddingR + songR * 2) * d.allIndex;
        const cy = r * Math.sin(d.allAngle);
        return cy;
      })
      .attr("r", songR)
      .style("fill", d => musicGenreColorScale(d.music_genre));
  }
}

///////////////////////////////////////////////////////////////////////////////
// UTILS //////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
function getDistinctElements(data, accesor = d => d) {
  return [...new Set(data.map(accesor))];
}
function chunk(array, threshold) {
  const tempContainer = [];

  function cut(array, threshold) {
    if (array.length > threshold) {
      const subset = array.splice(0, threshold);
      tempContainer.push(subset);
      cut(array, threshold);
    } else {
      tempContainer.push(array);
    }
  }

  cut(array, threshold);

  return tempContainer;
}

function getStarInnerRadius(data) {
  return (
    (data.length * 2 * songR + (data.length - 1) * paddingH) / (2 * Math.PI) -
    paddingR -
    songR
  );
}

function formatData(data, musicGenres) {
  // const simulation = d3
  //   .forceSimulation(nodes)
  //   // .force("charge", d3.forceManyBody().strength(5))
  //   .force(
  //     "collide",
  //     d3.forceCollide().radius(d => 2 + d.r)
  //   )
  //   .force("x", d3.forceX(svgWidth / 2))
  //   .force("y", d3.forceY(svgHeight / 2))
  //   .on("tick", ticked);

  const allSongsStar = getSongsDistribution(data, musicGenres).songsArray;
  console.log("allSongsStar", allSongsStar);

  // Get Star inner radius when the songs are all together
  const allSongsStarR =
    getStarInnerRadius(allSongsStar) > minStarR
      ? getStarInnerRadius(allSongsStar)
      : minStarR;

  // Get angle when the songs are all together
  allSongsStar.forEach((d, i, array) => {
    d.forEach((o, index) => {
      o.allAngle = ((2 * Math.PI) / array.length) * i;
      o.allStarR = allSongsStarR;
      o.allIndex = index;
    });
  });

  const IESIDs = getDistinctElements(data, d => d.IES_ID);

  IESIDs.forEach(IESID => {
    const thisIESSonsData = data.filter(d => d.IES_ID === IESID);

    const IESSongsStar = getSongsDistribution(
      thisIESSonsData,
      musicGenres
    ).songsArray;

    // Get Star inner radius when the songs are by IES
    const IESSongsStarR =
      getStarInnerRadius(IESSongsStar) > minStarR
        ? getStarInnerRadius(IESSongsStar)
        : minStarR;

    // Get angle when the songs are by IES
    IESSongsStar.forEach((d, i, array) => {
      d.forEach((o, index) => {
        o.IESAngle = ((2 * Math.PI) / array.length) * i;
        o.IESStarR = IESSongsStarR;
        o.IESIndex = index;
      });
    });
  });

  return data;
}

function getSongsDistribution(data, musicGenres) {
  const songsArray = [];
  musicGenres.forEach(musicGenre => {
    const array = data.filter(d => d.music_genre === musicGenre);
    const threshold = getThreshold(array);
    if (array.length !== 0) {
      songsArray.push(chunk(array, threshold));
    }
  });

  return { songsArray: songsArray.flat(), genresArray: songsArray };
}

function getDataByIESID(data, musicGenres) {
  const IESIDs = getDistinctElements(data, d => d.IES_ID);

  const dataByIESID = {};

  IESIDs.forEach(IESID => {
    const thisIES = (dataByIESID[IESID] = {});
    const thisIESSonsData = data.filter(d => d.IES_ID === IESID);

    thisIES.name = thisIESSonsData[0]["IES"];
    thisIES.IESStarR = thisIESSonsData[0].IESStarR;
    thisIES.allStarR = thisIESSonsData[0].allStarR;
    thisIES.IESCoords = coord[IESID];
    thisIES.allCoords = center;
    thisIES.songs = getSongsDistribution(
      thisIESSonsData,
      musicGenres
    ).songsArray;
  });

  return dataByIESID;
}

function getThreshold(array) {
  return array.length < 3
    ? 2
    : array.length < 8
    ? 3
    : array.length < 15
    ? 4
    : array.length < 25
    ? 5
    : array.length < 35
    ? 6
    : 7;
}

function wrap(text, width, verticalAllignment) {
  // In order to work properly, the text must have defined attr "x" and "y"
  text.each(function (d, i, nodes) {
    const text = d3.select(nodes[i]);

    const words = text.text().split(/\s+/).reverse();

    let word;
    let line = [];
    let lineNumber = 0;
    const lineHeight = 1.15; // ems
    const x = text.attr("x");
    const y = text.attr("y") || 0;
    const dy = parseFloat(text.attr("dy"));
    let tspan = text
      .text(null)
      .append("tspan")
      .attr("x", x)
      .attr("y", y)
      .attr("dy", dy + "em");
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));

      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);

        if (verticalAllignment === "middle") {
          text
            .selectAll("tspan")
            .attr("y", y - (lineHeight * lineNumber) / 2 + "em");
        }
      }
    }
  });
}

// const nodes = [{ r: 75 }, { r: 90 }, { r: 35 }, { r: 90 }, { r: 50 }];

// function ticked() {
//   svg
//     .selectAll("circle")
//     .data(nodes)
//     .join("circle")
//     .attr("r", d => d.r)
//     .style("fill", "pink")
//     .attr("cx", function (d) {
//       return d.x;
//     })
//     .attr("cy", function (d) {
//       return d.y;
//     });
// }
