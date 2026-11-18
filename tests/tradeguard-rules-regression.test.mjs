import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(process.env.TRADEGUARD_RULES || 'tradeguard-source/rules.js', 'utf8');
const rules = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const base = {
  hsCode: '52010000', productDescription: 'raw cotton', hsCodeVerified: true,
  unitOfMeasure: 'Kilogram', invoicePrice: '11', marketLow: '10', marketHigh: '12',
  currency: 'USD', marketSource: 'Synthetic benchmark', marketSourceDate: '2026-01-01',
  valuationBasis: 'FOB'
};
const evidence = {
  indicatorConfidence: 'High', evidenceStatus: 'Available for review',
  reviewerEvidenceNote: 'Synthetic fixture; reviewer checked supporting documents.'
};

test('TradeGuard returns no scoreable signal for a clean synthetic baseline', () => {
  const result = rules.calculateRisk({ ...base });
  assert.equal(result.rawScore, 0);
  assert.equal(result.band, 'Low');
  assert.equal(result.decisionReady, true);
  assert.equal(result.flags.length, 0);
});
test('TradeGuard material price deviation retains configured 25-point indicator', () => {
  const result = rules.calculateRisk({ ...base, invoicePrice: '50' });
  assert.equal(result.flags.find(x => x.id === 'price-material')?.points, 25);
  assert.equal(result.deviation > 100, true);
});
test('TradeGuard withholds price scoring when currency is missing', () => {
  const result = rules.calculateRisk({ ...base, currency: '' });
  assert.equal(result.priceScoringEligible, false);
  assert.equal(result.deviation, null);
});
test('TradeGuard suppresses price indicator when the unit conflicts with HS profile', () => {
  const result = rules.calculateRisk({ ...base, unitOfMeasure: 'Piece', tbmlIndicators: ['price-value-anomaly'] });
  assert.equal(result.priceScoringEligible, false);
  assert.ok(result.suppressedIndicators.includes('price-value-anomaly'));
});
test('TradeGuard requires evidence context for a selected manual indicator', () => {
  const result = rules.calculateRisk({ ...base, tbmlIndicators: ['quantity-unit-mismatch'] });
  assert.equal(result.decisionReady, false);
  assert.match(result.readinessIssues.join(' '), /evidence, confidence and a reviewer rationale/);
});
test('TradeGuard accepts a selected indicator only with evidence context', () => {
  const result = rules.calculateRisk({ ...base, ...evidence, tbmlIndicators: ['quantity-unit-mismatch'] });
  assert.equal(result.decisionReady, true);
  assert.equal(result.flags.find(x => x.id === 'tbml-quantity-unit-mismatch')?.points, 10);
});
test('TradeGuard flags HS description conflict without inferring wrongdoing', () => {
  const result = rules.calculateRisk({ ...base, productDescription: 'beef meat product' });
  assert.ok(result.flags.some(x => x.id === 'goods-hs-mismatch-auto'));
  assert.equal(result.priceScoringEligible, false);
});
test('TradeGuard control-only PEP context adds zero numeric points', () => {
  const result = rules.calculateRisk({ ...base, pepStatus: 'Possible PEP' });
  assert.ok(result.flags.some(x => x.id === 'pep-screening-context' && x.controlOnly && x.points === 0));
  assert.equal(result.rawScore, 0);
});
test('TradeGuard clamps aggregate indicator points at 100', () => {
  const result = rules.calculateRisk({
    ...base, ...evidence, relatedParty: true, thirdPartyPayment: true,
    routeMismatch: true, portLoading: 'A', portDischarge: 'B',
    routeDetails: 'Synthetic direct route', businessProfile: 'Synthetic textile importer',
    documentMismatch: true, duplicateInvoice: true,
    tbmlIndicators: ['multiple-phantom-shipment','business-profile-mismatch','unusual-payment-terms']
  });
  assert.equal(result.cappedScore, 100);
  assert.equal(result.scoreCapApplied, true);
});
