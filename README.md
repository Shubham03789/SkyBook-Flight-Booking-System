# SkyBook - Flight Booking System

## Project Overview

SkyBook is a Java-based flight booking and reservation web application developed as a collaborative academic project.

The system provides functionality for flight booking, passenger and booking management, payment processing, seat booking, PNR generation, and ticket information retrieval.

## Features

- Flight booking and reservation
- Passenger and booking information management
- Seat selection and availability management
- Payment processing
- Payment method selection
- Discount calculation
- PNR generation
- Ticket information generation and retrieval
- Booking confirmation
- MySQL database integration

## Technologies Used

- Java 17
- Jakarta EE
- Java Servlets
- Maven
- MySQL
- JDBC
- HTML
- CSS
- JavaScript
- NetBeans IDE

## My Contribution

I developed the following modules as part of the project:

### 1. Payment Module

The Payment Module handles the payment stage of the flight booking process.

Key responsibilities include:

- Processing payment requests
- Supporting debit card, credit card, and UPI payment methods
- Calculating applicable discounts
- Calculating the final amount to be paid
- Recording payment information in the database
- Updating booking status after successful payment
- Updating seat availability after payment
- Validating payment and booking information

### 2. PNR & Ticket Module

The PNR & Ticket Module handles booking confirmation information and ticket-related details.

Key responsibilities include:
- Generating PNR information
- Retrieving booking details
- Retrieving passenger and flight information
- Retrieving seat information
- Retrieving payment details
- Providing ticket and booking status information
- Displaying the generated booking and ticket information
- Generating and downloading the ticket as a PDF

## Database

The application uses **MySQL** for storing and retrieving flight booking, passenger, payment, seat, and ticket-related information.

Database connectivity is implemented using **JDBC**.

Database credentials and other sensitive configuration details are not included in this repository.

## Project Structure

```text
SkyBook/
├── src/
│   ├── main/
│   │   ├── java/
│   │   ├── resources/
│   │   └── webapp/
│   └── test/
├── pom.xml
└── nb-configuration.xml
