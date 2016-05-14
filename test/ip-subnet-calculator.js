'use strict';

var should	= require( 'should' ),
	ipsc	= require( '../lib/ip-subnet-calculator' ),
	_		= require( 'lodash' );


var ipList = {
	'127.0.0.1'			: 2130706433,
	'8.8.4.4'			: 134743044,
	'8.8.8.8'			: 134744072,
	'4.2.2.2'			: 67240450,
	'255.255.255.255'	: 4294967295,
	'0.0.0.0'			: 0
};


var ipValidity = {
	'127.0.0.1'			: true,
	'255.255.255.255'	: true,
	'0.0.0.0'			: true,
	'12.32'				: false,
	'0.0.0.0.1'			: false,
	'123.123.512.123'	: false,
	' 123.123.123.123 '	: false,
	'hello world'		: false,
	'#0'				: false,
	'#67240450'			: false
};


var ipNumValidity = {

	'#2130706433'	: true,
	'#134743044'	: true,
	'#134744072'	: true,
	'#67240450'		: true,
	'#4294967295'	: true,
	'#0'			: true,
	'#4294967296'	: false,
	'#11234.5839'	: false,
	'hello world'	: false,
	'127.0.0.1'		: false
};


var ipRanges = [
	{
		start	: '10.0.0.0',
		end		: '10.0.0.255',
		mask	: 24,
		success	: true
	},
	{
		start	: '128.0.0.0',
		end		: '128.0.255.255',
		mask	: 16,
		success	: true
	},
	{
		start	: '10.0.0.0',
		end		: '10.0.0.0',
		mask	: 32,
		success	: true
	},
	{
		start	: '0.0.0.0',
		end		: '255.255.255.255',
		mask	: 0,
		success	: true
	},
	{
		start	: '10.5.0.0',
		end		: '10.0.3.25',
		success	: false
	}
];


var ipSubnets = [

	{
		ip		: '10.0.0.45',
		mask	: 24,
		start	: '10.0.0.0',
		end		: '10.0.0.255'
	},
	{
		ip		: '101.0.2.45',
		mask	: 16,
		start	: '101.0.0.0',
		end		: '101.0.255.255'
	}

];





