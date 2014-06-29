
require.config(
		{
			paths	: {
					'jquery'	: 'https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min'
				},

			shim	: {
					'jquery'	: {
							exports : [ 'jquery', '$' ]
						}
				},

			baseUrl	: 'lib'
		}
	);



require( [ '../resources/js/ui' ],

	function()
	{
		// done!
	}

);
