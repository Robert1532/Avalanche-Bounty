// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

/// @title PropertyShares
/// @notice Demo-only economic participation token for one fictional property.
/// @dev This contract deliberately does not assert or create legal real-estate ownership.
contract PropertyShares is ERC20, Ownable, ReentrancyGuard {
    error ZeroAddress();
    error ZeroAmount();
    error SaleClosed();
    error InsufficientInventory(uint256 requested, uint256 available);
    error IncorrectPayment(uint256 expected, uint256 received);
    error NothingToClaim();

    uint256 private constant MAGNITUDE = 2 ** 128;

    /// @notice Human-readable off-chain reference, for example BOL-001.
    string public propertyReference;

    /// @notice The wallet initially receiving all fixed-supply tokens and sale proceeds.
    address public immutable issuer;

    /// @notice Price of one token in native AVAX units for the testnet demo.
    uint256 public immutable pricePerShare;

    /// @notice If false, purchases are disabled. ERC-20 transfers remain available.
    bool public saleOpen = true;

    /// @notice Cumulative rent credited per token, scaled by MAGNITUDE.
    uint256 public magnifiedRentPerShare;
    uint256 public totalRentDeposited;
    uint256 public totalRentClaimed;

    mapping(address account => int256 correction) private magnifiedRentCorrections;
    mapping(address account => uint256 amount) public withdrawnRent;

    event SharesPurchased(address indexed buyer, uint256 shares, uint256 paid);
    event RentalDeposited(address indexed depositor, uint256 amount);
    event RentalClaimed(address indexed account, uint256 amount);
    event SaleStatusChanged(bool open);

    /// @param reference_ A public reference for the fictional property.
    /// @param name_ ERC-20 display name.
    /// @param symbol_ ERC-20 display symbol.
    /// @param totalShares_ Immutable total number of economic-participation units.
    /// @param pricePerShare_ Native AVAX price in wei used only for this demo.
    /// @param issuer_ Wallet that holds the initial issuance and receives sale proceeds.
    constructor(
        string memory reference_,
        string memory name_,
        string memory symbol_,
        uint256 totalShares_,
        uint256 pricePerShare_,
        address issuer_
    ) ERC20(name_, symbol_) Ownable(issuer_) {
        if (issuer_ == address(0)) revert ZeroAddress();
        if (totalShares_ == 0 || pricePerShare_ == 0) revert ZeroAmount();

        propertyReference = reference_;
        issuer = issuer_;
        pricePerShare = pricePerShare_;
        _mint(issuer_, totalShares_);
    }

    /// @notice Shares currently listed by the issuer through ERC-20 allowance.
    /// @dev The issuer lists inventory by approving this contract for its own tokens.
    function availableShares() public view returns (uint256) {
        uint256 issuerBalance = balanceOf(issuer);
        uint256 listedShares = allowance(issuer, address(this));
        return issuerBalance < listedShares ? issuerBalance : listedShares;
    }

    /// @notice Buy listed economic-participation tokens with native test AVAX.
    /// @dev The exact payment requirement prevents ambiguous pricing.
    function buyShares(uint256 shares) external payable nonReentrant {
        if (!saleOpen) revert SaleClosed();
        if (shares == 0) revert ZeroAmount();

        uint256 inventory = availableShares();
        if (shares > inventory) revert InsufficientInventory(shares, inventory);

        uint256 expectedPayment = shares * pricePerShare;
        if (msg.value != expectedPayment) {
            revert IncorrectPayment(expectedPayment, msg.value);
        }

        _spendAllowance(issuer, address(this), shares);
        _transfer(issuer, msg.sender, shares);
        Address.sendValue(payable(issuer), msg.value);

        emit SharesPurchased(msg.sender, shares, msg.value);
    }

    /// @notice Credits a rental-income payment for the current token holders.
    /// @dev In the MVP this action belongs to the simulated property manager, the issuer.
    function depositRental() external payable onlyOwner {
        if (msg.value == 0) revert ZeroAmount();

        magnifiedRentPerShare += (msg.value * MAGNITUDE) / totalSupply();
        totalRentDeposited += msg.value;

        emit RentalDeposited(msg.sender, msg.value);
    }

    /// @notice Claims all income accrued by the caller.
    function claimRental() external nonReentrant {
        uint256 amount = withdrawableRentalOf(msg.sender);
        if (amount == 0) revert NothingToClaim();

        withdrawnRent[msg.sender] += amount;
        totalRentClaimed += amount;
        Address.sendValue(payable(msg.sender), amount);

        emit RentalClaimed(msg.sender, amount);
    }

    /// @notice Amount of deposited rental income that an account may currently withdraw.
    /// @dev Transfer corrections ensure a buyer cannot claim rent credited before a transfer.
    function withdrawableRentalOf(address account) public view returns (uint256) {
        return accumulativeRentalOf(account) - withdrawnRent[account];
    }

    /// @notice Total rent ever attributed to an account under its token-holding history.
    function accumulativeRentalOf(address account) public view returns (uint256) {
        int256 magnifiedAmount = int256(magnifiedRentPerShare * balanceOf(account))
            + magnifiedRentCorrections[account];
        return uint256(magnifiedAmount) / MAGNITUDE;
    }

    /// @notice Stops or resumes primary purchases without changing the fixed token supply.
    function setSaleOpen(bool open) external onlyOwner {
        saleOpen = open;
        emit SaleStatusChanged(open);
    }

    /// @dev Keeps historic rent attribution correct whenever tokens move.
    function _update(address from, address to, uint256 value) internal override {
        super._update(from, to, value);

        int256 correction = int256(magnifiedRentPerShare * value);
        if (from == address(0)) {
            magnifiedRentCorrections[to] -= correction;
        } else if (to == address(0)) {
            magnifiedRentCorrections[from] += correction;
        } else {
            magnifiedRentCorrections[from] += correction;
            magnifiedRentCorrections[to] -= correction;
        }
    }
}