describe( 'IP Subnet Calculator',
	function()
	{
		it( 'should convert string IPs to decimals',
			function()
			{
				_.each(
						ipList,
						function( ipDec, ipStr )
						{
							ipsc.toDecimal( ipStr ).should.be.exactly( ipDec );
						}
					);
			}
		);


		it( 'should convert decimal IPs to strings',
				function()
				{
					_.each(
							ipList,
							function( ipDec, ipStr )
							{
								ipsc.toString( ipDec ).should.be.exactly( ipStr );
							}
						);
				}
		);
		
		
		it( 'should correctly create bitmasks',
				function()
				{
					ipsc.getMask( 0 ).should.be.exactly( 0 );
					ipsc.getMask( 4 ).should.be.exactly( 15 );
					ipsc.getMask( 15 ).should.be.exactly( 32767 );
					ipsc.getMask( 32 ).should.be.exactly( 4294967295 );
				}
			);


		it( 'should correctly create prefix bitmasks',
				function()
				{
					ipsc.getPrefixMask( 0 ).should.be.exactly( 0 );
					ipsc.getPrefixMask( 4 ).should.be.exactly( 4026531840 );
					ipsc.getPrefixMask( 15 ).should.be.exactly( 4294836224 );
					ipsc.getPrefixMask( 32 ).should.be.exactly( 4294967295 );
				}
		);


		it( 'should validate IP addresses',
				function()
				{
					_.each(
							ipValidity,
							function( isValid, ipStr )
							{
								if( ipStr.substr( 0, 1 ) === '#' )
								{
									ipStr = parseFloat( ipStr.substr( 1 ) );
								}

								ipsc.isIp( ipStr ).should.be.exactly( isValid );
							}
					);
				}
			);


		it( 'should validate numeric IP addresses',
				function()
				{
					_.each(
							ipNumValidity,
							function( isValid, ipNum )
							{
								if( ipNum.substr( 0, 1 ) === '#' )
								{
									ipNum = parseFloat( ipNum.substr( 1 ) );
								}

								ipsc.isDecimalIp( ipNum ).should.be.exactly( isValid );
							}
					);
				}
		);


		it( 'should calculate optimal range for a maskable range',
				function()
				{
					_.each(
							ipRanges,
							function( ipRange )
							{
								var range = ipsc.getOptimalRange( ipsc.toDecimal( ipRange.start ), ipsc.toDecimal( ipRange.end ) );

								if( ipRange.success )
								{
									range.ipLowStr.should.be.exactly( ipRange.start );
									range.ipLow.should.be.exactly( ipsc.toDecimal( range.ipLowStr ) );
									range.ipHighStr.should.be.exactly( ipRange.end );
									range.ipHigh.should.be.exactly( ipsc.toDecimal( range.ipHighStr ) );
									range.prefixSize.should.be.exactly( ipRange.mask );
									range.invertedSize.should.be.exactly( 32 - ipRange.mask );
									range.invertedMask.should.be.exactly( ipsc.getMask( range.invertedSize ) );
									range.prefixMask.should.be.exactly( ipsc.getPrefixMask( range.prefixSize ) );
									range.invertedMaskStr.should.be.exactly( ipsc.toString( range.invertedMask ) );
									range.prefixMaskStr.should.be.exactly( ipsc.toString( range.prefixMask ) );
								}
								else
								{
									should.equal( range, null );
								}
							}
						);
				}
			);


		it( 'should calculate CIDR masks',
				function()
				{
					_.each(
							ipSubnets,
							function( subnet )
							{
								var range = ipsc.calculateCIDRPrefix(
										subnet.ip,
										ipsc.toString( ipsc.getPrefixMask( subnet.mask ) )
									);

								range.ipLowStr.should.be.exactly( subnet.start );
								range.ipHighStr.should.be.exactly( subnet.end );
								range.prefixSize.should.be.exactly( subnet.mask );
								range.invertedSize.should.be.exactly( 32 - subnet.mask );
							}
					);
				}
		);


		it( 'should calculate subnet masks',
				function()
				{
					_.each(
							ipSubnets,
							function( subnet )
							{
								var range = ipsc.calculateSubnetMask( subnet.ip, subnet.mask );

								range.ipLowStr.should.be.exactly( subnet.start );
								range.ipHighStr.should.be.exactly( subnet.end );
								range.prefixSize.should.be.exactly( subnet.mask );
								range.invertedSize.should.be.exactly( 32 - subnet.mask );
							}
						);
				}
			);


		it( 'should calculate masks for non-standard ranges',
				function()
				{
					var ranges = ipsc.calculate( '10.0.0.0', '10.0.1.1' );

					ranges[ 0 ].ipLowStr.should.be.exactly( '10.0.0.0' );
					ranges[ 0 ].ipHighStr.should.be.exactly( '10.0.0.255' );
					ranges[ 1 ].ipLowStr.should.be.exactly( '10.0.1.0' );
					ranges[ 1 ].ipHighStr.should.be.exactly( '10.0.1.1' );
				}
			);


		it( 'should calculate masks for non-standard ranges',
				function()
				{
					var ranges = ipsc.calculate( '10.0.0.0', '10.0.1.1' );

					ranges[ 0 ].ipLowStr.should.be.exactly( '10.0.0.0' );
					ranges[ 0 ].ipHighStr.should.be.exactly( '10.0.0.255' );
					ranges[ 1 ].ipLowStr.should.be.exactly( '10.0.1.0' );
					ranges[ 1 ].ipHighStr.should.be.exactly( '10.0.1.1' );
				}
		);


		it( 'should reject requests with invalid IPs',
				function()
				{
					should.equal( ipsc.calculate( 'hello', 'world' ), null );
				}
			);


		it( 'should fail calculate() if start IP is higher than end IP',
				function()
				{
					should.equal( ipsc.calculate( '10.1.0.0', '10.0.0.0' ), null );
				}
		);


		it( 'should fail calculateSubnetMask() if IP is invalid',
				function()
				{
					should.equal( ipsc.calculateSubnetMask( 'helloworld', 24 ), null );
				}
		);


		it( 'should fail calculateCIDRPrefix() if IP is invalid',
				function()
				{
					should.equal( ipsc.calculateCIDRPrefix( 'helloworld', '255.255.255.255' ), null );
				}
		);


		it( 'should pass decimal IPs through toDecimal()',
				function()
				{
					ipsc.toDecimal( 4026531840 ).should.be.exactly( 4026531840 );
				}
			);


		it( 'should pass string IPs through toString()',
				function()
				{
					ipsc.toString( '127.0.0.1' ).should.be.exactly( '127.0.0.1' );
				}
		);


		it( 'should reject converting invalid numeric IPs to strings',
				function()
				{
					(
						function()
						{
							ipsc.toString( -1 );
						}
					)
					.should.throw();
				}
		);

	}
);


