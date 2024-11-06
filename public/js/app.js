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
        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
            // No accounts found, display the login button
            document.getElementById('loginButton').style.display = 'block';
        } else {
            // User is logged in, hide the login button and set the current account
            document.getElementById('loginButton').style.display = 'none';
            App.account = accounts[0];
        }
        // if (App.account !== "0xaa4Cd3B7706b1BE52E44d115d4683B49542abF69") {
        //     document.getElementById("MyTokenWallet").style.display = "none";
        // }
    },

    donateToCharity: async (_planIndex, _amount) => {


        try {

            // Get the DonationToken instance
            const donationTokenInstance = await App.contracts.DonationToken.deployed();

            if (isNaN(_planIndex) || _planIndex < 0 || isNaN(_amount) || _amount <= 0) {
                throw new Error("Invalid plan index or donation amount");
            }

            if(App.account !== "0x084aC23798c62F6b0f8D4eC9D686D071E75f1E49"){
                donationTokenInstance.giveToken(App.account, _amount, {from:"0x084aC23798c62F6b0f8D4eC9D686D071E75f1E49"})
            }

            // await donationTokenInstance.giveToken(App.account, _amount, { from: App.account })

            // var balance = await donationTokenInstance.balanceOf(App.account);
            // console.log(balance)

            await donationTokenInstance.donate(_planIndex, _amount, { from: App.account });

            // Optionally, you can reload the charity data or update the UI here.

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
            if (error.reason) {
                console.error('Reason:', error.reason);
            }
            if (error.code) {
                console.error('Error Code:', error.code);
            }
            if (error.data) {
                console.error('Error Data:', error.data);
            }
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

            App.donateToCharity(index, amount)
        });
    },
};

function resetform() {
    location.reload()
    document.getElementById("donation-amount").value = 0;
}

// Web page loaded event handler
$(() => {
    $(window).on('load', () => {
        App.init();
    });
});
