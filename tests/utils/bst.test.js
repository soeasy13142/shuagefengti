const {
  createNode,
  insertNode,
  deleteNode,
  searchNode,
  traverseTree,
  treeHeight,
  layoutTree,
  inOrderValues,
  cloneTree
} = require('../../utils/bst');

// ======================== 辅助函数 ========================

/**
 * 从值数组构建 BST
 */
function buildTree(values) {
  let root = null;
  for (let i = 0; i < values.length; i++) {
    let result = insertNode(root, values[i]);
    root = result.root;
  }
  return root;
}

// ======================== createNode ========================

describe('createNode', () => {
  test('创建节点包含正确的值', () => {
    let node = createNode(42);
    expect(node.value).toBe(42);
    expect(node.left).toBeNull();
    expect(node.right).toBeNull();
  });
});

// ======================== insertNode ========================

describe('insertNode', () => {
  test('空树插入第一个节点', () => {
    let result = insertNode(null, 50);
    expect(result.root.value).toBe(50);
    expect(result.root.left).toBeNull();
    expect(result.root.right).toBeNull();
  });

  test('插入 5 个节点后树结构正确', () => {
    let root = null;
    root = insertNode(root, 50).root;
    root = insertNode(root, 30).root;
    root = insertNode(root, 70).root;
    root = insertNode(root, 20).root;
    root = insertNode(root, 40).root;

    expect(root.value).toBe(50);
    expect(root.left.value).toBe(30);
    expect(root.right.value).toBe(70);
    expect(root.left.left.value).toBe(20);
    expect(root.left.right.value).toBe(40);
  });

  test('插入步骤包含 compare 和 insert 类型', () => {
    let result = insertNode(null, 50);
    let types = result.steps.map(function(s) { return s.type; });
    expect(types).toContain('insert');
    expect(types).toContain('done');
  });

  test('插入到已有节点的左侧生成 compare 步骤', () => {
    let root = buildTree([50]);
    let result = insertNode(root, 30);
    let compareSteps = result.steps.filter(function(s) { return s.type === 'compare'; });
    expect(compareSteps.length).toBeGreaterThanOrEqual(1);
    expect(compareSteps[0].description).toContain('左');
  });

  test('插入到已有节点的右侧生成 compare 步骤', () => {
    let root = buildTree([50]);
    let result = insertNode(root, 70);
    let compareSteps = result.steps.filter(function(s) { return s.type === 'compare'; });
    expect(compareSteps.length).toBeGreaterThanOrEqual(1);
    expect(compareSteps[0].description).toContain('右');
  });
});

// ======================== inOrderValues ========================

describe('inOrderValues', () => {
  test('中序遍历结果有序', () => {
    let root = buildTree([50, 30, 70, 20, 40, 60, 80]);
    expect(inOrderValues(root)).toEqual([20, 30, 40, 50, 60, 70, 80]);
  });

  test('空树返回空数组', () => {
    expect(inOrderValues(null)).toEqual([]);
  });

  test('单节点树', () => {
    let root = buildTree([42]);
    expect(inOrderValues(root)).toEqual([42]);
  });
});

// ======================== searchNode ========================

describe('searchNode', () => {
  test('查找存在的节点返回 found 步骤', () => {
    let root = buildTree([50, 30, 70, 20, 40]);
    let steps = searchNode(root, 40);
    let foundStep = steps.find(function(s) { return s.type === 'found'; });
    expect(foundStep).toBeDefined();
    expect(foundStep.value).toBe(40);
  });

  test('查找存在的节点路径正确', () => {
    let root = buildTree([50, 30, 70, 20, 40]);
    let steps = searchNode(root, 40);
    let foundStep = steps.find(function(s) { return s.type === 'found'; });
    expect(foundStep.path).toEqual([50, 30, 40]);
  });

  test('查找不存在的节点返回 not-found 步骤', () => {
    let root = buildTree([50, 30, 70]);
    let steps = searchNode(root, 25);
    let notFoundStep = steps.find(function(s) { return s.type === 'not-found'; });
    expect(notFoundStep).toBeDefined();
    expect(notFoundStep.value).toBe(25);
  });

  test('查找不存在的节点返回完整搜索路径', () => {
    let root = buildTree([50, 30, 70, 20, 40]);
    let steps = searchNode(root, 25);
    let notFoundStep = steps.find(function(s) { return s.type === 'not-found'; });
    expect(notFoundStep.path).toEqual([50, 30, 20]);
  });

  test('查找根节点', () => {
    let root = buildTree([50, 30, 70]);
    let steps = searchNode(root, 50);
    let foundStep = steps.find(function(s) { return s.type === 'found'; });
    expect(foundStep).toBeDefined();
    expect(foundStep.path).toEqual([50]);
  });

  test('步骤描述为中文', () => {
    let root = buildTree([50, 30, 70]);
    let steps = searchNode(root, 30);
    expect(steps[0].description).toMatch(/比较/);
  });
});

