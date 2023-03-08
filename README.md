# Coding Dojo Zoom Attendance Parser

Welcome to the Coding Dojo Zoom Attendance Parser, a web application that retrieves and visualizes attendance records from Zoom meetings. This application uses OAuth2 to authenticate users with Zoom and provides a backend API built with Express and a front-end user interface using vanilla JavaScript. This is version 1.0 of the application and is still in beta, so please use it cautiously and report any issues you encounter.

## Features

The Coding Dojo, Zoom Attendance Parser, includes the following features:

- User authentication with Zoom OAuth
- Retrieval of attendance records from Zoom meetings via Zoom's API
- Visualization of attendance data in a user-friendly interface
- Support for multiple Zoom accounts

## Installation

To install and run the Coding Dojo Zoom Attendance Parser on your local machine, follow these steps:

1. Clone the repository to your local machine:

    
    `git clone https://github.com/SR-Coder/Attandance_parser.git`

1. Navigate to the project directory:

    `cd Attendance_parser/zoom`

1. Install the dependencies:

    `npm install`

1. Start the server:

    `nodemon app.js`

    or

    `npm start`

1. Open your web browser and navigate to `http://localhost:8000`.

## Usage

To use the Coding Dojo Zoom Attendance Parser, follow these steps:

1. Login using your Zoom account credentials.

1. Click the "Connect to Zoom" button to connect your Zoom account to the application.

1. Once connected, select an Instructor from the first drop-down and click 'Get Meetings' to get a list of meetings associated with that instructor.

1. Select the meeting name and click "Get Occurances" to retrieve a list of dates and times for the meeting.

1. Select an occurrence and click "Get Attendance" to display the attendance.  

1. The attendance records will be displayed in a table on the screen.

1. To log out, click the "Logout" button.

## Known Issues

- This is a beta release, so some bugs or issues may occur. If you encounter any problems, please report them to the development team.
- Currently, Tyler T. C# class is not working correctly

## Contributing

If you would like to contribute to the development of the Coding Dojo Zoom Attendance Parser, please follow these guidelines:

1. Fork the repository to your own GitHub account.

2. Clone your forked repository to your local machine.

3. Create a new branch for your changes.

4. Make your changes and test them locally.

5. Push your changes to your forked repository.

6. Submit a pull request to the original repository with a detailed description of your changes.

## License

The Coding Dojo, Zoom Attendance Parser, is licensed under the MIT License. See the `LICENSE` file for more information.

