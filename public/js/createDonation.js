const createDonation = {
    web3Provider: null,
    contracts: {},
    account: null,

    init: async () => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {  // Check if user disconnected
                    createDonation.handleLoginState(false);
                } else if (accounts[0] !== createDonation.account) { // Check if account changed
                    createDonation.account = accounts[0];
                    createDonation.handleLoginState(true);
                    window.location.reload(); // Reload the page
                }
            });

            window.ethereum.on('chainChanged', (_chainId) => {
                window.location.reload();
            });
        }

        await createDonation.initContract();
        await createDonation.loadCharityData();
        createDonation.bindEvents();
        await createDonation.checkLogin();
    },

    initContract: async () => {
        try {
            const response = await fetch('DonationToken.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch Token.json. Status: ${response.status}`);
            }

            const data = await response.json();
            const MyTokenArtifact = data;
            createDonation.contracts.DonationToken = TruffleContract(MyTokenArtifact);
            createDonation.contracts.DonationToken.setProvider(createDonation.web3Provider);
        } catch (err) {
            console.error('Error initializing contract:', err);
        }
    },

    loadCharityData: async () => {
        try {
            const donationTokenInstance = await createDonation.contracts.DonationToken.deployed();
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
                        <button type="button" class="btn btn-info text-light" data-bs-toggle="modal"
                            data-bs-target="#exampleModal" data-bs-whatever="@mdo" id="donate-btn">Donate</button>
                    </div>
                `;
                count++;
                // Append the card to the container
                cardcontainer.appendChild(card);
            });
        } catch (error) {
            console.error('Error loading charity data:', error);
        }
    },

    checkLogin: async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    createDonation.account = accounts[0];
                    createDonation.handleLoginState(true);
                } else {
                    createDonation.handleLoginState(false);
                }
            } catch (error) {
                console.error("Error checking initial login state:", error);
                createDonation.handleLoginState(false);
            }
        } else {
            console.log("MetaMask not detected");
            createDonation.handleLoginState(false);
        }
    },

    handleLoginState: (isLoggedIn) => {
        const loginButton = document.getElementById('loginButton');
        const accountAddressSpan = document.getElementById('accountAddress');

        if (isLoggedIn) {
            loginButton.style.display = 'none';
            accountAddressSpan.style.display = 'inline';
            accountAddressSpan.textContent = createDonation.account;
        } else {
            loginButton.style.display = 'block'; // or 'inline-block'
            loginButton.textContent = 'Login';
            accountAddressSpan.style.display = 'none';
            loginButton.addEventListener('click', createDonation.handleLogin);  // Add listener if not logged in
        }
    },

    handleLogin: async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts.length > 0) {
                    createDonation.account = accounts[0];
                    createDonation.handleLoginState(true);
                }
            } catch (error) {
                console.error("Error requesting accounts:", error);
            }
        } else {
            console.log('Please install MetaMask to interact with this dApp.');
        }
    },

    donateToCharity: async (_planIndex, _amount) => {
        try {
            // Get the DonationToken instance
            const donationTokenInstance = await createDonation.contracts.DonationToken.deployed();

            if (isNaN(_planIndex) || _planIndex < 0 || isNaN(_amount) || _amount <= 0) {
                throw new Error("Invalid plan index or donation amount");
            }

            if (createDonation.account !== "0x084aC23798c62F6b0f8D4eC9D686D071E75f1E49") {
                await donationTokenInstance.giveToken(createDonation.account, _amount, { from: "0x084aC23798c62F6b0f8D4eC9D686D071E75f1E49" });
            }

            await donationTokenInstance.donate(_planIndex, _amount, { from: createDonation.account });

            // Display a success pop-up message
            Swal.fire(
                'Donation Successful!',
                '',
                'success'
            ).then(function () {
                setTimeout(function () {
                    window.location.href = "./index.html";
                }, 100); // Delay of 100 milliseconds
            });

            resetform();
            console.log('Donation successful');
        } catch (error) {
            console.error('Error donating to charity:', error.message);
            // Display an error pop-up message
            Swal.fire(
                'Error!',
                'There was an error during the donation process.',
                'error'
            );
        }
    },

    bindEvents: () => {
        // Bind events...

        var index;

        $(document).on('click', '#donate-btn', function () {
            index = parseInt($(this).closest(".contents-card").find(".array-index").text());
        });
        $(document).on('click', '#donate-to-charity-btn', function () {
            var amount = parseInt(document.getElementById("donation-amount").value);
            createDonation.donateToCharity(index, amount);
        });
    },
};

function resetform() {
    location.reload();
    document.getElementById("donation-amount").value = 0;
}

// Web page loaded event handler
$(() => {
    $(window).on('load', () => {
        createDonation.init();
    });
});
