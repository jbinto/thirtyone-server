/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */
/* (above: Make ESLint happy about Map() not being a real constructor) */

/* globals describe, it, beforeEach */

import { expect } from 'chai';
import { fromJS } from 'immutable';
import { parseCard, scoreHand } from '../src/utils';

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

    expect(parseCard('Jc')).to.equal(fromJS({
      name: 'J', rank: 10, suit: 'c',
    }));

    expect(parseCard('Qh')).to.equal(fromJS({
      name: 'Q', rank: 10, suit: 'h',
    }));
  });

  it('aces are worth 11', () => {
    expect(parseCard('As')).to.equal(fromJS({
      name: 'A', rank: 11, suit: 's',
    }));
  });
});

describe('scoreHand', () => {
  it('can score a hand of all the same suit', () => {
    const hand = ['10c', 'Jc', 'Ac'];
    const score = scoreHand(hand);
    expect(score).to.equal(31);
  });

  it('can score a hand of varying suits', () => {
    expect(scoreHand(['10c', '9c', '2s'])).to.equal(19);
    expect(scoreHand(['10c', '9h', '2s'])).to.equal(10);
  });
});
