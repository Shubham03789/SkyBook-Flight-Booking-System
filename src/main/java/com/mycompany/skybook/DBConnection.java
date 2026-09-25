package com.mycompany.skybook;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class DBConnection {

    private static final String URL;
    private static final String USER;
    private static final String PASSWORD;

    static {
        Properties properties = new Properties();

        try (InputStream input =
                     DBConnection.class.getClassLoader()
                             .getResourceAsStream("db.properties")) {

            if (input == null) {
                throw new RuntimeException(
                        "db.properties file not found."
                );
            }

            properties.load(input);

            URL = properties.getProperty("db.url");
            USER = properties.getProperty("db.user");
            PASSWORD = properties.getProperty("db.password");

        } catch (IOException e) {
            throw new RuntimeException(
                    "Unable to load database configuration.",
                    e
            );
        }
    }

    public static Connection getConnection()
            throws SQLException {

        try {

            Class.forName("com.mysql.cj.jdbc.Driver");

            System.out.println(
                    ">>> MySQL JDBC Driver loaded successfully <<<"
            );

        } catch (ClassNotFoundException e) {

            throw new SQLException(
                    "MySQL JDBC Driver not found.",
                    e
            );
        }

        Connection connection =
                DriverManager.getConnection(
                        URL,
                        USER,
                        PASSWORD
                );

        System.out.println(
                ">>> DATABASE CONNECTION SUCCESSFUL <<<"
        );

        return connection;
    }
}