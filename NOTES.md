# Notes

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
