# Component Lifecycle

```js
Example Component Lifecycle

start() // starts the component, including obseerrver and such
animateIn() // animates the component in /triggered by the observer or manually
stop() // stops the component, including observer and such
animateOut() // animates the component out /triggered by the observer or manually
destroy() // destroys the component, including observer and such

page transition

pageOut() {
    stop()
    animateOut() (if in view)
    destroy()
}

pageIn() {
    start()
    animateIn()
}
```
