/**
 * Hungarian Algorithm (Munkres Algorithm) for optimal assignment problem
 * Used to assign players to positions to maximize total team rating
 */

export interface Assignment {
  row: number;
  col: number;
  cost: number;
}

/**
 * Solves the assignment problem using Hungarian algorithm
 * @param costMatrix - Matrix where costMatrix[i][j] is the cost of assigning row i to column j
 * @returns Array of assignments (row index to column index)
 */
export function hungarianAlgorithm(costMatrix: number[][]): number[] {
  const n = costMatrix.length;
  const m = costMatrix[0]?.length || 0;

  if (n === 0 || m === 0) return [];

  // Make it a square matrix by padding with high costs
  const size = Math.max(n, m);
  const matrix: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (i < n && j < m) {
        matrix[i][j] = costMatrix[i][j];
      } else {
        matrix[i][j] = 1e9; // Large penalty for non-existent assignments
      }
    }
  }

  // Step 1: Subtract row minimums
  for (let i = 0; i < size; i++) {
    const rowMin = Math.min(...matrix[i]);
    for (let j = 0; j < size; j++) {
      matrix[i][j] -= rowMin;
    }
  }

  // Step 2: Subtract column minimums
  for (let j = 0; j < size; j++) {
    let colMin = matrix[0][j];
    for (let i = 1; i < size; i++) {
      colMin = Math.min(colMin, matrix[i][j]);
    }
    for (let i = 0; i < size; i++) {
      matrix[i][j] -= colMin;
    }
  }

  // Step 3: Find optimal assignment using augmenting path method
  const assignment = new Array(size).fill(-1);
  const rowCovered = new Array(size).fill(false);
  const colCovered = new Array(size).fill(false);

  // Try to find initial assignment with zeros
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (matrix[i][j] === 0 && assignment[i] === -1 && !colCovered[j]) {
        assignment[i] = j;
        colCovered[j] = true;
        break;
      }
    }
  }

  // Augment the assignment until complete
  let maxIterations = size * size;
  let iteration = 0;

  while (assignment.includes(-1) && iteration < maxIterations) {
    iteration++;

    // Reset coverage
    rowCovered.fill(false);
    colCovered.fill(false);

    // Cover columns with assignments
    for (let i = 0; i < size; i++) {
      if (assignment[i] !== -1) {
        colCovered[assignment[i]] = true;
      }
    }

    // Mark rows without assignments
    for (let i = 0; i < size; i++) {
      if (assignment[i] === -1) {
        rowCovered[i] = true;
      }
    }

    // Find minimum uncovered value
    let minUncovered = Infinity;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!rowCovered[i] && !colCovered[j]) {
          minUncovered = Math.min(minUncovered, matrix[i][j]);
        }
      }
    }

    if (minUncovered === Infinity) break;

    // Adjust matrix
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!rowCovered[i] && !colCovered[j]) {
          matrix[i][j] -= minUncovered;
        } else if (rowCovered[i] && colCovered[j]) {
          matrix[i][j] += minUncovered;
        }
      }
    }

    // Try to find new assignments
    for (let i = 0; i < size; i++) {
      if (assignment[i] === -1) {
        for (let j = 0; j < size; j++) {
          if (matrix[i][j] === 0 && !colCovered[j]) {
            assignment[i] = j;
            colCovered[j] = true;
            break;
          }
        }
      }
    }
  }

  // Return only the first n assignments (original problem size)
  return assignment.slice(0, n);
}

/**
 * Greedy fallback algorithm when Hungarian fails or for simpler cases
 * Assigns players to their best available positions
 */
export function greedyAssignment(costMatrix: number[][]): number[] {
  const n = costMatrix.length;
  const m = costMatrix[0]?.length || 0;

  if (n === 0 || m === 0) return [];

  const assignment = new Array(n).fill(-1);
  const usedCols = new Set<number>();

  // Create list of all player-position pairs with their costs
  const pairs: { row: number; col: number; cost: number }[] = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      pairs.push({ row: i, col: j, cost: costMatrix[i][j] });
    }
  }

  // Sort by cost (ascending, since we want minimum cost)
  pairs.sort((a, b) => a.cost - b.cost);

  // Greedily assign
  for (const pair of pairs) {
    if (assignment[pair.row] === -1 && !usedCols.has(pair.col)) {
      assignment[pair.row] = pair.col;
      usedCols.add(pair.col);

      // If all rows assigned, we're done
      if (usedCols.size === n) break;
    }
  }

  return assignment;
}
