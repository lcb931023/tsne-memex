const db = new DataWrap(DATABASE);
db.install();

const memex = db.database

// [['philosophy', 14], ['psychology', 12]]
const allTags = db.getStats().tags

/**
 * {
 *    'starlight': [0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
 *    'high fall': [1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
 * }
 */
const preparedMemex = {}

for (const key in memex) {
  if (memex.hasOwnProperty(key)) {
    const meme = memex[key]
    // avoid processing memes that aren't properly tagged
    if (!meme.TAGS) continue;
    preparedMemex[key] = []
    allTags.forEach(tag => {
      const tagName = tag[0]
      if (meme.TAGS.includes(tagName)) preparedMemex[key].push(1)
      else preparedMemex[key].push(0)
    });
  }
}

console.log(preparedMemex)

let model = new TSNE({
  dim: 2,
  perplexity: 30.0,
  earlyExaggeration: 4.0,
  learningRate: 100.0,
  nIter: 1000,
  metric: 'euclidean'
});

model.init({
  data: Object.values(preparedMemex),
  type: 'dense'
});

// `error`,  `iter`: final error and iteration number
// note: computation-heavy action happens here
let [error, iter] = model.run();

// // rerun without re-calculating pairwise distances, etc.
// let [error, iter] = model.rerun();

// // `output` is unpacked ndarray (regular nested javascript array)
// let output = model.getOutput();

// // `outputScaled` is `output` scaled to a range of [-1, 1]
let outputScaled = model.getOutputScaled();

console.log(outputScaled)

var trace1 = {
  x: outputScaled.map(output => output[0]),
  y: outputScaled.map(output => output[1]),
  type: 'scatter',
  mode: 'markers',
  textposition: 'top center',
  textfont: {
    size: 12,
  },
  text: Object.keys(preparedMemex),
  marker: { size: 8, color: '#000000' }
};

var data = [ trace1 ];

var layout = {
  xaxis: {
    range: [ -1.1, 1.1 ]
  },
  yaxis: {
    range: [ -1.1, 1.1 ]
  },
  hovermode: 'closest',
  dragmode: 'pan',
  title:'Memex'
};

Plotly.newPlot('vis', data, layout, {
  scrollZoom: true,
});
