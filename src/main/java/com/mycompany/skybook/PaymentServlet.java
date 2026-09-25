package com.mycompany.skybook;

import java.io.IOException;
import java.io.PrintWriter;
import java.security.SecureRandom;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(
        name = "PaymentServlet",
        urlPatterns = {"/payment"}
)
public class PaymentServlet extends HttpServlet {

    private static final String PNR_CHARACTERS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    private static final int PNR_LENGTH = 6;

    private static final SecureRandom RANDOM =
            new SecureRandom();

    @Override
    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/plain;charset=UTF-8");

        String paymentMethod =
                request.getParameter("paymentMethod");

        String bookingId =
                request.getParameter("bookingId");

        Connection connection = null;

        try {

            if (bookingId == null || bookingId.isBlank()) {
                throw new IllegalArgumentException(
                        "We could not identify your booking. "
                        + "Please go back and try again."
                );
            }

            int bookingIdValue;

            try {
                bookingIdValue =
                        Integer.parseInt(bookingId);

            } catch (NumberFormatException e) {
                throw new IllegalArgumentException(
                        "Your booking information is invalid. "
                        + "Please try again."
                );
            }

            if (paymentMethod == null || paymentMethod.isBlank()) {
                throw new IllegalArgumentException(
                        "Please select a payment method."
                );
            }

            connection = DBConnection.getConnection();
            connection.setAutoCommit(false);

            double originalAmount;
            int flightId;
            String seatNumbers;

            String bookingSql = """
                    SELECT
                        flight_id,
                        seat_numbers,
                        total_fare,
                        booking_status
                    FROM bookings
                    WHERE booking_id = ?
                    FOR UPDATE
                    """;

            try (
                PreparedStatement statement =
                        connection.prepareStatement(bookingSql)
            ) {

                statement.setInt(1, bookingIdValue);

                try (ResultSet result = statement.executeQuery()) {

                    if (!result.next()) {
                        throw new IllegalArgumentException(
                                "We could not find this booking. "
                                + "Please try booking your flight again."
                        );
                    }

                    flightId =
                            result.getInt("flight_id");

                    seatNumbers =
                            result.getString("seat_numbers");

                    originalAmount =
                            result.getDouble("total_fare");
                }
            }

            String existingTicketSql = """
                    SELECT ticket_id, pnr
                    FROM tickets
                    WHERE booking_id = ?
                    """;

            try (
                PreparedStatement statement =
                        connection.prepareStatement(existingTicketSql)
            ) {

                statement.setInt(1, bookingIdValue);

                try (ResultSet result = statement.executeQuery()) {

                    if (result.next()) {
                        throw new IllegalArgumentException(
                                "This booking has already been paid for. "
                                + "Please go to your dashboard to view your ticket."
                        );
                    }
                }
            }

            double discountPercentage;

            if ("debit-card".equals(paymentMethod)) {
                discountPercentage = 15.00;

            } else if ("credit-card".equals(paymentMethod)) {
                discountPercentage = 10.00;

            } else if ("upi".equals(paymentMethod)) {
                discountPercentage = 15.00;

            } else {
                throw new IllegalArgumentException(
                        "Please select a valid payment method."
                );
            }

            double discountAmount =
                    (originalAmount * discountPercentage) / 100;

            double amountPaid =
                    originalAmount - discountAmount;

            String paymentStatus = "SUCCESS";

            if (seatNumbers == null || seatNumbers.isBlank()) {
                throw new IllegalArgumentException(
                        "No seats were found for this booking. "
                        + "Please select your seats again."
                );
            }

            String[] seats = seatNumbers.split(",");

            String seatSql = """
                    UPDATE seat_inventory
                    SET seat_status = 'BOOKED'
                    WHERE flight_id = ?
                    AND seat_number = ?
                    AND seat_status = 'AVAILABLE'
                    """;

            try (
                PreparedStatement statement =
                        connection.prepareStatement(seatSql)
            ) {

                for (String seat : seats) {

                    String seatNumber = seat.trim();

                    if (seatNumber.isEmpty()) {
                        continue;
                    }

                    statement.setInt(1, flightId);
                    statement.setString(2, seatNumber);

                    int updatedRows =
                            statement.executeUpdate();

                    if (updatedRows != 1) {
                        throw new IllegalArgumentException(
                                "Seat "
                                + seatNumber
                                + " is no longer available. "
                                + "Please go back and select another seat."
                        );
                    }
                }
            }

            String paymentSql = """
                    INSERT INTO payments
                    (
                        booking_id,
                        payment_method,
                        original_amount,
                        discount_percentage,
                        discount_amount,
                        amount_paid,
                        payment_status
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """;

            try (
                PreparedStatement statement =
                        connection.prepareStatement(paymentSql)
            ) {

                statement.setInt(1, bookingIdValue);
                statement.setString(2, paymentMethod);
                statement.setDouble(3, originalAmount);
                statement.setDouble(4, discountPercentage);
                statement.setDouble(5, discountAmount);
                statement.setDouble(6, amountPaid);
                statement.setString(7, paymentStatus);

                statement.executeUpdate();
            }

            String bookingUpdateSql = """
                    UPDATE bookings
                    SET booking_status = 'CONFIRMED'
                    WHERE booking_id = ?
                    """;

            try (
                PreparedStatement statement =
                        connection.prepareStatement(bookingUpdateSql)
            ) {

                statement.setInt(1, bookingIdValue);
                statement.executeUpdate();
            }

            String generatedPNR =
                    generateUniquePNR(connection);

            String ticketSql = """
                    INSERT INTO tickets
                    (
                        booking_id,
                        pnr,
                        ticket_status
                    )
                    VALUES (?, ?, 'CONFIRMED')
                    """;

            try (
                PreparedStatement statement =
                        connection.prepareStatement(ticketSql)
            ) {

                statement.setInt(1, bookingIdValue);
                statement.setString(2, generatedPNR);

                statement.executeUpdate();
            }

            connection.commit();

            try (PrintWriter out = response.getWriter()) {

                out.println("PAYMENT_SUCCESS");
                out.println("PNR: " + generatedPNR);
                out.println("Booking confirmed successfully.");
            }

        } catch (IllegalArgumentException e) {

            if (connection != null) {
                try {
                    connection.rollback();
                } catch (SQLException rollbackError) {
                    rollbackError.printStackTrace();
                }
            }

            response.setStatus(
                    HttpServletResponse.SC_BAD_REQUEST
            );

            try (PrintWriter out = response.getWriter()) {
                out.print(e.getMessage());
            }

        } catch (SQLException e) {

            if (connection != null) {
                try {
                    connection.rollback();
                } catch (SQLException rollbackError) {
                    rollbackError.printStackTrace();
                }
            }

            e.printStackTrace();

            response.setStatus(
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR
            );

            try (PrintWriter out = response.getWriter()) {
                out.print(
                        "We could not complete your payment "
                        + "right now. Please try again."
                );
            }

        } finally {

            if (connection != null) {
                try {
                    connection.setAutoCommit(true);
                    connection.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    private String generateUniquePNR(
            Connection connection)
            throws SQLException {

        String checkPNRSql = """
                SELECT ticket_id
                FROM tickets
                WHERE pnr = ?
                """;

        while (true) {

            String pnr = generatePNR();

            try (
                PreparedStatement statement =
                        connection.prepareStatement(checkPNRSql)
            ) {

                statement.setString(1, pnr);

                try (ResultSet result = statement.executeQuery()) {

                    if (!result.next()) {
                        return pnr;
                    }
                }
            }
        }
    }

    private String generatePNR() {

        StringBuilder pnr =
                new StringBuilder(PNR_LENGTH);

        for (int i = 0; i < PNR_LENGTH; i++) {

            int index =
                    RANDOM.nextInt(PNR_CHARACTERS.length());

            pnr.append(
                    PNR_CHARACTERS.charAt(index)
            );
        }

        return pnr.toString();
    }
}