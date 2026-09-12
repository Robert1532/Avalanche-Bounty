import { expect } from "chai";
import { ethers } from "hardhat";

describe("PropertyShares", function () {
  const TOTAL_SHARES = 7_000n;
  const PRICE_PER_SHARE = ethers.parseEther("0.01");

  async function deployFixture() {
    const [issuer, investor, receiver, stranger] = await ethers.getSigners();
    const property = await ethers.deployContract("PropertyShares", [
      "BOL-001",
      "Fracciona Propiedad #001",
      "FRA-001",
      TOTAL_SHARES,
      PRICE_PER_SHARE,
      issuer.address
    ]);
    await property.waitForDeployment();
    await property.connect(issuer).approve(await property.getAddress(), TOTAL_SHARES);

    return { property, issuer, investor, receiver, stranger };
  }

  it("mints a fixed supply to the issuer and lists it only after explicit approval", async function () {
    const { property, issuer } = await deployFixture();

    expect(await property.totalSupply()).to.equal(TOTAL_SHARES);
    expect(await property.balanceOf(issuer.address)).to.equal(TOTAL_SHARES);
    expect(await property.availableShares()).to.equal(TOTAL_SHARES);
    expect(await property.pricePerShare()).to.equal(PRICE_PER_SHARE);
  });

  it("sells a share allocation only for the exact AVAX payment", async function () {
    const { property, issuer, investor } = await deployFixture();
    const shares = 100n;
    const payment = shares * PRICE_PER_SHARE;

    await expect(
      property.connect(investor).buyShares(shares, { value: payment })
    )
      .to.emit(property, "SharesPurchased")
      .withArgs(investor.address, shares, payment);

    expect(await property.balanceOf(investor.address)).to.equal(shares);
    expect(await property.balanceOf(issuer.address)).to.equal(TOTAL_SHARES - shares);
    expect(await property.availableShares()).to.equal(TOTAL_SHARES - shares);

    await expect(
      property.connect(investor).buyShares(1n, { value: 0n })
    ).to.be.revertedWithCustomError(property, "IncorrectPayment");
  });

  it("credits rental income according to the share balance at deposit time", async function () {
    const { property, issuer, investor } = await deployFixture();
    const shares = 100n;
    const rental = ethers.parseEther("1");

    await property.connect(investor).buyShares(shares, { value: shares * PRICE_PER_SHARE });
    await property.connect(issuer).depositRental({ value: rental });

    const expectedInvestorRent = (rental * shares) / TOTAL_SHARES;
    expect(await property.withdrawableRentalOf(investor.address)).to.be.closeTo(
      expectedInvestorRent,
      1n
    );

    await property.connect(investor).claimRental();
    expect(await property.withdrawnRent(investor.address)).to.equal(
      await property.accumulativeRentalOf(investor.address)
    );
  });

  it("does not give a transferee income that accrued before the transfer", async function () {
    const { property, issuer, investor, receiver } = await deployFixture();
    const shares = 100n;
    const firstRental = ethers.parseEther("1");
    const secondRental = ethers.parseEther("2");

    await property.connect(investor).buyShares(shares, { value: shares * PRICE_PER_SHARE });
    await property.connect(issuer).depositRental({ value: firstRental });

    const investorFirstRent = await property.withdrawableRentalOf(investor.address);
    await property.connect(investor).transfer(receiver.address, shares);
    await property.connect(issuer).depositRental({ value: secondRental });

    expect(await property.withdrawableRentalOf(investor.address)).to.equal(investorFirstRent);
    expect(await property.withdrawableRentalOf(receiver.address)).to.be.closeTo(
      (secondRental * shares) / TOTAL_SHARES,
      1n
    );
  });

  it("restricts simulated rental deposits to the issuer", async function () {
    const { property, stranger } = await deployFixture();

    await expect(
      property.connect(stranger).depositRental({ value: 1n })
    ).to.be.revertedWithCustomError(property, "OwnableUnauthorizedAccount");
  });
});
