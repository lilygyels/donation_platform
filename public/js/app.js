const App = {
    web3Provider: null,
    contracts: {},
    account: null,

    init: async () => {
        if (typeof window.ethereum !== 'undefined') {
            App.web3Provider = window.ethereum;
            web3 = new Web3(window.ethereum);
            await window.ethereum.enable(); // Request account access if not already granted
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7111');
            web3 = new Web3(App.web3Provider);
        }

        await App.initContract();
        await App.loadCharityData();
        App.bindEvents();
        await App.checkLogin(); // Check if the user is already logged in.
    },

    initContract: async () => {
        try {
            const response = await fetch('DonationToken.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch Token.json. Status: ${response.status}`);
            }

            const data = await response.json();
            const MyTokenArtifact = data;
            App.contracts.DonationToken = TruffleContract(MyTokenArtifact);
            App.contracts.DonationToken.setProvider(App.web3Provider);
        } catch (err) {
            console.error('Error initializing contract:', err);
        }
    },

    loadCharityData: async () => {
        try {
            const donationTokenInstance = await App.contracts.DonationToken.deployed();
            // Show loading spinner
            document.getElementById("loading-spinner").classList.remove("d-none");

            // Get the number of donation plans
            const numDonationPlans = await donationTokenInstance.getNumDonationPlans();
            const donationPlanData = [];

            // Retrieve each donation plan's data
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
            let count = 0;
            donationPlanData.forEach((charityData) => {
                const formattedAddress = charityData.beneficiary.substring(0, 6) + "..." + charityData.beneficiary.substring(charityData.beneficiary.length - 8);
                
                // Create a new card element
                const card = document.createElement("div");
                card.className = "contents-card col-md-4 mb-4";
                card.innerHTML = `
                    <div class="card shadow-sm">
                        <img src="./image/donation.jpg" class="card-img-top" alt="Charity Image">
                        <div class="card-body">
                            <h5 class="card-title">Donate For The Poor</h5>
                            <p class="card-text">${formattedAddress}</p>
                            <p class="card-text">${charityData.donationDescription}</p>
                            <div class="progress my-3">
                                <div class="progress-bar bg-success" role="progressbar" style="width: ${(charityData.totalDonated / charityData.goal) * 100}%;"
                                    aria-valuenow="${(charityData.totalDonated / charityData.goal) * 100}" aria-valuemin="0" aria-valuemax="100">${(charityData.totalDonated / charityData.goal) * 100}%</div>
                            </div>
                            <button type="button" class="btn btn-info text-light" data-bs-toggle="modal"
                                data-bs-target="#donationModal" data-bs-whatever="@mdo" id="donate-btn">Donate</button>
                            <span class="array-index d-none">${count}</span> <!-- Hidden index element -->
                        </div>
                    </div>
                `;
                count++;
                cardcontainer.appendChild(card);
            });
        } catch (error) {
            console.error('Error loading charity data:', error);
            Swal.fire('Error!', 'There was an issue loading charity data.', 'error');
        } finally {
            // Hide loading spinner once data is loaded
            document.getElementById("loading-spinner").classList.add("d-none");
        }
    },

    checkLogin: async () => {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
            document.getElementById('loginButton').style.display = 'block';
        } else {
            document.getElementById('loginButton').style.display = 'none';
            App.account = accounts[0];
        }
    },

    donateToCharity: async (_planIndex, _amount) => {
        try {
            const donationTokenInstance = await App.contracts.DonationToken.deployed();

            if (isNaN(_planIndex) || _planIndex < 0 || isNaN(_amount) || _amount <= 0) {
                throw new Error("Invalid plan index or donation amount");
            }

            // Show loading spinner during transaction processing
            document.getElementById("loading-spinner").classList.remove("d-none");

            if (App.account !== "0x084aC23798c62F6b0f8D4eC9D686D071E75f1E49") {
                await donationTokenInstance.giveToken(App.account, _amount, {from: "0x084aC23798c62F6b0f8D4eC9D686D071E75f1E49"});
            }

            await donationTokenInstance.donate(_planIndex, _amount, { from: App.account });

            Swal.fire('Donation Successful!', '', 'success').then(() => {
                setTimeout(() => {
                    window.location.href = "./index.html";
                }, 100); // Delay of 100 milliseconds
            });

            App.resetForm();
        } catch (error) {
            console.error('Error donating to charity:', error.message);
            Swal.fire('Error!', 'There was an error during the donation process.', 'error');
        } finally {
            // Hide loading spinner after transaction completes or fails
            document.getElementById("loading-spinner").classList.add("d-none");
        }
    },

    resetForm: () => {
        document.getElementById("donation-amount").value = ""; // Reset the donation amount input field
    },

    bindEvents: () => {
        let index = -1;
        $(document).on('click', '#donate-btn', function () {
            index = parseInt($(this).closest(".contents-card").find(".array-index").text(), 10);
        });

        $(document).on('click', '#donate-to-charity-btn', function () {
            const amount = parseInt(document.getElementById("donation-amount").value, 10);
            if (!isNaN(index) && index >= 0 && !isNaN(amount) && amount > 0) {
                App.donateToCharity(index, amount);
            } else {
                Swal.fire('Invalid Input!', 'Please make sure to select a valid donation plan and enter a positive donation amount.', 'error');
            }
        });
    },
};

// Web page loaded event handler
$(() => {
    $(window).on('load', () => {
        App.init();
    });
});
