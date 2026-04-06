def send_sms(phone_number, message):
    # Integration point for real SMS provider.
    print(f"[NOTIFICATION MOCK] SMS => {phone_number}: {message}")


def send_email(email, subject, body):
    # Integration point for real mail provider.
    print(f"[NOTIFICATION MOCK] EMAIL => {email}: {subject}")
