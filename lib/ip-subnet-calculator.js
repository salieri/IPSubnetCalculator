/*jshint strict: false, bitwise: false */
/* global define,module */

/**
 * @namespace
 * @author Aleksi Asikainen
 *
 * IpSubnetCalculator 0.1.0
 *
 * Copyright (c) 2013, Aleksi Asikainen
 * All rights reserved.
 *
 * Released under Apache 2.0 License
 * http://www.apache.org/licenses/LICENSE-2.0.html
 *
 *
 * Designed for:
 *
 *    1) Calculating optimal and exact subnet masks for an
 *       unrestricted range of IP addresses.
 *
 *       E.g. range 10.0.1.255 - 10.0.3.255 should result in:
 *
 *           10.0.1.255/32
 *           10.0.2.0/24
 *           10.0.3.0/24
 *
 *    2) Calculating subnets from an IP and bitmask size
 *
 *    3) Calculating subnets and bitmask sizes from an IP and subnet mask
 *
 *
 * Use `calculate()`, `calculateSubnetMask()`, and `calculateCIDRPrefix()` for easy access.
 *
 */
var IpSubnetCalculator = {

	/**
	 * Calculates an optimal set of IP masks for the given IP address range
	 *
	 * @param {string} ipStart Lowest IP in the range to be calculated in string format ("123.123.123.123")
	 * @param {string} ipEnd Highest IP (inclusive) in the range to be calculated in string format ("123.123.123.123")
	 *
	 * @return The function returns null in case of an error. Otherwise, an array containing one or more subnet
	 *         masks is returned:
	 *
	 * <code>var result = [
	 *      {
	 *          ipLow              : 2071689984,
	 *          ipLowStr           : "123.123.123.0",
	 *          ipHigh             : 2071690239,
	 *          ipHighStr          : "123.123.123.255",
	 *          prefixMask         : 4294967040,
	 *          prefixMaskStr      : "255.255.255.0",
	 *          prefixSize         : 24,
	 *          invertedMask       : 255,
	 *          invertedMaskStr    : "0.0.0.255",
	 *          invertedMaskSize   : 8
	 *      },
	 *
	 *      ...
	 *  ];
	 * </code>
	 * @public
	 */
	calculate : function( ipStart, ipEnd )
	{
		var ipStartNum, ipEndNum, ipCurNum;
		var rangeCollection = [];
				
		if( 
			( ipStart === '' ) || ( ipStart === null ) || ( ipStart === false ) || 
			( ipEnd === '' ) || ( ipEnd === null ) || ( ipEnd === false ) 
		)
		{
			return null;
		}
		
		
		ipStartNum = IpSubnetCalculator.toDecimal( ipStart );
		ipEndNum = IpSubnetCalculator.toDecimal( ipEnd );
		
		if( ipEndNum < ipStartNum )
		{
			return null;
		}
	
		ipCurNum = ipStartNum;
		
		while( ipCurNum <= ipEndNum )
		{
			var optimalRange = IpSubnetCalculator.getOptimalRange( ipCurNum, ipEndNum );
			
			if( optimalRange === null )
			{
				return null;
			}
		
			rangeCollection.push( optimalRange );
			
			ipCurNum = optimalRange.ipHigh + 1;		
		}
				
		return rangeCollection;	
	},
	
	
	/**
	 * Calculates a subnet mask from CIDR prefix.
	 *
	 * @param {string} ip IP address in string format
	 * @param {int} prefixSize Number of relevant bits in the subnet mask
	 * @return {object|null} Returns null in case of an error, and a subnet data object otherwise.
	 *         For details about the subnet data object, see documentation of
	 *         getMaskRange()
	 * @public
	 */
	calculateSubnetMask : function( ip, prefixSize )
	{
		if( 
			( ip === '' ) || ( ip === null ) || ( ip === false ) || 
			( prefixSize === '' ) || ( prefixSize === null ) || ( prefixSize === false ) 
		)
		{
			return null;
		}

	
		var ipNum = IpSubnetCalculator.toDecimal( ip );
				
		return IpSubnetCalculator.getMaskRange( ipNum, prefixSize );	
	},
	
	
	/**
	 * Calculates a CIDR prefix from subnet mask.
	 *
	 * @param {string} ip IP address in string format
	 * @param {string} subnetMask IP subnet mask in string format ("255.255.255.0")
	 * @return {object|null} Returns null in case of an error, and a subnet data object otherwise.
	 *         For details about the subnet data object, see documentation of
	 *         getMaskRange()
	 * @public
	 */
	calculateCIDRPrefix : function( ip, subnetMask )
	{
		if( 
			( ip === '' ) || ( ip === null ) || ( ip === false ) || 
			( subnetMask === '' ) || ( subnetMask === null ) || ( subnetMask === false ) 
		)
		{
			return null;
		}

	
		var ipNum = IpSubnetCalculator.toDecimal( ip );
		var subnetMaskNum = IpSubnetCalculator.toDecimal( subnetMask );
	
		var prefix = 0;
		var newPrefix = 0;
		var prefixSize;
	
		for( prefixSize = 0; prefixSize < 32; prefixSize++ )
		{
			newPrefix = ( prefix + ( 1 << ( 32 - ( prefixSize + 1 ) ) ) ) >>> 0;
		
			if( ( ( subnetMaskNum & newPrefix ) >>> 0 ) !== newPrefix )
			{
				break;
			}
		
			prefix = newPrefix;		
		} 
		
		return IpSubnetCalculator.getMaskRange( ipNum, prefixSize );		 
	},
	

	/**
	 * Finds the largest subnet mask that begins from ipNum and does not
	 * exceed ipEndNum.
	 *
	 * @param {int} ipNum IP start point
	 * @param {int} ipEndNum IP end point
	 * @return {object|null} Returns null on failure, otherwise an object with the following fields:
	 *
	 * ipLow - Decimal representation of the lowest IP address in the subnet
	 * ipLowStr - String representation of the lowest IP address in the subnet
	 * ipHigh - Decimal representation of the highest IP address in the subnet
	 * ipHighStr - String representation of the highest IP address in the subnet
	 * prefixMask - Bitmask matching prefixSize
	 * prefixMaskStr - String / IP representation of the bitmask
	 * prefixSize - Size of the prefix
	 * invertedMask - Bitmask matching the inverted subnet mask
	 * invertedMaskStr - String / IP representation of the inverted mask
	 * invertedSize - Number of relevant bits in the inverted mask
	 * @private
	 */
	getOptimalRange : function( ipNum, ipEndNum )
	{
		var prefixSize;
		var optimalRange = null;
		
		for( prefixSize = 32; prefixSize >= 0; prefixSize-- )
		{
			var maskRange = IpSubnetCalculator.getMaskRange( ipNum, prefixSize );
			
			if( ( maskRange.ipLow === ipNum ) && ( maskRange.ipHigh <= ipEndNum ) )
			{
				optimalRange = maskRange;
			}
			else
			{
				break;
			}
		}
		
		return optimalRange;
	}, 


	/**
	 * Calculates details of a CIDR subnet
	 *
	 * @param {int} ipNum Decimal IP address
	 * @param {int} prefixSize Subnet mask size in bits
	 * @return {object} Returns an object with the following fields:
	 *
	 * ipLow - Decimal representation of the lowest IP address in the subnet
	 * ipLowStr - String representation of the lowest IP address in the subnet
	 * ipHigh - Decimal representation of the highest IP address in the subnet
	 * ipHighStr - String representation of the highest IP address in the subnet
	 * prefixMask - Bitmask matching prefixSize
	 * prefixMaskStr - String / IP representation of the bitmask
	 * prefixSize - Size of the prefix
	 * invertedMask - Bitmask matching the inverted subnet mask
	 * invertedMaskStr - String / IP representation of the inverted mask
	 * invertedSize - Number of relevant bits in the inverted mask
	 * @private
	 */
	getMaskRange : function( ipNum, prefixSize )
	{
		var prefixMask = IpSubnetCalculator.getPrefixMask( prefixSize );
		var lowMask = IpSubnetCalculator.getMask( 32 - prefixSize );
		
		var ipLow = ( ipNum & prefixMask ) >>> 0;
		var ipHigh = ( ( ( ipNum & prefixMask ) >>> 0 ) + lowMask ) >>> 0;
		
		return {
			'ipLow'				: ipLow,
			'ipLowStr'			: IpSubnetCalculator.toString( ipLow ),
			
			'ipHigh'			: ipHigh,
			'ipHighStr'			: IpSubnetCalculator.toString( ipHigh ),
			
			'prefixMask'		: prefixMask,
			'prefixMaskStr'		: IpSubnetCalculator.toString( prefixMask ),
			'prefixSize'		: prefixSize,
			
			'invertedMask'		: lowMask,
			'invertedMaskStr'	: IpSubnetCalculator.toString( lowMask ),
			'invertedSize'		: 32 - prefixSize
		};
	},


	/**
	 * Creates a bitmask with maskSize leftmost bits set to one
	 *
	 * @param {int} prefixSize Number of bits to be set
	 * @return {int} Returns the bitmask
	 * @private
	 */
	getPrefixMask : function( prefixSize )
	{
		var mask = 0;
		var i;
		
		for( i = 0; i < prefixSize; i++ )
		{
			mask += ( 1 << ( 32 - ( i + 1 ) ) ) >>> 0;
		}
		
		return mask;
	},
	
	
	/**
	 * Creates a bitmask with maskSize rightmost bits set to one
	 *
	 * @param {int} maskSize Number of bits to be set
	 * @return {int} Returns the bitmask
	 * @private
	 */
	getMask : function( maskSize )
	{
		var mask = 0;
		var i;
		
		for( i = 0; i < maskSize; i++ )
		{
			mask += ( 1 << i ) >>> 0;
		}
		
		return mask;
	},
	
	
	/**
	 * Converts string formatted IPs to decimal representation
	 *
	 * @link http://javascript.about.com/library/blipconvert.htm
	 * @param {string} ipString IP address in string format
	 * @return {int} Returns the IP address in decimal format
	 * @private
	 */
	toDecimal : function( ipString )
	{
		var d = ipString.split( '.' );
		return ( ( ( ( ( ( +d[ 0 ] ) * 256 ) + ( +d [ 1 ] ) ) * 256 ) + ( +d[ 2 ] ) ) * 256 ) + ( +d[ 3 ] );
	},
	
	
	/**
	 * Converts decimal IPs to string representation
	 *
	 * @link http://javascript.about.com/library/blipconvert.htm
	 * @param {int} ipNum IP address in decimal format
	 * @return {string} Returns the IP address in string format
	 * @private
	 */
	toString : function( ipNum )
	{	
		var d = ipNum % 256;
		
		for( var i = 3; i > 0; i-- )
		{ 
			ipNum   = Math.floor( ipNum / 256 );
			d       = ipNum % 256 + '.' + d;
		}
		
		return d;
	}
};


if( ( typeof define === 'function' ) && ( define.amd ) )
{
	define( [], function() { return IpSubnetCalculator; } );
}
else if( typeof exports === 'object' )
{
	module.exports = IpSubnetCalculator;
}

