# push-queue

## Usage

```js
const q = require('push-queue')();

q.push(function (cb) {
	setTimeout(function () {
		console.log(1);
		cb();
	}, 1000);
});

q.push(function (cb) {
	setTimeout(function () {
		console.log(2);
		cb();
	}, 500);
});
```

result
```
1  // after 1000ms
2  // after 1500ms
```
