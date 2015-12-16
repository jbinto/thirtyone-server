/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */
/* (above: Make ESLint happy about Map() not being a real constructor) */

/* globals describe, it, beforeEach */

import { expect } from 'chai';
import { fromJS } from 'immutable';
import { parseCard } from '../src/utils';

describe('parseCard', () => {
  it('numbered cards are worth their rank', () => {
    expect(parseCard('2s')).to.equal(fromJS({
      name: '2', rank: 2, suit: 's',
    }));

    expect(parseCard('6c')).to.equal(fromJS({
      name: '6', rank: 6, suit: 'c',
    }));
  });

  it('face cards are worth 10', () => {
    expect(parseCard('Kd')).to.equal(fromJS({
      name: 'K', rank: 10, suit: 'd',
    }));
  });

  it('aces are worth 11', () => {
    expect(parseCard('Kd')).to.equal(fromJS({
      name: 'A', rank: 11, suit: 'd',
    }));
  });
});
