let bookingData = null;

function loadBookingSummary() {

    fetch("booking?bookingId=1")

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Unable to load booking data."
                );
            }

            return response.json();
        })

        .then(data => {

            console.log(
                "Booking summary data:",
                data
            );

            bookingData = data;

            document.getElementById(
                "pnr"
            ).textContent =
                data.pnr || "Not Available";

            document.getElementById(
                "flightNumber"
            ).textContent =
                data.flightNumber;

            document.getElementById(
                "airline"
            ).textContent =
                data.airline;

            document.getElementById(
                "from"
            ).textContent =
                data.from;

            document.getElementById(
                "to"
            ).textContent =
                data.to;

            const departureDate =
                new Date(
                    data.departure.replace(
                        " ",
                        "T"
                    )
                );

            document.getElementById(
                "departure"
            ).textContent =
                departureDate.toLocaleString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );

            const passengerList =
                document.getElementById(
                    "passengerList"
                );

            passengerList.innerHTML = "";

            data.seats.forEach(
                function (seat, index) {

                    const passengerRow =
                        document.createElement(
                            "div"
                        );

                    passengerRow.className =
                        "passenger-row";

                    passengerRow.innerHTML = `

                        <div>

                            <span>Passenger</span>

                            <strong>
                                Passenger ${index + 1}
                            </strong>

                        </div>

                        <div>

                            <span>Seat</span>

                            <strong>
                                ${seat}
                            </strong>

                        </div>

                        <div>

                            <span>Booking User</span>

                            <strong>
                                ${data.passengerName}
                            </strong>

                        </div>

                    `;

                    passengerList.appendChild(
                        passengerRow
                    );
                }
            );

            if (data.paymentStatus !== null) {

                document.getElementById(
                    "originalAmount"
                ).textContent =
                    "₹" +
                    Number(
                        data.originalAmount
                    ).toLocaleString("en-IN");

                document.getElementById(
                    "discountAmount"
                ).textContent =
                    "-₹" +
                    Number(
                        data.discountAmount
                    ).toLocaleString("en-IN");

                document.getElementById(
                    "paymentMethod"
                ).textContent =
                    formatPaymentMethod(
                        data.paymentMethod
                    );

                document.getElementById(
                    "paymentStatus"
                ).textContent =
                    data.paymentStatus;

                document.getElementById(
                    "amountPaid"
                ).textContent =
                    "₹" +
                    Number(
                        data.amountPaid
                    ).toLocaleString("en-IN");

            } else {

                document.getElementById(
                    "originalAmount"
                ).textContent =
                    "Not Paid";

                document.getElementById(
                    "discountAmount"
                ).textContent =
                    "₹0";

                document.getElementById(
                    "paymentMethod"
                ).textContent =
                    "Not Paid";

                document.getElementById(
                    "paymentStatus"
                ).textContent =
                    "PENDING";

                document.getElementById(
                    "amountPaid"
                ).textContent =
                    "₹0";
            }
        })

        .catch(error => {

            console.error(
                "Booking Summary Error:",
                error
            );

            alert(
                "Unable to load booking summary:\n\n"
                + error.message
            );
        });
}


function formatPaymentMethod(method) {

    if (!method) {
        return "Not Paid";
    }

    if (method === "debit-card") {
        return "Debit Card";
    }

    if (method === "credit-card") {
        return "Credit Card";
    }

    if (method === "upi") {
        return "UPI";
    }

    return method;
}


