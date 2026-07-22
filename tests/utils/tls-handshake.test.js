const { generateSteps } = require('../../utils/tls-handshake');

describe('generateSteps - full handshake', () => {
  test('generates 12 steps for full handshake', () => {
    const steps = generateSteps('full');
    expect(steps).toHaveLength(12);
    expect(steps[0].type).toBe('handshake');
    expect(steps[0].from).toBe('client');
    expect(steps[0].to).toBe('server');
    expect(steps[0].payload.label).toBe('ClientHello');
  });

  test('each step has required fields', () => {
    const steps = generateSteps('full');
    steps.forEach((s, i) => {
      expect(s).toHaveProperty('step', i);
      expect(s).toHaveProperty('from');
      expect(s).toHaveProperty('to');
      expect(s).toHaveProperty('type');
      expect(s).toHaveProperty('payload');
      expect(s).toHaveProperty('explanation');
      expect(s.payload).toHaveProperty('label');
      expect(s.payload).toHaveProperty('fields');
      expect(Array.isArray(s.payload.fields)).toBe(true);
    });
  });

  test('steps alternate directions correctly', () => {
    const steps = generateSteps('full');
    // ClientHello → client→server, ServerHello → server→client, etc.
    expect(steps[0].from).toBe('client');
    expect(steps[0].to).toBe('server');
    expect(steps[1].from).toBe('server');
    expect(steps[1].to).toBe('client');
  });

  test('last step is summary type', () => {
    const steps = generateSteps('full');
    expect(steps[steps.length - 1].type).toBe('summary');
  });

  test('includes keyDerive step', () => {
    const steps = generateSteps('full');
    const keyStep = steps.find(s => s.type === 'keyDerive');
    expect(keyStep).toBeDefined();
    expect(keyStep.derivedKeys).toBeDefined();
    expect(keyStep.derivedKeys).toHaveProperty('handshakeSecret');
    expect(keyStep.derivedKeys).toHaveProperty('serverTrafficKey');
    expect(keyStep.derivedKeys).toHaveProperty('serverTrafficIV');
    expect(keyStep.derivedKeys).toHaveProperty('clientTrafficKey');
    expect(keyStep.derivedKeys).toHaveProperty('clientTrafficIV');
    expect(keyStep.derivedKeys).toHaveProperty('appTrafficKey');
    expect(keyStep.derivedKeys).toHaveProperty('appTrafficIV');
  });

  test('ClientHello has cipherSuites and supportedGroups fields', () => {
    const steps = generateSteps('full');
    const ch = steps[0];
    const fieldNames = ch.payload.fields.map(f => f.name);
    expect(fieldNames).toContain('cipher_suites');
    expect(fieldNames).toContain('key_share');
    expect(fieldNames).toContain('supported_groups');
  });

  test('Certificate step has certChain extra', () => {
    const steps = generateSteps('full');
    const certStep = steps.find(s => s.payload.label === 'Certificate');
    expect(certStep).toBeDefined();
    expect(certStep.payload.extra).toBeDefined();
    expect(certStep.payload.extra.certChain).toBeDefined();
    expect(certStep.payload.extra.certChain.length).toBeGreaterThanOrEqual(2);
  });

  test('Finished step type is handshake', () => {
    const steps = generateSteps('full');
    const finishedSteps = steps.filter(s => s.payload.label === 'Finished');
    expect(finishedSteps.length).toBe(2);
    finishedSteps.forEach(s => {
      expect(s.type).toBe('handshake');
    });
  });
});

describe('generateSteps - psk handshake', () => {
  test('generates 8 steps for psk handshake', () => {
    const steps = generateSteps('psk');
    expect(steps).toHaveLength(8);
  });

  test('psk handshake mentions PSK in ClientHello', () => {
    const steps = generateSteps('psk');
    expect(steps[0].payload.label).toMatch(/PSK/);
  });

  test('psk handshake has keyDerive step', () => {
    const steps = generateSteps('psk');
    const keyStep = steps.find(s => s.type === 'keyDerive');
    expect(keyStep).toBeDefined();
    expect(keyStep.derivedKeys).toBeDefined();
  });

  test('psk last step is summary', () => {
    const steps = generateSteps('psk');
    expect(steps[steps.length - 1].type).toBe('summary');
  });
});

describe('generateSteps - mitm warning', () => {
  test('generates 7 steps for mitm warning', () => {
    const steps = generateSteps('mitm');
    expect(steps).toHaveLength(7);
  });

  test('mitm has alert type step', () => {
    const steps = generateSteps('mitm');
    const alertSteps = steps.filter(s => s.type === 'alert');
    expect(alertSteps.length).toBeGreaterThanOrEqual(1);
  });

  test('mitm Certificate step has highlight on subject', () => {
    const steps = generateSteps('mitm');
    const certStep = steps.find(s => s.payload.label === 'Certificate');
    expect(certStep).toBeDefined();
    const subjectField = certStep.payload.fields.find(f => f.name === 'subject');
    expect(subjectField).toBeDefined();
    expect(subjectField.highlight).toBe(true);
  });

  test('mitm last step is summary', () => {
    const steps = generateSteps('mitm');
    expect(steps[steps.length - 1].type).toBe('summary');
  });
});

describe('generateSteps - invalid scenario', () => {
  test('returns empty array for unknown scenario', () => {
    const steps = generateSteps('unknown');
    expect(steps).toEqual([]);
  });
});
