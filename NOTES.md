# Notes

## 2016-01-09 14:20

What's left?

* Rule: 31
* Rule: 30.5
* Rule: Knock
* Multiple hands / loonies (better to save this for when end-to-end works I think)
* Refactor older functions to use gameState instead of gameStarted/handStarted/etc
* `index.js` to handle socket connections, start bringing in Redux
* Code to match players to sockets
* Code to filter sensitive data before emitting to clients (e.g. the other player's hand, the contents of the draw pile)
* something something redux

How exactly is redux going to fit here? This is still something we haven't figured out. 

I think the thing to do is finish all of the rules, then get going on the websocket stuff so I can actually start on the React side.

## 2016-01-09 14:00

Spent last night trying to add code coverage. [Ran into a bunch of issues](https://github.com/gotwarlost/istanbul/issues/512) with istanbul+mocha+babel, but that's all solved now and we have a nifty code coverage report:

https://coveralls.io/builds/4674071

One thing that was interesting to learn is that Node 4 (e.g. npm2) and Node 5 (e.g. npm3) don't install dependencies the same way. [npm3 dependency installation is non-deterministic.](https://docs.npmjs.com/how-npm-works/npm3-nondet)

So I found myself in situations where I had something in my `node_modules` that didn't actually match my `package.json`.
Realistically, `rm -rf node_modules && npm i` on a semi-regular basis is the only way to go. It's how the CI platforms work anyway.

## 2016-01-07 17:55

Added JSDoc descriptions to all core game functions in `game.js` and `utils.js`.

Unfortunately, I can't really generate documentation yet. `documentationjs` is the current de-facto standard, it supports Babel, **but not Babel 6**.

Some things came out of this:

* It's actually impossible for the discard pile to get empty
* Found & fixed bug: allowed user to discard a card they didn't have [snip]


## 2015-12-31 23:00

Thinking about a refactor where we only use the minimal state needed for each action.

For example:

--

`drawCard(state, player) // => newState` would become

`drawCard(hand, drawPile) // => { hand, drawPile }`

--

`discardCard(state, player, card)`

`discardCard(hand, discardPile, card) // => { hand, discardPile }`

--

Currently, `drawCard` and `discardCard` both handle their respective actions (i.e. shifting cards from one pile to another), *and* return a modified global/immutable 31 state object.

I believe that the Redux reducer should be the one to handle all of that (low-level) state concatenation.

What about `startGame`, `addPlayer`, etc? They might need a bigger snapshot of state.

`startGame` just basically sets up the global state tree boilerplate. It seems more of a top-level Redux reducer concern.

`addPlayer`, if extracted to be more "functional" would just essentially become `Array.prototype.push`. The complexity here, again, is in manipulating the custom state tree. (We're doing redux work here without having yet included redux.)

--

It seems like it would make sense to refactor `hand` out from the `game` module.

--

Reducer composition: this is the Redux feature where you can have your state tree composed of nested reducer functions, e.g. to generate this state subtree:

```
piles: {
  hands: {[...]}
  draw: [..]
  discard: ...  
}
```

We would write a `piles` reducer: it would take an action and the initial `piles` state, and return the modified `piles`.

Then, the root reducer would be responsible for the concatenation/state tree manipulations, and we could - maybe - just generate that by using Redux `combineReducers` [(example)](http://rackt.org/redux/docs/api/combineReducers.html).

Aha.

The wrench in the works here is `gameState`, which lives at *the top of the state tree*. How can the `piles` reducer handle this?

Does this mean that we'd have another reducer that just handles `gameState`, which gets called on every `store.dispatch(...)`?

Let's say we did. What does this mean for validation of actions? Right now, since I just have a single, massive `state => state` function for each discrete game action, I can validate "at the top".

What if I was using reducers? Who would be responsible?

I could extract some sort of `validateAction` and repeatedly call it at each level... or (and I think this makes more sense) **I could make a Redux middleware** which refuses to dispatch the action if the current state and the request action are incompatible.

## 2015-12-16 9:30

* `WAITING_FOR_PLAYER_TO_DRAW` will have to become `WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK`

## 2015-12-16 9:00

* Not sure it was really worth writing Redux style functional reducers on the server side. It has been an eye opening exercise for sure, but my FP skills are pretty rudimentary and I feel like I'm going backwards in a lot of ways. Every function I write needs **the state of the entire world** and a few more arguments on top of that. I sort of ache for a `struct` or a stateful `class` to hide all of this. I understand, sort of, conceptually, that currying could help with my "too many arguments" problem, but not well enough to make a difference.

* One of the things that feels uncomfortable about this reducer style of programming is just returning `state` when there's an unrecognized action or other state-related reason for not being able to proceed. I want to aggressively validate and fail fast, but that's not what's happening.

* I feel like there might be an upcoming conundrum, where I've coded myself into a corner. Consider:

- Hand is dealt.
- User picks up the only discard card.
- Discard pile now has 0 length.
- (This is an edge case we must handle. OK.)
- On the client side we would have logic to handle discard.count==0, so prevent that action from being fired (gray out something).
- On the server side, drawFromDiscard is simply ignored? I guess so...

My worry was trying to signal from the server to the client in some special, the-sky-is-falling way that "there is nothing left in the discard pile!"

And then, trying to signal from the server to the client, that, oh no, your bogus request to pick up from the empty discard pile was not fulfilled!

But I think I'm worrying about nothing. My client won't let us get into that situation. Even if someone modifies the client, or if there is a bug, the server will happily ignore the request. The gameState won't change, React won't update, and it'll be like nothing happened at all.

This kind of makes me understand now why Redux returns the same state for bogus actions.
