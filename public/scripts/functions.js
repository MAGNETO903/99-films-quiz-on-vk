var get_random_elements = function(arr, num=1, except_elements = []) {
	var elements = []

	while (elements.length < num) {
		var rand_index = Math.floor(Math.random() * arr.length)

		if (except_elements.includes(arr[rand_index]) == false && elements.includes(arr[rand_index]) == false) {

			elements.push(arr[rand_index])
		}
	}

	return elements
}

var get_random_num = function(a, b, except_elements = []) {
	var num = Math.floor(Math.random() * (b-a))+a;

	while (except_elements.includes(num) == true) {
		num = Math.floor(Math.random() * (b-a))+a;
	}

	return num
}

var delete_val = function(arr, val) {
	var myIndex = arr.indexOf(val);
	if (myIndex !== -1) {
	    arr.splice(myIndex, 1);
	}

	return arr
}