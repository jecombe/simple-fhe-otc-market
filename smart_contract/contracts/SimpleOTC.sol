pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "./MyConfidentialERC20.sol";
import { SepoliaZamaFHEVMConfig } from "fhevm/config/ZamaFHEVMConfig.sol";

contract SimpleOTC is SepoliaZamaFHEVMConfig {
  struct RFQ {
    euint32 id;
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

  // Events
  event RFQCreated(
    address maker,
    address indexed tokenBuy,
    address indexed tokenSell
  );
  event RFQFilled(
    address taker,
    address maker,
    address indexed tokenBuy,
    address indexed tokenSell
  );
  event ErrorChanged(address indexed user);

  // State variables
  euint32 public rfqCounter;

  //mapping
  mapping(euint32 => RFQ) private rfqs;
  mapping(address => LastError) private _lastErrors;

  constructor() {
    NO_ERROR = TFHE.asEuint8(0); // Code 0: No error
    NOT_ENOUGH_FUNDS = TFHE.asEuint8(1); // Code 1: Insufficient funds
  }

  /**
   * @dev Sets the last error for a specific address.
   * @param error Encrypted error code.
   * @param addr Address of the user.
   */
  function setLastError(euint8 error, address addr) private {
    _lastErrors[addr] = LastError(error, block.timestamp);
    emit ErrorChanged(addr);
  }

  /**
   * @dev Creates a new RFQ (Request For Quote) for token swap.
   * @param _tokenBuy Address of the token to be bought.
   * @param _tokenSell Address of the token to be sold.
   * @param _tokenBuyQty Encrypted quantity of the token to buy.
   * @param _tokenSellQty Encrypted quantity of the token to sell.
   * @param inputProof Proof used for encryption validation.
   */
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

    // Transfer sell token to contract
    TFHE.allowTransient(tokenSellQty, _tokenSell);
    bool success = tokenSell.transferFrom(
      msg.sender,
      address(this),
      tokenSellQty
    );
    require(success, "Deposit of token sell failed");

    // Create RFQ
    rfqCounter = TFHE.randEuint32(); // Random 32-bit number
    rfqs[rfqCounter] = RFQ(
      rfqCounter,
      msg.sender,
      _tokenBuy,
      _tokenSell,
      tokenBuyQty,
      tokenSellQty
    );

    TFHE.allow(tokenSellQty, address(this));
    TFHE.allow(tokenBuyQty, address(this));

    emit RFQCreated(msg.sender, _tokenBuy, _tokenSell);
  }

  /**
   * @dev Removes an existing RFQ created by the sender.
   * @param _id Encrypted ID of the RFQ to remove.
   * @param inputProof Proof used for encryption validation.
   */
  function removeRFQ(einput _id, bytes calldata inputProof) external {
    euint32 eid = TFHE.asEuint32(_id, inputProof);
    RFQ memory rfq = rfqs[eid];
    require(msg.sender == rfq.maker, "Not maker of RFQ");

    // Return sell token to the maker
    TFHE.allowTransient(rfq.tokenSellQty, rfq.tokenSell);
    bool success = MyConfidentialERC20(rfq.tokenSell).transfer(
      msg.sender,
      rfq.tokenSellQty
    );
    require(success);

    delete rfqs[eid];
  }

  /**
   * @dev Allows a taker to fulfill an RFQ by swapping tokens.
   * @param _id Encrypted ID of the RFQ to be taken.
   * @param inputProof Proof used for encryption validation.
   */
  function takeRFQ(einput _id, bytes calldata inputProof) external {
    euint32 eid = TFHE.asEuint32(_id, inputProof);
    RFQ memory rfq = getRFQ(eid);
    MyConfidentialERC20 tokenBuy = MyConfidentialERC20(rfq.tokenBuy);

    euint64 balanceTokenBuy = tokenBuy.balanceOf(msg.sender);
    ebool canTransfer = TFHE.le(rfq.tokenBuyQty, balanceTokenBuy);

    setLastError(
      TFHE.select(canTransfer, NO_ERROR, NOT_ENOUGH_FUNDS),
      msg.sender
    );

    euint64 validatedPrice = TFHE.select(
      canTransfer,
      rfq.tokenBuyQty,
      TFHE.asEuint64(0)
    );

    // Transfer tokenBuy from taker to maker
    TFHE.allowTransient(rfq.tokenBuyQty, rfq.tokenBuy);
    bool success = tokenBuy.transferFrom(msg.sender, rfq.maker, validatedPrice);
    require(success, "Transfer of token buy failed");

    // Transfer tokenSell from contract to taker
    TFHE.allowTransient(rfq.tokenSellQty, rfq.tokenSell);
    success = MyConfidentialERC20(rfq.tokenSell).transfer(
      msg.sender,
      rfq.tokenSellQty
    );
    require(success, "Transfer of token sell failed");

    delete rfqs[eid];

    emit RFQFilled(msg.sender, rfq.maker, rfq.tokenBuy, rfq.tokenSell);
  }

  /**
   * @dev Retrieves an RFQ by its encrypted ID.
   * @param _id Encrypted ID of the RFQ.
   * @return RFQ structure containing details of the request.
   */
  function getRFQ(euint32 _id) public view returns (RFQ memory) {
    RFQ memory rfq = rfqs[_id];
    require(rfq.maker != address(0), "RFQ not found");
    return rfq;
  }
}
