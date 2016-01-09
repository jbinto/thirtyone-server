/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */
/* (above: Make ESLint happy about Map() not being a real constructor) */

/* globals describe, it, beforeEach */

import { expect } from 'chai';
import { List, fromJS } from 'immutable';
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

  it('returns undefined for unparsable cards', () => {
    const badCards = [
      '1s',
      '11s',
      '3q',
      'Qq',
    ];

    badCards.forEach((card) => {
      expect(parseCard(card)).to.equal(undefined);
    });
  });
});

describe('scoreHand', () => {
  it('can score a hand of all the same suit', () => {
    const hand = List(['10c', 'Jc', 'Ac']);
    const score = scoreHand(hand);
    expect(score).to.equal(31);
  });

  it('can score a hand of varying suits', () => {
    const hand1 = List(['10c', '9c', '2s']);
    const hand2 = List(['10c', '9h', '2s']);
    expect(scoreHand(hand1)).to.equal(19);
    expect(scoreHand(hand2)).to.equal(10);
  });

  it('scores 3 of a kind as 30.5', () => {
    const hand = List(['2c', '2h', '2s']);
    expect(scoreHand(hand)).to.equal(30.5);
  });
});