// ======================== deleteNode ========================

describe('deleteNode', () => {
  test('删除叶子节点', () => {
    let root = buildTree([50, 30, 70, 20]);
    let result = deleteNode(root, 20);
    expect(result.root.left.left).toBeNull();
    expect(inOrderValues(result.root)).toEqual([30, 50, 70]);
  });

  test('删除单子节点', () => {
    let root = buildTree([50, 30, 70, 20]);
    let result = deleteNode(root, 30);
    expect(result.root.left.value).toBe(20);
    expect(inOrderValues(result.root)).toEqual([20, 50, 70]);
  });

  test('删除双子节点用后继替换', () => {
    let root = buildTree([50, 30, 70, 20, 40, 60, 80]);
    let result = deleteNode(root, 50);
    expect(result.root.value).toBe(60);
    expect(inOrderValues(result.root)).toEqual([20, 30, 40, 60, 70, 80]);
  });

  test('删除不存在的节点', () => {
    let root = buildTree([50, 30, 70]);
    let result = deleteNode(root, 99);
    expect(inOrderValues(result.root)).toEqual([30, 50, 70]);
    let notFoundStep = result.steps.find(function(s) { return s.type === 'not-found'; });
    expect(notFoundStep).toBeDefined();
  });

  test('删除步骤包含 compare 类型', () => {
    let root = buildTree([50, 30, 70]);
    let result = deleteNode(root, 30);
    let compareSteps = result.steps.filter(function(s) { return s.type === 'compare'; });
    expect(compareSteps.length).toBeGreaterThanOrEqual(1);
  });

  test('删除叶子节点步骤包含 delete 类型', () => {
    let root = buildTree([50, 30, 70]);
    let result = deleteNode(root, 30);
    let deleteStep = result.steps.find(function(s) { return s.type === 'delete'; });
    expect(deleteStep).toBeDefined();
    expect(deleteStep.description).toContain('叶子');
  });

  test('删除双子节点步骤包含 replace 类型', () => {
    let root = buildTree([50, 30, 70]);
    let result = deleteNode(root, 50);
    let replaceStep = result.steps.find(function(s) { return s.type === 'replace'; });
    expect(replaceStep).toBeDefined();
    expect(replaceStep.description).toContain('后继');
  });
});

// ======================== traverseTree ========================

