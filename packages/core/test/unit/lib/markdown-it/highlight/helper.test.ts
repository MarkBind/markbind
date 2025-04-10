import {
  splitCodeAndIndentation,
  collateAllIntervalsWithColors,
} from '../../../../../src/lib/markdown-it/highlight/helper';

describe('splitCodeAndIndentation', () => {
  test('with leading spaces', () => {
    const [indents, content] = splitCodeAndIndentation('    var x = 1;');
    expect(indents).toEqual('    ');
    expect(content).toEqual('var x = 1;');
  });

  test('with no leading spaces', () => {
    const [indents, content] = splitCodeAndIndentation('var x = 1;');
    expect(indents).toEqual('');
    expect(content).toEqual('var x = 1;');
  });

  test('with only space', () => {
    const [indents, content] = splitCodeAndIndentation('    ');
    expect(indents).toEqual('    ');
    expect(content).toEqual('');
  });

  test('with empty string', () => {
    const [indents, content] = splitCodeAndIndentation('');
    expect(indents).toEqual('');
    expect(content).toEqual('');
  });

  test('with both tabs and whitespace', () => {
    const [indents, content] = splitCodeAndIndentation('\t \t   code');
    expect(indents).toEqual('\t \t   ');
    expect(content).toEqual('code');
  });
});

type ColoredInterval = { bounds: [number, number ], color: string };

describe('collateAllIntervalsWithColors', () => {
  test('with no intervals', () => {
    expect(collateAllIntervalsWithColors([])).toEqual([]);
  });

  test('with single interval', () => {
    const intervals: ColoredInterval[] = [{ bounds: [0, 5], color: 'red' }];
    expect(collateAllIntervalsWithColors(intervals)).toEqual(intervals);
  });

  test('with adjacent intervals - no merging', () => {
    const intervals: ColoredInterval[] = [
      { bounds: [0, 10], color: 'red' },
      { bounds: [11, 100], color: 'blue' },
    ];
    expect(collateAllIntervalsWithColors(intervals)).toEqual(intervals);
  });

  test('with 2 overlapping intervals - takes last color', () => {
    const intervals: ColoredInterval[] = [
      { bounds: [0, 10], color: 'red' },
      { bounds: [5, 15], color: 'blue' },
    ];

    const expected: ColoredInterval[] = [{ bounds: [0, 15], color: 'blue' }];

    expect(collateAllIntervalsWithColors(intervals)).toEqual(expected);
  });

  test('with more than 2 overlapping intervals', () => {
    const intervals: ColoredInterval[] = [
      { bounds: [0, 5], color: 'red' },
      { bounds: [4, 7], color: 'blue' },
      { bounds: [6, 9], color: 'green' },
      { bounds: [10, 12], color: 'yellow' },
      { bounds: [11, 15], color: 'purple' },
      { bounds: [14, 16], color: 'orange' },
    ];

    const expected: ColoredInterval[] = [
      { bounds: [0, 9], color: 'green' },
      { bounds: [10, 16], color: 'orange' },
    ];

    expect(collateAllIntervalsWithColors(intervals)).toEqual(expected);
  });
});
