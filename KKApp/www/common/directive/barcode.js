angular.module('KooKoo.BarcodeDirective',[
])
.directive('barcode', ['$timeout',
	function($timeout){
		return {
			restrict: 'A',
			scope: {
				barcode: '=',
			},
			link: function(scope, el, attrs){
				var renderBarcode = function(){
					var scale = 2,
						sym = 'upca', 
						rot='N';
					var opts = {
						includetext: true,
						inkspread: 0
					};
					var bw = new BWIPJS;
					bw.bitmap(new Bitmap);
					bw.scale(scale,scale);
					bw.push(scope.barcode);
					bw.push(opts);
					//try {

						bw.call(sym, function(e){
							 // If e is truthy, an error has occurred.
							if(e){
								console.log(e)
								return;
							}
							bw.bitmap().show(attrs.id, rot);
						});
						
					//} catch(e) {
						//console.log(e);
						/*
						var s = '';
						if (e.fileName)
							s += e.fileName + ' ';
						if (e.lineNumber)
							s += '[line ' + e.lineNumber + '] ';
						alert(s + (s ? ': ' : '') + e.message);
						*/
					//}
				}
				scope.$watch('barcode', function(){	
					$timeout(function(){
						renderBarcode();
					}, 1000)		
				});

			}
		};
	}
]);