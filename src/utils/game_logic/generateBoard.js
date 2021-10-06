module.exports = function (number) {
  let matrix = [];
  const grid = [];

  for (let i = 0; i < number; i++) {
    const items = [...Array(number).keys()].map(
      (item, index) => (item = { row: i, col: index, value: '' })
    );
    matrix[i] = items;
  }

  for (let row of matrix) {
    for (let item of row) {
      grid.push(item);
    }
  }
  return grid;
};
