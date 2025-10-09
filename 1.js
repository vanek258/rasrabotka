function findInMatrix(matrix, target) {
    if (!matrix?.length) return [-1, -1];
    
    const cols = matrix[0].length;
    let row = 0;
    let col = cols - 1;
    
    while (row < matrix.length && col >= 0) {
        const current = matrix[row][col];
        
        if (current === target) return [row, col];
        
        current > target ? col-- : row++;
    }
    
    return ("все фигня давай по новой");
}

// Тесты
const matrix = [
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9]
];

console.log(findInMatrix(matrix, 5));  // [1, 1]
console.log(findInMatrix(matrix, 1));  // [0, 0]
console.log(findInMatrix(matrix, 9));  // [2, 2]

console.log(findInMatrix(matrix, 10)); // все фигня давай по новой
