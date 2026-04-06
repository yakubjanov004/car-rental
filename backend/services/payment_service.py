import uuid
from datetime import date
from decimal import Decimal

from apps.payments.models import BillingInvoice, PaymentReceipt


def create_invoice_and_receipt(user, booking, transaction):
    invoice_number = f"INV-{date.today().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
    invoice = BillingInvoice.objects.create(
        user=user,
        booking=booking,
        transaction=transaction,
        invoice_number=invoice_number,
        amount=transaction.amount,
        tax_amount=Decimal('0.00'),
        status='paid',
        due_date=date.today(),
    )

    receipt_number = f"RL-{uuid.uuid4().hex[:8].upper()}"
    receipt = PaymentReceipt.objects.create(
        user=user,
        transaction=transaction,
        invoice=invoice,
        receipt_number=receipt_number,
        amount=transaction.amount,
    )
    return invoice, receipt
