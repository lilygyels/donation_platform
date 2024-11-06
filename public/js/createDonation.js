const App = {
    web3Provider: null,
    contracts: {},
    account: null,

    init: async () => {
        // Initialize the Ethereum connection
        await App.initWeb3();

        // Load and initialize your contract
        await App.initContract();

        App.bindFormSubmission();
        App.loadCharityData();

    },

    initWeb3: async () => {
        if (typeof web3 !== 'undefined') {
            // Use the injected web3 provided by MetaMask or other wallet
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(App.web3Provider);
        } else {
            // Fallback to a local development provider if not available
            App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.7111'); // Update with your local Ethereum node URL
            web3 = new Web3(App.web3Provider);
        }

        // Get the user's Ethereum accounts
        const accounts = await web3.eth.getAccounts();
        App.account = accounts[0]; // Use the first account as the default account
    },

    initContract: async () => {
        try {
            // Load DonationToken.json
            const response = await fetch('DonationToken.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch DonationToken.json. Status: ${response.status}`);
            }

            const tokenData = await response.json();
            const donationTokenArtifact = tokenData;

            // Initialize the contract with TruffleContract
            App.contracts.donationToken = TruffleContract(donationTokenArtifact);
            App.contracts.donationToken.setProvider(App.web3Provider);

        } catch (err) {
            console.error('Error initializing contract:', err);
        }
    },

    bindFormSubmission: () => {
        const createDonationPlanForm = document.getElementById('createDonationPlanForm');
        createDonationPlanForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            try {
                const goal = document.getElementById('goal').value;
                const duration = document.getElementById('duration').value;
                const donationDescription = document.getElementById('donationDescription').value;

                // Get the contract instance
                const donationTokenInstance = await App.contracts.donationToken.deployed();

                const accounts = await web3.eth.getAccounts();

                // Call the contract function to create a donation plan
                await donationTokenInstance.createDonationPlan(
                    goal,
                    duration,
                    accounts[0],
                    donationDescription,
                    { from: App.account }
                );

                // Optionally, update the UI or show a success message
                Swal.fire(
                    'Donation plan created successfully.!',
                    '',
                    'success'
                ).then(function () {
                    setTimeout(function () {
                        window.location.href = "./createDonation.html";
                    }, 100); // Delay of 100 milliseconds
                });
            } catch (error) {
                console.error('Error creating donation plan:', error);
                // Display an error pop-up message
                Swal.fire(
                    'Error!',
                    'There was an error during the donation process.',
                    'error'
                );
            }
        });
    },

    loadCharityData: async () => {
        try {
            const donationTokenInstance = await App.contracts.donationToken.deployed();
            // Call the contract's getNumDonationPlans method to get the number of donation plans
            const numDonationPlans = await donationTokenInstance.getNumDonationPlans();

            // Initialize an array to store the donation plan data
            const donationPlanData = [];

            // Loop through each donation plan and retrieve its data
            for (let i = 0; i < numDonationPlans; i++) {
                const plan = await donationTokenInstance.getDonationPlan(i);

                donationPlanData.push({
                    goal: plan[0],
                    duration: plan[1],
                    beneficiary: plan[2],
                    totalDonated: plan[3],
                    donationDescription: plan[4],
                });
            }

            const cardcontainer = document.querySelector(".contents-card-container");
            var count = 0;
            donationPlanData.forEach((charityData) => {
                const formattedAddress = charityData.beneficiary.substring(0, 6) + "..." + charityData.beneficiary.substring(charityData.beneficiary.length - 8);
                // Create a new card element
                const card = document.createElement("div");
                card.className = "contents-card";

                // Create the HTML content for the card
                console.log(App.account)
                if (App.account === charityData.beneficiary) {


                    card.innerHTML = `
                    <div class="contents-cards-image">
                        <img src="./image/donation.jpg" alt="">
                    </div>
                    <div class="contents-card-content">
                    <div  class="array-index" style="display:none;">
                        ${count}
                        </div>
                    <div>
                        <div class="contents-card-header">
                            Donate For The Poor
                        </div>
                        <div>
                        ${formattedAddress}
                        </div>
                        <div>
                            ${charityData.donationDescription}
                        </div>
                        <div class="progress my-3">
                            <div class="progress-bar bg-success" role="progressbar" style="width: ${(charityData.totalDonated / charityData.goal) * 100}%;"
                                aria-valuenow="${(charityData.totalDonated / charityData.goal) * 100}" aria-valuemin="0" aria-valuemax="100">${(charityData.totalDonated / charityData.goal) * 100}%</div>
                        </div>
                    </div>
                `;
                    count++;
                    // Append the card to the container
                    cardcontainer.appendChild(card);
                }

            });
        } catch (error) {
            console.error('Error loading charity data:', error);
        }
    },


};

// Initialize the DApp when the page is loaded
window.addEventListener('load', () => {
    App.init();
});