const discounts = {
    "debit-card": 15,
    "credit-card": 10,
    "upi": 15
};

let originalFare = 0;
let bookingData = null;

const paymentFormTile =
    document.querySelector(".payment-form-tile");

const paymentOptions =
    document.querySelectorAll(
        'input[name="payment-method"]'
    );

function loadBookingData() {

    fetch("booking?bookingId=1")
        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Failed to load booking data."
                );
            }

            return response.json();
        })

        .then(data => {

            console.log(
                "Booking data received:",
                data
            );

            bookingData = data;
            originalFare = data.totalFare;

            document.getElementById(
                "bookingFrom"
            ).textContent = data.from;

            document.getElementById(
                "bookingTo"
            ).textContent = data.to;

            document.getElementById(
                "bookingFlight"
            ).textContent = data.flightNumber;

            const departureDate =
                new Date(
                    data.departure.replace(" ", "T")
                );

            document.getElementById(
                "bookingDeparture"
            ).textContent =
                departureDate.toLocaleString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );

            document.getElementById(
                "bookingPassengers"
            ).textContent =
                data.passengerCount;

            document.getElementById(
                "bookingSeats"
            ).textContent =
                data.seats.join(", ");

            document.getElementById(
                "bookingAirline"
            ).textContent =
                data.airline;

            document.getElementById(
                "bookingFare"
            ).textContent =
                "₹" +
                originalFare.toLocaleString("en-IN");
        })

        .catch(error => {

            console.error(
                "Booking READ error:",
                error
            );

            document.getElementById(
                "bookingFrom"
            ).textContent = "Error";

            document.getElementById(
                "bookingTo"
            ).textContent = "Error";

            document.getElementById(
                "bookingFlight"
            ).textContent = "Error";

            document.getElementById(
                "bookingDeparture"
            ).textContent = "Error";

            document.getElementById(
                "bookingPassengers"
            ).textContent = "Error";

            document.getElementById(
                "bookingSeats"
            ).textContent = "Error";

            document.getElementById(
                "bookingAirline"
            ).textContent = "Error";

            document.getElementById(
                "bookingFare"
            ).textContent = "Error";

            alert(
                "Unable to load booking data:\n\n"
                + error.message
            );
        });
}


paymentOptions.forEach(function (option) {

    option.addEventListener(
        "change",
        function () {

            const selectedPaymentMethod =
                this.value;

            showPaymentForm(
                selectedPaymentMethod
            );
        }
    );
});


function showPaymentForm(paymentMethod) {

    const discountPercentage =
        discounts[paymentMethod];

    const discountAmount =
        (originalFare * discountPercentage) / 100;

    const payableAmount =
        originalFare - discountAmount;

    let paymentTitle = "";

    if (paymentMethod === "debit-card") {

        paymentTitle =
            "Debit Card Payment";

    } else if (paymentMethod === "credit-card") {

        paymentTitle =
            "Credit Card Payment";

    } else if (paymentMethod === "upi") {

        paymentTitle =
            "UPI Payment";
    }

    paymentFormTile.innerHTML = `

        <div class="payment-form">

            <h2>${paymentTitle}</h2>

            ${getPaymentFields(paymentMethod)}

            <div class="fare-summary">

                <div class="fare-line">

                    <span>Original Fare</span>

                    <strong>
                        ₹${originalFare.toLocaleString("en-IN")}
                    </strong>

                </div>

                <div class="fare-line discount">

                    <span>
                        Discount (${discountPercentage}%)
                    </span>

                    <strong>
                        -₹${discountAmount.toLocaleString("en-IN")}
                    </strong>

                </div>

                <div class="fare-line total">

                    <span>Amount Payable</span>

                    <strong>
                        ₹${payableAmount.toLocaleString("en-IN")}
                    </strong>

                </div>

            </div>

            <button
                type="button"
                class="payment-button"
                onclick="processPayment()">

                Pay ₹${payableAmount.toLocaleString("en-IN")}
                to SkyBook

            </button>

        </div>
    `;
}


