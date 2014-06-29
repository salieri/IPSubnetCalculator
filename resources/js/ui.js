
require( [ 'jquery', 'ip-subnet-calculator' ],

function( $, IpSubnetCalculator )
{
	'use strict';

	var showResult = function( elementName, msg )
	{
		$( '#' + elementName ).html( msg );
		$( '#' + elementName ).slideDown( 'fast' );
	};


	$( '#ip_calculate_range_button' ).click(
			function()
			{
				var result = IpSubnetCalculator.calculate(
						$( '#ip_calculate_range_start_ip' ).val(),
						$( '#ip_calculate_range_end_ip' ).val()
					);

				if( result === null )
				{
					showResult( 'ip_calculate_range_result', 'Please enter IP range in the fields above' );
				}
				else
				{
					var i;
					var msg = '<h2>Result</h2>' +
								'<table>' +
								'<thead><tr><td>IP</td><td>Prefix</td><td>Subnet Mask</td></tr></thead>' +
								'<tfoot><tr><td>IP</td><td>Prefix</td><td>Subnet Mask</td></tr></tfoot>';

					for( i = 0; i < result.length; i++ )
					{
						msg += '<tr>' +
									'<td>' + result[ i ].ipLowStr + '</td>' +
									'<td>' + '/' + result[ i ].prefixSize + '</td>' +
									'<td>' + result[ i ].prefixMaskStr + '</td>' +
									"</tr>\n";
					}

					msg += "</tbody></table>\n";

					showResult( 'ip_calculate_range_result', msg );
				}
			}
		);


	$( '#ip_calculate_cidr_mask_button' ).click(
			function()
			{
				var result = IpSubnetCalculator.calculateSubnetMask(
						$( '#ip_calculate_cidr_mask_ip' ).val(),
						$( '#ip_calculate_cidr_mask_mask' ).val()
					);

				if( result === null )
				{
					showResult( 'ip_calculate_cidr_mask_result', 'Please enter IP range in the fields above' );
				}
				else
				{
					var msg = '<h2>Result</h2>' +
								'<table>' +
								'<thead><tr><td>Address Range</td><td>Subnet Mask</td><td>Prefix Size</td></tr></thead>' +
								'<tbody>' +
								'<tr>' +
									'<td>' + result.ipLowStr + ' - ' + result.ipHighStr + '</td>' +
									'<td>' + result.prefixMaskStr + '</td>' +
									'<td>' + result.prefixSize + '</td>' +
								'</tr>' +
								'</tbody></table>';

					showResult( 'ip_calculate_cidr_mask_result', msg );
				}
			}
		);


	$( '#ip_calculate_mask_button' ).click(
			function()
			{
				var result = IpSubnetCalculator.calculateCIDRPrefix(
						$( '#ip_calculate_mask_ip' ).val(),
						$( '#ip_calculate_mask_mask' ).val()
					);

				if( result === null )
				{
					showResult( 'ip_calculate_mask_result', 'Please enter IP range in the fields above' );
				}
				else
				{
					var msg = '<h2>Result</h2>' +
								'<table>' +
								'<thead><tr><td>Address Range</td><td>Subnet Mask</td><td>Prefix Size</td></tr></thead>' +
								'<tbody>' +
								'<tr>' +
									'<td>' + result.ipLowStr + ' - ' + result.ipHighStr + '</td>' +
									'<td>' + result.prefixMaskStr + '</td>' +
									'<td>' + result.prefixSize + '</td>' +
								'</tr>' +
								'</tbody></table>';

					showResult( 'ip_calculate_mask_result', msg );
				}
			}
		);

} );

