// SPDX-License-Identifier: MIT
// Author: Chris Labasky https://chrislabasky.com

pragma solidity ^0.8.24;

import "./ERC247.sol";

contract Example_ERC247 is ERC247 {

    constructor( ) ERC247("Example_ERC247"){
        baseURI = "https://www.erc-247.com/";
    }

}
