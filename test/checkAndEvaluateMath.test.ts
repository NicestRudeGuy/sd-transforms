import { expect } from '@esm-bundle/chai';
import { checkAndEvaluateMath } from '../src/checkAndEvaluateMath';
import { runTransformSuite } from './suites/transform-suite.test';

runTransformSuite(checkAndEvaluateMath as (value: unknown) => unknown);

describe('check and evaluate math', () => {
  it('checks and evaluates math expressions', () => {
    expect(checkAndEvaluateMath('4px')).to.equal('4px');
    expect(checkAndEvaluateMath('4 * 7')).to.equal('28');
    expect(checkAndEvaluateMath('4 * 7px')).to.equal('28px');
    expect(checkAndEvaluateMath('4 * 7rem')).to.equal('28rem');
    expect(checkAndEvaluateMath('(15 + 20 - 17 * 8 / 3) * 7px')).to.equal('-72.333px');
  });

  it('can evaluate math expressions where more than one token has a unit, in case of px', () => {
    expect(checkAndEvaluateMath('4px * 7px')).to.equal('28px');
    expect(checkAndEvaluateMath('4 * 7px * 8px')).to.equal('224px');
  });

  it('cannot evaluate math expressions where more than one token has a unit, when unit is not px', () => {
    expect(checkAndEvaluateMath('4em * 7em')).to.equal('4em * 7em');
    expect(checkAndEvaluateMath('4 * 7em * 8em')).to.equal('4 * 7em * 8em');
    // exception for pixels, it strips px, making it 4 * 7em = 28em = 448px, where 4px * 7em would be 4px * 112px = 448px as well
    expect(checkAndEvaluateMath('4px * 7em')).to.equal('28em');
  });
  // TODO: we can make this smarter in the future. If every piece of the expression shares the same unit,
  // we can strip the unit, do the calculation, and add back the unit.
  // However, there's not really a good way to do calculations with mixed units,
  // e.g. 2em * 4rem is not possible
  it('can evaluate math expressions where more than one token has a unit, as long as for each piece of the expression the unit is the same', () => {
    // can resolve them, because all values share the same unit
    // TODO: implement tests below, failing atm
    expect(checkAndEvaluateMath('5rem * 4rem / 2rem')).to.equal('10rem'); // current: '5rem * 4rem / 2rem'
    expect(checkAndEvaluateMath('10vw + 20vw')).to.equal('10vw'); // current: '10vw + 20vw'

    // cannot resolve them, because em is dynamic and 20/20px is static value
    expect(checkAndEvaluateMath('2em + 20')).to.equal('2em + 20');
    expect(checkAndEvaluateMath('2em + 20px')).to.equal('2em + 20px');

    // can resolve them, because multiplying by pixels/unitless is possible, regardless of the other value's unit
    expect(checkAndEvaluateMath('2pt * 4')).to.equal('8pt');
    expect(checkAndEvaluateMath('2em * 20px')).to.equal('40em');
  });

  it('supports multi-value expressions with math expressions', () => {
    expect(checkAndEvaluateMath('8 / 4 * 7px 8 * 5px 2 * 4px')).to.equal('14px 40px 8px');
    expect(checkAndEvaluateMath('5px + 4px + 10px 3 * 2px')).to.equal('19px 6px');
    expect(checkAndEvaluateMath('5px 3 * 2px')).to.equal('5px 6px');
    expect(checkAndEvaluateMath('3 * 2px 5px')).to.equal('6px 5px');
  });
});
