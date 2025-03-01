pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "./MyConfidentialERC20.sol";
contract SimpleOTC {
    struct RFQ {
        uint id;
        address maker;
        address tokenBuy;
        address tokenSell;
        euint64 tokenBuyQty;
        euint64 tokenSellQty;
    }

    struct LastError {
        euint8 error; // Encrypted error code
        uint timestamp; // Timestamp of the error
    }

    // Define error codes
    euint8 internal NO_ERROR;
    euint8 internal NOT_ENOUGH_FUNDS;

    //events
    event RFQCreated(uint id, address maker, address indexed tokenBuy, address indexed tokenSell);
    event RFQFilled(uint id, address taker, address maker, address indexed tokenBuy, address indexed tokenSell);
    event ErrorChanged(address indexed user);

    // state variables
    uint public rfqCounter;

    mapping(uint => RFQ) private rfqs;
    mapping(address => LastError) private _lastErrors;

    constructor() {
        NO_ERROR = TFHE.asEuint8(0); // Code 0: No error
        NOT_ENOUGH_FUNDS = TFHE.asEuint8(1); // Code 1: Insufficient funds
    }

    /**
     * @dev Set the last error for a specific address.
     * @param error Encrypted error code.
     * @param addr Address of the user.
     */
    function setLastError(euint8 error, address addr) private {
        _lastErrors[addr] = LastError(error, block.timestamp);
        emit ErrorChanged(addr);
    }

    function createRFQ(
        address _tokenBuy,
        address _tokenSell,
        einput _tokenBuyQty,
        einput _tokenSellQty,
        bytes calldata inputProof
    ) external {
        MyConfidentialERC20 tokenSell = MyConfidentialERC20(_tokenSell);
        euint64 tokenBuyQty = TFHE.asEuint64(_tokenBuyQty, inputProof);
        euint64 tokenSellQty = TFHE.asEuint64(_tokenSellQty, inputProof);

        // transfer sell token to contract
        TFHE.allowTransient(tokenSellQty, _tokenSell);
        bool success = tokenSell.transferFrom(msg.sender, address(this), tokenSellQty);
        require(success, "Deposit of token sell failed");

        // create RFQ
        rfqs[rfqCounter] = RFQ(rfqCounter, msg.sender, _tokenBuy, _tokenSell, tokenBuyQty, tokenSellQty);
        TFHE.allow(tokenSellQty, address(this));
        TFHE.allow(tokenBuyQty, address(this));

        emit RFQCreated(rfqCounter, msg.sender, _tokenBuy, _tokenSell);

        rfqCounter++;
    }

    function removeRFQ(uint _id) external {
        RFQ memory rfq = rfqs[_id];
        require(msg.sender == rfq.maker, "Not maker of RFQ");

        // give token sell back to maker
        TFHE.allowTransient(rfq.tokenSellQty, rfq.tokenSell);
        bool success = MyConfidentialERC20(rfq.tokenSell).transfer(msg.sender, rfq.tokenSellQty);
        require(success);

        delete rfqs[_id];
    }

    function takeRFQ(uint _id) external {
        RFQ memory rfq = getRFQ(_id);
        MyConfidentialERC20 tokenBuy = MyConfidentialERC20(rfq.tokenBuy);

        // Check if the sender has enough balance to transfer
        euint64 bal = tokenBuy.balanceOf(msg.sender);

        ebool canTransfer = TFHE.le(rfq.tokenBuyQty, bal);
        // Log the error state: NO_ERROR or NOT_ENOUGH_FUNDS
        setLastError(TFHE.select(canTransfer, NO_ERROR, NOT_ENOUGH_FUNDS), msg.sender);

        euint64 validatedPrice = TFHE.select(canTransfer, rfq.tokenBuyQty, TFHE.asEuint64(0));

        TFHE.allowTransient(rfq.tokenBuyQty, rfq.tokenBuy);

        bool success = tokenBuy.transferFrom(msg.sender, rfq.maker, validatedPrice);
        require(success, "Transfer of token buy failed");

        // transfer sell token to taker
        TFHE.allowTransient(rfq.tokenSellQty, rfq.tokenSell);
        success = MyConfidentialERC20(rfq.tokenSell).transfer(msg.sender, rfq.tokenSellQty);
        require(success, "Transfer of token sell failed");

        delete rfqs[_id];

        emit RFQFilled(_id, msg.sender, rfq.maker, rfq.tokenBuy, rfq.tokenSell);
    }

    function getRFQ(uint _id) public view returns (RFQ memory) {
        RFQ memory rfq = rfqs[_id];
        require(rfq.maker != address(0), "RFQ not found");
        return rfq;
    }
}
