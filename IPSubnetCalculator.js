/*jshint strict: false, bitwise: false */


/**
* \class IPSubnetCalculator
* 
* IPSubnetCalculator 0.1.0
* 
* Copyright (c) 2013, Aleksi Asikainen   
* All rights reserved.
* 
* Released under Apache 2.0 License
* http://www.apache.org/licenses/LICENSE-2.0.html 
* 
*  
* A singleton class for:
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
*    3) Calculating subnets from an IP and subnet mask   
*
* 
* Use calculate(), calculateCIDRMask(), and calculateMask() for easy access.
*
**/


var IPSubnetCalculator = {

	/**
	* \fn calculate( ipStart, ipEnd )
	*
	* Calculates an optimal set of IP masks for the given IP address range	 
	*
	* \param ipStart String Lowest IP in the range to be calculated in string format ("123.123.123.123")  
	* \param ipEnd String Highest IP (inclusive) in the range to be calculated in string format ("123.123.123.123")
	*
	* \return The function returns null in case of an error. Otherwise, an array containing one or more subnet 
	*         masks is returned:
	*
	*         [
	*             {
	*                 ipLow              : 2071689984,
	*                 ipLowStr           : "123.123.123.0",
	*                 ipHigh             : 2071690239,
	*                 ipHighStr          : "123.123.123.255",
	*                 prefixMask         : 4294967040,
	*                 prefixMaskStr      : "255.255.255.0",
	*                 prefixSize         : 24,
	*                 invertedMask       : 255,
	*                 invertedMaskStr    : "0.0.0.255",
	*                 invertedMaskSize   : 8
	*             },
	*
	*             ...
	*
	*         ]
	*
	**/

	calculate : function IPSubnetCalculator_calculate( ipStart, ipEnd )
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
		
		
		ipStartNum = IPSubnetCalculator.toDecimal( ipStart );
		ipEndNum = IPSubnetCalculator.toDecimal( ipEnd );
		
		if( ipEndNum < ipStartNum )
		{
			return null;
		}
	
		ipCurNum = ipStartNum;
		
		while( ipCurNum <= ipEndNum )
		{
			var optimalRange = IPSubnetCalculator.getOptimalRange( ipCurNum, ipEndNum );
			
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
	* \fn calculateCIDRMask( ip, prefixSize )
	* \param ip IP address in string format
	* \param prefixSize Number of relevant bits in the subnet mask
	* \return Returns null in case of an error, and a subnet data object otherwise.
	*         For details about the subnet data object, see documentation of
	*         getMaskRange()	 
	**/
	
	calculateCIDRMask : function IPSubnetCalculator_calculateCIDRMask( ip, prefixSize )
	{
		if( 
			( ip === '' ) || ( ip === null ) || ( ip === false ) || 
			( prefixSize === '' ) || ( prefixSize === null ) || ( prefixSize === false ) 
		)
		{
			return null;
		}

	
		var ipNum = IPSubnetCalculator.toDecimal( ip );
				
		return IPSubnetCalculator.getMaskRange( ipNum, prefixSize );	
	},
	
	
	/**
	* \fn calculateMask( ip, ipMask )
	* \param ip IP address in string format
	* \param ipMask IP subnet mask in string format ("255.255.255.0")
	* \return Returns null in case of an error, and a subnet data object otherwise.
	*         For details about the subnet data object, see documentation of
	*         getMaskRange()	 
	**/
	
	calculateMask : function IPSubnetCalculator_calculateMask( ip, ipMask )
	{
		if( 
			( ip === '' ) || ( ip === null ) || ( ip === false ) || 
			( ipMask === '' ) || ( ipMask === null ) || ( ipMask === false ) 
		)
		{
			return null;
		}

	
		var ipNum = IPSubnetCalculator.toDecimal( ip );
		var ipMaskNum = IPSubnetCalculator.toDecimal( ipMask );
	
		var prefix = 0;
		var newPrefix = 0;
		var prefixSize;
	
		for( prefixSize = 0; prefixSize < 32; prefixSize++ )
		{
			newPrefix = ( prefix + ( 1 << ( 32 - ( prefixSize + 1 ) ) ) ) >>> 0;
		
			if( ( ( ipMaskNum & newPrefix ) >>> 0 ) !== newPrefix )
			{
				break;
			}
		
			prefix = newPrefix;		
		} 
		
		return IPSubnetCalculator.getMaskRange( ipNum, prefixSize );		 
	},
	

	/**
	* \fn getOptimalRange( ipNum, ipEndNum )
	* 
	* Finds the largest subnet mask that begins from ipNum and does not
	* exceed ipEndNum.
	* 
	* \return Returns null on failure, otherwise an object with the following fields:
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
	*
	*/

	getOptimalRange : function IPSubnetCalculator_getOptimalRange( ipNum, ipEndNum )
	{
		var prefixSize;
		var optimalRange = null;
		
		for( prefixSize = 32; prefixSize >= 0; prefixSize-- )
		{
			var maskRange = IPSubnetCalculator.getMaskRange( ipNum, prefixSize );
			
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
	* \fn getMaskRange( ipNum, prefixSize )
	* \param ipNum Decimal IP address
	* \param prefixSize Subnet mask size in bits
	* 
	* Calculates details of a CIDR subnet
	* 
	* \return Returns an object with the following fields:
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
	*
	**/

	getMaskRange : function IPSubnetCalculator_getMaskRange( ipNum, prefixSize )
	{
		var prefixMask = IPSubnetCalculator.getPrefixMask( prefixSize );
		var lowMask = IPSubnetCalculator.getMask( 32 - prefixSize );
		
		var ipLow = ( ipNum & prefixMask ) >>> 0;
		var ipHigh = ( ( ( ipNum & prefixMask ) >>> 0 ) + lowMask ) >>> 0;
		
		return {
			'ipLow'				: ipLow,
			'ipLowStr'			: IPSubnetCalculator.toString( ipLow ),
			
			'ipHigh'			: ipHigh,
			'ipHighStr'			: IPSubnetCalculator.toString( ipHigh ),
			
			'prefixMask'		: prefixMask,
			'prefixMaskStr'		: IPSubnetCalculator.toString( prefixMask ),
			'prefixSize'		: prefixSize,
			
			'invertedMask'		: lowMask,
			'invertedMaskStr'	: IPSubnetCalculator.toString( lowMask ),
			'invertedSize'		: 32 - prefixSize
		};
	},


	/**
	* \fn getPrefixMask( prefixSize )
	* \param prefixSize Number of bits to be set	 
	* 
	* Creates a bitmask with maskSize leftmost bits set to one 
	* 
	* \return Returns the bitmask
	*
	**/
	
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
	* \fn getMask( maskSize )
	* \param maskSize Number of bits to be set	 
	* 
	* Creates a bitmask with maskSize rightmost bits set to one
	* 
	* \return Returns the bitmask
	*
	**/
	
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
	* \fn toDecimal( ipString )
	* \param ipString IP address in string format	 
	* 
	* Converts string formatted IPs to decimal representation
	*
	* Function copied from http://javascript.about.com/library/blipconvert.htm	
	*
	* \return Returns the IP address in decimal format
	*
	**/
	
	toDecimal : function IPSubnetCalculator_toDecimal( ipString )
	{
		var d = ipString.split( '.' );
		return ( ( ( ( ( ( + d[ 0 ] ) * 256 ) + ( +d [ 1 ] ) ) * 256 ) + ( +d[ 2 ] ) ) * 256 ) + ( +d[ 3 ] );
	},
	
	
	/**
	* \fn toString( ipNum )
	* \param ipNum IP address in decimal format
	* 
	* Converts decimal IPs to string representation
	*
	* Function copied from http://javascript.about.com/library/blipconvert.htm
	* 
	* \return Returns the IP address in string format
	*
	**/
	
	toString : function IPSubnetCalculator_toString( ipNum )
	{	
		var d = ipNum % 256;
		
		for( var i = 3; i > 0; i-- )
		{ 
			ipNum = Math.floor( ipNum / 256 );
			d = ipNum % 256 + '.' + d;
		}
		
		return d;
	}



};



