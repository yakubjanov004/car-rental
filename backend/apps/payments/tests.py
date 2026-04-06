from datetime import timedelta
from decimal import Decimal
from unittest.mock import patch

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.bookings.models import Booking
from apps.cars.models import Car, CarModel
from apps.districts.models import District
from apps.payments.models import BillingInvoice, PaymentReceipt, PaymentTransaction
from apps.users.models import User


class PaymentFlowApiTests(APITestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			username='payment_user',
			password='StrongPass123!',
			is_staff=True,
		)
		self.client.force_authenticate(user=self.user)

		district = District.objects.create(name='Yunusobod')
		model = CarModel.objects.create(
			brand='BMW',
			model_name='X7',
			category='premium',
			model_group='bmw-x7-test',
			transmission='automatic',
			fuel_type='benzin',
			seats=5,
			base_daily_price=Decimal('1000000.00'),
			base_deposit=Decimal('5000000.00'),
		)
		self.car = Car.objects.create(
			model_info=model,
			district=district,
			inventory_code='INV-TEST-001',
			plate_number='10 111 AAA',
			color_name='Black',
			color_hex='#111111',
			year=2024,
			daily_price=Decimal('1000000.00'),
			deposit=Decimal('5000000.00'),
			status='available',
			is_available=True,
		)
		self.booking = Booking.objects.create(
			user=self.user,
			car=self.car,
			start_date=timezone.now().date(),
			end_date=timezone.now().date() + timedelta(days=2),
			total_price=Decimal('2000000.00'),
			status='pending',
			full_name='Test User',
			phone_number='+998901112233',
		)

		self.initiate_url = '/api/payments/initiate/'
		self.verify_url = '/api/payments/verify-otp/'
		self.resend_url = '/api/payments/resend-otp/'

	def _initiate(self, card_number='8600123412341234'):
		return self.client.post(
			self.initiate_url,
			{
				'booking_id': self.booking.id,
				'card_number': card_number,
				'expiry': '12/30',
				'cvv': '123',
				'holder': 'TEST USER',
			},
			format='json',
		)

	def test_initiate_payment_creates_otp_transaction(self):
		response = self._initiate()

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn('transaction_id', response.data)

		txn = PaymentTransaction.objects.get(id=response.data['transaction_id'])
		self.assertEqual(txn.status, 'otp_sent')
		self.assertEqual(txn.payment_type, 'new_card')
		self.assertEqual(txn.booking_id, self.booking.id)
		self.assertEqual(txn.user_id, self.user.id)
		self.assertEqual(len(txn.otp_code), 6)

	def test_initiate_payment_rejects_insufficient_funds_card(self):
		response = self._initiate(card_number='0000123412341234')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(response.data.get('code'), 'INSUFFICIENT_FUNDS')
		self.assertEqual(PaymentTransaction.objects.count(), 0)

	def test_verify_otp_marks_payment_paid_and_creates_receipt(self):
		initiate_response = self._initiate()
		txn = PaymentTransaction.objects.get(id=initiate_response.data['transaction_id'])

		verify_response = self.client.post(
			self.verify_url,
			{'transaction_id': txn.id, 'otp_code': txn.otp_code},
			format='json',
		)

		self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
		self.assertEqual(verify_response.data.get('status'), 'success')

		txn.refresh_from_db()
		self.booking.refresh_from_db()
		self.assertEqual(txn.status, 'paid')
		self.assertEqual(self.booking.status, 'approved')
		self.assertEqual(BillingInvoice.objects.filter(transaction=txn).count(), 1)
		self.assertEqual(PaymentReceipt.objects.filter(transaction=txn).count(), 1)

	def test_verify_otp_rejects_wrong_code(self):
		initiate_response = self._initiate()
		txn = PaymentTransaction.objects.get(id=initiate_response.data['transaction_id'])

		verify_response = self.client.post(
			self.verify_url,
			{'transaction_id': txn.id, 'otp_code': '111111'},
			format='json',
		)

		self.assertEqual(verify_response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(verify_response.data.get('code'), 'INVALID_OTP')

		txn.refresh_from_db()
		self.assertEqual(txn.status, 'otp_sent')
		self.assertEqual(BillingInvoice.objects.count(), 0)
		self.assertEqual(PaymentReceipt.objects.count(), 0)

	@patch('apps.payments.views.random.randint', return_value=654321)
	def test_resend_otp_updates_code(self, _mock_randint):
		initiate_response = self._initiate()
		txn = PaymentTransaction.objects.get(id=initiate_response.data['transaction_id'])

		resend_response = self.client.post(
			self.resend_url,
			{'transaction_id': txn.id},
			format='json',
		)

		self.assertEqual(resend_response.status_code, status.HTTP_200_OK)
		self.assertEqual(resend_response.data.get('message'), 'OTP qayta yuborildi')
		self.assertEqual(resend_response.data.get('_dev_otp'), '654321')

		txn.refresh_from_db()
		self.assertEqual(txn.otp_code, '654321')
		self.assertEqual(txn.status, 'otp_sent')
