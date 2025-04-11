const nnCanvas = document.getElementById('nnCanvas');
const nnCtx = nnCanvas.getContext('2d');

function drawNeuralNetwork(nn) {
  nnCtx.clearRect(0, 0, nnCanvas.width, nnCanvas.height);

  const layers = [nn.input_nodes, nn.hidden_nodes, nn.output_nodes];
  const neuronRadius = 10;
  const layerSpacing = nnCanvas.width / (layers.length + 1);

  const positions = [];

  for (let l = 0; l < layers.length; l++) {
    const layerSize = layers[l];
    const layerYSpacing = nnCanvas.height / (layerSize + 1);
    const layerX = layerSpacing * (l + 1);
    positions[l] = [];
    for (let n = 0; n < layerSize; n++) {
      const y = layerYSpacing * (n + 1);
      positions[l].push({ x: layerX, y });
    }
  }

  const input = [
    Math.random(), Math.random(), Math.random(), Math.random()
  ];

  let activations = [input];
  let hidden_input = Matrix.multiply(nn.weights_ih, Matrix.fromArray(input));
  hidden_input.add(nn.bias_h);
  hidden_input.map(sigmoid);
  activations.push(hidden_input.toArray());

  let output_input = Matrix.multiply(nn.weights_ho, hidden_input);
  output_input.add(nn.bias_o);
  output_input.map(sigmoid);
  activations.push(output_input.toArray());

  for (let l = 0; l < layers.length - 1; l++) {
    const fromLayer = positions[l];
    const toLayer = positions[l + 1];
    const weights = l === 0 ? nn.weights_ih : nn.weights_ho;
    const actFrom = activations[l];
    const actTo = activations[l + 1];

    for (let i = 0; i < fromLayer.length; i++) {
      for (let j = 0; j < toLayer.length; j++) {
        const weight = weights.data[j][i];
        const activation = actFrom[i] * actTo[j];
        nnCtx.beginPath();
        nnCtx.moveTo(fromLayer[i].x, fromLayer[i].y);
        nnCtx.lineTo(toLayer[j].x, toLayer[j].y);
        nnCtx.strokeStyle = activation > 0.5 ? "red" : "lightgray";
        nnCtx.lineWidth = activation > 0.5 ? 2 : 1;
        nnCtx.stroke();
      }
    }
  }

  for (let l = 0; l < layers.length; l++) {
    for (let n = 0; n < layers[l]; n++) {
      const { x, y } = positions[l][n];
      const activation = activations[l][n];
      nnCtx.beginPath();
      nnCtx.arc(x, y, neuronRadius, 0, Math.PI * 2);
      nnCtx.fillStyle = activation > 0.5 ? "red" : "#0cf";
      nnCtx.fill();
      nnCtx.strokeStyle = "black";
      nnCtx.stroke();
    }
  }
}

const nnCanvasBest = document.getElementById('nnCanvasBest');
const bestCtx = nnCanvasBest.getContext('2d');

function drawNeuralNetworkWithWeights(nn) {
  bestCtx.clearRect(0, 0, nnCanvasBest.width, nnCanvasBest.height);

  const layers = [nn.input_nodes, nn.hidden_nodes, nn.output_nodes];
  const neuronRadius = 10;
  const layerSpacing = nnCanvasBest.width / (layers.length + 1);
  const positions = [];

  for (let l = 0; l < layers.length; l++) {
    const layerSize = layers[l];
    const layerYSpacing = nnCanvasBest.height / (layerSize + 1);
    const layerX = layerSpacing * (l + 1);
    positions[l] = [];
    for (let n = 0; n < layerSize; n++) {
      const y = layerYSpacing * (n + 1);
      positions[l].push({ x: layerX, y });
    }
  }

  for (let l = 0; l < layers.length - 1; l++) {
    const fromLayer = positions[l];
    const toLayer = positions[l + 1];
    const weights = l === 0 ? nn.weights_ih : nn.weights_ho;

    for (let i = 0; i < fromLayer.length; i++) {
      for (let j = 0; j < toLayer.length; j++) {
        const weight = weights.data[j][i];
        bestCtx.beginPath();
        bestCtx.moveTo(fromLayer[i].x, fromLayer[i].y);
        bestCtx.lineTo(toLayer[j].x, toLayer[j].y);
        bestCtx.strokeStyle = weight > 0 ? "#0f0" : "#f00";
        bestCtx.lineWidth = Math.abs(weight) * 2;
        bestCtx.stroke();

        const midX = (fromLayer[i].x + toLayer[j].x) / 2;
        const midY = (fromLayer[i].y + toLayer[j].y) / 2;
        bestCtx.fillStyle = "#fff";
        bestCtx.font = "10px monospace";
        bestCtx.fillText(weight.toFixed(2), midX, midY);
      }
    }
  }

  for (let l = 0; l < layers.length; l++) {
    for (let n = 0; n < layers[l]; n++) {
      const { x, y } = positions[l][n];
      bestCtx.beginPath();
      bestCtx.arc(x, y, neuronRadius, 0, Math.PI * 2);
      bestCtx.fillStyle = "#0099ff";
      bestCtx.fill();
      bestCtx.strokeStyle = "#fff";
      bestCtx.stroke();
    }
  }
}