// TODO list
// - Meter aspa para cerrar song info
// - Colocar los circulos de los IES según force simulation
// - Actualizar el texto de la página
// - Meter logos
// - Hay textos en la song info que se salen. Cortar? wrap?
// - comprobar contraste colores

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
const svgHeight = svgWidth / 1.6;
const songR = 4;
const minStarR = windowWidth * 0.02;
const paddingR = 6;
const paddingH = 8;
let allSongsStarR;
const coord = {
  1: { x: svgWidth / 6 - svgWidth / 2, y: svgHeight / 4 - svgHeight / 2 },
  2: { x: (svgWidth / 6) * 3 - svgWidth / 2, y: svgHeight / 4 - svgHeight / 2 },
  3: { x: (svgWidth / 6) * 5 - svgWidth / 2, y: svgHeight / 4 - svgHeight / 2 },
  4: {
    x: svgWidth / 3 - svgWidth / 2,
    y: (svgHeight / 4) * 2.8 - svgHeight / 2,
  },
  5: {
    x: (svgWidth / 3) * 2 - svgWidth / 2,
    y: (svgHeight / 4) * 2.8 - svgHeight / 2,
  },
};
const center = { x: svgWidth / 2, y: svgHeight / 2 };
const duration = 1500;
const halfDuration = 750;
let vizState = "All";
let selectedSong;

