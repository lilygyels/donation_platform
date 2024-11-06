const DonationToken = artifacts.require("DonationToken");

contract("DonationToken", (accounts) => {
    let donationToken;

    before(async () => {
        donationToken = await DonationToken.deployed();
    });

    it("should have the correct name, description, and symbol", async () => {
        const name = await donationToken.name();
        const description = await donationToken.description();
        const symbol = await donationToken.symbol();

        assert.equal(name, "HOPETOKEN", "Name should match");
        assert.equal(description, "HELPIN THE POOR PEOPLE IN NEED", "Description should match");
        assert.equal(symbol, "HOPE", "Symbol should match");
    });

    it("should allow the owner to create a donation plan", async () => {
        const goal = 100;
        const duration = 30;
        const beneficiary = accounts[1];
        const donationDescription = "Test Donation Plan";

        await donationToken.createDonationPlan(goal, duration, beneficiary, donationDescription, { from: accounts[0] });

        const plan = await donationToken.donationPlans(0);

        assert.equal(plan.goal, goal, "Goal should match");
        assert.equal(plan.duration, duration, "Duration should match");
        assert.equal(plan.beneficiary, beneficiary, "Beneficiary should match");
        assert.equal(plan.donationDescription, donationDescription, "Description should match");
    });

    it("should allow donors to contribute tokens to a charity", async () => {
        const goal = 100;
        const duration = 30;
        const beneficiary = accounts[1];
        const donationDescription = "Test Donation Plan";
        const donationAmount = 50;

        // Create a donation plan
        await donationToken.createDonationPlan(goal, duration, beneficiary, donationDescription, { from: accounts[0] });

        // Transfer some tokens to the donor's account
        const transferAmount = 100; // Adjust this to the desired amount
        await donationToken.transfer(accounts[2], transferAmount, { from: accounts[0] });

        // Check the donor's balance before making a donation
        const donorBalanceBefore = await donationToken.balanceOf(accounts[2]);

        assert.equal(donorBalanceBefore, transferAmount, "Donor's balance should match");

        // Make a donation
        await donationToken.donate(0, donationAmount, { from: accounts[2] });

        // Check the donor's balance after making the donation
        const donorBalanceAfter = await donationToken.balanceOf(accounts[2]);

        assert.equal(donorBalanceAfter, transferAmount - donationAmount, "Donor's balance after donation should match");
    });

    it("should not allow donation if the plan index is invalid", async () => {
        const invalidIndex = 999;
        const donationAmount = 50;

        try {
            await donationToken.donate(invalidIndex, donationAmount, { from: accounts[2] });
            assert.fail("Donation with invalid plan index should fail");
        } catch (error) {
            assert.include(error.message, "Invalid plan index", "Error message should indicate invalid plan index");
        }
    });

    it("should not allow donation if the donation amount is zero", async () => {
        const goal = 100;
        const duration = 30;
        const beneficiary = accounts[1];
        const donationDescription = "Test Donation Plan";
        const donationAmount = 0;

        await donationToken.createDonationPlan(goal, duration, beneficiary, donationDescription, { from: accounts[0] });

        try {
            await donationToken.donate(0, donationAmount, { from: accounts[2] });
            assert.fail("Donation with zero amount should fail");
        } catch (error) {
            assert.include(error.message, "Donation amount must be greater than 0", "Error message should indicate zero amount");
        }
    });


    it("should return the list of donors for a donation plan", async () => {
        const goal = 100;
        const duration = 30;
        const beneficiary = accounts[1];
        const donationDescription = "Test Donation Plan";
        const donationAmount = 50;

        // Create a donation plan
        await donationToken.createDonationPlan(goal, duration, beneficiary, donationDescription, { from: accounts[0] });

        // Transfer some tokens to the donor's account
        const transferAmount = 100;
        await donationToken.transfer(accounts[2], transferAmount, { from: accounts[0] });

        // Make a donation
        await donationToken.donate(0, donationAmount, { from: accounts[2] });

        // Get the list of donors for the donation plan
        const donors = await donationToken.getDonors(0);

        // Ensure that there is only one donor
        assert.equal(donors.length, 2, "There should be one donor");

        // Ensure that the donor's address matches the expected address
        assert.equal(donors[0], accounts[2], "Donor's address should match");
    });



});
