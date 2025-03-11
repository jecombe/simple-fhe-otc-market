pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "./MyConfidentialERC20.sol";
import { SepoliaZamaFHEVMConfig } from "fhevm/config/ZamaFHEVMConfig.sol";
import { IConfidentialERC20 } from "fhevm-contracts/contracts/token/ERC20/IConfidentialERC20.sol";

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
  uint public id = 0;
  //mapping
  mapping(address => LastError) private _lastErrors;
  mapping(address => euint32[]) private userIDS;
  mapping(address => uint32[]) private userIDSS;

  RFQ[] public otcMarkets; // Liste des OTC stockés

  constructor() {
    NO_ERROR = TFHE.asEuint8(0); // Code 0: No error
    NOT_ENOUGH_FUNDS = TFHE.asEuint8(1); // Code 1: Insufficient funds
    TFHE.allowThis(NO_ERROR);
    TFHE.allowThis(NOT_ENOUGH_FUNDS);
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
    euint64 tokenBuyQty = TFHE.asEuint64(_tokenBuyQty, inputProof);
    euint64 tokenSellQty = TFHE.asEuint64(_tokenSellQty, inputProof);

    TFHE.allowTransient(tokenSellQty, _tokenSell);

    TFHE.allowThis(tokenBuyQty);
    TFHE.allowThis(tokenSellQty);

    euint32 eID = TFHE.randEuint32();

    otcMarkets.push(
      RFQ({
        id: eID,
        maker: msg.sender,
        tokenBuy: _tokenBuy,
        tokenSell: _tokenSell,
        tokenBuyQty: tokenBuyQty,
        tokenSellQty: tokenSellQty
      })
    );

    userIDS[msg.sender].push(eID);

    TFHE.allow(userIDS[msg.sender][userIDS[msg.sender].length - 1], msg.sender);
    TFHE.allowThis(userIDS[msg.sender][userIDS[msg.sender].length - 1]);

    IConfidentialERC20(_tokenSell).transferFrom(
      msg.sender,
      address(this),
      tokenSellQty
    );

    emit RFQCreated(msg.sender, _tokenBuy, _tokenSell);
  }

  function getRFQTY(euint32 _eid) public returns (euint64) {
    euint64 returnPrice = TFHE.asEuint64(0);

    for (uint i = 0; i < otcMarkets.length; i++) {
      euint32 idRFQ = otcMarkets[i].id;
      ebool isEqual = TFHE.eq(idRFQ, _eid);
      returnPrice = TFHE.select(
        isEqual,
        otcMarkets[i].tokenBuyQty,
        returnPrice
      );
    }

    return returnPrice;
  }

  function getRFQ(euint32 _eid) public returns (RFQ memory) {
    // Initialisation avec des valeurs par défaut pour chaque champ
    euint32 returnID = TFHE.asEuint32(0);
    address returnMaker = address(0);
    address returnTokenBuy = address(0);
    address returnTokenSell = address(0);
    euint64 returnTokenBuyQty = TFHE.asEuint64(0);
    euint64 returnTokenSellQty = TFHE.asEuint64(0);

    // Boucle pour parcourir otcMarkets
    for (uint i = 0; i < otcMarkets.length; i++) {
      euint32 idRFQ = otcMarkets[i].id;
      ebool isEqual = TFHE.eq(idRFQ, _eid);

      // Sélectionner chaque champ de l'objet RFQ
      returnID = TFHE.select(isEqual, otcMarkets[i].id, returnID);

      returnMaker = otcMarkets[i].maker;
      returnTokenBuy = otcMarkets[i].tokenBuy;
      returnTokenSell = otcMarkets[i].tokenSell;
      returnTokenBuyQty = TFHE.select(
        isEqual,
        otcMarkets[i].tokenBuyQty,
        returnTokenBuyQty
      );
      returnTokenSellQty = TFHE.select(
        isEqual,
        otcMarkets[i].tokenSellQty,
        returnTokenSellQty
      );
    }

    // Reconstruire l'objet RFQ avec les champs sélectionnés
    RFQ memory returnRFQ = RFQ({
      id: returnID,
      maker: returnMaker,
      tokenBuy: returnTokenBuy,
      tokenSell: returnTokenSell,
      tokenBuyQty: returnTokenBuyQty,
      tokenSellQty: returnTokenSellQty
    });

    return returnRFQ;
  }

  function getQuantityOTC(
    einput _eid,
    bytes calldata inputProof
  ) public returns (euint64) {
    euint32 eid = TFHE.asEuint32(_eid, inputProof);

    euint64 eQTY = getRFQTY(eid);
    return eQTY;
  }

  function getID() public view returns (euint32[] memory) {
    return userIDS[msg.sender];
  }

  function getIDS() public view returns (uint32[] memory) {
    return userIDSS[msg.sender];
  }

  function takeRFQ(einput _eid, bytes calldata inputProof) external {
    euint32 eid = TFHE.asEuint32(_eid, inputProof);
    RFQ memory otc = getRFQ(eid);

    euint64 balanceTokenBuy = IConfidentialERC20(otc.tokenBuy).balanceOf(
      msg.sender
    );

    ebool canTransferOne = TFHE.ne(balanceTokenBuy, TFHE.asEuint64(0));

    setLastError(
      TFHE.select(canTransferOne, NO_ERROR, NOT_ENOUGH_FUNDS),
      msg.sender
    );

    ebool canTransfer = TFHE.ge(balanceTokenBuy, otc.tokenBuyQty);

    setLastError(
      TFHE.select(canTransfer, NO_ERROR, NOT_ENOUGH_FUNDS),
      msg.sender
    );

    TFHE.allowThis(canTransfer);

    euint64 validatedPrice = TFHE.select(
      canTransfer,
      otc.tokenBuyQty,
      TFHE.asEuint64(0)
    );

    TFHE.allow(validatedPrice, msg.sender);

    // Transfer tokenBuy from taker to maker
    // TFHE.allowTransient(otc.tokenBuyQty, otc.tokenBuy);

    bool success = IConfidentialERC20(otc.tokenBuy).transferFrom(
      msg.sender,
      otc.maker,
      validatedPrice
    );

    require(success, "Transfer of token buy failed");

    //TFHE.allowTransient(otc.tokenSellQty, otc.tokenSell);

    success = IConfidentialERC20(otc.tokenSell).transfer(
      msg.sender,
      otc.tokenSellQty
    );

    require(success, "Transfer of token sell failed");
  }
}