function init(files) {
  const dataRaw = files[0];
  // console.log("dataRaw", dataRaw);

  // const musicGenres = getDistinctElements(dataRaw, d => d.music_genre);
  const musicGenres = [
    "Rock",
    "Hard rock",
    "Punk",
    "Pop",
    "Pop en español",
    "J-Pop",
    "K-Pop",
    "Electrónica",
    "Dance",
    "House",
    "Afro-beat",
    "Beatbox",
    "Hip-Hop",
    "Hip-hop/Rap",
    "Rap",
    "Latin rap",
    "Latino",
    "Urbano latino",
    "Música latina",
    "Salsa y Tropical",
    "Reggaeton, flamenco",
    "Flamenco",
    "Reggae",
    "Dubstep",
    "R&B/Soul",
    "Downtempo",
    "Cantautores",
    "Música infantil",
    "Músicas del mundo",
    "Gospel y música cristiana",
    "Musicales",
    "Banda sonora",
    "Futbol",
    "Publicidad",
    "New Age",
    "Alternativa",
    "",
  ];
  // console.log("musicGenres", JSON.stringify(musicGenres));
  // console.log("musicGenres", musicGenres.length);

  const data = formatSongsData(dataRaw, musicGenres);
  const dataByUniqueID = getDataByUniqueID(data);
  const genresData = formatGenresData(data, musicGenres);
  const dataByIESID = getDataByIESID(data, musicGenres);

  console.log("data", data);
  console.log("dataByUniqueID", dataByUniqueID);
  console.log("dataByUniqueID", Object.values(dataByUniqueID));
  // console.log("dataByIESID", dataByIESID);

  // Scales ////////////////////////////////////////////////////////////////
  const colors1 = [
    "#5cecb5",
    "#008c6c",
    "#02a3f9",
    "#00539c",
    "#027feb",
    "#a9b4ff",
    "#9985ff",
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
    "#ff8a7c",
    "#914135",
    "#f9634e",
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
  ];
  const colors = [
    "#aafd21",
    "#71a92f",
    "#b5fb82",
    "#80ff54",
    "#b9f9a3",
    "#74a66c",
    "#02d53f",
    "#00b65c",
    "#01ec84",
    "#24ae7d",
    "#1cffbe",
    "#7bbaa0",
    "#b3f6dc",
    "#7cffd8",
    "#97fae4",
    "#01b09c",
    "#01e9d7",
    "#02aad3",
    "#8bd1ff",
    "#799adb",
    "#c37ee5",
    "#e7b0ff",
    "#ff9ade",
    "#ff6dab",
    "#fc6d50",
    "#ffc39c",
    "#cb8c5f",
    "#ff8e0b",
    "#ffaf4c",
    "#ffac33",
    "#c19149",
    "#ffd87c",
    "#b59829",
    "#fce6ad",
    "#ffe754",
    "#acba00",
    "#e5f15d",
    "#d1f586",
  ];
  // console.log("colors", colors.length);
  const musicGenreColorScale = d3
    .scaleOrdinal()
    .domain(musicGenres)
    .range(colors);

  // Containers ////////////////////////////////////////////////////////////////
  const svg = d3
    .select("#graph")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .style("user-select", "none");

  const chartContainer = svg
    .append("g")
    .attr("transform", d => `translate(${svgWidth / 2}, ${svgHeight / 2})`);

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
  drawStars(dataByIESID, genresData);

  svg.on("click", () => update());

  function drawStars(dataByIESID, genresData) {
    const IESArray = Object.values(dataByIESID);

    const ies = chartContainer
      .selectAll(".IESContainer")
      .data(IESArray)
      .enter()
      .append("g")
      .attr("class", "IESContainer");

    // Music genres items
    const genresItems = chartContainer
      .selectAll(".musicGenresLabels")
      .data(genresData)
      .enter()
      .append("g")
      .attr("class", "musicGenresLabels")
      .attr("transform", d => {
        // Poner todos los nombres a la misma distancia?
        // TODO Calcular el rayHeight máximo. Ahora está puesto a mano
        const maxRayHeight = 7;
        const r =
          allSongsStarR +
          songR * 2 * maxRayHeight +
          paddingR * (maxRayHeight + 2);
        // const r =
        //   allSongsStarR +
        //   songR * 2 * d.rayHeight +
        //   paddingR * (d.rayHeight + 2);
        const x = r * Math.cos(d.angle);
        const y = r * Math.sin(d.angle);
        return `translate(${x}, ${y})`;
      });

    // Music genres names
    genresItems
      .append("text")
      .attr("transform", d => {
        if (d.angle < Math.PI / 2 || d.angle > (3 * Math.PI) / 2)
          return `rotate(${d.angle * (180 / Math.PI)})`;
        else return `rotate(${(d.angle + Math.PI) * (180 / Math.PI)})`;
      })
      .attr("dy", "0.35em")
      .attr("text-anchor", d => {
        if (d.angle < Math.PI / 2 || d.angle > (3 * Math.PI) / 2)
          return "start";
        else return "end";
      })
      .style("font", `${svgWidth * 0.01}px Arial`)
      // .style("fill", "#8F8F8F")
      .style("fill", d => musicGenreColorScale(d.musicGenreName))
      .style("opacity", 1)
      .text(d => d.musicGenreName);

    // Inner circle
    ies
      .append("circle")
      .attr("class", "IESCircle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", d => d.allStarR - svgWidth * 0.01)
      .style("fill", "none")
      .style("stroke", "grey")
      .style("stroke-width", "2px")
      .style("stroke-dasharray", "3, 3");

    // IES Name
    ies
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

    // Song info
    const songInfoContainer = chartContainer
      .append("g")
      .attr("id", "songInfoContainer")
      .style("opacity", 0);

    const videoWidth = allSongsStarR;
    const videoHeight = videoWidth / 1.77;

    // background Circle
    songInfoContainer
      .append("circle")
      .attr("id", "backgroundCircle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", allSongsStarR - svgWidth * 0.01)
      .style("fill", "#171717");

    // IES name
    songInfoContainer
      .append("text")
      .attr("id", "IESName")
      .attr("x", 0)
      .attr("y", -videoHeight / 2 - videoWidth * 0.17)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("font", "16px Arial")
      .style("fill", "#c2c2c2");

    // Student cover
    songInfoContainer
      .append("svg:image")
      .attr("id", "studentCover")
      .attr("x", -videoWidth * 0.2 - videoHeight - videoWidth * 0.04)
      .attr("y", -videoHeight / 2)
      .attr("width", videoHeight)
      .attr("height", videoHeight);

    // Video cover
    const videoContainer = songInfoContainer
      .append("g")
      .attr("id", "videoCoverContainer")
      .attr(
        "transform",
        `translate(${-videoWidth * 0.2}, ${-videoHeight / 2})`
      );

    videoContainer
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", videoWidth)
      .attr("height", videoHeight)
      .call(g => highlightVideo(g));

    videoContainer
      .append("svg:image")
      .attr("id", "videoCover")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", videoWidth)
      .attr("height", videoHeight)
      .style("pointer-events", "none");

    videoContainer
      .append("g")
      .attr("transform", `translate(${videoWidth / 2}, ${videoHeight / 2})`)
      .append("path")
      .attr("id", "playIcon")
      .attr("transform", "rotate(90)")
      .attr("d", triangle(videoWidth / 6))
      .style("fill", "none")
      .style("stroke", "white")
      .style("stroke-width", 2);

    // Song name
    songInfoContainer
      .append("text")
      .attr("id", "songName")
      .attr("x", -videoWidth * 0.2)
      .attr("y", videoHeight / 2 + videoWidth * 0.05)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .style("font", "12px Arial")
      .style("fill", "#fff");

    // Artist name
    songInfoContainer
      .append("text")
      .attr("id", "artistName")
      .attr("x", -videoWidth * 0.2)
      .attr("y", videoHeight / 2 + videoWidth * 0.15)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .style("font", "14px Arial")
      .style("fill", "#fff");

    // Music genre
    songInfoContainer
      .append("text")
      .attr("id", "musicGenre")
      .attr("x", -videoWidth * 0.2)
      .attr("y", videoHeight / 2 + videoWidth * 0.3)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .style("font", "18px Arial")
      .style("fill", "#fff");

    const rays = ies
      .selectAll(".rays")
      .data(d => d.songs)
      .enter()
      .append("g")
      .attr("class", "rays");

    const songCircles = rays
      .selectAll(".songs")
      .data(d => d)
      .enter()
      .append("g")
      .attr("class", "songs")
      .attr("transform", d => {
        const r =
          d.allStarR + paddingR + songR + (paddingR + songR * 2) * d.allIndex;
        const cx = r * Math.cos(d.allAngle);
        const cy = r * Math.sin(d.allAngle);
        return `translate(${cx}, ${cy})`;
      })
      .call(songCircles => showSongInfo(songCircles));

    songCircles
      .append("circle")
      .attr("class", "songSelected")
      .attr("id", d => d.uniqueID)
      .attr("r", songR + 5)
      .style("pointer-events", "all")
      .style("fill", "none")
      .style("stroke", d => musicGenreColorScale(d.music_genre))
      .style("stroke-opacity", 0);

    songCircles
      .append("circle")
      .style("filter", "url(#glow)")
      .attr("id", d => `${d.music_genre}-IES${d.IES_ID}-${d.loop_name}`)
      .attr("r", songR)
      .style("fill", d => musicGenreColorScale(d.music_genre));
  }

  function update() {
    if (vizState === "IES") {
      vizState = "All";

      d3.selectAll(".IESContainer")
        .transition()
        .duration(duration)
        .attr("transform", d => `translate(0,0)`);

      d3.selectAll(".IESCircle")
        .transition()
        .duration(duration)
        .attr("r", d => d.allStarR);

      d3.selectAll(".IESName")
        .transition()
        .duration(duration)
        .style("opacity", 0);

      d3.selectAll(".musicGenresLabels")
        .transition()
        .duration(duration)
        .style("opacity", 1);

      // d3.select("#elPratName")
      //   .transition()
      //   .duration(duration)
      //   .style("opacity", 1);

      d3.selectAll(".IESContainer")
        .selectAll(".rays")
        .selectAll(".songs")
        .transition()
        .duration(duration)
        .attr("transform", d => {
          const r =
            d.allStarR + paddingR + songR + (paddingR + songR * 2) * d.allIndex;
          const cx = r * Math.cos(d.allAngle);
          const cy = r * Math.sin(d.allAngle);
          return `translate(${cx}, ${cy})`;
        });
    } else if (vizState === "All") {
      vizState = "IES";

      // Deseleccionar cualquier canción que estuviera seleccionada
      d3.select(`#${selectedSong}`).style("stroke-opacity", 0);
      selectedSong = undefined;
      d3.select("#songInfoContainer").style("opacity", 0);

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

      d3.selectAll(".musicGenresLabels")
        .transition()
        .duration(halfDuration)
        .style("opacity", 0);
      // TODO queda un poco raro que aparezcan antes de que los puntos estén en su sitio

      d3.selectAll(".IESContainer")
        .selectAll(".rays")
        .selectAll(".songs")
        .transition()
        .duration(duration)
        .attr("transform", d => {
          const r =
            d.IESStarR + paddingR + songR + (paddingR + songR * 2) * d.IESIndex;
          const cx = r * Math.cos(d.IESAngle);
          const cy = r * Math.sin(d.IESAngle);
          return `translate(${cx}, ${cy})`;
        });
    }
  }

  function showSongInfo(songs) {
    songs.on("click", clicked);
    songs
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseout", mouseout);

    function clicked(event, song) {
      event.stopPropagation();
      if (vizState === "All") {
        if (song.uniqueID !== selectedSong) {
          // Si la canción que se ha seleccionado no estaba seleccionada

          // Deseleccionar la canción anterior
          d3.select(`#${selectedSong}`).style("stroke-opacity", 0);

          // Mostrar el círculo alrededor del punto de la canción que indica que está seleccionada
          d3.select(`#${song.uniqueID}`).style("stroke-opacity", 1);
          updateSongInfo(song);

          // actualizar selectedSong con el id de esta canción
          selectedSong = song.uniqueID;
        } else {
          // Si estaba seleccionada, deseleccionar
          selectedSong = undefined;
          d3.select(`#${song.uniqueID}`).style("stroke-opacity", 0);
        }
      }
    }
    function mouseover(event, song) {
      if (!selectedSong && vizState === "All") {
        d3.select("#songInfoContainer").style("opacity", 1);
      }
      const cursor = vizState === "All" ? "pointer" : "default";
      d3.select(this).style("cursor", cursor);
    }
    function mousemove(event, song) {
      if (!selectedSong && vizState === "All") {
        d3.select("#songInfoContainer").style("opacity", 1);

        updateSongInfo(song);
      }

      const cursor = vizState === "All" ? "pointer" : "default";
      d3.select(this).style("cursor", cursor);
    }
    function mouseout(event, song) {
      if (!selectedSong) d3.select("#songInfoContainer").style("opacity", 0);
    }
    function updateSongInfo(song) {
      d3.select("#studentCover").attr(
        "xlink:href",
        `data/student-covers/${song.loop_name}.jpg`
      );
      d3.select("#videoCover").attr("href", song.video_cover_url);
      d3.select("#videoCoverContainer")
        .select("rect")
        .attr("id", song.uniqueID);
      d3.select("#IESName").text(song.IES);
      d3.select("#studentName").text(song.loop_name.replace(/ .*/, ""));
      d3.select("#songName").text(
        song.base_song_title.replace(`, ${song.artist}`, "")
      );
      d3.select("#artistName").text(song.artist);
      d3.select("#musicGenre")
        .text(song.music_genre)
        .style("fill", musicGenreColorScale(song.music_genre));
    }
  }

  function highlightVideo(g) {
    g.on("click.video", clicked);

    g.on("mouseover.video", mouseover)
      .on("mousemove.video", mousemove)
      .on("mouseout.video", mouseout);

    function clicked(event) {
      event.stopPropagation();
      const songUniqueID = d3.select(event.target).attr("id");
      const videoUrl = dataByUniqueID[songUniqueID].youtube_url;
      window.open(videoUrl, "_blank");
    }
    function mouseover(event) {
      d3.select(event.target).style("cursor", "pointer");
      d3.select("#playIcon").style("fill", "white");
    }
    function mousemove(event) {
      d3.select(event.target).style("cursor", "pointer");
      d3.select("#playIcon").style("fill", "white");
    }
    function mouseout(event) {
      d3.select("#playIcon").style("fill", "none");
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
// UTILS //////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
function getDistinctElements(data, accesor = d => d) {
  return [...new Set(data.map(accesor))];
}

function triangle(l) {
  const h = (l * Math.sqrt(3)) / 2;
  return `M${0} ${-(h * 2) / 3} L${l / 2} ${h / 3} L${-l / 2} ${h / 3} Z`;
}

// function getVideoURL(url) {
//   const regex = /v=([A-Za-z0-9_-]{11})/;
//   const match = url.match(regex);

//   if (match && match[1]) {
//     const videoId = match[1];
//     return `https://www.youtube.com/embed/${videoId}`;
//   } else {
//     console.log("No video ID found.");
//   }
// }

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

function getDataByUniqueID(data) {
  const dataByUniqueID = {};
  data.forEach(song => {
    song["uniqueID"] = `song_${song.project_ID}_${song.loop_ID}`;
    if (!dataByUniqueID[`song_${song.project_ID}_${song.loop_ID}`])
      dataByUniqueID[`song_${song.project_ID}_${song.loop_ID}`] = song;
  });
  return dataByUniqueID;
}

function formatSongsData(data, musicGenres) {
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

  const allSongsStar = getSongsDistribution(data, musicGenres).raysArray;
  console.log("allSongsStar", allSongsStar);

  // Get Star inner radius when the songs are all together
  allSongsStarR =
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
    ).raysArray;

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

function formatGenresData(data, musicGenres) {
  const songsDistributions = getSongsDistribution(data, musicGenres);
  const numberOfRays = songsDistributions.raysArray.length;
  const angleUnit = (2 * Math.PI) / numberOfRays;

  const musicGenresItems = songsDistributions.genresArray.map((o, i, array) => {
    const angle =
      array
        .map(a => a.length)
        .reduce((acc, curr, index) => {
          if (index < i) {
            return acc + curr;
          } else if (index === i) {
            return acc + (curr - 1) / 2;
          } else {
            return acc;
          }
        }, 0) * angleUnit;
    const rayHeight = d3.max(o.map(d => d.length));

    const musicGenresItem = {};
    musicGenresItem.musicGenreName = o.flat()[0]["music_genre"];
    musicGenresItem.angle = angle;
    musicGenresItem.rayHeight = rayHeight;

    return musicGenresItem;
  });

  return musicGenresItems;
}

function getSongsDistribution(data, musicGenres) {
  const raysArray = [];
  musicGenres.forEach(musicGenre => {
    const array = data.filter(d => d.music_genre === musicGenre);
    const threshold = getThreshold(array);
    if (array.length !== 0) {
      raysArray.push(chunk(array, threshold));
    }
  });

  return { raysArray: raysArray.flat(), genresArray: raysArray };
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
    ).raysArray;
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
