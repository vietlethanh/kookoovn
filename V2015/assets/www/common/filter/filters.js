angular.module('MCMRelationshop.Filter',[
])
.filter('tel', function () {
	return function (tel) {
		if (!tel) { return ''; }
		var value = tel.toString().trim().replace(/^\+/, '');
		if (value.match(/[^0-9]/)) {
			return tel;
		}
		tel = tel.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
		return tel;
	};
})
.filter('currency', function () {
	return function (val) {
		if (!val) { return ''; }
		var value = val.toString().trim().replace('.', '');
		if (value.match(/[^0-9]/)) {
			return val;
		}
		val.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
		return val;
	};
});