function downloadBookingPDF() {

    if (!bookingData) {

        alert(
            "Booking data is still loading. Please wait."
        );

        return;
    }

    if (
        typeof window.jspdf === "undefined"
    ) {

        alert(
            "PDF library could not be loaded."
        );

        return;
    }

    const { jsPDF } = window.jspdf;

    const pdf =
        new jsPDF();

    const pageWidth =
        pdf.internal.pageSize.getWidth();

    const margin = 20;

    let y = 20;

    const root =
        getComputedStyle(
            document.documentElement
        );

    const primaryColor =
        root.getPropertyValue(
            "--primary-color"
        ).trim();

    const primaryRGB =
        hexToRGB(primaryColor);

    const logo =
        new Image();

    logo.src =
        "skybook-logo.png";

    logo.onload = function () {

        const logoWidth = 55;

        const logoHeight =
            (logo.height / logo.width)
            * logoWidth;

        const logoX =
            (pageWidth - logoWidth) / 2;

        const logoY = 12;

        pdf.addImage(
            logo,
            "PNG",
            logoX,
            logoY,
            logoWidth,
            logoHeight
        );

        y =
            logoY
            + logoHeight
            + 10;

        pdf.setTextColor(
            primaryRGB.r,
            primaryRGB.g,
            primaryRGB.b
        );

        pdf.setFontSize(16);

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.text(
            "Booking Confirmation",
            pageWidth / 2,
            y,
            {
                align: "center"
            }
        );

        y += 8;

        pdf.setTextColor(
            30,
            100,
            60
        );

        pdf.setFontSize(10);

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.text(
            "Payment Successful",
            pageWidth / 2,
            y,
            {
                align: "center"
            }
        );

        y += 10;

        pdf.setDrawColor(
            primaryRGB.r,
            primaryRGB.g,
            primaryRGB.b
        );

        pdf.line(
            margin,
            y,
            pageWidth - margin,
            y
        );

        y += 12;

        pdf.setTextColor(
            primaryRGB.r,
            primaryRGB.g,
            primaryRGB.b
        );

        pdf.setFontSize(14);

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.text(
            "Booking Details",
            margin,
            y
        );

        y += 9;

        pdf.setFontSize(11);

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.setTextColor(
            20,
            20,
            20
        );

        pdf.text(
            "PNR: "
            + (bookingData.pnr || "Not Available"),
            margin,
            y
        );

        y += 7;

        pdf.text(
            "Flight: "
            + bookingData.flightNumber,
            margin,
            y
        );

        y += 7;

        pdf.text(
            "Airline: "
            + bookingData.airline,
            margin,
            y
        );

        y += 7;

        pdf.text(
            "From: "
            + bookingData.from,
            margin,
            y
        );

        y += 7;

        pdf.text(
            "To: "
            + bookingData.to,
            margin,
            y
        );

        y += 7;

        pdf.text(
            "Departure: "
            + formatPDFDate(
                bookingData.departure
            ),
            margin,
            y
        );

        y += 14;

        pdf.setTextColor(
            primaryRGB.r,
            primaryRGB.g,
            primaryRGB.b
        );

        pdf.setFontSize(14);

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.text(
            "Passengers",
            margin,
            y
        );

        y += 9;

        pdf.setFontSize(11);

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.setTextColor(
            20,
            20,
            20
        );

        bookingData.seats.forEach(
            function (seat, index) {

                pdf.text(
                    "Passenger "
                    + (index + 1)
                    + "     Seat: "
                    + seat
                    + "     User: "
                    + bookingData.passengerName,
                    margin,
                    y
                );

                y += 7;
            }
        );

        y += 7;

        pdf.setTextColor(
            primaryRGB.r,
            primaryRGB.g,
            primaryRGB.b
        );

        pdf.setFontSize(14);

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.text(
            "Payment Details",
            margin,
            y
        );

        y += 9;

        pdf.setFontSize(11);

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.setTextColor(
            20,
            20,
            20
        );

        pdf.text(
            "Original Amount: ₹"
            + formatAmount(
                bookingData.originalAmount
            ),
            margin,
            y
        );

        y += 7;

        pdf.text(
            "Discount: ₹"
            + formatAmount(
                bookingData.discountAmount
            ),
            margin,
            y
        );

        y += 7;

        pdf.text(
            "Payment Method: "
            + formatPaymentMethod(
                bookingData.paymentMethod
            ),
            margin,
            y
        );

        y += 7;

        pdf.text(
            "Payment Status: "
            + bookingData.paymentStatus,
            margin,
            y
        );

        y += 12;

        pdf.setDrawColor(
            primaryRGB.r,
            primaryRGB.g,
            primaryRGB.b
        );

        pdf.line(
            margin,
            y,
            pageWidth - margin,
            y
        );

        y += 10;

        pdf.setTextColor(
            primaryRGB.r,
            primaryRGB.g,
            primaryRGB.b
        );

        pdf.setFontSize(15);

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.text(
            "Amount Paid",
            margin,
            y
        );

        pdf.text(
            "₹"
            + formatAmount(
                bookingData.amountPaid
            ),
            pageWidth - margin,
            y,
            {
                align: "right"
            }
        );

        y += 20;

        pdf.setTextColor(
            80,
            80,
            80
        );

        pdf.setFontSize(9);

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.text(
            "Thank you for booking with SkyBook.",
            pageWidth / 2,
            y,
            {
                align: "center"
            }
        );

        y += 6;

        pdf.text(
            "This is a computer-generated booking confirmation.",
            pageWidth / 2,
            y,
            {
                align: "center"
            }
        );

        pdf.save(
            "SkyBook_PNR_"
            + (bookingData.pnr || "Booking")
            + ".pdf"
        );
    };

    logo.onerror = function () {

        alert(
            "SkyBook logo could not be loaded.\n\n"
            + "Make sure the file is named:\n"
            + "skybook-logo.png\n\n"
            + "and is inside the Web Pages folder."
        );
    };
}


function goToDashboard() {

    window.location.href =
        "dashboard.html";
}


function hexToRGB(hex) {

    hex =
        hex.replace(
            "#",
            ""
        );

    if (hex.length === 3) {

        hex =
            hex
                .split("")
                .map(
                    function (character) {
                        return character + character;
                    }
                )
                .join("");
    }

    return {

        r: parseInt(
            hex.substring(0, 2),
            16
        ),

        g: parseInt(
            hex.substring(2, 4),
            16
        ),

        b: parseInt(
            hex.substring(4, 6),
            16
        )
    };
}


function formatPDFDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(
            dateString.replace(
                " ",
                "T"
            )
        );

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function formatAmount(amount) {

    return Number(
        amount
    ).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


loadBookingSummary();