module.exports = function () {
	var q = [], _push = q.push;

	q.complete = true;

	q.push = function (fn) {
		var cb = function () {
			q.shift();
			if(q.length){
				q[0]();
			}
			else{
				q.complete = true;
			}
		};

		_push.call(q, function () {
			fn(cb);
		});

		if(q.complete === true){
			q.complete = false;
			fn(cb);
		}
	};

	return q;
};


// var q = module.exports();

// q.push(function (cb) {
// 	setTimeout(function () {
// 		console.log(1);
// 		cb();
// 	}, 100);
	
// });

// q.push(function (cb) {
// 	setTimeout(function () {
// 		console.log(2);
// 		cb();
// 	}, 50);
// });