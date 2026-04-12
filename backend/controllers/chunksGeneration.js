export function chunkTextWithOverlap(text, chunkSize, overlap) {
    const chunks = [];
    const step = Math.max(1, chunkSize - overlap);

    for (let i = 0; i < text.length; i += step) {
        chunks.push(text.slice(i, i + chunkSize));
    }

    return chunks;
}