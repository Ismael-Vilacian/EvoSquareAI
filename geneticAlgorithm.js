function evolve(oldGen) {
  let maxScore = Math.max(...oldGen.map(d => d.score));
  oldGen.forEach(d => d.fitness = d.score / maxScore);

  let newGen = [];
  for (let i = 0; i < oldGen.length; i++) {
    let parent = selectOne(oldGen);
    let child = parent.clone();
    child.brain.mutate(0.1);
    newGen.push(child);
  }
  return newGen;
}

function selectOne(gen) {
  let r = Math.random();
  let sum = 0;
  for (let d of gen) {
    sum += d.fitness;
    if (sum > r) return d;
  }
  return gen[0];
}