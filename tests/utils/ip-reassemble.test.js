const { fragment } = require('../../utils/ip-fragment');
const { reassemble } = require('../../utils/ip-reassemble');

describe('reassemble', () => {
  test('reassembles 3 fragments back to original size', () => {
    const result = fragment(3000, 1000);
    const reassembled = reassemble(result.fragments);
    expect(reassembled.success).toBe(true);
    expect(reassembled.totalBytes).toBe(3000);
    expect(reassembled.totalFragments).toBe(4);
  });

  test('reassembles single fragment', () => {
    const result = fragment(500, 1500);
    const reassembled = reassemble(result.fragments);
    expect(reassembled.success).toBe(true);
    expect(reassembled.totalBytes).toBe(500);
  });

  test('reassembles fragment at exact payload multiple', () => {
    const result = fragment(1960, 1000); // 2 fragments
    const reassembled = reassemble(result.fragments);
    expect(reassembled.success).toBe(true);
    expect(reassembled.totalBytes).toBe(1960);
  });

  test('returns total bytes = sum of all fragment data lengths', () => {
    const result = fragment(4000, 1500);
    const reassembled = reassemble(result.fragments);
    const sumDataLengths = result.fragments.reduce(function(s, f) { return s + f.dataLength; }, 0);
    expect(reassembled.totalBytes).toBe(sumDataLengths);
  });

  test('fragments maintain correct byte order', () => {
    const result = fragment(3000, 1000);
    const reassembled = reassemble(result.fragments);
    expect(reassembled.fragments[0].dataStart).toBe(0);
    expect(reassembled.fragments[1].dataStart).toBeLessThan(reassembled.fragments[2].dataStart);
  });

  test('final fragment has mf = false', () => {
    const result = fragment(3000, 1000);
    const reassembled = reassemble(result.fragments);
    const last = reassembled.fragments[reassembled.fragments.length - 1];
    expect(last.mf).toBe(false);
  });

  test('edge: minimum size datagram', () => {
    const result = fragment(100, 1500);
    const reassembled = reassemble(result.fragments);
    expect(reassembled.success).toBe(true);
    expect(reassembled.totalBytes).toBe(100);
  });

  test('edge: MTU = 68 (minimum)', () => {
    const result = fragment(200, 68);
    const reassembled = reassemble(result.fragments);
    expect(reassembled.success).toBe(true);
    expect(reassembled.totalBytes).toBe(200);
  });

  test('returns structured progress for animation', () => {
    const result = fragment(3000, 1000);
    const reassembled = reassemble(result.fragments);
    // Should provide "merge steps" for animation
    expect(Array.isArray(reassembled.mergeSteps)).toBe(true);
    expect(reassembled.mergeSteps.length).toBe(result.totalFragments);
    // Each step shows cumulative size after merging that fragment
    reassembled.mergeSteps.forEach(function(step, i) {
      expect(typeof step.cumulativeBytes).toBe('number');
      expect(typeof step.fragmentIndex).toBe('number');
      expect(typeof step.description).toBe('string');
    });
  });
});
