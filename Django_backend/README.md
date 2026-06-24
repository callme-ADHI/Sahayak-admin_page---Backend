# Steps to set up this project locally

## Step 1

Clone the repo locally
```
git clone https://github.com/Sahayak-App/Sahayak-Backend.git
```

## Step 2

* Download and install [PostgreSQL](https://www.postgresql.org/download/windows/)
* During installation, set password as 'password'
* During installation, set port as '5432'
* Close after installation

## Step 3

* Install [python](https://www.python.org/downloads/) if you dont have it installed
* Switch to the cloned folder `cd Sahayak-Backend`
* Now install dependencies using `pip install -r requirements.txt`
* Optionally, If you want you could set up a python virtual environment using Pycharm, or through the command line

## Step 4

* Run `python manage.py migrate`

Now all the tables are completely set up, but to actually see them you have to do Step 5

## Step 5

To actually see the tables that were just created, we use DBeaver. Download and install [DBeaver](https://dbeaver.io/download/)

* Create a new connection, choose PostgresSQL
* On the details tab set host as 'localhost'
* Set port as '5432'
* Set database as 'postgres'
* Set username as 'postgres'
* Set password as 'password'
* Connect

If it connected successfully then the connection should appear on the left side, expand it till you can see the tables in the public schema and select the 13 tables then right click
and select `Create New Digram` to view the interactable ER diagram. That's it!
