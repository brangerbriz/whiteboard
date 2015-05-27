	
	Math.norm = function(value, min, max) {
		return (value - min) / (max - min);
	};

	Math.lerp = function(norm, min, max) {
		return (max - min) * norm + min;
	};

	Math.map = function(value, sourceMin, sourceMax, destMin, destMax) {
		return Math.lerp(Math.norm(value, sourceMin, sourceMax), destMin, destMax);
	};