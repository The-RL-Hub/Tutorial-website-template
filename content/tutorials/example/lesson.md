# Example lesson

This sample verifies the complete Markdown rendering path.

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

## A repeated heading

The second heading receives a unique identifier, so both sidebar links work.

> **Warning:** Serve the site over HTTP; browser security rules usually block local XHR from file URLs.
