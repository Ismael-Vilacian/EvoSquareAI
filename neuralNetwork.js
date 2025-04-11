class NeuralNetwork {
  constructor(input_nodes, hidden_nodes, output_nodes) {
    this.input_nodes = input_nodes;
    this.hidden_nodes = hidden_nodes;
    this.output_nodes = output_nodes;

    this.weights_ih = new Matrix(this.hidden_nodes, this.input_nodes).randomize();
    this.weights_ho = new Matrix(this.output_nodes, this.hidden_nodes).randomize();
    this.bias_h = new Matrix(this.hidden_nodes, 1).randomize();
    this.bias_o = new Matrix(this.output_nodes, 1).randomize();
  }

  predict(inputs_array) {
    let inputs = Matrix.fromArray(inputs_array);
    let hidden = Matrix.multiply(this.weights_ih, inputs);
    hidden.add(this.bias_h);
    hidden.map(sigmoid);

    let output = Matrix.multiply(this.weights_ho, hidden);
    output.add(this.bias_o);
    output.map(sigmoid);

    return output.toArray();
  }

  copy() {
    let clone = new NeuralNetwork(this.input_nodes, this.hidden_nodes, this.output_nodes);
    clone.weights_ih = this.weights_ih.copy();
    clone.weights_ho = this.weights_ho.copy();
    clone.bias_h = this.bias_h.copy();
    clone.bias_o = this.bias_o.copy();
    return clone;
  }

  mutate(rate) {
    this.weights_ih.map(e => e + (Math.random() * 2 - 1) * rate);
    this.weights_ho.map(e => e + (Math.random() * 2 - 1) * rate);
    this.bias_h.map(e => e + (Math.random() * 2 - 1) * rate);
    this.bias_o.map(e => e + (Math.random() * 2 - 1) * rate);
  }
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

class Matrix {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.data = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
  }

  static fromArray(arr) {
    let m = new Matrix(arr.length, 1);
    for (let i = 0; i < arr.length; i++) {
      m.data[i][0] = arr[i];
    }
    return m;
  }

  toArray() {
    let arr = [];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        arr.push(this.data[i][j]);
      }
    }
    return arr;
  }

  randomize() {
    return this.map(e => Math.random() * 2 - 1);
  }

  static multiply(a, b) {
    if (a.cols !== b.rows) throw new Error('Columns of A must match rows of B');
    let result = new Matrix(a.rows, b.cols);
    for (let i = 0; i < result.rows; i++) {
      for (let j = 0; j < result.cols; j++) {
        let sum = 0;
        for (let k = 0; k < a.cols; k++) {
          sum += a.data[i][k] * b.data[k][j];
        }
        result.data[i][j] = sum;
      }
    }
    return result;
  }

  add(n) {
    return this.map((e, i, j) => e + n.data[i][j]);
  }

  map(fn) {
    this.data = this.data.map((row, i) =>
      row.map((val, j) => fn(val, i, j))
    );
    return this;
  }

  copy() {
    let m = new Matrix(this.rows, this.cols);
    m.data = this.data.map(row => row.slice());
    return m;
  }
}