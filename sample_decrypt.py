# pip install bcrypt
import bcrypt

new_password = "$2b$12$J274I0bFnAwxfO8vOcJD5uoTMdhpqzMhizPHjhyxflmX.dTXta7CG".encode()
salt = bcrypt.gensalt(rounds=12)   # rounds=12 matches $2b$12$
new_hash = bcrypt.hashpw(new_password, salt)
print(new_hash)
print(new_hash.decode())
