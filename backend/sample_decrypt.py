# pip install bcrypt
import bcrypt

new_password = "NewSecret123".encode()
salt = bcrypt.gensalt(rounds=12)   # rounds=12 matches $2b$12$
new_hash = bcrypt.hashpw(new_password, salt)
print(new_hash.decode())
