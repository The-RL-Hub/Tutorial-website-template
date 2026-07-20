# Example lesson

This sample verifies the complete Markdown rendering path.

## Learning goals and prerequisites

The reader needs basic Python syntax and the meaning of a finite reward sequence. After this lesson, the reader should be able to:

- compute a discounted return with backward recursion;
- identify the reward order used by the function;
- test the edge cases $\gamma=0$ and an empty sequence;
- state that the example calculates a return but does not learn a policy.

The example is intentionally small. It demonstrates lesson structure and renderer behavior, not a full RL chapter.

## A repeated heading

Inline math looks like $G_t=R_{t+1}+\gamma G_{t+1}$.

> **Tip:** Callouts use the current token-based Marked renderer.

### Code

~~~python
def discounted_return(rewards, gamma):
    value = 0.0
    for reward in reversed(rewards):
        value = reward + gamma * value
    return value
~~~

## Worked audit

For `rewards = [1, 2]` and $\gamma=0.5$, the loop first sets the value to $2$, then returns $1+0.5(2)=2$. With $\gamma=0$, only the first reward contributes, so the result is $1$. An empty reward list returns the initialized value $0$.

These three cases check reward order, discount placement, and the empty-input boundary. A lesson using this function should also validate the allowed range of $\gamma$ in production code.

## A repeated heading

The second heading receives a unique identifier, so both sidebar links work.

## Assumptions and common mistakes

- Rewards are ordered from earliest to latest.
- The function assumes a finite sequence.
- A discount outside $[0,1]$ needs an explicit task-specific reason and validation.
- Reversing the sequence twice changes the return definition.
- This return is one sample, not an expected value or a value-function estimate.
- A truncated sequence may omit future rewards and should not be described as a completed episode.

## Summary

Backward recursion computes a finite discounted return in one pass. Its interpretation depends on reward order, the discount, and the reason the sequence ended.

## Exercises

1. Compute the return of `[2, -1, 3]` for $\gamma=0.9$ by hand.
2. Add input validation for the discount and test both invalid boundaries.
3. Compare a terminal sequence with a sequence stopped by an external step limit.
4. Write a test that would fail if rewards were processed in forward order.

An answer is checkable when it states the reward order, discount, expected number, and end condition.

> **Warning:** Serve the site over HTTP; browser security rules usually block local XHR from file URLs.
