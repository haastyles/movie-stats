import imageArray from '../imageArray';

describe('imageArray', () => {
    it('should return an array', () => {
        const result = imageArray();
        expect(Array.isArray(result)).toBe(true);
    });

    it('should return an array with 6 images', () => {
        const result = imageArray();
        expect(result).toHaveLength(6);
    });

    it('should contain image paths', () => {
        const result = imageArray();
        result.forEach(image => {
            expect(image).toBeDefined();
        });
    });
});