describe('traverseTree', () => {
  let root;

  beforeEach(() => {
    //       50
    //      /  \
    //    30    70
    //   /  \
    //  20  40
    root = buildTree([50, 30, 70, 20, 40]);
  });

  test('前序遍历顺序正确', () => {
    let steps = traverseTree(root, 'pre');
    let visited = steps.filter(function(s) { return s.type === 'visit'; })
      .map(function(s) { return s.value; });
    expect(visited).toEqual([50, 30, 20, 40, 70]);
  });

  test('中序遍历顺序正确', () => {
    let steps = traverseTree(root, 'in');
    let visited = steps.filter(function(s) { return s.type === 'visit'; })
      .map(function(s) { return s.value; });
    expect(visited).toEqual([20, 30, 40, 50, 70]);
  });

  test('后序遍历顺序正确', () => {
    let steps = traverseTree(root, 'post');
    let visited = steps.filter(function(s) { return s.type === 'visit'; })
      .map(function(s) { return s.value; });
    expect(visited).toEqual([20, 40, 30, 70, 50]);
  });

  test('层序遍历顺序正确', () => {
    let steps = traverseTree(root, 'level');
    let visited = steps.filter(function(s) { return s.type === 'visit'; })
      .map(function(s) { return s.value; });
    expect(visited).toEqual([50, 30, 70, 20, 40]);
  });

  test('空树遍历返回 done 步骤', () => {
    let steps = traverseTree(null, 'in');
    expect(steps.length).toBe(1);
    expect(steps[0].type).toBe('done');
  });

  test('遍历最后一步为 done', () => {
    let steps = traverseTree(root, 'pre');
    expect(steps[steps.length - 1].type).toBe('done');
  });

  test('层序遍历描述包含层数信息', () => {
    let steps = traverseTree(root, 'level');
    let visitSteps = steps.filter(function(s) { return s.type === 'visit'; });
    expect(visitSteps[0].description).toContain('第 1 层');
    expect(visitSteps[1].description).toContain('第 2 层');
  });
});

// ======================== treeHeight ========================

describe('treeHeight', () => {
  test('空树高度为 0', () => {
    expect(treeHeight(null)).toBe(0);
  });

  test('单节点树高度为 1', () => {
    expect(treeHeight(buildTree([50]))).toBe(1);
  });

  test('三层树高度为 3', () => {
    let root = buildTree([50, 30, 70, 20, 40]);
    expect(treeHeight(root)).toBe(3);
  });

  test('不平衡树高度正确', () => {
    let root = buildTree([10, 20, 30, 40, 50]);
    expect(treeHeight(root)).toBe(5);
  });
});

// ======================== layoutTree ========================

describe('layoutTree', () => {
  test('空树返回空布局', () => {
    let layout = layoutTree(null);
    expect(layout.nodes).toEqual([]);
    expect(layout.edges).toEqual([]);
  });

  test('单节点树有 1 个节点 0 条边', () => {
    let layout = layoutTree(buildTree([50]));
    expect(layout.nodes.length).toBe(1);
    expect(layout.edges.length).toBe(0);
  });

  test('三个节点有 2 条边', () => {
    let layout = layoutTree(buildTree([50, 30, 70]));
    expect(layout.nodes.length).toBe(3);
    expect(layout.edges.length).toBe(2);
  });

  test('节点包含 value, x, y, state 属性', () => {
    let layout = layoutTree(buildTree([50]));
    let node = layout.nodes[0];
    expect(node).toHaveProperty('value', 50);
    expect(node).toHaveProperty('x');
    expect(node).toHaveProperty('y');
    expect(node).toHaveProperty('state', 'normal');
  });

  test('边包含起点和终点坐标', () => {
    let layout = layoutTree(buildTree([50, 30, 70]));
    let edge = layout.edges[0];
    expect(edge).toHaveProperty('x1');
    expect(edge).toHaveProperty('y1');
    expect(edge).toHaveProperty('x2');
    expect(edge).toHaveProperty('y2');
    expect(edge).toHaveProperty('state', 'normal');
  });

  test('根节点 y 坐标为 0', () => {
    let layout = layoutTree(buildTree([50, 30, 70]));
    let rootNode = layout.nodes.find(function(n) { return n.value === 50; });
    expect(rootNode.y).toBe(0);
  });
});

// ======================== cloneTree ========================

describe('cloneTree', () => {
  test('深拷贝产生独立副本', () => {
    let root = buildTree([50, 30, 70]);
    let cloned = cloneTree(root);
    cloned.value = 999;
    expect(root.value).toBe(50);
  });

  test('空树拷贝返回 null', () => {
    expect(cloneTree(null)).toBeNull();
  });

  test('拷贝保持结构', () => {
    let root = buildTree([50, 30, 70, 20, 40]);
    let cloned = cloneTree(root);
    expect(inOrderValues(cloned)).toEqual([20, 30, 40, 50, 70]);
  });
});
