export const GAUSSIAN_KERNAL_5X5 =  [
    [ 1/273, 4/273, 7/273, 4/273, 1/273],
    [4/273, 16/273, 26/273, 16/273, 4/273],
    [7/273, 26/273, 41/273, 26/273, 7/273],
    [4/273, 16/273, 26/273, 16/273, 4/273],
    [1/273, 4/273, 7/273, 4/273, 1/273]
]

export function CREATE_GAUSS_KERNAL(size){
    let sigma = 1;
    let W = size;
    let kernel = new Array(size).fill(0).map(() => new Array(size).fill(0));
    let mean = W/2;
    let sum = 0.0; // For accumulating the kernel values
    for (let x = 0; x < W; ++x){
        for (let y = 0; y < W; ++y) {
            kernel[x][y] = Math.exp( -0.5 * (Math.pow((x-mean)/sigma, 2.0) + Math.pow((y-mean)/sigma,2.0)) )
                / (2 * Math.PI * sigma * sigma);

            // Accumulate the kernel values
            sum += kernel[x][y];
        }

    }

    // Normalize the kernel
    for (let x = 0; x < W; ++x){
        for (let y = 0; y < W; ++y){
            kernel[x][y] /= sum;
        }
    }

    return kernel
}