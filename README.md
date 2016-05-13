IP Subnet Calculator
=================

JavaScript class for calculating optimal subnet masks for non-standard IP ranges, e.g. 5.4.3.21 - 6.7.8.9

[View demo](http://franksrevenge.github.io/IPSubnetCalculator/)

[![Build Status](https://travis-ci.org/franksrevenge/IPSubnetCalculator.svg?branch=master)](https://travis-ci.org/franksrevenge/IPSubnetCalculator) [![Coverage Status](https://coveralls.io/repos/github/franksrevenge/IPSubnetCalculator/badge.svg?branch=master)](https://coveralls.io/github/franksrevenge/IPSubnetCalculator?branch=master) [![Dependency Status](https://david-dm.org/franksrevenge/IPSubnetCalculator/status.svg)](https://david-dm.org/franksrevenge/IPSubnetCalculator#info=dependencies&view=table) [![Dev Dependency Status](https://david-dm.org/franksrevenge/IPSubnetCalculator/dev-status.svg)](https://david-dm.org/franksrevenge/IPSubnetCalculator#info=devDependencies&view=table)


What does it do?
----------------

* Calculates subnet masks for standard and non-standard IP ranges. For example, `10.0.0.5 - 10.0.0.23` will result in `10.0.0.5/32, 10.0.0.6/31, 10.0.0.8/29, 10.0.0.16/29`.

* Calculates CIDR prefixes from subnet masks, e.g. `10.0.0.5/255.255.128.0` will result in `10.0.0.0/17`.

* Calculates subnet masks from CIDR prefixes, e.g. `10.0.0.5/17` will result in `255.255.128.0`.


Support
-------

* Node.js
* RequireJS
* Direct browser use


Installation
------------

```sh
> bower install ip-subnet-calculator

> npm install ip-subnet-calculator
```


Node.js
-------

```javascript
var IpSubnetCalculator = require( 'ip-subnet-calculator' );

console.log( IpSubnetCalculator.isIp( '127.0.0.1' ) ); // "true"
console.log( IpSubnetCalculator.toDecimal( '127.0.0.1' ) ); // "2130706433"

console.log( IpSubnetCalculator.calculate( '5.4.3.21', '6.7.8.9' ) );

```


RequireJS
---------

```javascript
require( [ 'ip-subnet-calculator' ],

function( IpSubnetCalculator )
{
    console.log( IpSubnetCalculator.isIp( '127.0.0.1' ) ); // "true"
    console.log( IpSubnetCalculator.toDecimal( '127.0.0.1' ) ); // "2130706433"
    
    console.log( IpSubnetCalculator.calculate( '5.4.3.21', '6.7.8.9' ) ); 
} );
```


Direct browser use
------------------

```html
<script src='lib/ip-subnet-calculator.js'></script>

<script>
    console.log( IpSubnetCalculator.isIp( '127.0.0.1' ) ); // "true"
    console.log( IpSubnetCalculator.toDecimal( '127.0.0.1' ) ); // "2130706433"
    
    console.log( IpSubnetCalculator.calculate( '5.4.3.21', '6.7.8.9' ) );
</script>
```


API
---

### IpSubnetCalculator.calculate( ipStart, ipEnd ) ###

Calculates an optimal set of IP masks for the given IP address range.

*ipStart* (string|number) Lowest IP in the range to be calculated in string (`123.123.123.0`) or numeric (`2071689984`) format.

*ipEnd* (string|number) Highest IP (inclusive) in the range to be calculated in string (`123.123.123.255`) or numeric (`2071690239`) format.

The function returns `null` in case of an error. Otherwise, an array containing one or more subnet
masks is returned:

```javascript
var result = [
    {
        ipLow              : 2071689984,
        ipLowStr           : "123.123.123.0",
        ipHigh             : 2071690239,
        ipHighStr          : "123.123.123.255",
        prefixMask         : 4294967040,
        prefixMaskStr      : "255.255.255.0",
        prefixSize         : 24,
        invertedMask       : 255,
        invertedMaskStr    : "0.0.0.255",
        invertedMaskSize   : 8
    },
    
    ...
];
```

Each object in question contain the following properties:

| Property             | Use                                                            |
:----------------------|:---------------------------------------------------------------|
| ipLow                | Decimal representation of the lowest IP address in the range   |
| ipLowStr             | String representation of the lowest IP address in the range    |
| ipHigh               | Decimal representation of the highest IP address in the range  |
| ipHighStr            | String representation of the highest IP address in the range   |
| prefixMask           | Decimal representation of the prefix (subnet) mask             |
| prefixMaskStr        | String representation of the prefix (subnet) mask              |
| prefixSize           | Size of the prefix (subnet) mask in bits                       |
| invertedMask         | Decimal representation of the inverted prefix mask             |
| invertedMaskStr      | String representation of the inverted prefix mask              |
| invertedSize         | Size of the inverted prefix max in bits                        |


### IpSubnetCalculator.calculateSubnetMask( ip, prefixSize ) ###

Calculates a subnet mask from CIDR prefix.

*ip* (string|number) IP address in string or numeric format

*prefixSize* Number of relevant bits in the subnet mask

The function returns an object containing full description of the IP range, as described in `IpSubnetCalculator.calculate()`.


### IpSubnetCalculator.calculateCIDRPrefix( ip, subnetMask ) ###

Calculates a CIDR prefix from subnet mask.

*ip* (string|number) IP address in string or numeric format

*subnetMask* (string|number) IP subnet mask in string or numeric format

The function returns an object containing full description of the IP range, as described in `IpSubnetCalculator.calculate()`.


## Test Functions ##

### IpSubnetCalculator.isIp( ipStr ) ###

Tests whether string is an IP address.

*ipStr* (string) A string

The function returns a `true` if the string is an IP address, `false` otherwise.

### IpSubnetCalculator.isDecimalIp( ipNum ) ###

Tests whether string is an IP address.

*ipNum* (number) A number

The function returns a `true` if the number is an IP address, `false` otherwise.


## Conversion Functions ##

### IpSubnetCalculator.toDecimal( ip ) ###

Calculates a decimal integer from an string IP address.

*ip* (string|number) IP address in string format

The function returns a decimal representation of an IP address as an integer. If a valid numeric representation 
of an IP is passed to this function, it is returned unmodified.

If an invalid value is passed to the function, it will `throw` an `Error` object.


### IpSubnetCalculator.toString( num ) ###

*num* (number|string) Decimal representation of an IP address.

The function returns an IP address as a string. If a valid string representation of an IP is passed to this function,
it is returned unmodified.

If an invalid value is passed to the function, it will `throw` an `Error` object.


License
-------

[MIT](http://opensource.org/licenses/MIT)


