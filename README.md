# See-Employee
written by shoc71;


## Description
Full stack application that allows Managers & Owners to keep track of their employees, jobs, positoins, wages, and more. By using the terminal the user can update, add, or delete user information in real-time and save all informaiton immediately upon editing the tables. 

Soruce code located on ```index.js``` on root directory of this folder. This is to avoid any bugs or crashes from seperating the code.

## Table of Contents
- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [Contribution](#contribution)
- [Questions](#questions)

## Installation
1. Open up terminal (more specifically [bash](https://www.youtube.com/watch?v=3eu67g3PTdk))
2. Install ```npm``` and ```node``` packages on your desktop
3. Type the following command: ```git clone git@github.com:shoc71/See-Employee.git```
4. Type the following command: ```npm i ``` 
5. Connect to the local database by typing the following command: ```psql -h localhost -p 5432 -U postgres <your_database_name>``` (in this case ```second_db```) so...

```psql -h localhost -p 5432 -U postgres second_db``` 

(Note: this could be used for online remote connections assuming you changed ```localhost``` to ```host``` depending on the hostname, port, and database)


## Usage
After competing the installion instructions type up in the CLI (terminal), navigate to the code's location using the "cd" command and finally run node index.js as such.

```~/path/to/code$ node index.js```

## Contribution
Fork repo, make changes, and request a merge.

If you idenitfy any security or performance issues or any major improvements, raise an issue and let the community know.


## License
This project is licensed under the [![License](https://opensource.org/licenses/Apache-2.0)](https://opensource.org/licenses/Apache-2.0).

## Questions
For any questions or concerns, please email mrdrlogic@gmail.com

Youtube Tutorial: [See-Employee Walkthrough](https://youtu.be/Va5LKcrqqTw)

Deployed Webpage: https://shoc71.github.io/See-Employee/

GitHub Profile: [shoc71](https://github.com/shoc71)
