var ipsc = require( 'ip-subnet-calculator' );

console.log( 'Is "127.0.0.1" an IP?', ipsc.isIp( '127.0.0.1' ) );

console.log( 'What is numeric representation of "127.0.0.1"?', ipsc.toDecimal( '127.0.0.1' ) );

console.log( 'Mask for 5.4.3.21-6.7.8.9', ipsc.calculate( '5.4.3.21', '6.7.8.9' ) );
