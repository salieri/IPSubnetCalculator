'use strict';

/**
 * @namespace
 * @author Aleksi Asikainen
 * @link https://github.com/franksrevenge/IPSubnetCalculator
 *
 * IpSubnetCalculator 1.1.0
 *
 * Copyright (c) 2013-2016, Aleksi Asikainen
 * All rights reserved.
 *
 * Released under MIT License
 * https://opensource.org/licenses/MIT
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
	 * @param {string|number} ipStart Lowest IP in the range to be calculated
	 * @param {string|number} ipEnd Highest IP (inclusive) in the range to be calculated
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

		try
		{
			ipStartNum	= this.toDecimal( ipStart );
			ipEndNum	= this.toDecimal( ipEnd );
		}
		catch( err )
		{
			return null;
		}
		
		if( ipEndNum < ipStartNum )
		{
			return null;
		}
	
		ipCurNum = ipStartNum;
		
		while( ipCurNum <= ipEndNum )
		{
			var optimalRange = this.getOptimalRange( ipCurNum, ipEndNum );
			
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
	 * @param {string|number} ip IP address ("2.3.4.5")
	 * @param {int} prefixSize Number of relevant bits in the subnet mask (24)
	 * @return {object|null} Returns null in case of an error, and a subnet data object otherwise.
	 *         For details about the subnet data object, see documentation of
	 *         getMaskRange()
	 * @public
	 */
	calculateSubnetMask : function( ip, prefixSize )
	{
		var ipNum;

		try
		{
			ipNum = this.toDecimal( ip );
		}
		catch( err )
		{
			return null;
		}
				
		return this.getMaskRange( ipNum, prefixSize );
	},
	
	
	/**
	 * Calculates a CIDR prefix from subnet mask.
	 *
	 * @param {string|number} ip IP address ("2.3.4.5")
	 * @param {string|number} subnetMask IP subnet mask ("255.255.255.0")
	 * @return {object|null} Returns `null` in case of an error, and a subnet data object otherwise.
	 *         For details about the subnet data object, see documentation of
	 *         getMaskRange()
	 * @public
	 */
	calculateCIDRPrefix : function( ip, subnetMask )
	{
		var ipNum,
			subnetMaskNum,
			prefix			= 0,
			newPrefix		= 0,
			prefixSize;

		try
		{
			ipNum			= this.toDecimal( ip );
			subnetMaskNum	= this.toDecimal( subnetMask );
		}
		catch( err )
		{
			return null;
		}

		for( prefixSize = 0; prefixSize < 32; prefixSize++ )
		{
			newPrefix = ( prefix + ( 1 << ( 32 - ( prefixSize + 1 ) ) ) ) >>> 0;
		
			if( ( ( subnetMaskNum & newPrefix ) >>> 0 ) !== newPrefix )
			{
				break;
			}
		
			prefix = newPrefix;
		}
		
		return this.getMaskRange( ipNum, prefixSize );
	},
	

	/**
	 * Finds the largest subnet mask that begins from ipNum and does not
	 * exceed ipEndNum.
	 *
	 * @param {int} ipNum IP start point (inclusive)
	 * @param {int} ipEndNum IP end point (inclusive)
	 * @return {object|null} Returns `null` on failure, otherwise an object with the following fields:
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
		var prefixSize,
			optimalRange = null;
		
		for( prefixSize = 32; prefixSize >= 0; prefixSize-- )
		{
			var maskRange = this.getMaskRange( ipNum, prefixSize );
			
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
		var prefixMask	= this.getPrefixMask( prefixSize ),
			lowMask		= this.getMask( 32 - prefixSize ),
			ipLow		= ( ipNum & prefixMask ) >>> 0,
			ipHigh		= ( ( ( ipNum & prefixMask ) >>> 0 ) + lowMask ) >>> 0;

		return {
			ipLow			: ipLow,
			ipLowStr		: this.toString( ipLow ),
			
			ipHigh			: ipHigh,
			ipHighStr		: this.toString( ipHigh ),
			
			prefixMask		: prefixMask,
			prefixMaskStr	: this.toString( prefixMask ),
			prefixSize		: prefixSize,
			
			invertedMask	: lowMask,
			invertedMaskStr	: this.toString( lowMask ),
			invertedSize	: 32 - prefixSize
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
		var mask = 0,
			i;
		
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
		var mask = 0,
			i;
		
		for( i = 0; i < maskSize; i++ )
		{
			mask += ( 1 << i ) >>> 0;
		}
		
		return mask;
	},


	/**
	 * Test whether string is an IP address
	 * @param {string} ip
	 * @returns {boolean}
	 * @public
	 */
	isIp : function( ip )
	{
		if( typeof ip !== 'string' )
		{
			return false;
		}

		var parts = ip.match( /^([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/ );

		if( parts === null )
		{
			return false;
		}

		for( var i = 1; i <= 4; i++ )
		{
			var n = parseInt( parts[ i ], 10 );

			if( ( n > 255 ) || ( n < 0 ) )
			{
				return false;
			}
		}

		return true;
	},


	/**
	 * Test whether number is an IP address
 	 * @param {number} ipNum
	 * @returns {boolean}
	 * @public
	 */
	isDecimalIp : function( ipNum )
	{
		return (
				( typeof ipNum === 'number' ) && // is this a number?
				( ipNum % 1 === 0 ) && // does the number have a decimal place?
				( ipNum >= 0 ) &&
				( ipNum <= 4294967295 )
			);
	},

	
	/**
	 * Converts string formatted IPs to decimal representation
	 *
	 * @link http://javascript.about.com/library/blipconvert.htm
	 * @param {string|number} ipString IP address in string format. If a decimal representation given, it is returned unmodified.
	 * @return {int} Returns the IP address in decimal format
	 * @throws {Error} Throws an error, if `ipString` does not contain an IP address.
	 * @private
	 */
	toDecimal : function( ipString )
	{
		if( ( typeof ipString === 'number' ) && ( this.isDecimalIp( ipString ) === true ) )
		{
			return ipString;
		}

		if( this.isIp( ipString ) === false )
		{
			throw new Error( 'Not an IP address: ' + ipString );
		}

		var d = ipString.split( '.' );

		return ( ( ( ( ( ( +d[ 0 ] ) * 256 ) + ( +d [ 1 ] ) ) * 256 ) + ( +d[ 2 ] ) ) * 256 ) + ( +d[ 3 ] );
	},
	
	
	/**
	 * Converts decimal IPs to string representation
	 *
	 * @link http://javascript.about.com/library/blipconvert.htm
	 * @param {int} ipNum IP address in decimal format. If a string representation is given, it is returned unmodified.
	 * @return {string} Returns the IP address in string format
	 * @throws {Error} Throws an error, if `ipNum` is out of range, not a decimal, or not a number
	 * @private
	 */
	toString : function( ipNum )
	{
		if( ( typeof ipNum === 'string' ) && ( this.isIp( ipNum ) === true ) )
		{
			return ipNum;
		}

		if( this.isDecimalIp( ipNum ) === false )
		{
			throw new Error( 'Not a numeric IP address: ' + ipNum );
		}

		var d = ipNum % 256;
		
		for( var i = 3; i > 0; i-- )
		{
			ipNum	= Math.floor( ipNum / 256 );
			d		= ipNum % 256 + '.' + d;
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

