// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

contract DonationToken is ERC20, Ownable {
    string public name = "CHARITOKEN";
    string public description = "HELPIN THE POOR IN NEED";
    string public symbol = "CHARITY";
    uint8 public decimals = 0;
    uint256 public INITIAL_SUPPLY = 10000000;

    address public owneracc;

    constructor() public {
        _mint(msg.sender, INITIAL_SUPPLY);
        owneracc = msg.sender;
    }

    struct DonationPlan {
        uint256 goal;
        uint256 duration;
        address beneficiary;
        uint256 totalDonated;
        string donationDescription;
        address[] donors;
    }

    DonationPlan[] public donationPlans;

    event Donated(
        address indexed donor,
        address indexed charity,
        uint256 amount
    );

    function createDonationPlan(
        uint256 _goal,
        uint256 _duration,
        address _beneficiary,
        string calldata _donationDescription
    ) external {
        require(_duration > 0, "Duration must be greater than 0");

        donationPlans.push(
            DonationPlan({
                goal: _goal,
                duration: _duration,
                beneficiary: _beneficiary,
                totalDonated: 0,
                donationDescription: _donationDescription,
                donors: new address[](0)
            })
        );
    }

    function giveToken(address receiver, uint256 _amount) public{
        transfer(receiver, _amount);
    }

    function donate(uint256 _planIndex, uint256 _amount) external {
        require(_planIndex < donationPlans.length, "Invalid plan index");
        require(_amount > 0, "Donation amount must be greater than 0");

        DonationPlan storage plan = donationPlans[_planIndex];

        require(plan.beneficiary != address(0), "Invalid charity address");

        transfer(plan.beneficiary, _amount);

        emit Donated(msg.sender, plan.beneficiary, _amount);

        plan.donors.push(msg.sender);

        plan.totalDonated += _amount;
    }

    function getDonors(
        uint256 _planIndex
    ) external view returns (address[] memory) {
        require(_planIndex < donationPlans.length, "Invalid plan index");
        DonationPlan storage plan = donationPlans[_planIndex];
        return plan.donors;
    }

    function getNumDonationPlans() external view returns (uint256) {
        return donationPlans.length;
    }

    function getDonationPlan(
        uint256 index
    )
        external
        view
        returns (
            uint256 goal,
            uint256 duration,
            address beneficiary,
            uint256 totalDonated,
            string memory donationDescription
        )
    {
        require(index < donationPlans.length, "Invalid plan index");
        DonationPlan storage plan = donationPlans[index];
        return (
            plan.goal,
            plan.duration,
            plan.beneficiary,
            plan.totalDonated,
            plan.donationDescription
        );
    }


    function balanceOf(address account) public view returns (uint256) {
        return super.balanceOf(account);
    }
}