function getPaymentFields(paymentMethod) {

    if (
        paymentMethod === "debit-card" ||
        paymentMethod === "credit-card"
    ) {

        return `

            <div class="form-group">

                <label for="cardNumber">
                    Card Number
                </label>

                <input
                    type="text"
                    id="cardNumber"
                    placeholder="Enter card number"
                    maxlength="25"
                    inputmode="numeric"
                    oninput="
                        this.value =
                        this.value
                        .replace(/\\D/g, '')
                        .substring(0, 16)
                        .replace(
                            /(\\d{4})(?=\\d)/g,
                            '$1 - '
                        );
                    ">

            </div>

            <div class="form-row">

                <div class="form-group">

                    <label for="expiry">
                        Expiry Date
                    </label>

                    <input
                        type="text"
                        id="expiry"
                        placeholder="MM / YY"
                        maxlength="7"
                        inputmode="numeric"
                        oninput="
                            this.value =
                            this.value
                            .replace(/\\D/g, '')
                            .substring(0, 4);

                            if (this.value.length > 2)
                                this.value =
                                this.value.substring(0, 2)
                                + ' / '
                                + this.value.substring(2);
                        ">

                </div>

                <div class="form-group">

                    <label for="cvv">
                        CVV
                    </label>

                    <input
                        type="password"
                        id="cvv"
                        placeholder="CVV"
                        maxlength="3"
                        inputmode="numeric">

                </div>

            </div>

            <div class="form-group">

                <label for="cardHolder">
                    Card Holder Name
                </label>

                <input
                    type="text"
                    id="cardHolder"
                    placeholder="Enter card holder name">

            </div>

        `;
    }

    if (paymentMethod === "upi") {

        return `

            <div class="form-group">

                <label for="upiApp">
                    Select UPI App
                </label>

                <select id="upiApp">

                    <option value="">
                        Select an app
                    </option>

                    <option value="google-pay">
                        Google Pay
                    </option>

                    <option value="phonepe">
                        PhonePe
                    </option>

                    <option value="paytm">
                        Paytm
                    </option>

                </select>

            </div>

            <div class="form-group">

                <label for="upiId">
                    UPI ID
                </label>

                <input
                    type="text"
                    id="upiId"
                    placeholder="example@upi">

            </div>

        `;
    }
}


function processPayment() {

    const selectedPayment =
        document.querySelector(
            'input[name="payment-method"]:checked'
        );

    if (!selectedPayment) {

        alert(
            "Please select a payment method."
        );

        return;
    }

    if (!bookingData) {

        alert(
            "Booking data is still loading. "
            + "Please wait."
        );

        return;
    }

    const paymentMethod =
        selectedPayment.value;

    let amount;

    if (paymentMethod === "debit-card") {

        amount =
            originalFare * 0.85;

    } else if (paymentMethod === "credit-card") {

        amount =
            originalFare * 0.90;

    } else if (paymentMethod === "upi") {

        amount =
            originalFare * 0.85;
    }

    const formData =
        new URLSearchParams();

    formData.append(
        "bookingId",
        bookingData.bookingId
    );

    formData.append(
        "paymentMethod",
        paymentMethod
    );

    formData.append(
        "amount",
        amount
    );

    fetch("payment", {

        method: "POST",

        headers: {
            "Content-Type":
                "application/x-www-form-urlencoded"
        },

        body: formData

    })

        .then(response => {

            return response.text()
                .then(result => {

                    if (!response.ok) {
                        throw new Error(result);
                    }

                    return result;
                });
        })

        .then(result => {

            const loadingOverlay =
                document.querySelector(
                    ".loading-overlay"
                );

            loadingOverlay.classList.add(
                "active"
            );

            setTimeout(function () {

                window.location.href =
                    "BookingSummary.html";

            }, 6000);
        })

        .catch(error => {

            console.error(error);

            alert(
                "Backend Error:\n\n"
                + error.message
            );
        });
}


loadBookingData();