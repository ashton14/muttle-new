CREATE DATABASE IF NOT EXISTS muttle;
CREATE USER IF NOT EXISTS professorx@localhost IDENTIFIED WITH mysql_native_password BY 'mutants';
GRANT ALL PRIVILEGES ON muttle.* TO professorx@localhost;