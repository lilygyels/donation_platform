DonationToken Smart Contract

Overview
The DonationToken smart contract is an Ethereum-based ERC-20 token that enables users to create donation plans and make donations to specified beneficiaries. It aims to facilitate charitable giving with transparency and tracking features.

Token Information
Contract Name: DonationToken
Token Symbol: CHARITY
Decimals: 0
Initial Supply: 10,000,000 CHARI
Description: HELPING THE POOR IN NEED

Features
Token Management
DonationToken is an ERC-20 token with functionalities for managing token balances.

Donation Plans
Users can create donation plans with specific goals, durations, beneficiaries, and descriptions.

Donations
Tokens can be donated to any active donation plan.

Donor Tracking
The contract keeps a record of donors and the total amount donated to each plan.

Contract Ownership
The contract is owned by the deployer's address, which retains control over critical functions.

Functions
createDonationPlan
Description: Creates a new donation plan.

Parameters:
_goal: The fundraising goal in tokens.
_duration: The duration of the plan (e.g., in days).
_beneficiary: Address of the beneficiary.
_donationDescription: Description of the donation plan.

Access: Open to all users.

donate
Description: Allows users to donate tokens to a specific donation plan.

Parameters:
_planIndex: Index of the donation plan.
_amount: Number of tokens to donate.

Access: Open to all users.

getDonors
Description: Retrieves the list of donors for a specific donation plan.

Parameters:
_planIndex: Index of the donation plan.

Access: Public view function.

getNumDonationPlans
Description: Retrieves the total number of donation plans created.

Access: Public view function.

getDonationPlan
Description: Retrieves details of a specific donation plan.

Parameters:
index: Index of the donation plan.

Access: Public view function.

Usage
Creating a Donation Plan: Call createDonationPlan with the necessary parameters to create a new donation plan.
Donating to a Plan: Use donate with the specific plan index and donation amount to contribute to a plan.
Checking Donors: Call getDonors with the plan index to see the list of donors for that plan.
Retrieving Donation Plans: Use getNumDonationPlans to get the total number of plans or getDonationPlan with the plan index to get details on a specific plan.

Project Contributors
Tandin Pema Gyalmo

License
This project is licensed under the MIT License. See the SPDX-License-Identifier at the beginning of the contract.

Conclusion
The DonationToken smart contract promotes charitable giving by allowing users to create and contribute to donation plans. With transparency and donor tracking features, it offers an enhanced user experience for donors and beneficiaries.