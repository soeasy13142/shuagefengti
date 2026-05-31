const { parseMarkdown } = require('../../utils/markdown-parser');

describe('parseMarkdown', () => {
  test('解析标准格式单选题', () => {
    const md = `1. 以下哪个是正确的？
A. 选项一
B. 选项二
C. 选项三
D. 选项四
答案：A

2. 第二题
A. 甲
B. 乙
答案：B`;
    const result = parseMarkdown(md);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('single');
    expect(result[0].stem).toContain('以下哪个是正确的');
    expect(result[0].options).toHaveLength(4);
    expect(result[0].answer).toBe('A');
    expect(result[1].answer).toBe('B');
  });

  test('解析增强格式（## 标题）', () => {
    const md = `## 第1题
以下哪个排序算法最优？
A. 冒泡
B. 快速
C. 选择
D. 插入
**答案：B**`;
    const result = parseMarkdown(md);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('single');
    expect(result[0].answer).toBe('B');
  });

  test('解析多选题', () => {
    const md = `1. 多选题
A. 选项A
B. 选项B
C. 选项C
D. 选项D
答案：AB`;
    const result = parseMarkdown(md);
    expect(result[0].type).toBe('multi');
    expect(result[0].answer).toBe('AB');
  });

  test('解析多选题（逗号分隔）', () => {
    const md = `1. 多选题
A. 选项A
B. 选项B
C. 选项C
答案：A,C`;
    const result = parseMarkdown(md);
    expect(result[0].type).toBe('multi');
    expect(result[0].answer).toBe('AC');
  });

  test('解析判断题', () => {
    const md = `1. 地球是圆的
A. 对
B. 错
答案：A`;
    const result = parseMarkdown(md);
    expect(result[0].type).toBe('judge');
  });

  test('解析填空题', () => {
    const md = `1. 中国的首都是___。
答案：北京`;
    const result = parseMarkdown(md);
    expect(result[0].type).toBe('fill');
    expect(result[0].answer).toBe('北京');
  });

  test('解析填空题（多空）', () => {
    const md = `1. ___和___是两大直辖市。
答案：北京,上海`;
    const result = parseMarkdown(md);
    expect(result[0].type).toBe('fill');
    expect(result[0].answer).toBe('北京,上海');
  });

  test('解析简答题', () => {
    const md = `1. 请解释什么是递归。
答案：递归是指函数调用自身的过程`;
    const result = parseMarkdown(md);
    expect(result[0].type).toBe('essay');
  });

  test('解析含解析的题目', () => {
    const md = `1. 1+1=?
A. 1
B. 2
C. 3
D. 4
答案：B
解析：1加1等于2`;
    const result = parseMarkdown(md);
    expect(result[0].explanation).toContain('1加1等于2');
  });

  test('空内容返回空数组', () => {
    expect(parseMarkdown('')).toEqual([]);
    expect(parseMarkdown(null)).toEqual([]);
  });
});
