const { SCENARIOS, SCENARIO_LABELS, getScenarioById, validateScenarios } = require('../../utils/nat-data');

describe('SCENARIOS', () => {
  test('has exactly 3 scenarios', () => {
    expect(SCENARIOS.length).toBe(3);
  });

  test('each scenario has required fields', () => {
    SCENARIOS.forEach(function(s) {
      expect(s.id).toBeDefined();
      expect(s.label).toBeDefined();
      expect(s.internalNetwork).toBeDefined();
      expect(s.internalNetwork.subnet).toBeDefined();
      expect(s.publicIp).toBeDefined();
      expect(s.portRange).toBeDefined();
      expect(Array.isArray(s.steps)).toBe(true);
    });
  });

  test('steps for "single-host" contain valid fields', () => {
    const scenario = getScenarioById('single-host');
    expect(scenario).toBeDefined();
    scenario.steps.forEach(function(step) {
      expect(typeof step.step).toBe('number');
      expect(['lan', 'router', 'wan']).toContain(step.zone);
      expect(step.packet).toBeDefined();
      expect(step.packet.srcIp).toBeDefined();
      expect(step.packet.srcPort).toBeDefined();
      expect(step.packet.dstIp).toBeDefined();
      expect(step.packet.dstPort).toBeDefined();
      expect(['TCP', 'UDP']).toContain(step.packet.protocol);
      expect(step.explanation).toBeDefined();
      expect(step.tableUpdate).toBeDefined();
      expect(['add', 'remove', 'noop']).toContain(step.tableUpdate.action);
    });
  });

  test('"multi-host" scenario has steps with at least 2 different srcIp', () => {
    const scenario = getScenarioById('multi-host');
    const srcIps = scenario.steps.map(function(s) { return s.packet.srcIp; });
    const uniqueIps = srcIps.filter(function(v, i, a) { return a.indexOf(v) === i; });
    expect(uniqueIps.length).toBeGreaterThanOrEqual(2);
  });

  test('"port-forward" scenario includes staticMapping', () => {
    const scenario = getScenarioById('port-forward');
    expect(scenario.staticMapping).toBeDefined();
    expect(scenario.staticMapping.externalPort).toBeDefined();
    expect(scenario.staticMapping.internalIp).toBeDefined();
    expect(scenario.staticMapping.internalPort).toBeDefined();
  });

  test('validateScenarios returns valid for all scenarios', () => {
    const result = validateScenarios();
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });
});

describe('SCENARIO_LABELS', () => {
  test('has 3 labels', () => {
    expect(SCENARIO_LABELS.length).toBe(3);
  });
});
