CREATE DATABASE IF NOT EXISTS muttle;
\! echo CREATE DATABASE IF NOT EXISTS muttle;

CREATE USER IF NOT EXISTS professorx@localhost IDENTIFIED WITH mysql_native_password BY 'mutants';
\! echo CREATE USER IF NOT EXISTS professorx@localhost IDENTIFIED WITH mysql_native_password BY 'mutants';

GRANT ALL PRIVILEGES ON muttle.* TO professorx@localhost;
\! echo GRANT ALL PRIVILEGES ON muttle.* TO professorx@localhost;

