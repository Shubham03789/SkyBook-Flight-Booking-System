package com.mycompany.skybook;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(name = "BookingServlet", urlPatterns = {"/booking"})
public class BookingServlet extends HttpServlet {

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType(
                "application/json;charset=UTF-8"
        );

        String bookingId =
                request.getParameter("bookingId");

        if (bookingId == null || bookingId.isBlank()) {

            response.setStatus(
                    HttpServletResponse.SC_BAD_REQUEST
            );

            try (PrintWriter out = response.getWriter()) {

                out.println("""
                    {
                        "error": "Booking ID is required"
                    }
                    """);
            }

            return;
        }

        String sql = """
            SELECT
                b.booking_id,
                b.passenger_count,
                b.seat_numbers,
                b.total_fare,
                b.booking_status,

                u.full_name,
                u.email,

                f.flight_number,
                f.airline_name,
                f.departure_time,
                f.arrival_time,

                source.city AS source_city,
                source.airport_code AS source_code,

                destination.city AS destination_city,
                destination.airport_code AS destination_code,

                p.payment_method,
                p.original_amount,
                p.discount_percentage,
                p.discount_amount,
                p.amount_paid,
                p.payment_status,
                p.payment_date,

                t.pnr,
                t.issue_date,
                t.ticket_status

            FROM bookings b

            JOIN users u
                ON b.user_id = u.user_id

            JOIN flights f
                ON b.flight_id = f.flight_id

            JOIN airports source
                ON f.source_airport_id = source.airport_id

            JOIN airports destination
                ON f.destination_airport_id = destination.airport_id

            LEFT JOIN payments p
                ON p.payment_id = (
                    SELECT MAX(p2.payment_id)
                    FROM payments p2
                    WHERE p2.booking_id = b.booking_id
                )

            LEFT JOIN tickets t
                ON t.booking_id = b.booking_id

            WHERE b.booking_id = ?
            """;

        try (
            Connection connection =
                    DBConnection.getConnection();

            PreparedStatement statement =
                    connection.prepareStatement(sql)
        ) {

            statement.setInt(
                    1,
                    Integer.parseInt(bookingId)
            );

            try (
                ResultSet result =
                        statement.executeQuery();

                PrintWriter out =
                        response.getWriter()
            ) {

                if (!result.next()) {

                    response.setStatus(
                            HttpServletResponse.SC_NOT_FOUND
                    );

                    out.println("""
                        {
                            "error": "Booking not found"
                        }
                        """);

                    return;
                }

                String seats =
                        result.getString("seat_numbers");

                String[] seatArray =
                        seats.split(",");

                out.println("{");

                out.println(
                        "\"bookingId\": "
                        + result.getInt("booking_id")
                        + ","
                );

                String pnr =
                        result.getString("pnr");

                if (pnr == null) {

                    out.println(
                            "\"pnr\": null,"
                    );

                } else {

                    out.println(
                            "\"pnr\": \""
                            + pnr
                            + "\","
                    );
                }

                out.println(
                        "\"passengerCount\": "
                        + result.getInt("passenger_count")
                        + ","
                );

                out.println("\"seats\": [");

                for (
                        int i = 0;
                        i < seatArray.length;
                        i++
                ) {

                    out.print(
                            "\""
                            + seatArray[i].trim()
                            + "\""
                    );

                    if (i < seatArray.length - 1) {
                        out.print(",");
                    }
                }

                out.println("],");

                out.println(
                        "\"totalFare\": "
                        + result.getDouble("total_fare")
                        + ","
                );

                out.println(
                        "\"bookingStatus\": \""
                        + result.getString("booking_status")
                        + "\","
                );

                String ticketStatus =
                        result.getString("ticket_status");

                if (ticketStatus == null) {

                    out.println(
                            "\"ticketStatus\": null,"
                    );

                } else {

                    out.println(
                            "\"ticketStatus\": \""
                            + ticketStatus
                            + "\","
                    );
                }

                out.println(
                        "\"passengerName\": \""
                        + result.getString("full_name")
                        + "\","
                );

                out.println(
                        "\"email\": \""
                        + result.getString("email")
                        + "\","
                );

                out.println(
                        "\"flightNumber\": \""
                        + result.getString("flight_number")
                        + "\","
                );

                out.println(
                        "\"airline\": \""
                        + result.getString("airline_name")
                        + "\","
                );

                out.println(
                        "\"departure\": \""
                        + result.getTimestamp("departure_time")
                        + "\","
                );

                out.println(
                        "\"arrival\": \""
                        + result.getTimestamp("arrival_time")
                        + "\","
                );

                out.println(
                        "\"from\": \""
                        + result.getString("source_city")
                        + "\","
                );

                out.println(
                        "\"fromAirport\": \""
                        + result.getString("source_code")
                        + "\","
                );

                out.println(
                        "\"to\": \""
                        + result.getString("destination_city")
                        + "\","
                );

                out.println(
                        "\"toAirport\": \""
                        + result.getString("destination_code")
                        + "\","
                );

                String paymentMethod =
                        result.getString("payment_method");

                if (paymentMethod == null) {

                    out.println(
                            "\"paymentMethod\": null,"
                    );

                    out.println(
                            "\"originalAmount\": null,"
                    );

                    out.println(
                            "\"discountPercentage\": null,"
                    );

                    out.println(
                            "\"discountAmount\": null,"
                    );

                    out.println(
                            "\"amountPaid\": null,"
                    );

                    out.println(
                            "\"paymentStatus\": null"
                    );

                } else {

                    out.println(
                            "\"paymentMethod\": \""
                            + paymentMethod
                            + "\","
                    );

                    out.println(
                            "\"originalAmount\": "
                            + result.getDouble(
                                    "original_amount"
                            )
                            + ","
                    );

                    out.println(
                            "\"discountPercentage\": "
                            + result.getDouble(
                                    "discount_percentage"
                            )
                            + ","
                    );

                    out.println(
                            "\"discountAmount\": "
                            + result.getDouble(
                                    "discount_amount"
                            )
                            + ","
                    );

                    out.println(
                            "\"amountPaid\": "
                            + result.getDouble(
                                    "amount_paid"
                            )
                            + ","
                    );

                    out.println(
                            "\"paymentStatus\": \""
                            + result.getString(
                                    "payment_status"
                            )
                            + "\""
                    );
                }

                out.println("}");
            }

        } catch (NumberFormatException e) {

            response.setStatus(
                    HttpServletResponse.SC_BAD_REQUEST
            );

            try (PrintWriter out = response.getWriter()) {

                out.println("""
                    {
                        "error": "Invalid booking ID"
                    }
                    """);
            }

        } catch (SQLException e) {

            response.setStatus(
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR
            );

            try (PrintWriter out = response.getWriter()) {

                out.println(
                        "{ \"error\": \""
                        + e.getMessage()
                                .replace("\"", "'")
                        + "\" }"
                );
            }
        }
    }
}